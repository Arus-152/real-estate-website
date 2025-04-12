"use client"

import { useState } from "react"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function LoginForm() {
  const [email, setEmail] = useState("test@example.com")
  const [password, setPassword] = useState("password123")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { signIn, signUp, enableGuestMode } = useAuth()

  const handleAuth = async (action) => {
    setError("")
    setSuccess("")
    setIsLoading(true)

    try {
      if (action === "signin") {
        await signIn(email, password)
      } else {
        const result = await signUp(email, password)
        if (result?.user) {
          setSuccess("Account created! You can now sign in.")
        }
      }
    } catch (err) {
      setError(err.message || "An error occurred during authentication")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGuestMode = () => {
    enableGuestMode()
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Commerce Plaza</CardTitle>
        <CardDescription className="text-center">
          Sign in to your account to view your favorites and history
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="guest">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
            <TabsTrigger value="guest">Guest</TabsTrigger>
          </TabsList>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-4 bg-green-50 border-green-200">
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          <TabsContent value="signin">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleAuth("signin")
              }}
            >
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-[#0041d9]" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleAuth("signup")
              }}
            >
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <p className="text-xs text-gray-500">Password must be at least 6 characters long</p>
                </div>
                <Button type="submit" className="w-full bg-[#0041d9]" disabled={isLoading}>
                  {isLoading ? "Signing up..." : "Sign Up"}
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="guest">
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-md">
                <h3 className="font-medium text-blue-800 mb-2">Guest Mode</h3>
                <p className="text-blue-700 text-sm mb-2">
                  Continue as a guest to explore the application without creating an account. You'll still be able to:
                </p>
                <ul className="text-blue-700 text-sm list-disc pl-5 mb-2">
                  <li>View property listings</li>
                  <li>See sample view history</li>
                  <li>Interact with sample favorites</li>
                </ul>
                <p className="text-blue-700 text-sm">Note: Your data won't be saved permanently in guest mode.</p>
              </div>
              <Button type="button" className="w-full bg-[#0041d9]" onClick={handleGuestMode}>
                Continue as Guest
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-gray-500">By signing in, you agree to our Terms of Service and Privacy Policy.</p>
      </CardFooter>
    </Card>
  )
}

