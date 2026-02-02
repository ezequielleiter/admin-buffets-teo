"use client"
import React from "react";
import { useParams } from "next/navigation";
import useReporte from "../../../../hooks/useReporte";
import ProtectedRoute from "../../../../components/ProtectedRoute";
import DashboardLayout from "@/app/components/DashboardLayout";

function ReporteContent() {
  const params = useParams();
  const eventoId = params?.eventoid as string;

  const { data, loading, error } = useReporte(eventoId);

  return (
    <DashboardLayout title={`Reporte`}>
      <main className="flex-1 flex flex-col overflow-y-auto">
        <header className="h-16 md:h-20 border-b border-gray-200 bg-white flex items-center justify-between px-4 md:px-8 py-2 md:py-4 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <h2 className="text-base md:text-lg font-bold text-text-primary">Reporte</h2>
            <span className="text-sm text-text-secondary">Evento {eventoId}</span>
          </div>
        </header>

        <div className="p-4 md:p-8">
          {error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="text-red-800 font-medium mb-2">Error</h3>
              <p className="text-red-600 text-sm">{String(error)}</p>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : data ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  <h3 className="text-sm font-medium text-text-primary">Total vendido</h3>
                  <p className="mt-3 text-xl md:text-2xl font-bold text-primary">{formatCurrency(data.totalVendido)}</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  <h3 className="text-sm font-medium text-text-primary">Transferencia</h3>
                  <p className="mt-3 text-xl md:text-2xl font-bold text-primary">{formatCurrency(data.totalTransferencia)}</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  <h3 className="text-sm font-medium text-text-primary">Efectivo</h3>
                  <p className="mt-3 text-xl md:text-2xl font-bold text-primary">{formatCurrency(data.totalEfectivo)}</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  <h3 className="text-sm font-medium text-text-primary">Órdenes</h3>
                  <p className="mt-3 text-xl md:text-2xl font-bold text-primary">{data.cantidadOrdenes}</p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  <h3 className="text-sm font-medium text-text-primary">Top productos</h3>
                  {data.topProductos && data.topProductos.length > 0 ? (
                    <ol className="mt-3 space-y-2 list-decimal ml-5">
                      {data.topProductos.map((p: any) => (
                        <li key={p.id} className="flex items-center justify-between">
                          <span className="font-semibold text-text-primary">{p.nombre}</span>
                          <span className="text-text-secondary text-sm ml-4">{p.cantidad} unidades</span>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <div className="mt-3 text-text-secondary">N/A</div>
                  )}
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  <h3 className="text-sm font-medium text-text-primary">Top promos</h3>
                  {data.topPromos && data.topPromos.length > 0 ? (
                    <ol className="mt-3 space-y-2 list-decimal ml-5">
                      {data.topPromos.map((p: any) => (
                        <li key={p.id} className="flex items-center justify-between">
                          <span className="font-semibold text-text-primary">{p.nombre}</span>
                          <span className="text-text-secondary text-sm ml-4">{p.cantidad} unidades</span>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <div className="mt-3 text-text-secondary">N/A</div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="text-text-secondary">No hay datos para este reporte.</div>
          )}
        </div>
      </main>
    </DashboardLayout>
  );
}

export default function ReportePage() {
  return (
    <ProtectedRoute>
      <ReporteContent />
    </ProtectedRoute>
  );
}

function formatCurrency(value: number | undefined | null) {
  if (value === undefined || value === null) return "-";
  try {
    return value.toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
  } catch (e) {
    return String(value);
  }
}
