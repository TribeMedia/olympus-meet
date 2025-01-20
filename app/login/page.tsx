"use client"

import { LoginForm } from "@/components/login-form"
import { Card } from "@/components/ui/card"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md p-6 space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Welcome Back</h1>
          <p className="text-gray-500">Sign in to join your meeting</p>
        </div>
        <LoginForm />
      </Card>
    </div>
  )
}
