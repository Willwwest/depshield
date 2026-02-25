"use client"

import { useState, useEffect } from "react"
import type { DependencyNode } from "@/lib/types"

interface UsePackageDetailReturn {
  data: DependencyNode | null;
  isLoading: boolean;
  error: string | null;
}

export function usePackageDetail(packageName: string): UsePackageDetailReturn {
  const [data, setData] = useState<DependencyNode | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('scanResult');
    if (stored) {
      try {
        const scanResult = JSON.parse(stored);
        const found = scanResult.dependencies?.find(
          (d: DependencyNode) => d.name === packageName
        );
        if (found) {
          setData(found);
          setIsLoading(false);
          return;
        }
      } catch {
        // fall through to API call
      }
    }

    const controller = new AbortController();

    async function fetchDetail() {
      try {
        const res = await fetch(`/api/package/${encodeURIComponent(packageName)}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`Failed to fetch: ${res.statusText}`);
        const result = await res.json();
        setData(result);
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setError(err.message);
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchDetail();
    return () => controller.abort();
  }, [packageName]);

  return { data, isLoading, error };
}
