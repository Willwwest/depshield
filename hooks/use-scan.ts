"use client"

import { useState, useCallback } from "react"
import type { ScanResult, ScanStep, ScanStepStatus } from "@/lib/types"
import { SCAN_STEPS } from "@/lib/constants"
import { MOCK_RESULTS } from "@/lib/mock-data"

interface UseScanReturn {
  steps: ScanStep[];
  currentStep: number;
  isScanning: boolean;
  isComplete: boolean;
  error: string | null;
  result: ScanResult | null;
  startScan: (input: { repoUrl?: string; packageJson?: string; demo?: string }) => Promise<void>;
}

function createInitialSteps(): ScanStep[] {
  return SCAN_STEPS.map(s => ({
    id: s.id,
    label: s.label,
    description: s.description,
    status: 'pending' as ScanStepStatus,
  }));
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function useScan(): UseScanReturn {
  const [steps, setSteps] = useState<ScanStep[]>(createInitialSteps);
  const [currentStep, setCurrentStep] = useState(-1);
  const [isScanning, setIsScanning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);

  const advanceStep = useCallback((stepIndex: number) => {
    setCurrentStep(stepIndex);
    setSteps(prev => prev.map((s, i) => ({
      ...s,
      status: i < stepIndex ? 'complete' : i === stepIndex ? 'active' : 'pending',
    })));
  }, []);

  const startScan = useCallback(async (input: { repoUrl?: string; packageJson?: string; demo?: string }) => {
    setIsScanning(true);
    setIsComplete(false);
    setError(null);
    setResult(null);
    setSteps(createInitialSteps());

    try {
      if (input.demo) {
        const mockResult = MOCK_RESULTS[input.demo];
        if (!mockResult) throw new Error(`No demo data for "${input.demo}"`);

        for (let i = 0; i < SCAN_STEPS.length; i++) {
          advanceStep(i);
          await delay(400 + Math.random() * 300);
        }

        setSteps(prev => prev.map(s => ({ ...s, status: 'complete' as ScanStepStatus })));
        setResult(mockResult);
        setIsComplete(true);
        sessionStorage.setItem('scanResult', JSON.stringify(mockResult));
        return;
      }

      const body: Record<string, string> = {};
      if (input.repoUrl) body.repoUrl = input.repoUrl;
      if (input.packageJson) body.packageJson = input.packageJson;

      advanceStep(0);

      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`Scan failed: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response stream');

      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        accumulated += decoder.decode(value, { stream: true });
        const lines = accumulated.split('\n');
        accumulated = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const event = JSON.parse(line);
            if (event.type === 'progress' && typeof event.step === 'number') {
              advanceStep(event.step);
            } else if (event.type === 'result') {
              setSteps(prev => prev.map(s => ({ ...s, status: 'complete' as ScanStepStatus })));
              setResult(event.data);
              setIsComplete(true);
              sessionStorage.setItem('scanResult', JSON.stringify(event.data));
            } else if (event.type === 'error') {
              throw new Error(event.message || 'Scan failed');
            }
          } catch {
            // skip malformed JSON lines
          }
        }
      }

      if (!result) {
        try {
          const finalData = JSON.parse(accumulated);
          if (finalData.type === 'result') {
            setSteps(prev => prev.map(s => ({ ...s, status: 'complete' as ScanStepStatus })));
            setResult(finalData.data);
            setIsComplete(true);
            sessionStorage.setItem('scanResult', JSON.stringify(finalData.data));
          }
        } catch {
          // no final data
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      setSteps(prev => prev.map((s, i) => ({
        ...s,
        status: i === currentStep ? 'error' : s.status,
      })));
    } finally {
      setIsScanning(false);
    }
  }, [advanceStep, currentStep, result]);

  return { steps, currentStep, isScanning, isComplete, error, result, startScan };
}
