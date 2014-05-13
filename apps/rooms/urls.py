from django.conf.urls import patterns, url

urlpatterns = patterns(
    'rooms.views',
    url(r'^(?P<shorten_id>\S+)$', 'room_detail', name='detail'),
    url(r'^$', 'room_create', name='create')
)
