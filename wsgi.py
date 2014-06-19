import os
import newrelic.agent

newrelic.agent.initialize('/home/git/ssmid.io/none_and_void/newrelic.ini')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings.base')

from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
application = newrelic.agent.WSGIApplicationWrapper(application)