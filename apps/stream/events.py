import re
import uuid
import json
import asyncio
import logging.config
from .base import Stream
from .exceptions import NotFound
from django.contrib.webdesign import lorem_ipsum


logger = logging.getLogger(__name__)


class SignalHandler(Stream):

    def get_param(self):
        param = re.match('/rooms/([\w\d]+)/signalling', self.request.path)
        if not param:
            raise NotFound()
        return param.group(1)

    @asyncio.coroutine
    def get(self):
        room = self.get_param()
        # uid = uuid.uuid4().hex
        uid = lorem_ipsum.words(1, False).capitalize()
        data = dict(type='uid', uid=uid)
        data['from'] = uid
        self.send(data, event='uid' )
        yield from self.redis.publish(room, json.dumps((data, 'newbuddy')))

        self.heartbeat()
        logger.info('New participant was published with uid={}'.format(uid))
        subscriber = yield from self.redis.start_subscribe()

        # Subscribe to channel.
        yield from subscriber.subscribe([room])

        connected_to_me = set()
        # Inside a while loop, wait for incoming events.
        while True:
            reply = yield from subscriber.next_published()
            data, event = json.loads(reply.value)
            sender = data.get('from', '')
            if sender == uid:
                continue
            # if sender in connected_to_me:
            #     logger.info('Ignoring event from %s, %s', sender, data)
            #     continue
            # elif event == 'connected':
            #     logger.info('RTC session was established')
            #     connected_to_me.add(sender)

            self.send(data, event=event)
            logger.info('Transmitted: %s from chanel %s', repr(event), reply.channel)
