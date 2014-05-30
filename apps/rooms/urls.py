from django.conf.urls import patterns, url

urlpatterns = patterns(
    'rooms.views',
    url(r'^(?P<shorten_id>\S{4,8})/signalling$', 'signaling', name='signaling'),
    url(r'^(?P<shorten_id>\S{4,8})$', 'room_detail', name='detail'),
    url(r'^delete/(?P<shorten_id>\S{4,8})$', 'room_delete', name='delete'),
    url(r'^$', 'room_create', name='create')
)
