import json
from django.views.generic import CreateView, DetailView, View
from django.shortcuts import get_object_or_404
from django.http import HttpResponse
import django_rq

redis_client = django_rq.get_connection()


import short_url

from .models import Room


class RoomCreateView(CreateView):
    model = Room


class RoomDetailView(DetailView):
    model = Room

    def get_object(self):
        decoded_id = short_url.decode_url(self.kwargs.get('shorten_id'))
        return get_object_or_404(self.model, **{'id': decoded_id})


class SinalingUpdate(View):

    def get(self, request, *args, **kwargs):
        room = self.kwargs.get('shorten_id')
        # b'{"type":"icecandidate","from":"4390d76aaa514006b753e77b5bdccd96","candidate":{"candidate":"candidate:1 2 UDP 1686110206 193.239.74.126 56125 typ srflx raddr 10.2.2.41 rport 56125","sdpMid":"","sdpMLineIndex":0}}'
        raw = self.request.body.decode('ascii')
        event = json.loads(raw)
        packet = (event, event['type'])
        redis_client.publish(room, json.dumps(packet))
        return HttpResponse()

    post = options = get


room_create = RoomCreateView.as_view()
room_detail = RoomDetailView.as_view()
signaling =  SinalingUpdate.as_view()
