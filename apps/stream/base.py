import asyncio
import logging
import sse
from .exceptions import MethodNotAllowed


logger = logging.getLogger(__name__)


class Stream(sse.Handler):
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
