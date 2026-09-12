from django.apps import AppConfig

PLUGIN_NAME = "care_inventory"


class CareInventoryConfig(AppConfig):
    name = PLUGIN_NAME
    verbose_name = "Care Inventory"

    def ready(self):
        from care_inventory import signals  # noqa: F401
