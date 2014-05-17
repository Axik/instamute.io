import asyncio
import asyncio_redis
import logging.config
import sse
from django.core.management.base import BaseCommand
from ...events import SignalHandler


logger = logging.getLogger(__name__)
logging.basicConfig(level='INFO', format='%(message)s')

class Command(BaseCommand):
    help = 'Starts streaming http server'

    def handle(self, *args, **options):
        host, port = 'localhost', 8888
        loop = asyncio.get_event_loop()
        start_server = sse.serve(SignalHandler, host, port)
        loop.run_until_complete(start_server)
        logger.info("Server listening on {0}:{1}".format(host, port))

        redis_pool = create_pooling(host='localhost', port=6379, poolsize=10)
        loop.run_until_complete(redis_pool)
        logger.info("Redis pool initialized with pool_size={}".format(10))
        loop.run_forever()


@asyncio.coroutine
def create_pooling(**kwargs):
    SignalHandler.redis = yield from asyncio_redis.Pool.create(**kwargs)