from django import forms
from django.utils.translation import ugettext_lazy as _


class ContactForm(forms.Form):

    email = forms.EmailField(help_text=_('Your email'), required=False)
    body = forms.CharField(help_text=_('Something, that you want to tell us, it can be everything'),
                           widget=forms.Textarea())
