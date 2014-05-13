from django.views.generic import RedirectView
from django.core.urlresolvers import reverse_lazy


class MainView(RedirectView):
    url = reverse_lazy('rooms:create')


main = MainView.as_view()
