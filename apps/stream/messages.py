import logging

import asyncio
from asyncio.queues import Queue
from collections import defaultdict

logger = logging.getLogger(__name__)


class MessageDispatcher(object):
    """
    Redis PubSub message dispatcher.
    """
    subscription = None
    queue = None

    def __init__(self, subscription, loop=None):
        self.subscription = subscription
        self.queues = defaultdict(list) # chanel name -> list of Q
        self.loop = loop or asyncio.get_event_loop()

    @staticmethod
    @asyncio.coroutine
    def create(connection, loop=None):
        """
        Initialize message dispatcher
        """
        subscriber = yield from connection.start_subscribe()
        dispatcher =  MessageDispatcher(subscriber, loop)
        asyncio.async(dispatcher.dispatch())
        return dispatcher

    @asyncio.coroutine
    def dispatch(self):
        """
        Dispatch message to room queue
        """
        while True:
            reply = yield from self.subscription.next_published()
            for q in self.queues[reply.channel]:
                q.put_nowait(reply.value)

    def register(self, chanel):
        """
        Handler usage:
        >>> chanel = dispatcher.register('foo')
        >>> yield from chanel.get()
        >>> chanel.close()
        """
        q = Queue()
        self.queues[chanel].append(q)
        self.subscription.subscribe([chanel])

        def free(*a, **k):
            """
            Stop serving client
            """
            queues = self.queues[chanel]
            queues.remove(q)
            if not queues:
                self.subscription.unsubscribe(chanel)
                del self.queues[chanel]
                logger.debug('%s chanel was released', chanel)

        q.close = free
        return q
