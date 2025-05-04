"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Activity, Search, Loader2 } from "lucide-react"

type Symptom = {
  id: number
  name: string
  description: string
}

export default function SymptomCheckerPage() {
  const [symptoms, setSymptoms] = useState<Symptom[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSymptoms, setSelectedSymptoms] = useState<number[]>([])
  const [additionalInfo, setAdditionalInfo] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://medihelp-backend.onrender.com/api"

  useEffect(() => {
    const fetchSymptoms = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken")
        const headers: HeadersInit = {}

        if (accessToken) {
          headers.Authorization = `Bearer ${accessToken}`
        }

        const response = await fetch(`${API_URL}/health/symptoms/`, { headers })

        if (response.ok) {
          const data = await response.json()
          setSymptoms(data.results || [])
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load symptoms. Please try again.",
          })
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "An error occurred while loading symptoms.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchSymptoms()
  }, [API_URL, toast])

  const filteredSymptoms = symptoms.filter((symptom) => symptom.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const handleSymptomToggle = (symptomId: number) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptomId) ? prev.filter((id) => id !== symptomId) : [...prev, symptomId],
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (selectedSymptoms.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select at least one symptom.",
      })
      return
    }

    if (!isAuthenticated && !authLoading) {
      toast({
        title: "Login Required",
        description: "Please log in to save your symptom check.",
      })
      router.push("/login")
      return
    }

    setIsSubmitting(true)

    try {
      const accessToken = localStorage.getItem("accessToken")

      const response = await fetch(`${API_URL}/health/checks/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          symptoms: selectedSymptoms,
          additional_info: additionalInfo || undefined,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: "Symptom check created",
          description: "Your symptoms have been recorded successfully.",
        })
        router.push(`/symptom-checker/results/${data.id}`)
      } else {
        const errorData = await response.json()
        toast({
          variant: "destructive",
          title: "Error",
          description: errorData.detail || "Failed to create symptom check.",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container py-10">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Symptom Checker</h1>
          <p className="text-muted-foreground">
            Select the symptoms you're experiencing to get insights about possible conditions.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Select Your Symptoms
            </CardTitle>
            <CardDescription>
              Check all symptoms that apply to you. Be as specific as possible for better results.
            </CardDescription>

            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search symptoms..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-4">Loading symptoms...</p>
                </div>
              ) : filteredSymptoms.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredSymptoms.map((symptom) => (
                    <div key={symptom.id} className="flex items-start space-x-2">
                      <Checkbox
                        id={`symptom-${symptom.id}`}
                        checked={selectedSymptoms.includes(symptom.id)}
                        onCheckedChange={() => handleSymptomToggle(symptom.id)}
                      />
                      <div className="grid gap-1.5 leading-none">
                        <Label
                          htmlFor={`symptom-${symptom.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {symptom.name}
                        </Label>
                        <p className="text-xs text-muted-foreground">{symptom.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No symptoms found matching your search.</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="additional-info">Additional Information (Optional)</Label>
                <Textarea
                  id="additional-info"
                  placeholder="Provide any additional details about your symptoms, such as when they started, severity, etc."
                  value={additionalInfo}
                  onChange={(e) => setAdditionalInfo(e.target.value)}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting || selectedSymptoms.length === 0}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Check Symptoms"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
