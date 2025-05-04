"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Activity, AlertTriangle, ArrowLeft, Stethoscope } from "lucide-react"

type SymptomCheck = {
  id: number
  created_at: string
  symptoms: { id: number; name: string; description: string }[]
  additional_info?: string
  ai_diagnosis?: {
    conditions?: string[]
    recommendations?: string[]
    urgency?: string
  }
}

type Condition = {
  id: number
  name: string
  description: string
  severity: "low" | "medium" | "high" | string | number | null
}

// Helper function to implement fetch with retry logic
const fetchWithRetry = async (url: string, options: RequestInit, maxRetries = 3, delay = 1000) => {
  let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      
      // If rate limited, wait and retry
      if (response.status === 429) {
        // Get retry-after header or use exponential backoff
        const retryAfter = response.headers.get('Retry-After');
        const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : delay * Math.pow(2, attempt);
        console.log(`Rate limited. Waiting ${waitTime}ms before retry ${attempt + 1}/${maxRetries}`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      
      return response;
    } catch (error) {
      console.error(`Attempt ${attempt + 1} failed:`, error);
      lastError = error;
      
      // Wait before retrying
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt)));
      }
    }
  }
  
  throw lastError || new Error(`Failed after ${maxRetries} attempts`);
};

export default function SymptomCheckResultPage() {
  const [check, setCheck] = useState<SymptomCheck | null>(null)
  const [possibleConditions, setPossibleConditions] = useState<Condition[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [retryCount, setRetryCount] = useState(0)
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { toast } = useToast()
  const params = useParams()
  const checkId = params.id
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://medihelp-backend.onrender.com/api"

  useEffect(() => {
    const fetchCheckDetails = async () => {
      if (authLoading) return

      if (!isAuthenticated) {
        toast({
          variant: "destructive",
          title: "Authentication required",
          description: "Please log in to view your symptom check results.",
        })
        return
      }

      try {
        setIsLoading(true)
        const accessToken = localStorage.getItem("accessToken")

        console.log(`Fetching symptom check details from: ${API_URL}/health/checks/${checkId}/`)
        
        // Use the retry-enabled fetch function
        const checkResponse = await fetchWithRetry(
          `${API_URL}/health/checks/${checkId}/`, 
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json"
            },
          },
          3  // Max retries
        )
        
        console.log(`Symptom check API response status: ${checkResponse.status}`)

        if (checkResponse.ok) {
          const checkData = await checkResponse.json()
          console.log("Symptom check data:", checkData)
          
          // Ensure symptoms have valid IDs
          if (checkData.symptoms && Array.isArray(checkData.symptoms)) {
            checkData.symptoms = checkData.symptoms.map((symptom, index) => ({
              ...symptom,
              id: symptom.id || index + 1, // Use existing ID or fallback to index+1
              description: symptom.description || "No description available"
            }))
          } else {
            // Initialize empty array if symptoms is missing or not an array
            checkData.symptoms = []
          }
          
          setCheck(checkData)

          // Check if the response already includes AI-generated conditions
          if (checkData.ai_diagnosis?.conditions && checkData.ai_diagnosis.conditions.length > 0) {
            console.log("Using AI-generated conditions from check data")
            
            // Transform AI diagnosis conditions into the expected format
            const aiConditions = checkData.ai_diagnosis.conditions.map((name: string, index: number) => ({
              id: index + 1,
              name,
              description: index === 0 
                ? "This condition matches your symptoms most closely based on AI analysis."
                : "This condition may be related to your symptoms based on AI analysis.",
              severity: checkData.ai_diagnosis.urgency || "medium"
            }))
            
            setPossibleConditions(aiConditions)
          } else {
            // If no AI conditions, fetch some generic conditions as fallback
            console.log("Fetching generic conditions as fallback")
            try {
              const conditionsResponse = await fetchWithRetry(
                `${API_URL}/health/conditions/?page=1&page_size=3`, 
                {
                  headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json"
                  },
                },
                2  // Fewer retries for secondary request
              )

              if (conditionsResponse.ok) {
                const conditionsData = await conditionsResponse.json()
                console.log("Conditions data:", conditionsData)
                
                // Ensure conditions have valid IDs
                const conditions = (conditionsData.results || []).map((condition: any, index: number) => ({
                  ...condition,
                  id: condition.id || index + 1, // Use existing ID or fallback to index+1
                  description: condition.description || "No detailed description available."
                }))
                
                setPossibleConditions(conditions)
              } else {
                throw new Error(`Failed to fetch conditions: ${conditionsResponse.status}`)
              }
            } catch (conditionError) {
              console.error("Error fetching conditions:", conditionError)
              // Use sample conditions in development
              if (process.env.NODE_ENV === "development") {
                console.log("Using sample conditions in development mode")
                setPossibleConditions([
                  {
                    id: 1,
                    name: "Common Cold",
                    description: "A viral infection of the upper respiratory tract.",
                    severity: "low"
                  },
                  {
                    id: 2,
                    name: "Seasonal Allergies",
                    description: "An allergic response to seasonal environmental triggers.",
                    severity: "low"
                  },
                  {
                    id: 3,
                    name: "Influenza",
                    description: "A contagious respiratory illness caused by influenza viruses.",
                    severity: "medium"
                  }
                ])
              }
            }
          }
        } else {
          console.error("Failed to fetch symptom check:", checkResponse.status)
          let errorMessage = "Failed to load symptom check details."
          
          try {
            const errorData = await checkResponse.json()
            errorMessage = errorData.detail || errorData.error || errorMessage
          } catch (e) {
            // If response is not JSON, use status text
            errorMessage = checkResponse.statusText || errorMessage
          }
          
          // Special handling for rate limiting
          if (checkResponse.status === 429) {
            errorMessage = "Too many requests. Please try again in a moment."
            
            // Implement retry with increasing delay
            if (retryCount < 3) {
              const retryDelay = Math.pow(2, retryCount) * 1000;
              console.log(`Rate limited. Will retry in ${retryDelay}ms (attempt ${retryCount + 1}/3)`)
              
              toast({
                title: "Rate limited",
                description: `Retrying in ${retryDelay/1000} seconds...`,
              })
              
              setRetryCount(prev => prev + 1)
              setTimeout(() => {
                fetchCheckDetails()
              }, retryDelay)
              return
            }
          }
          
          toast({
            variant: "destructive",
            title: "Error",
            description: errorMessage,
          })
        }
      } catch (error) {
        console.error("Error fetching symptom check:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "An error occurred while loading your results. Please try again.",
        })
        
        // Use sample data in development mode
        if (process.env.NODE_ENV === "development") {
          console.log("Using sample data in development mode")
          setCheck({
            id: Number(checkId) || 1,
            created_at: new Date().toISOString(),
            symptoms: [
              { id: 1, name: "Headache", description: "Pain in the head or upper neck" },
              { id: 2, name: "Fatigue", description: "Extreme tiredness resulting from mental or physical exertion" }
            ],
            additional_info: "Started yesterday evening after work",
            ai_diagnosis: {
              conditions: ["Tension Headache", "Migraine", "Dehydration"],
              recommendations: ["Rest", "Stay hydrated", "Over-the-counter pain relievers if needed"],
              urgency: "low"
            }
          })
          
          setPossibleConditions([
            {
              id: 1,
              name: "Tension Headache",
              description: "The most common type of headache that causes mild to moderate pain.",
              severity: "low"
            },
            {
              id: 2,
              name: "Migraine",
              description: "A headache of varying intensity, often accompanied by nausea and sensitivity to light and sound.",
              severity: "medium"
            },
            {
              id: 3,
              name: "Dehydration",
              description: "A condition that occurs when the body doesn't have enough water to function properly.",
              severity: "low"
            }
          ])
        }
      } finally {
        setIsLoading(false)
      }
    }

    if (!authLoading) {
      fetchCheckDetails()
    }
    
    // Reset retry count when checkId changes
    return () => {
      setRetryCount(0)
    }
  }, [checkId, isAuthenticated, authLoading, API_URL, toast, retryCount])

  // Helper function to get severity display text
  const getSeverityText = (severity: string | number | null | undefined): string => {
    if (severity === null || severity === undefined) return "Unknown"

    if (typeof severity === "string") {
      return severity.charAt(0).toUpperCase() + severity.slice(1)
    }

    if (typeof severity === "number") {
      if (severity <= 3) return "Low"
      if (severity <= 7) return "Medium"
      return "High"
    }

    return "Unknown"
  }

  // Helper function to get severity class
  const getSeverityClass = (severity: string | number | null | undefined): string => {
    let severityLevel: string

    if (typeof severity === "string") {
      severityLevel = severity.toLowerCase()
    } else if (typeof severity === "number") {
      if (severity <= 3) severityLevel = "low"
      else if (severity <= 7) severityLevel = "medium"
      else severityLevel = "high"
    } else {
      severityLevel = "low"
    }

    switch (severityLevel) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
      default:
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Loading your results...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="container py-10">
        <div className="max-w-3xl mx-auto text-center">
          <AlertTriangle className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
          <p className="mb-6">Please log in to view your symptom check results.</p>
          <Button asChild>
            <Link href="/login">Log In</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (!check) {
    return (
      <div className="container py-10">
        <div className="max-w-3xl mx-auto text-center">
          <AlertTriangle className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Result Not Found</h1>
          <p className="mb-6">The symptom check result you're looking for could not be found.</p>
          <Button asChild>
            <Link href="/symptom-checker">Try Another Check</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Button asChild variant="ghost" className="mb-4">
            <Link href="/dashboard" className="flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
          <h1 className="text-3xl font-bold mb-2">Symptom Check Results</h1>
          <p className="text-muted-foreground">
            Check #{check.id} • {new Date(check.created_at).toLocaleString()}
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Your Symptoms
              </CardTitle>
            </CardHeader>
            <CardContent>
              {check.symptoms && check.symptoms.length > 0 ? (
                <ul className="space-y-2">
                  {check.symptoms.map((symptom) => (
                    <li key={`symptom-${symptom.id || symptom.name}`} className="flex items-start gap-2">
                      <div className="bg-primary/10 p-1 rounded-full mt-0.5">
                        <Activity className="h-3 w-3 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{symptom.name}</p>
                        <p className="text-sm text-muted-foreground">{symptom.description}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No symptoms recorded for this check.</p>
              )}

              {check.additional_info && (
                <div className="mt-4 pt-4 border-t">
                  <p className="font-medium">Additional Information:</p>
                  <p className="text-muted-foreground">{check.additional_info}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-primary" />
                Possible Conditions
              </CardTitle>
              <CardDescription>
                Based on your symptoms, these conditions might be relevant. This is not a diagnosis.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {possibleConditions.length > 0 ? (
                  possibleConditions.map((condition) => (
                    <div key={`condition-${condition.id || condition.name}`} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{condition.name}</h3>
                        <div className={`px-2 py-1 text-xs rounded-full ${getSeverityClass(condition.severity)}`}>
                          {getSeverityText(condition.severity)} Severity
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{condition.description}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">No specific conditions identified based on your symptoms.</p>
                  </div>
                )}

                <div className="bg-muted p-4 rounded-lg mt-6">
                  <p className="text-sm font-medium mb-2">Important Disclaimer</p>
                  <p className="text-xs text-muted-foreground">
                    This information is not a medical diagnosis. The results are based on the symptoms you reported and
                    should be used for informational purposes only. Always consult with a healthcare professional for
                    proper diagnosis and treatment.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-primary" />
                Next Steps
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button asChild className="flex-1">
                    <Link href="/doctors">Find a Doctor</Link>
                  </Button>
                  <Button asChild variant="outline" className="flex-1">
                    <Link href="/first-aid">View First Aid Guides</Link>
                  </Button>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button asChild variant="outline" className="flex-1">
                    <Link href="/education">Read Health Articles</Link>
                  </Button>
                  <Button asChild variant="outline" className="flex-1">
                    <Link href="/chat">Chat with Health Assistant</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
