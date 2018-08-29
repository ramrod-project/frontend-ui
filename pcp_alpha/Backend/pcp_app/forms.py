from django import forms
from brain.checks import verify as brain_verify
from brain.brain_pb2 import Plugin


class TargetForm(forms.Form):
    """
    TargetForm class is the template to add a new target as a form.
    """
    plugin_name = forms.CharField(label='plugin_name', max_length=100)
    location_num = forms.CharField(label='location_num', max_length=39)
    port_num = forms.CharField(label='port_num', max_length=4)
    optional_char = forms.CharField(label='optional', max_length=100, required=False)


def verify_plugin_data(plugin_data):
    """

    :param plugin_data:
    :return: <bool>
    """
    return brain_verify(plugin_data, Plugin())