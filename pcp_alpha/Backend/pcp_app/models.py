from django.db import models


class CapabilitiesModel(models.Model):
    """
    CapabilitiesModel class creates a table in sqlite and stores
    plugin names and capability names.
    """
    plugin_capability_name = models.CharField(max_length=200)
    capability_name = models.CharField(max_length=200)

    def __str__(self):
        """
        This function returns a queryset as a string
        :return: queryset
        """
        return "{}-{}".format(self.plugin_capability_name, self.capability_name)

