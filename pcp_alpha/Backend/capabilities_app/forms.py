from django.forms import ModelForm
from .models import CapabilitiesModel


class CapabilitiesForm(ModelForm):
    """
    CapabilitiesForm class is a custom form to add new plugin names
    and capabilities.
    Dev Note: The form might not be used in the future.
    """
    class Meta:
        model = CapabilitiesModel
        fields = ('plugin_capability_name', 'capability_name')
