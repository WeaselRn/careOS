import uuid

from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="InventoryItem",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("sku", models.CharField(max_length=50, unique=True)),
                ("name", models.CharField(max_length=200)),
                ("category", models.CharField(default="General", max_length=100)),
                ("unit", models.CharField(default="units", max_length=30)),
                ("quantity_on_hand", models.IntegerField(default=0)),
                ("reorder_level", models.IntegerField(default=0)),
                ("location_name", models.CharField(blank=True, max_length=200)),
                ("is_active", models.BooleanField(default=True)),
                ("last_updated", models.DateTimeField(auto_now=True)),
            ],
            options={
                "verbose_name": "Inventory item",
                "verbose_name_plural": "Inventory items",
                "ordering": ["name"],
            },
        ),
        migrations.CreateModel(
            name="StockMovement",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("movement_type", models.CharField(choices=[("restock", "Restock"), ("issue", "Issue"), ("adjustment", "Adjustment"), ("transfer", "Transfer")], max_length=20)),
                ("quantity", models.IntegerField()),
                ("reference", models.CharField(blank=True, max_length=100)),
                ("notes", models.TextField(blank=True)),
                ("occurred_at", models.DateTimeField(auto_now_add=True)),
                ("item", models.ForeignKey(on_delete=models.deletion.CASCADE, related_name="movements", to="care_inventory.inventoryitem")),
            ],
            options={
                "ordering": ["-occurred_at"],
            },
        ),
    ]
