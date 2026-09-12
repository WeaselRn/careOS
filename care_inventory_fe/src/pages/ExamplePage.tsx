import { useMemo, useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { PlusIcon, SearchIcon, SlidersHorizontalIcon, MinusIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { API, type InventoryItem, type InventorySummary } from "@/utils/api";

const fallbackItems: InventoryItem[] = [
  {
    id: "inv-1001",
    sku: "MED-001",
    name: "Surgical gloves",
    category: "Supplies",
    unit: "boxes",
    quantity_on_hand: 42,
    reorder_level: 30,
    location_name: "Ward A",
    is_low_stock: false,
    last_updated: "2026-09-12T09:00:00Z",
  },
  {
    id: "inv-1002",
    sku: "PH-004",
    name: "IV fluids",
    category: "Pharmacy",
    unit: "bottles",
    quantity_on_hand: 18,
    reorder_level: 20,
    location_name: "Pharmacy",
    is_low_stock: true,
    last_updated: "2026-09-12T08:40:00Z",
  },
  {
    id: "inv-1003",
    sku: "DIAG-022",
    name: "Blood pressure cuffs",
    category: "Diagnostics",
    unit: "units",
    quantity_on_hand: 9,
    reorder_level: 12,
    location_name: "Store room",
    is_low_stock: true,
    last_updated: "2026-09-12T08:15:00Z",
  },
];

const fallbackSummary: InventorySummary = {
  total_items: fallbackItems.length,
  total_units: fallbackItems.reduce((sum, item) => sum + item.quantity_on_hand, 0),
  low_stock_items: fallbackItems.filter((item) => item.is_low_stock).length,
  categories: [...new Set(fallbackItems.map((item) => item.category))],
};

export default function ExamplePage() {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [stockFilter, setStockFilter] = useState<"all" | "low">("all");
  const [itemsOverride, setItemsOverride] = useState<InventoryItem[] | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    sku: "",
    category: "Supplies",
    unit: "units",
    quantity_on_hand: 0,
    reorder_level: 10,
    location_name: "",
  });
  const { data, isLoading } = useQuery({
    queryKey: ["care_inventory", "summary"],
    queryFn: async () => {
      try {
        const response = await API.summary();
        if (response?.items?.length) return response;
      } catch {
        // No backend available during isolated frontend development; fall back to sample data.
      }

      return {
        items: fallbackItems,
        summary: fallbackSummary,
      };
    },
  });

  const items = itemsOverride ?? data?.items ?? fallbackItems;
  const summary = useMemo(
    () => ({
      total_items: items.length,
      total_units: items.reduce((sum, item) => sum + item.quantity_on_hand, 0),
      low_stock_items: items.filter((item) => item.quantity_on_hand <= item.reorder_level).length,
      categories: [...new Set(items.map((item) => item.category))],
    }),
    [items],
  );
  const filteredItems = useMemo(
    () =>
      items.filter((item) => {
        const matchesQuery = `${item.name} ${item.sku} ${item.location_name}`
          .toLowerCase()
          .includes(query.toLowerCase());
        const matchesCategory = category === "All" || item.category === category;
        const matchesStock = stockFilter === "all" || item.quantity_on_hand <= item.reorder_level;
        return matchesQuery && matchesCategory && matchesStock;
      }),
    [category, items, query, stockFilter],
  );

  const adjustStock = (id: string, amount: number) => {
    setItemsOverride(
      items.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity_on_hand: Math.max(0, item.quantity_on_hand + amount),
              is_low_stock: item.quantity_on_hand + amount <= item.reorder_level,
            }
          : item,
      ),
    );
  };

  const addItem = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newItem.name.trim() || !newItem.sku.trim()) return;
    const item: InventoryItem = {
      ...newItem,
      id: `local-${Date.now()}`,
      name: newItem.name.trim(),
      sku: newItem.sku.trim().toUpperCase(),
      location_name: newItem.location_name.trim() || "Unassigned",
      is_low_stock: newItem.quantity_on_hand <= newItem.reorder_level,
      last_updated: new Date().toISOString(),
    };
    setItemsOverride([item, ...items]);
    setNewItem({
      name: "",
      sku: "",
      category: "Supplies",
      unit: "units",
      quantity_on_hand: 0,
      reorder_level: 10,
      location_name: "",
    });
    setShowAddForm(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 text-slate-900">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-700">
              {t("inventory__eyebrow")}
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              {t("inventory__page_title")}
            </h1>
          </div>
          <Button size="sm" onClick={() => setShowAddForm((open) => !open)}>
            <PlusIcon />
            {t("inventory__add_item")}
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">{t("inventory__total_items")}</p>
            <p className="mt-3 text-3xl font-semibold">{summary.total_items}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">{t("inventory__total_units")}</p>
            <p className="mt-3 text-3xl font-semibold">{summary.total_units}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">{t("inventory__low_stock")}</p>
            <p className="mt-3 text-3xl font-semibold text-amber-600">
              {summary.low_stock_items}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">{t("inventory__status")}</p>
            <p className="mt-3 text-lg font-semibold text-emerald-700">
              {isLoading ? t("inventory__loading") : t("inventory__stable")}
            </p>
          </div>
        </div>

        {showAddForm && (
          <form
            onSubmit={addItem}
            className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm"
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">{t("inventory__add_item")}</h2>
                <p className="text-sm text-slate-600">{t("inventory__add_item_hint")}</p>
              </div>
              <button type="button" className="text-sm text-slate-500" onClick={() => setShowAddForm(false)}>
                {t("inventory__cancel")}
              </button>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {[
                ["name", "inventory__name", "text"],
                ["sku", "inventory__sku", "text"],
                ["location_name", "inventory__location", "text"],
              ].map(([field, label, type]) => (
                <label key={field} className="text-sm font-medium text-slate-700">
                  {t(label)}
                  <input
                    required={field !== "location_name"}
                    type={type}
                    value={newItem[field as keyof typeof newItem]}
                    onChange={(event) =>
                      setNewItem((current) => ({ ...current, [field]: event.target.value }))
                    }
                    className="mt-1 h-9 w-full rounded-md border border-slate-300 bg-white px-3 font-normal outline-none focus:border-emerald-600"
                  />
                </label>
              ))}
              <label className="text-sm font-medium text-slate-700">
                {t("inventory__on_hand")}
                <input type="number" min="0" value={newItem.quantity_on_hand} onChange={(event) => setNewItem((current) => ({ ...current, quantity_on_hand: Number(event.target.value) }))} className="mt-1 h-9 w-full rounded-md border border-slate-300 bg-white px-3 font-normal" />
              </label>
              <label className="text-sm font-medium text-slate-700">
                {t("inventory__reorder")}
                <input type="number" min="0" value={newItem.reorder_level} onChange={(event) => setNewItem((current) => ({ ...current, reorder_level: Number(event.target.value) }))} className="mt-1 h-9 w-full rounded-md border border-slate-300 bg-white px-3 font-normal" />
              </label>
              <label className="text-sm font-medium text-slate-700">
                {t("inventory__category")}
                <select value={newItem.category} onChange={(event) => setNewItem((current) => ({ ...current, category: event.target.value }))} className="mt-1 h-9 w-full rounded-md border border-slate-300 bg-white px-3 font-normal">
                  {["Supplies", "Pharmacy", "Diagnostics", "Equipment"].map((option) => <option key={option}>{option}</option>)}
                </select>
              </label>
            </div>
            <Button type="submit" size="sm" className="mt-4">{t("inventory__save_item")}</Button>
          </form>
        )}

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <h2 className="text-lg font-semibold">{t("inventory__stock_table")}</h2>
              <p className="text-sm text-slate-500">{summary.categories.length} {t("inventory__categories_label")}</p>
            </div>
            <span className="text-sm text-slate-500">
              {filteredItems.length} / {items.length} {t("inventory__items_label")}
            </span>
          </div>

          <div className="flex flex-wrap gap-3 border-b border-slate-200 bg-slate-50 p-4">
            <label className="relative min-w-56 flex-1">
              <SearchIcon className="absolute left-3 top-2.5 size-4 text-slate-400" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("inventory__search")} className="h-9 w-full rounded-md border border-slate-300 bg-white pl-9 pr-3 text-sm outline-none focus:border-emerald-600" />
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <SlidersHorizontalIcon className="size-4" />
              <select value={category} onChange={(event) => setCategory(event.target.value)} className="h-9 rounded-md border border-slate-300 bg-white px-3">
                <option>All</option>
                {summary.categories.map((option) => <option key={option}>{option}</option>)}
              </select>
            </label>
            <Button size="sm" variant={stockFilter === "low" ? "warning" : "outline"} onClick={() => setStockFilter((current) => current === "low" ? "all" : "low")}>
              {t("inventory__low_stock_only")}
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left">
              <thead className="bg-slate-50 text-sm uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-medium">{t("inventory__name")}</th>
                  <th className="px-5 py-3 font-medium">{t("inventory__sku")}</th>
                  <th className="px-5 py-3 font-medium">{t("inventory__location")}</th>
                  <th className="px-5 py-3 font-medium">{t("inventory__on_hand")}</th>
                  <th className="px-5 py-3 font-medium">{t("inventory__reorder")}</th>
                  <th className="px-5 py-3 font-medium">{t("inventory__status")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-900">{item.name}</div>
                      <div className="text-slate-500">{item.category}</div>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{item.sku}</td>
                    <td className="px-5 py-4 text-slate-600">{item.location_name}</td>
                    <td className="px-5 py-4 font-medium text-slate-900">
                      <div className="flex items-center gap-2">
                        <button aria-label={t("inventory__decrease")} onClick={() => adjustStock(item.id, -1)} className="rounded border border-slate-300 p-1 text-slate-500 hover:bg-slate-100"><MinusIcon className="size-3" /></button>
                        <button aria-label={t("inventory__increase")} onClick={() => adjustStock(item.id, 1)} className="rounded border border-slate-300 p-1 text-emerald-700 hover:bg-emerald-50"><PlusIcon className="size-3" /></button>
                        <span className="ml-1">{item.quantity_on_hand} {item.unit}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{item.reorder_level}</td>
                    <td className="px-5 py-4">
                      <span className={[
                        "inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
                        item.quantity_on_hand <= item.reorder_level ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800",
                      ].join(" ")}>
                        {item.quantity_on_hand <= item.reorder_level ? t("inventory__low") : t("inventory__healthy")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
