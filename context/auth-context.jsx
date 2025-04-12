"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"

const AuthContext = createContext()

// Create a guest user object
const GUEST_USER = {
  id: "guest-user-id",
  email: "guest@example.com",
  user_metadata: {
    name: "Guest User",
  },
  isGuest: true,
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const supabase = getSupabaseClient()

  useEffect(() => {
    // Check for active session
    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        setUser(session?.user || null)
      } catch (error) {
        console.error("Session check error:", error)
      } finally {
        setLoading(false)
      }

      // Listen for auth changes
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user || null)
      })

      return () => subscription.unsubscribe()
    }

    checkSession()
  }, [supabase])

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return data
  }

  const signUp = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
      },
    })
    if (error) throw error
    return data
  }

  const signOut = async () => {
    if (user?.isGuest) {
      setUser(null)
      return
    }

    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  // Function to enable guest mode
  const enableGuestMode = () => {
    setUser(GUEST_USER)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, enableGuestMode, isGuest: user?.isGuest }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
