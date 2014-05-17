import six
from sse.exceptions import SseException

__all__ = ['MethodNotAllowed', 'NotFound']


class StreamProtocolException(SseException):
    """
    To avoid confusing with class naming or maybe I need some brain surgery
    """
    def __init__(self, **kwargs):
        for key, value in six.iteritems(kwargs):
            if not hasattr(self, key):
                raise TypeError("%s() received an invalid keyword %r."
                                "only accepts arguments that are already "
                                "attributes of the exception class." % (self.__class__.__name__, key))
            setattr(self, key, value)


class MethodNotAllowed(StreamProtocolException):
    status = 405

    def __init__(self, methods, **kwargs):
        self.headers = (
                        ('Allow', '/'.join(m.upper() for m in methods)),
                        )
        super().__init__(**kwargs)


class NotFound(StreamProtocolException):
    status = 404
