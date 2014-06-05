import json
import logging
import signal
import asyncio
import threading
from django.test import TestCase
from http.client import IncompleteRead
from ..management.commands.stream import init_app


logger = logging.getLogger(__name__)


class SSEThreadedServer(threading.Thread):

    @classmethod
    def create(cls, host, port, is_ready):
        thread = cls(daemon=True)
        cls.host = host
        cls.port = port
        cls.is_ready = is_ready
        thread.start()
        return thread

    def run(self):
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        loop.set_debug(True)
        self.loop = loop
        init_app(self.host, self.port)
        self.is_ready.set()
        loop.run_forever()


class LiveSSEServer(TestCase):
    PORT = 9000

    @property
    def live_server_url(self):
        return 'http://%s:%s' % ('0.0.0.0', self.PORT)

    @classmethod
    def setUpClass(cls):
        is_ready = threading.Event()
        cls.server = SSEThreadedServer.create('0.0.0.0', cls.PORT, is_ready=is_ready)
        is_ready.wait()
        super(LiveSSEServer, cls).setUpClass()

    @classmethod
    def tearDownClass(cls):
        cls.server.join(0.1)
        try:
            cls.server.loop.close()
        except Exception as e:
            logger.exception()

    def _read_event(self, response):
        try:
            event_name = str(response.raw.readline(), encoding='ascii')
            event_data = str(response.raw.readline(), encoding='ascii')
        except IncompleteRead as e:
            self.fail('Server bad response: {}'.format(e))
        newline = response.raw.readline()
        return self.parse_name(event_name), self.parse_data(event_data)

    def read_event(self, response):
        with UnixSignalDeathPenalty(1):
            return self._read_event(response)

    def parse_name(self, raw):
        _, name = raw.split(':')
        return name.strip()

    def parse_data(self, raw):
        data = json.loads(raw.split(':', 1)[-1].strip(' \n'))
        return data


class UnixSignalDeathPenalty(object):

    def handle_penalty(self, signum, frame):
        raise TimeoutError('Timeout')

    def __init__(self, timeout):
        self._timeout = timeout

    def __enter__(self):
        self.setup()

    def __exit__(self, type, value, traceback):
        # Always cancel immediately, since we're done
        self.cancel()
        return False

    def setup(self):
        """Sets up an alarm signal and a signal handler that raises
        a Runtime after the timeout amount (expressed in
        seconds).
        """
        signal.signal(signal.SIGALRM, self.handle_penalty)
        signal.alarm(self._timeout)

    def cancel(self):
        signal.alarm(0)
        signal.signal(signal.SIGALRM, signal.SIG_DFL)
