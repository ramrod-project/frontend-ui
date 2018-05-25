from django.forms import ModelForm
from django import forms


# TODO: Add comments to function below
class TargetForm(forms.Form):
    # target info
    plugin_name = forms.CharField(label='plugin_name', max_length=100)
    location_num = forms.CharField(label='location_num', max_length=15)
    port_num = forms.CharField(label='port_num', max_length=4)
    optional_char = forms.CharField(label='optional', max_length=100)

