import os
import asyncio
import asyncio_redis
import logging
import sse
from django.core.management.base import BaseCommand
from django.conf import settings
from ...base import AppProtocol
from ...events import SignalHandler
from ...messages import MessageDispatcher


logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Starts streaming http server'

    def handle(self, *args, **options):
        host, port = '0.0.0.0', os.environ.get('PORT', 8888)
        init_app(host, port)
        loop = asyncio.get_event_loop()
        loop.run_forever()


def init_app(host, port):
    loop = asyncio.get_event_loop()
    start_server = sse.serve(SignalHandler, host, port, klass=AppProtocol)
    loop.run_until_complete(start_server)
    logger.info("Server listening on {0}:{1}".format(host, port))

    pool_size = os.environ.get('POOL_SIZE', 10)
    redis_pool = create_pooling(poolsize=pool_size, **settings.REDIS)
    loop.run_until_complete(redis_pool)
    logger.info("Redis pool initialized with pool_size={}".format(settings.AIOREDIS_POOL_SIZE))

    channels = create_channels(connection=SignalHandler.redis, loop=loop)
    loop.run_until_complete(channels)
    logger.info("Message dispatcher was initialized")
    logger.info("Message chanel policy: [{}]".format('LOCAL' if settings.STREAM_SCALE == 1 else 'GLOBAL'))


@asyncio.coroutine
def create_pooling(**kwargs):
    SignalHandler.redis = yield from asyncio_redis.Pool.create(**kwargs)


@asyncio.coroutine
def create_channels(**kwargs):
    SignalHandler.dispatcher = yield from MessageDispatcher.create(**kwargs)
