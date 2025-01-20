"use client"

import { useTheme } from "next-themes"
import { useThemeStore } from "@/store/use-theme-store"
import { useEffect } from "react"

export function ThemeInitializer() {
  const { theme } = useThemeStore()
  const { setTheme } = useTheme()

  useEffect(() => {
    setTheme(theme)
  }, [theme, setTheme])

  return null
}

