from rest_framework import serializers

from care_inventory.models.items import InventoryItem, StockMovement


class InventoryItemSerializer(serializers.ModelSerializer):
    is_low_stock = serializers.BooleanField(read_only=True)

    class Meta:
        model = InventoryItem
        fields = (
            "id",
            "sku",
            "name",
            "category",
            "unit",
            "quantity_on_hand",
            "reorder_level",
            "location_name",
            "is_low_stock",
            "last_updated",
        )
        read_only_fields = fields


class StockMovementSerializer(serializers.ModelSerializer):
    class Meta:
        model = StockMovement
        fields = (
            "id",
            "item",
            "movement_type",
            "quantity",
            "reference",
            "notes",
            "occurred_at",
        )
        read_only_fields = fields
