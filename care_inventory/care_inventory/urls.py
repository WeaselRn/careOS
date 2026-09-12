"""URL routes.

Core mounts this module at /api/care_inventory/ via the PLUGIN_APPS loop in
config/urls.py. Do not repeat that prefix here.

Routes under `otp/` are for the patient portal (OTP-authenticated, phone-number scoped).
Keep them read-mostly. See the care-auth-contexts skill.
"""

from django.urls import path
from rest_framework.routers import DefaultRouter

from care_inventory.viewsets.config import ConfigView
from care_inventory.viewsets.items import InventoryItemsView, InventoryOverviewView

router = DefaultRouter()
# router.register("things", ThingViewSet, basename="inventory-thing")
# router.register("otp/things", OTPThingViewSet, basename="otp-inventory-thing")

urlpatterns = [
    *router.urls,
    path("config/", ConfigView.as_view(), name="care_inventory-config"),
    path("items/", InventoryItemsView.as_view(), name="care_inventory-items"),
    path("summary/", InventoryOverviewView.as_view(), name="care_inventory-summary"),
]
