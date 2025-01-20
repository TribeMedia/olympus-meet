"use client"

import { useState } from "react"
import { useAuthStore } from "@/store/use-auth-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { LoginFormData, AuthError } from "@/types/auth-types"

export function LoginForm() {
  const login = useAuthStore((state) => state.login)
  const [formData, setFormData] = useState<LoginFormData>({
    identifier: "",
    password: "",
    service: "https://bsky.social",
  })
  const [error, setError] = useState<AuthError | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      await login(formData.identifier, formData.password, formData.service)
      document.getElementById("loginForm")?.classList.add("hidden")
    } catch (err) {
      setError({
        message: err instanceof Error ? err.message : "Failed to login",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <Card className="w-full max-w-md bg-background/80 border-border backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Sign in with BlueSky</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="text"
              name="identifier"
              placeholder="Handle or Email"
              value={formData.identifier}
              onChange={handleChange}
              className="bg-background/50 border-input text-foreground placeholder:text-muted-foreground"
              required
            />
          </div>
          <div className="space-y-2">
            <Input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="bg-background/50 border-input text-foreground placeholder:text-muted-foreground"
              required
            />
          </div>
          <div className="space-y-2">
            <Input
              type="url"
              name="service"
              placeholder="PDS Server URL"
              value={formData.service}
              onChange={handleChange}
              className="bg-background/50 border-input text-foreground placeholder:text-muted-foreground"
              required
            />
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
          )}
          <Button
            type="submit"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

