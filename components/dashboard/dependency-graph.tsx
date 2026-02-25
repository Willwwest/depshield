"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import dynamic from "next/dynamic"
import { cn } from "@/lib/utils"
import type { GraphData } from "@/lib/types"

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false })

interface DependencyGraphProps {
  data: GraphData;
  onNodeClick?: (nodeId: string) => void;
  className?: string;
}

export function DependencyGraph({ data, onNodeClick, className }: DependencyGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<{ zoomToFit: (ms?: number) => void; zoom: (k: number) => void } | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        setDimensions({ width: entry.contentRect.width, height: entry.contentRect.height });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (graphRef.current?.zoomToFit) graphRef.current.zoomToFit(400);
    }, 1500);
    return () => clearTimeout(timer);
  }, [data]);

  const nodeCanvasObject = useCallback((node: Record<string, unknown>, ctx: CanvasRenderingContext2D) => {
    const x = (node.x as number) || 0;
    const y = (node.y as number) || 0;
    const val = (node.val as number) || 6;
    const color = (node.color as string) || "#6366F1";
    const name = (node.name as string) || "";
    const riskLevel = (node.riskLevel as string) || "info";
    const size = val * 1.2;

    const glowRadius = size + 8;
    const gradient = ctx.createRadialGradient(x, y, size * 0.3, x, y, glowRadius);
    gradient.addColorStop(0, color + "60");
    gradient.addColorStop(1, color + "00");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, glowRadius, 0, 2 * Math.PI);
    ctx.fill();

    if (riskLevel === "critical") {
      const pulse = 0.7 + Math.sin(Date.now() / 400) * 0.3;
      ctx.globalAlpha = pulse;
      const pulseGrad = ctx.createRadialGradient(x, y, size, x, y, size + 15);
      pulseGrad.addColorStop(0, color + "40");
      pulseGrad.addColorStop(1, color + "00");
      ctx.fillStyle = pulseGrad;
      ctx.beginPath();
      ctx.arc(x, y, size + 15, 0, 2 * Math.PI);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, 2 * Math.PI);
    ctx.fill();

    ctx.fillStyle = "#0A0E1A";
    ctx.beginPath();
    ctx.arc(x, y, size * 0.5, 0, 2 * Math.PI);
    ctx.fill();

    const label = name.length > 15 ? name.slice(0, 13) + ".." : name;
    const fontSize = Math.max(3.5, size * 0.55);
    ctx.font = `${fontSize}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    const textWidth = ctx.measureText(label).width;
    const padding = 2;
    ctx.fillStyle = "rgba(10,14,26,0.85)";
    ctx.beginPath();
    ctx.roundRect(x - textWidth / 2 - padding, y + size + 2, textWidth + padding * 2, fontSize + 3, 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.fillText(label, x, y + size + 3);
  }, []);

  return (
    <div ref={containerRef} className={cn("relative rounded-xl border border-white/5 bg-card overflow-hidden", className)}>
      {typeof window !== "undefined" && (
        <ForceGraph2D
          ref={graphRef as never}
          graphData={data as never}
          width={dimensions.width}
          height={dimensions.height}
          backgroundColor="transparent"
          nodeCanvasObject={nodeCanvasObject as never}
          nodePointerAreaPaint={(node: Record<string, unknown>, color: string, ctx: CanvasRenderingContext2D) => {
            const x = (node.x as number) || 0;
            const y = (node.y as number) || 0;
            const size = ((node.val as number) || 6) * 1.2;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(x, y, size + 4, 0, 2 * Math.PI);
            ctx.fill();
          }}
          onNodeClick={(node: Record<string, unknown>) => {
            if (onNodeClick && node.id) onNodeClick(node.id as string);
          }}
          linkColor={() => "rgba(255,255,255,0.06)"}
          linkWidth={1}
          linkDirectionalArrowLength={3}
          linkDirectionalArrowRelPos={1}
          cooldownTicks={100}
          warmupTicks={50}
          d3AlphaDecay={0.03}
          d3VelocityDecay={0.3}
        />
      )}
      <div className="absolute bottom-3 right-3 flex flex-col gap-1">
        <button type="button" onClick={() => graphRef.current?.zoom(1.5)} className="glass w-7 h-7 rounded flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors text-xs">+</button>
        <button type="button" onClick={() => graphRef.current?.zoom(0.67)} className="glass w-7 h-7 rounded flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors text-xs">-</button>
        <button type="button" onClick={() => graphRef.current?.zoomToFit(400)} className="glass w-7 h-7 rounded flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors text-[10px]">FIT</button>
      </div>
    </div>
  )
}
