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
    me = None
    room = None
    channel = None # message chanel

    def get_param(self):
        param = re.match('/rooms/([\w\d]+)/signalling', self.request.path)
        if not param:
            raise NotFound()
        return param.group(1)

    @asyncio.coroutine
    def get(self):
        self.room = self.get_param()
        # uid = uuid.uuid4().hex
        uid = lorem_ipsum.words(1, False).upper()
        self.me = uid
        data = dict(type='uid', uid=uid)
        data['from'] = uid
        self.send(data, event='uid' )

        yield from self.publish(self.room, json.dumps((data, 'newbuddy')))

        self.schedule_heartbeat()
        logger.debug('New participant was published with uid={}'.format(uid))
        self.channel = yield from self.dispatcher.register(self.room)

        # Inside a while loop, wait for incoming events.
        while True:
            value = yield from self.channel.get()
            data, event = json.loads(value)
            sender = data.get('from', '')
            to = data.get('to', '')
            if sender == uid:
                continue
            if to and to != self.me:
                continue

            self.send(data, event=event)
            logger.info('Transmitted: %s from message chanel %s', repr(event), self.room)

    def connection_lost(self, exc):
        logger.warning('Dropping connection')
        data = dict(type='dropped')
        data['from'] = self.me

        @asyncio.coroutine
        def drop():
            yield from self.channel.close()
            yield from self.publish(self.room, json.dumps((data, 'dropped')))
        asyncio.async(drop())
