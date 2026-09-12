# Care Inventory

Stock management for CARE

A [CARE](https://github.com/ohcnetwork/care) backend plugin. It is an ordinary Django app,
pip-installed into core and registered through `plug_config.py`. Core contains no reference
to this package.

## Install (local development)

Place the plugin inside the backend checkout as a **real directory**. A symlink breaks
`docker build`, which cannot follow links out of the build context.

```bash
mv /path/to/care_inventory $CARE_BE/care_inventory
```

`care/plug_config.py`:

```python
care_inventory = Plug(
    name="care_inventory",
    package_name="care_inventory",
    version="",
    configs={
        "INVENTORY_ENABLED": True,
    },
)

plugs = [care_inventory, ...]
```

Plugins are pip-installed at **image build time**, so a newly registered plug needs a rebuild:

```bash
cd $CARE_BE
make down      # safe stop. NOT `make teardown` — that deletes the database volume.
make build     # re-runs install_plugins.py
make up
make makemigrations && make migrate
```

`backend` and `celery` share one image, so a single rebuild covers both.

## API

Mounted automatically at `/api/care_inventory/` by core's `config/urls.py`.

| Method | Path | Description |
| --- | --- | --- |
| GET | `/api/care_inventory/config/` | Client-safe configuration |
| GET | `/api/care_inventory/items/` | Active inventory records with stock and reorder thresholds |
| GET | `/api/care_inventory/summary/` | Totals, low-stock count, and category grouping |

The plugin ships with an `InventoryItem` model, `StockMovement` history, and a `summary` endpoint for facility dashboards.

## Settings

Resolution order: `PLUGIN_CONFIGS["care_inventory"][key]` → environment variable → default.
See `care_inventory/settings.py`.
