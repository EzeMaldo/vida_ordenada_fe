"use client";
import { useSyncData } from "@/hooks/useSyncData";
import { CategoryDto } from "@/types";
import { Tag } from "lucide-react";

const bucketLabel: Record<string, string> = {
  FIXED: "Fijo",
  VARIABLE: "Variable",
  DEBT: "Deuda",
  INVEST: "Inversión",
};

const bucketColor: Record<string, string> = {
  FIXED: "#48CAE4",
  VARIABLE: "#2ECC71",
  DEBT: "#FF4D6D",
  INVEST: "#FFD60A",
};

function CategoryRow({ cat }: { cat: CategoryDto }) {
  return (
    <div className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/2 transition-colors">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: `${cat.colorHex}20`, border: `1px solid ${cat.colorHex}40` }}
      >
        <div className="w-3 h-3 rounded-full" style={{ background: cat.colorHex }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-text-primary text-sm font-medium truncate">{cat.name}</p>
        {cat.isDefault && (
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.28)" }}>Predeterminada</p>
        )}
      </div>
      <span
        className="text-xs font-medium px-2.5 py-0.5 rounded-full flex-shrink-0"
        style={{
          background: `${bucketColor[cat.bucket] || "#888"}20`,
          color: bucketColor[cat.bucket] || "#888",
          border: `1px solid ${bucketColor[cat.bucket] || "#888"}40`,
        }}
      >
        {bucketLabel[cat.bucket] || cat.bucket}
      </span>
    </div>
  );
}

export default function CategoriesPage() {
  const { data } = useSyncData();
  const categories = data?.categories || [];

  const incomeCategories = categories.filter((c) => c.type === "INCOME");
  const expenseCategories = categories.filter((c) => c.type === "EXPENSE");

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card rounded-xl p-4">
          <p className="text-xs mb-1" style={{ color: "rgba(255,255,255,0.45)" }}>Categorías de ingreso</p>
          <p className="text-2xl font-bold" style={{ color: "#2ECC71" }}>{incomeCategories.length}</p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <p className="text-xs mb-1" style={{ color: "rgba(255,255,255,0.45)" }}>Categorías de gasto</p>
          <p className="text-2xl font-bold" style={{ color: "#FF4D6D" }}>{expenseCategories.length}</p>
        </div>
      </div>

      {categories.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <Tag size={32} style={{ color: "rgba(255,255,255,0.2)" }} className="mx-auto mb-3" />
          <p className="text-text-muted text-sm">Sin categorías</p>
          <p className="text-text-muted text-xs mt-1">Sincronizá para ver tus categorías</p>
        </div>
      ) : (
        <>
          {/* Income */}
          {incomeCategories.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full" style={{ background: "#2ECC71" }} />
                <p className="text-sm font-semibold text-text-primary">Ingresos</p>
                <span className="text-xs ml-auto" style={{ color: "rgba(255,255,255,0.28)" }}>
                  {incomeCategories.length} categorías
                </span>
              </div>
              <div className="glass-card rounded-2xl overflow-hidden">
                <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                  {incomeCategories.map((c) => <CategoryRow key={c.id} cat={c} />)}
                </div>
              </div>
            </div>
          )}

          {/* Expense */}
          {expenseCategories.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full" style={{ background: "#FF4D6D" }} />
                <p className="text-sm font-semibold text-text-primary">Gastos</p>
                <span className="text-xs ml-auto" style={{ color: "rgba(255,255,255,0.28)" }}>
                  {expenseCategories.length} categorías
                </span>
              </div>
              <div className="glass-card rounded-2xl overflow-hidden">
                <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                  {expenseCategories.map((c) => <CategoryRow key={c.id} cat={c} />)}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
