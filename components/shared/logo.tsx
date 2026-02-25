import { cn } from "@/lib/utils"

interface LogoProps {
  size?: number;
  className?: string;
}

export function Logo({ size = 32, className }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="DepShield logo"
    >
      <title>DepShield</title>
      {/* Shield shape */}
      <path
        d="M16 2L4 8v8c0 7.2 5.1 13.9 12 16 6.9-2.1 12-8.8 12-16V8L16 2z"
        fill="url(#shield-gradient)"
        fillOpacity="0.15"
        stroke="url(#shield-gradient)"
        strokeWidth="1.5"
      />
      {/* Heartbeat/pulse line */}
      <path
        d="M8 16h4l2-4 2 8 2-8 2 4h4"
        stroke="url(#pulse-gradient)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <defs>
        <linearGradient id="shield-gradient" x1="4" y1="2" x2="28" y2="26">
          <stop stopColor="#6366F1" />
          <stop offset="1" stopColor="#8B5CF6" />
        </linearGradient>
        <linearGradient id="pulse-gradient" x1="8" y1="16" x2="24" y2="16">
          <stop stopColor="#6366F1" />
          <stop offset="0.5" stopColor="#A78BFA" />
          <stop offset="1" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export function LogoWithText({ size = 32, className }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <Logo size={size} />
      <span className="font-semibold text-lg tracking-tight text-foreground">
        Dep<span className="text-gradient">Shield</span>
      </span>
    </div>
  )
}
