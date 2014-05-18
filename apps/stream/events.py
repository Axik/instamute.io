import re
import uuid
import json
import asyncio
import logging.config
from .base import Stream
from .exceptions import NotFound


logger = logging.getLogger(__name__)

logging.basicConfig(level='INFO', format='%(message)s')


class SignalHandler(Stream):

    def get_param(self):
        param = re.match('/rooms/([\w\d]+)/signalling', self.request.path)
        if not param:
            raise NotFound()
        return param.group(1)

    @asyncio.coroutine
    def get(self):
        room = self.get_param()
        uid = uuid.uuid4().hex
        self.send('event: uid\n')
        event = json.dumps(dict(type='uid', uid=uid))
        self.send("data: {}\n\n".format(event))
        yield from self.redis.publish(room, "event: newbuddy\n")
        yield from self.redis.publish(room, "data: {}\n\n")

        self.heartbeat()
        logger.debug('New participant was published with uid={}'.format(uid))
        subscriber = yield from self.redis.start_subscribe()

        # Subscribe to channel.
        yield from subscriber.subscribe([room])

        # Inside a while loop, wait for incoming events.
        while True:
            reply = yield from subscriber.next_published()
            self.send(reply.value)
            logger.debug('Received: %s from chanel %s', repr(reply.value), reply.channel)

    @asyncio.coroutine
    def post(self):
        room = self.get_param()
        event_type = 'unknown'
        event = ''
        yield from self.redis.publish(room, "event: {}\n".format(event_type))
        yield from self.redis.publish(room, "data: {}\n\n".format(event))
        # explicit returning 200/OK
