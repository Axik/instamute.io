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

    @asyncio.coroutine
    def register(self, channel):
        """
        Handler usage:
        >>> channel = yield from dispatcher.register('foo')
        >>> yield from channel.get()
        >>> channel.close()
        """
        q = Queue()
        self.queues[channel].append(q)

        yield from self.subscription.subscribe([channel])

        def free(*a, **k):
            """
            Stop serving client
            """
            queues = self.queues[channel]
            queues.remove(q)
            if not queues:
                yield from self.subscription.unsubscribe([channel])
                del self.queues[channel]
                logger.info('%s chanel was released', channel)
        q.close = free
        return q

    @asyncio.coroutine
    def send_local(self, channel, msg):
        """
        Acceptable only for sibling handlers - inside the same UNIX process
        """
        for q in self.queues[channel]:
            q.put_nowait(msg)
        yield