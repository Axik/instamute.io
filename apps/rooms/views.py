import json
import string
import random
import django_rq
from django.views.generic import CreateView, DetailView, View
from django.shortcuts import redirect
from django.http import HttpResponse,Http404
from django.core.urlresolvers import reverse_lazy
from .models import Room


redis_client = django_rq.get_connection()


class RoomCreateView(CreateView):
    model = Room

    def form_valid(self, *args, **kwargs):
        rid = ''.join(random.choice(string.ascii_lowercase) for _ in range(5))
        redis_client.set(rid, 1)
        return redirect(reverse_lazy('rooms:detail', kwargs={'shorten_id': rid}))


class RoomDetailView(DetailView):
    model = Room

    def get_object(self):
        rid = self.kwargs.get('shorten_id')
        room = redis_client.get(rid)
        if room is None:
            raise Http404('Room not found')
        return room


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
