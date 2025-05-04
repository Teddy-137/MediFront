"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

type User = {
  id: number
  email: string
  first_name: string
  last_name: string
  phone: string
  date_of_birth?: string
  is_doctor?: boolean
}

type AuthContextType = {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  registerDoctor: (doctorData: DoctorRegisterData) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

type RegisterData = {
  email: string
  first_name: string
  last_name: string
  phone: string
  date_of_birth: string
  password: string
  confirm_password: string
}

type DoctorRegisterData = {
  email: string
  first_name: string
  last_name: string
  phone: string
  password: string
  license_number: string
  specialization: string
  consultation_fee: number
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://medihelp-backend.onrender.com/api"

  // Function to safely access localStorage (only in browser)
  const safeLocalStorage = {
    getItem: (key: string): string | null => {
      if (typeof window !== "undefined") {
        return localStorage.getItem(key)
      }
      return null
    },
    setItem: (key: string, value: string): void => {
      if (typeof window !== "undefined") {
        localStorage.setItem(key, value)
      }
    },
    removeItem: (key: string): void => {
      if (typeof window !== "undefined") {
        localStorage.removeItem(key)
      }
    },
  }

  // Helper function to extract tokens from various response formats
  const extractTokens = (data: any) => {
    // Check if tokens are nested in a 'tokens' object (new format)
    if (data.tokens && typeof data.tokens === "object") {
      return {
        accessToken: data.tokens.access,
        refreshToken: data.tokens.refresh,
      }
    }

    // Check for direct properties (old format)
    return {
      accessToken: data.access || data.access_token || data.token || data.accessToken,
      refreshToken: data.refresh || data.refresh_token || data.refreshToken,
    }
  }

  // Helper function to handle user authentication after receiving tokens
  const handleAuthentication = async (accessToken: string, refreshToken: string | null) => {
    // Store tokens
    safeLocalStorage.setItem("accessToken", accessToken)
    if (refreshToken) {
      safeLocalStorage.setItem("refreshToken", refreshToken)
    }

    console.log("Tokens stored, fetching user data")

    try {
      const userResponse = await fetch(`${API_URL}/auth/me/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      console.log("User data response status:", userResponse.status)

      if (userResponse.ok) {
        const userData = await userResponse.json()
        console.log("User data:", userData)

        setUser(userData)
        toast({
          title: "Login successful",
          description: `Welcome, ${userData.first_name}!`,
        })

        // Redirect based on user type
        if (userData.is_doctor) {
          router.push("/doctor-dashboard")
        } else {
          router.push("/dashboard")
        }
        return true
      } else {
        console.error("Failed to fetch user data:", userResponse.status)
        clearTokens()
        return false
      }
    } catch (error) {
      console.error("Error during authentication:", error)
      clearTokens()
      return false
    }
  }

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      const accessToken = safeLocalStorage.getItem("accessToken")
      if (accessToken) {
        try {
          const response = await fetch(`${API_URL}/auth/me/`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          })

          if (response.ok) {
            const userData = await response.json()
            setUser(userData)
          } else {
            // Token might be expired, try to refresh
            const refreshToken = safeLocalStorage.getItem("refreshToken")
            if (refreshToken) {
              try {
                const refreshResponse = await fetch(`${API_URL}/auth/token/refresh/`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ refresh: refreshToken }),
                })

                if (refreshResponse.ok) {
                  const { access } = await refreshResponse.json()
                  safeLocalStorage.setItem("accessToken", access)

                  // Try again with new token
                  const newResponse = await fetch(`${API_URL}/auth/me/`, {
                    headers: {
                      Authorization: `Bearer ${access}`,
                    },
                  })

                  if (newResponse.ok) {
                    const userData = await newResponse.json()
                    setUser(userData)
                  } else {
                    clearTokens()
                  }
                } else {
                  clearTokens()
                }
              } catch (error) {
                clearTokens()
              }
            } else {
              clearTokens()
            }
          }
        } catch (error) {
          clearTokens()
        }
      }
      setIsLoading(false)
    }

    checkAuth()
  }, [API_URL])

  const clearTokens = () => {
    safeLocalStorage.removeItem("accessToken")
    safeLocalStorage.removeItem("refreshToken")
    setUser(null)
  }

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      console.log("Attempting login with:", { email, API_URL })

      // Make sure we're using the correct endpoint
      const loginEndpoint = `${API_URL}/auth/login/`
      console.log("Login endpoint:", loginEndpoint)

      const response = await fetch(loginEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      console.log("Login response status:", response.status)

      // Always parse the response body, regardless of status
      const responseText = await response.text()
      console.log("Raw response text:", responseText)

      // Try to parse as JSON if possible
      let data
      try {
        data = JSON.parse(responseText)
        console.log("Parsed login response data:", data)
      } catch (e) {
        console.error("Failed to parse response as JSON:", e)
        throw new Error("Invalid response format from server")
      }

      if (response.ok) {
        // Extract tokens using the helper function
        const { accessToken, refreshToken } = extractTokens(data)

        console.log("Extracted tokens:", {
          accessToken: accessToken ? "Found" : "Not found",
          refreshToken: refreshToken ? "Found" : "Not found",
        })

        if (!accessToken) {
          console.error("Access token missing from response. Full response:", data)
          throw new Error("Access token missing from response")
        }

        // Handle authentication with the extracted tokens
        await handleAuthentication(accessToken, refreshToken)
      } else {
        // Handle login error
        console.error("Login failed:", data)
        toast({
          variant: "destructive",
          title: "Login failed",
          description: data.detail || data.message || "Invalid credentials. Please check your email and password.",
        })
      }
    } catch (error) {
      console.error("Login error:", error)
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error instanceof Error ? error.message : "An error occurred. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData: RegisterData) => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_URL}/auth/register/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })

      const responseText = await response.text()
      let data

      try {
        data = JSON.parse(responseText)
        console.log("Registration response:", data)
      } catch (e) {
        console.error("Failed to parse registration response:", e)
        throw new Error("Invalid response format from server")
      }

      if (response.ok) {
        toast({
          title: "Registration successful",
          description: "Your account has been created successfully",
        })

        // Check if the response contains tokens for automatic login
        const { accessToken, refreshToken } = extractTokens(data)

        if (accessToken) {
          console.log("Auto-login after registration with tokens")
          // Automatically log the user in
          await handleAuthentication(accessToken, refreshToken)
        } else {
          // If no tokens, redirect to login page
          console.log("No tokens in registration response, redirecting to login")
          router.push("/login")
        }
      } else {
        const errorMessage =
          data.detail ||
          (typeof data === "object"
            ? Object.entries(data)
                .map(([key, value]) => `${key}: ${value}`)
                .join(", ")
            : "Registration failed")

        toast({
          variant: "destructive",
          title: "Registration failed",
          description: errorMessage || "Please check your information and try again",
        })
      }
    } catch (error) {
      console.error("Registration error:", error)
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: "An error occurred. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const registerDoctor = async (doctorData: DoctorRegisterData) => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_URL}/doctors/register/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(doctorData),
      })

      const responseText = await response.text()
      let data

      try {
        data = JSON.parse(responseText)
        console.log("Doctor registration response:", data)
      } catch (e) {
        console.error("Failed to parse doctor registration response:", e)
        throw new Error("Invalid response format from server")
      }

      if (response.ok) {
        toast({
          title: "Registration successful",
          description: "Your doctor account has been created successfully",
        })

        // Check if the response contains tokens for automatic login
        const { accessToken, refreshToken } = extractTokens(data)

        if (accessToken) {
          console.log("Auto-login after doctor registration with tokens")
          // Automatically log the user in
          await handleAuthentication(accessToken, refreshToken)
        } else {
          // If no tokens, redirect to login page
          console.log("No tokens in doctor registration response, redirecting to login")
          router.push("/login")
        }
      } else {
        const errorMessage =
          data.detail ||
          (typeof data === "object"
            ? Object.entries(data)
                .map(([key, value]) => `${key}: ${value}`)
                .join(", ")
            : "Registration failed")

        toast({
          variant: "destructive",
          title: "Registration failed",
          description: errorMessage || "Please check your information and try again",
        })
      }
    } catch (error) {
      console.error("Doctor registration error:", error)
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: "An error occurred. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    const refreshToken = safeLocalStorage.getItem("refreshToken")
    const accessToken = safeLocalStorage.getItem("accessToken")

    if (refreshToken && accessToken) {
      try {
        await fetch(`${API_URL}/auth/logout/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ refresh_token: refreshToken }),
        })
      } catch (error) {
        // Continue with logout even if the API call fails
      }
    }

    clearTokens()
    setUser(null)
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    })
    router.push("/")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        registerDoctor,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
