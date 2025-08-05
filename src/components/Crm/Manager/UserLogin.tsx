import type React from "react"
import { useState } from "react"
import totem from "../Admin/AdminClient/totem.svg"
import { useNavigate } from "react-router-dom"
import {jwtDecode} from "jwt-decode"

interface DecodedToken {
  role?: string;
  exp?: number;
  id?: string; // Added id field to the interface
  // Add other properties that might be in your token
}

const LoginPage: React.FC = () => {
  const [rememberMe, setRememberMe] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // Using the manager and team member API endpoint
      const response = await fetch("https://totem-consultancy-beta.vercel.app/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Login failed")
      }

      // Set authentication data in localStorage
      localStorage.setItem("crmAuthenticated", "true")
      localStorage.setItem("token", data.token)

      // Try to decode the JWT token to determine the role and extract userId
      try {
        const decodedToken = jwtDecode<DecodedToken>(data.token)
        
        // Get role from token or fallback to API response
        const userRole = (decodedToken.role || data.role || "").toLowerCase()
        
        // Store the user role
        localStorage.setItem("userRole", userRole)
        
        // Extract and store the userId from the token
        if (decodedToken.id) {
          localStorage.setItem("userId", decodedToken.id)
        } else if (data.userId) {
          // Fallback to userId from API response if available
          localStorage.setItem("userId", data.userId)
        }

        // Navigate based on role
        if (userRole === "admin") {
          navigate("/crm/admin")
        } else if (userRole === "manager") {
          navigate("/crm/manager/dashboard")
        } else if (userRole === "team member" || userRole === "team") {
          navigate("/crm/team/dashboard")
        } else {
          // Default fallback if role is not recognized
          navigate("/crm/login")
        }
      } catch (decodeError) {
        console.error("Error decoding token:", decodeError)

        // Fallback to using the role from the API response
        const userRole = (data.role || "").toLowerCase()
        localStorage.setItem("userRole", userRole)
        
        // Fallback to userId from API response if available
        if (data.userId) {
          localStorage.setItem("userId", data.userId)
        }

        if (userRole === "admin") {
          navigate("/crm/admin")
        } else if (userRole === "manager") {
          navigate("/crm/manager/dashboard")
        } else if (userRole === "team member" || userRole === "team") {
          navigate("/crm/team/dashboard")
        } else {
          navigate("/crm/dashboard")
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred during login")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-white">
      <div className="flex flex-col justify-center px-8 py-12 w-1/2">
        <div className="w-full max-w-md mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Welcome back!</h1>

          {error && (
            <div className="mb-6 p-3 bg-red-100 text-red-700 rounded-md">
              <p>{error}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                type="email"
                id="email"
                placeholder="Enter your company email address"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                placeholder="Enter your password"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div className="mt-1">
                <a href="#" className="text-sm text-blue-500 hover:underline">
                  Forgot password
                </a>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:bg-gray-400"
            >
              {loading ? "Logging in..." : "Log In"}
            </button>
          </form>

          {/* Credentials information box */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="text-sm font-medium text-blue-800 mb-2">Demo Credentials</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <span className="font-medium text-gray-700 w-20">Manager:</span>
                <div className="flex-1">
                  <div>
                    <code className="bg-blue-100 px-2 py-1 rounded text-blue-800">manager@gmail.com</code>
                  </div>
                  <div className="mt-1">
                    <code className="bg-blue-100 px-2 py-1 rounded text-blue-800">manager@1234</code>
                  </div>
                </div>
              </div>
              <div className="flex items-center mt-2">
                <span className="font-medium text-gray-700 w-20">Team Member:</span>
                <div className="flex-1">
                  <div>
                    <code className="bg-blue-100 px-2 py-1 rounded text-blue-800">salah@gmail.com</code>
                  </div>
                  <div className="mt-1">
                    <code className="bg-blue-100 px-2 py-1 rounded text-blue-800">salah@1234</code>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-1/2 flex items-center justify-center">
        <div className="w-3/4 max-w-lg flex items-center justify-center">
          <img src={totem || "/placeholder.svg"} alt="Totem Logo" className="w-full h-auto object-contain" />
        </div>
      </div>
    </div>
  )
}

export default LoginPage