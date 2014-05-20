import re
import pickle
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
        data = dict(type='uid', uid=uid)
        self.send(data, event='uid' )
        yield from self.redis.publish(room, json.dumps((data, 'newbuddy')))

        self.heartbeat()
        logger.info('New participant was published with uid={}'.format(uid))
        subscriber = yield from self.redis.start_subscribe()

        # Subscribe to channel.
        yield from subscriber.subscribe([room])

        # Inside a while loop, wait for incoming events.
        while True:
            reply = yield from subscriber.next_published()
            data, event = json.loads(reply.value)
            if data.get('from', '') == uid:
                continue
            self.send(data, event=event)
            logger.info('Transmitted: %s from chanel %s', repr(event), reply.channel)
