from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from care_inventory.models.items import InventoryItem
from care_inventory.serializers.items import InventoryItemSerializer


class InventoryOverviewView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        queryset = InventoryItem.objects.filter(is_active=True)
        items = InventoryItemSerializer(queryset, many=True).data

        summary = {
            "total_items": len(items),
            "total_units": sum(item["quantity_on_hand"] for item in items),
            "low_stock_items": sum(1 for item in items if item["is_low_stock"]),
            "categories": sorted({item["category"] for item in items}),
        }

        return Response({"items": items, "summary": summary}, status=status.HTTP_200_OK)


class InventoryItemsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        queryset = InventoryItem.objects.filter(is_active=True).order_by("name")
        serializer = InventoryItemSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
