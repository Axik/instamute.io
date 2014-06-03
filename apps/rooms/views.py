import json
from django.views.generic import CreateView, DetailView, View
from django.shortcuts import get_object_or_404
from django.http import HttpResponse
import django_rq

redis_client = django_rq.get_connection()

from skd_tools.mixins import ActiveTabMixin
import short_url

from .models import Room


class RoomCreateView(ActiveTabMixin, CreateView):
    model = Room
    active_tab = 'home'


class RoomDetailView(DetailView):
    model = Room

    def get_object(self):
        decoded_id = short_url.decode_url(self.kwargs.get('shorten_id'))
        return get_object_or_404(self.model, **{'id': decoded_id})


class SignalingUpdate(View):

    def get(self, request, *args, **kwargs):
        room = self.kwargs.get('shorten_id')
        raw = self.request.body.decode('ascii')
        event = json.loads(raw)
        packet = (event, event['type'])
        redis_client.publish(room, json.dumps(packet))
        return HttpResponse()

    post = options = get


room_create = RoomCreateView.as_view()
room_detail = RoomDetailView.as_view()
signaling = SignalingUpdate.as_view()
