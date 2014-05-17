import weakref
import asyncio
import logging
import sse
from .exceptions import MethodNotAllowed


logger = logging.getLogger(__name__)


class Stream(sse.Handler):
    redis = None
    http_method_names = ['get', 'post']

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

    def schedule_ping(self):
        # Need be carefully with CPython garbage collection
        wself = weakref.ref(self)
        def _schedule_ping():
            handler = wself()
            if not handler:
                return
            handler.send(":p\n\n")
            handler.ping()
        loop = asyncio.get_event_loop()
        loop.call_later(2000, _schedule_ping)
