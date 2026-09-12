from __future__ import annotations

import uuid

from django.db import models


class InventoryItem(models.Model):
    """A stock record that can be tracked from the facility home page."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    sku = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=200)
    category = models.CharField(max_length=100, default="General")
    unit = models.CharField(max_length=30, default="units")
    quantity_on_hand = models.IntegerField(default=0)
    reorder_level = models.IntegerField(default=0)
    location_name = models.CharField(max_length=200, blank=True)
    is_active = models.BooleanField(default=True)
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]
        verbose_name = "Inventory item"
        verbose_name_plural = "Inventory items"

    def __str__(self):
        return f"{self.name} ({self.sku})"

    @property
    def is_low_stock(self):
        return self.quantity_on_hand <= self.reorder_level


class StockMovement(models.Model):
    """Records stock-in and stock-out changes for an item."""

    MOVEMENT_TYPES = (
        ("restock", "Restock"),
        ("issue", "Issue"),
        ("adjustment", "Adjustment"),
        ("transfer", "Transfer"),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    item = models.ForeignKey("InventoryItem", on_delete=models.CASCADE, related_name="movements")
    movement_type = models.CharField(max_length=20, choices=MOVEMENT_TYPES)
    quantity = models.IntegerField()
    reference = models.CharField(max_length=100, blank=True)
    notes = models.TextField(blank=True)
    occurred_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-occurred_at"]

    def __str__(self):
        return f"{self.movement_type}: {self.quantity} for {self.item}"
