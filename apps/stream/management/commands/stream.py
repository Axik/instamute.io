import os
import asyncio
import asyncio_redis
import logging
import sse
from django.core.management.base import BaseCommand
from ...base import AppProtocol
from ...events import SignalHandler


logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Starts streaming http server'

    def handle(self, *args, **options):
        host, port = '0.0.0.0', os.environ.get('PORT', 8888)
        loop = asyncio.get_event_loop()
        start_server = sse.serve(SignalHandler, host, port, klass=AppProtocol)
        loop.run_until_complete(start_server)
        logger.info("Server listening on {0}:{1}".format(host, port))

        pool_size = os.environ.get('POOL_SIZE', 100)
        redis_pool = create_pooling(host='localhost', port=6379, poolsize=pool_size)
        loop.run_until_complete(redis_pool)
        logger.info("Redis pool initialized with pool_size={}".format(pool_size))
        loop.run_forever()


@asyncio.coroutine
def create_pooling(**kwargs):
    SignalHandler.redis = yield from asyncio_redis.Pool.create(**kwargs)