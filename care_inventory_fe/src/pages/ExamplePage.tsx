import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

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

  const items = data?.items ?? fallbackItems;
  const summary = data?.summary ?? fallbackSummary;

  return (
    <div className="min-h-screen bg-slate-50 p-6 text-slate-900">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-700">
              {t("inventory__eyebrow")}
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              {t("inventory__page_title")}
            </h1>
          </div>
          <div className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-800">
            {summary.categories.length} {t("inventory__categories_label")}
          </div>
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

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <h2 className="text-lg font-semibold">{t("inventory__stock_table")}</h2>
            <span className="text-sm text-slate-500">
              {items.length} {t("inventory__items_label")}
            </span>
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
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-900">{item.name}</div>
                      <div className="text-slate-500">{item.category}</div>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{item.sku}</td>
                    <td className="px-5 py-4 text-slate-600">{item.location_name}</td>
                    <td className="px-5 py-4 font-medium text-slate-900">
                      {item.quantity_on_hand} {item.unit}
                    </td>
                    <td className="px-5 py-4 text-slate-600">{item.reorder_level}</td>
                    <td className="px-5 py-4">
                      <span
                        className={[
                          "inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
                          item.is_low_stock
                            ? "bg-amber-100 text-amber-800"
                            : "bg-emerald-100 text-emerald-800",
                        ].join(" ")}
                      >
                        {item.is_low_stock ? t("inventory__low") : t("inventory__healthy")}
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
