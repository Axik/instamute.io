import re
import uuid
import json
import asyncio
import logging
from .base import Stream
from .exceptions import NotFound
from aiohttp.errors import HttpErrorException
from django.contrib.webdesign import lorem_ipsum
from django.conf import settings


logger = logging.getLogger(__name__)


class SignalHandler(Stream):
    me = None
    room = None
    channel = None  # message chanel

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
        self.send(data, event='uid')
        yield from self.validate_client()

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
            connection = yield from self.get_connection()
            yield from connection.srem("members{}".format(self.room), [self.me])
        asyncio.async(drop())

    @asyncio.coroutine
    def validate_client(self):
        connection = yield from self.get_connection()
        members = yield from connection.scard("members{}".format(self.room))
        if members > settings.MAX_MEMBERS:
            logger.warn('Room [%s] is already full', self.room)
            self.send({"message": "Room is full"}, event='rejected')
            raise HttpErrorException(409, message='Rejected')
        yield from connection.sadd("members{}".format(self.room), [self.me])
        logger.info('Client [%s] was validated', self.me)
