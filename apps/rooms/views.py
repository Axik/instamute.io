import json
from django.views.generic import CreateView, DetailView, View, DeleteView
from django.shortcuts import get_object_or_404
from django.core.urlresolvers import reverse_lazy
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


class SignalingUpdate(View):

    def get(self, request, *args, **kwargs):
        room = self.kwargs.get('shorten_id')
        raw = self.request.body.decode('ascii')
        event = json.loads(raw)
        packet = (event, event['type'])
        redis_client.publish(room, json.dumps(packet))
        return HttpResponse()

    post = options = get


class RoomDeleteView(DeleteView):
    model = Room

    def get_object(self):
        decoded_id = short_url.decode_url(self.kwargs.get('shorten_id'))
        return get_object_or_404(self.model, **{'id': decoded_id})

    def delete(self, request, *args, **kwargs):
        response = super().delete(request, *args, **kwargs)
        room = self.kwargs.get('shorten_id')
        packet = ({}, 'deleted')
        redis_client.publish(room, json.dumps(packet))
        return response

    def get_success_url(self):
        return reverse_lazy('rooms:create')

    get = delete

room_create = RoomCreateView.as_view()
room_detail = RoomDetailView.as_view()
signaling = SignalingUpdate.as_view()
room_delete = RoomDeleteView.as_view()
