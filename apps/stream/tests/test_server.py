import uuid
import json
import redis
import requests
import logging
from django.conf import settings


from .utils import LiveSSEServer


redis_client = redis.StrictRedis(**settings.REDIS)
logger = logging.getLogger(__name__)


class EventBehaviorTest(LiveSSEServer):

    def setUp(self):
        self.current_room = uuid.uuid4().hex[:5]
        self.room_link = '{}/rooms/{}/signalling'.format(self.live_server_url, self.current_room)

    def test_connect_and_uid(self):
        logger.warn('test_connect_and_uid')
        r = requests.get(self.room_link, stream=True)
        self.assertEqual(r.status_code, 200)
        name, data = self.read_event(r)

        self.assertEqual(name, 'uid')
        self.assertIn('from', data)
        self.assertIn('type', data)
        self.assertIn('uid', data)

    def test_new_buddy(self):
        logger.warn('test_new_buddy')

        first_stream = requests.get(self.room_link, stream=True)
        self.assertEqual(first_stream.status_code, 200)
        name, data = self.read_event(first_stream)
        self.assertEqual(name, 'uid')
        # first stream connected

        second_stream = requests.get(self.room_link, stream=True)
        self.assertEqual(second_stream.status_code, 200)
        name, data = self.read_event(second_stream)
        self.assertEqual(name, 'uid')
        # second stream connected

        new_buddy, data = self.read_event(first_stream)
        self.assertEqual(new_buddy, 'newbuddy')
        self.assertIn('from', data)
        self.assertIn('type', data)
        self.assertIn('uid', data)
        # new buddy received

    def test_message_to_me(self):
        logger.warn('test_message_to_me')

        first_stream = requests.get(self.room_link, stream=True)
        self.assertEqual(first_stream.status_code, 200)
        name, data = self.read_event(first_stream)
        self.assertEqual(name, 'uid')
        me = data['uid']
        # first stream connected

        # publish message
        redis_client.publish(self.current_room, json.dumps([{'to': me, }, 'any_event']))
        name, data = self.read_event(first_stream)

        self.assertEqual(name, 'any_event')
        self.assertEqual(data, {'to': me})

    def test_message_to_all(self):
        logger.warn('test_message_to_all')

        first_stream = requests.get(self.room_link, stream=True)
        self.assertEqual(first_stream.status_code, 200)
        name, data = self.read_event(first_stream)
        self.assertEqual(name, 'uid')
        me = data['uid']
        # first stream connected

        second_stream = requests.get(self.room_link, stream=True)
        self.assertEqual(second_stream.status_code, 200)
        name, data = self.read_event(second_stream)
        self.assertEqual(name, 'uid')
        # second stream connected
        new_buddy, data = self.read_event(first_stream)

        # publish message
        redis_client.publish(self.current_room, json.dumps([{'foo': 'bar'}, 'any_event']))
        name, data = self.read_event(first_stream)

        self.assertEqual(name, 'any_event')
        self.assertEqual(data, {'foo': 'bar'})

        name, data = self.read_event(second_stream)
        self.assertEqual(name, 'any_event')
        self.assertEqual(data, {'foo': 'bar'})

    def test_message_from_me(self):
        first_stream = requests.get(self.room_link, stream=True)
        self.assertEqual(first_stream.status_code, 200)
        name, data = self.read_event(first_stream)
        self.assertEqual(name, 'uid')
        me = data['uid']
        # first stream connected

        # publish message
        redis_client.publish(self.current_room, json.dumps([{'foo': 'bar', 'from': me}, 'any_event']))

        with self.assertRaises(TimeoutError):
            # timeout, nothing received
            name, data = self.read_event(first_stream)

    def test_drop_connection(self):
        logger.warn('test_drop_connection')

        first_stream = requests.get(self.room_link, stream=True)
        self.assertEqual(first_stream.status_code, 200)
        name, data = self.read_event(first_stream)
        self.assertEqual(name, 'uid')
        me = data['uid']
        # first stream connected

        second_stream = requests.get(self.room_link, stream=True)
        self.assertEqual(second_stream.status_code, 200)
        name, data = self.read_event(second_stream)
        self.assertEqual(name, 'uid')
        # second stream connected

        first_stream = None

        name, data = self.read_event(second_stream)

        self.assertEqual(name, 'dropped')
