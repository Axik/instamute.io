import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings.base')

#Let's wrap with newrelic if it's installed
try:
    from newrelic import agent
    confpath = os.environ.get('NEWRELIC_CONFIG_PATH')
    if confpath and os.path.exists(confpath):
        agent.initialize(confpath)
        application = agent.WSGIApplicationWrapper(get_wsgi_application())
    else:
        application = get_wsgi_application()
except ImportError:
    application = get_wsgi_application()