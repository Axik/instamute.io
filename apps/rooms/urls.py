from django.conf.urls import patterns, url

urlpatterns = patterns(
    'rooms.views',
    url(r'^(?P<shorten_id>\S{4,8})$', 'room_detail', name='detail'),
    url(r'^$', 'room_create', name='create')
)
