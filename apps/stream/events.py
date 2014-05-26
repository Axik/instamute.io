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

        connection = yield from self.get_connection()
        yield from connection.publish(self.room, json.dumps((data, 'newbuddy')))

        self.heartbeat()
        logger.info('New participant was published with uid={}'.format(uid))
        subscriber = yield from connection.start_subscribe()

        # Subscribe to channel.
        yield from subscriber.subscribe([self.room])

        # Inside a while loop, wait for incoming events.
        while True:
            reply = yield from subscriber.next_published()
            data, event = json.loads(reply.value)
            sender = data.get('from', '')
            to = data.get('to', '')
            if sender == uid:
                continue
            if to and to != self.me:
                continue

            self.send(data, event=event)
            logger.info('Transmitted: %s from chanel %s', repr(event), reply.channel)

    @asyncio.coroutine
    def get_connection(self):
        while True:
            connection = self.redis._get_free_connection()
            if not connection:
                yield from asyncio.sleep(0.001)
            else:
                yield
                return connection

    def connection_lost(self, exc):
        logger.warning('Dropping connection')
        data = dict(type='dropped')
        data['from'] = self.me

        @asyncio.coroutine
        def drop():
            connection = yield from self.get_connection()
            yield from connection.publish(self.room, json.dumps((data, 'dropped')))

        asyncio.async(drop())
