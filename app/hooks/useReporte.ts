import { useState, useEffect, useCallback } from "react";
import teoAuth from "../lib/teoAuth";

type ReporteResult = {
  data: any | null;
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
};

function buildReporteUrl(eventoId: string, baseUrl?: string) {
  if (baseUrl) {
    try {
      const u = new URL("/api/admin-buffets/reporte", baseUrl);
      u.searchParams.set("evento_id", eventoId);
      return u.toString();
    } catch (e) {
      return `${baseUrl.replace(/\/$/, "")}/api/admin-buffets/reporte?eventoId=${encodeURIComponent(
        eventoId
      )}`;
    }
  }

  return `/api/admin-buffets/reporte?evento_id=${encodeURIComponent(eventoId)}`;
}

export function useReporte(eventoId?: string): ReporteResult {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(!!eventoId);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!eventoId) return;
    setLoading(true);
    setError(null);
    try {
      const finalUrl = buildReporteUrl(eventoId);
        
      const res = await teoAuth.authenticatedRequest(finalUrl);


      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err?.error || `HTTP ${res.status}`);
      }

      const json = await res.json();
      setData(json);
    } catch (e: any) {
      console.error("useReporte error:", e);
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [eventoId]);

  useEffect(() => {
    if (!eventoId) return;
    load();
  }, [eventoId, load]);

  return {
    data,
    loading,
    error,
    reload: load,
  };
}

export default useReporte;
