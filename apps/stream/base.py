import weakref
import asyncio
import logging
import sse
from django.conf import settings
from .exceptions import MethodNotAllowed


logger = logging.getLogger(__name__)


class Stream(sse.Handler):
    redis = None
    dispatcher = None
    http_method_names = ['get',]

    @asyncio.coroutine
    def handle_request(self):
        # Try to dispatch to the right method; if a method doesn't exist,
        # defer to the error handler. Also defer to the error handler if the
        # request method isn't on the approved list.
        if self.request.method.lower() in self.http_method_names:
            handler = getattr(self, self.request.method.lower(), self.http_method_not_allowed)
        else:
            handler = self.http_method_not_allowed
        yield from handler()

    @asyncio.coroutine
    def http_method_not_allowed(self):
        logger.warning('Method Not Allowed (%s): %s', self.request.method, self.request.path,
            extra={
                'status_code': 405,
                'request': self.request
            }
        )
        raise MethodNotAllowed(self.http_method_names)

    def validate_sse(self):
        for header, value in self.request.headers:
            if header.upper() == 'ACCEPT':
                options = value.split(';')
                for option in options:
                    accept = option.strip()
                    if accept in ['*', '*/*']:
                        return True
                    elif accept == 'text/event-stream':
                        return True
        raise sse.exceptions.NotAcceptable()

    def schedule_heartbeat(self):
        # Need be carefully with CPython garbage collection
        wself = weakref.ref(self)
        def _heartbeat():
            handler = wself()
            if not handler:
                return
            logger.debug('Sending heartbeat')
            handler.send('', event='heartbeat')
        loop = asyncio.get_event_loop()
        loop.call_later(2000, _heartbeat)

    def prepare_response(self):
        # SSE author is definitely fucking mongoloid
        response = sse.Response(self.transport, 200)
        response.add_header('Content-Type', 'text/event-stream')
        response.add_header('Cache-Control', 'no-cache')
        response.add_header('Connection', 'keep-alive')
        response.add_header("Access-Control-Allow-Origin", "*")
        response.add_header("Access-Control-Allow-Methods", "POST, GET")
        response.add_header("Access-Control-Allow-Headers", "X-PINGOTHER, Origin, X-Requested-With, Content-Type, Accept")
        response.add_header("Access-Control-Max-Age", "1728000")
        response.send_headers()
        self.response = response

    def send(self, *args, **kwargs):
        logger.info('[%s]Sending %s / %s', self.me, args, kwargs)
        try:
            return super().send(*args, **kwargs)
        except AssertionError:
            # SSE author is definitely fucking mongoloid
            pass

    @asyncio.coroutine
    def get_connection(self):
        while True:
            connection = self.redis._get_free_connection()
            if not connection:
                yield from asyncio.sleep(0.001)
            else:
                yield
                return connection

    @asyncio.coroutine
    def publish(self, room, data):
        if settings.STREAM_SCALE == 1:
            yield from self.publish_to_locals(room, data)
        else:
            yield from self.publish_to_redis(room, data)

    @asyncio.coroutine
    def publish_to_redis(self, room, data):
        connection = yield from self.get_connection()
        yield from connection.publish(room, data)

    @asyncio.coroutine
    def publish_to_locals(self, room, data):
        yield from self.dispatcher.send_local(room, data)


class AppProtocol(sse.protocol.SseServerProtocol):
    handler = None

    @asyncio.coroutine
    def handle_request(self, request, payload):
        handler = self.handler_class(self, request, payload)
        self.handler = handler
        try:
            handler.validate_sse()
        except sse.exceptions.SseException as e:
            response = sse.Response(self.transport, e.status)
            if e.headers:
                for header in e.headers:
                    response.add_header(*header)
            response.send_headers()
            try:
                response.write_eof()
            except:
                response.transport.write_eof()
            return

        handler.prepare_response()
        yield from handler.handle_request()
        try:
            handler.response.write_eof()
        except:
            handler.response.transport.write_eof()

    def connection_lost(self, exc):
        super().connection_lost(exc)
        self.handler.connection_lost(exc)
        self.handler = None
