"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

export default function DebugPage() {
  const [email, setEmail] = useState("test@example.com")
  const [password, setPassword] = useState("TestPassword123!")
  const [apiUrl, setApiUrl] = useState(process.env.NEXT_PUBLIC_API_URL || "https://medihelp-backend.onrender.com/api")
  const [response, setResponse] = useState("")
  const [loading, setLoading] = useState(false)

  const testLogin = async () => {
    setLoading(true)
    setResponse("Loading...")

    try {
      const loginEndpoint = `${apiUrl}/auth/login/`

      const response = await fetch(loginEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const responseText = await response.text()

      let formattedResponse = `Status: ${response.status} ${response.statusText}\n\n`
      formattedResponse += "Headers:\n"
      response.headers.forEach((value, key) => {
        formattedResponse += `${key}: ${value}\n`
      })
      formattedResponse += "\nBody:\n"

      try {
        // Try to format as JSON if possible
        const jsonData = JSON.parse(responseText)
        formattedResponse += JSON.stringify(jsonData, null, 2)

        // Extract and display tokens if present
        if (jsonData.tokens) {
          formattedResponse += "\n\nTokens found in response.tokens:"
          formattedResponse += `\n- Access token: ${jsonData.tokens.access ? "Present" : "Missing"}`
          formattedResponse += `\n- Refresh token: ${jsonData.tokens.refresh ? "Present" : "Missing"}`
        } else if (jsonData.access) {
          formattedResponse += "\n\nTokens found at root level:"
          formattedResponse += `\n- Access token: Present`
          formattedResponse += `\n- Refresh token: ${jsonData.refresh ? "Present" : "Missing"}`
        } else {
          formattedResponse += "\n\nNo tokens found in response"
        }
      } catch (e) {
        // If not valid JSON, just show the raw text
        formattedResponse += responseText
      }

      setResponse(formattedResponse)
    } catch (error) {
      setResponse(`Error: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-12">
      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle>API Debug Tool</CardTitle>
          <CardDescription>Test the login API directly to diagnose issues</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="apiUrl">API URL</Label>
            <Input id="apiUrl" value={apiUrl} onChange={(e) => setApiUrl(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="response">Response</Label>
            <Textarea id="response" value={response} readOnly className="font-mono h-64" />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={testLogin} disabled={loading} className="w-full">
            {loading ? "Testing..." : "Test Login"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
