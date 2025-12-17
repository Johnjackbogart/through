"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useSyncExternalStore } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// Safe hydration hook that doesn't cause cascading renders
function useHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )
}

export type ThemeToggleProps = {
  showLabel?: boolean
  label?: string
  className?: string
  onAfterToggle?: () => void
}

export function ThemeToggle({
  showLabel = false,
  label = "Toggle theme",
  className,
  onAfterToggle,
}: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme()
  const hydrated = useHydrated()
  const isDark = hydrated ? resolvedTheme === "dark" : true

  return (
    <Button
      variant="ghost"
      size={showLabel ? "sm" : "icon"}
      onClick={() => {
        setTheme(isDark ? "light" : "dark")
        onAfterToggle?.()
      }}
      className={cn(showLabel ? "w-full justify-start" : "w-9 h-9", className)}
      aria-label={label}
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-foreground" />
      ) : (
        <Moon className="h-4 w-4 text-foreground" />
      )}
      {showLabel ? <span>{label}</span> : null}
    </Button>
  )
}
