"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Activity, AlertTriangle, Calendar, Clock, Stethoscope } from "lucide-react"
import { useRouter } from "next/navigation"

type SymptomCheck = {
  id: number
  created_at: string
  symptoms: { id: number; name: string }[]
  additional_info?: string
}

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const [symptomChecks, setSymptomChecks] = useState<SymptomCheck[]>([])
  const [isLoadingChecks, setIsLoadingChecks] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    const fetchSymptomChecks = async () => {
      if (!isAuthenticated) return

      try {
        const accessToken = localStorage.getItem("accessToken")
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://medihelp-backend.onrender.com/api"

        const response = await fetch(`${API_URL}/health/checks/`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setSymptomChecks(data.results || [])
        }
      } catch (error) {
        console.error("Error fetching symptom checks:", error)
      } finally {
        setIsLoadingChecks(false)
      }
    }

    fetchSymptomChecks()
  }, [isAuthenticated])

  if (isLoading) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Welcome, {user?.first_name}!</h1>

      <Tabs defaultValue="overview">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="health-records">Health Records</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <Activity className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Symptom Checker</CardTitle>
                  <CardDescription>Check your symptoms</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href="/symptom-checker">Start Check</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <AlertTriangle className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>First Aid</CardTitle>
                  <CardDescription>Access emergency guides</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full" variant="outline">
                  <Link href="/first-aid">View Guides</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <Stethoscope className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Find Doctors</CardTitle>
                  <CardDescription>Book a consultation</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full" variant="outline">
                  <Link href="/doctors">Find Doctors</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Health Checks</CardTitle>
              <CardDescription>Your recent symptom checks and results</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingChecks ? (
                <div className="text-center py-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2">Loading your health checks...</p>
                </div>
              ) : symptomChecks.length > 0 ? (
                <div className="space-y-4">
                  {symptomChecks.slice(0, 3).map((check) => (
                    <div key={check.id} className="flex items-start gap-4 p-4 border rounded-lg">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <Activity className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">Symptom Check #{check.id}</h4>
                            <p className="text-sm text-muted-foreground">
                              Symptoms: {check.symptoms.map((s) => s.name).join(", ")}
                            </p>
                            {check.additional_info && <p className="text-sm mt-1">Note: {check.additional_info}</p>}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="h-3 w-3 mr-1" />
                            {new Date(check.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <Button asChild size="sm" variant="outline" className="mt-2">
                          <Link href={`/symptom-checker/results/${check.id}`}>View Details</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                  {symptomChecks.length > 3 && (
                    <div className="text-center mt-4">
                      <Button asChild variant="link">
                        <Link href="/dashboard/health-records">View all health checks</Link>
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">You haven't performed any symptom checks yet.</p>
                  <Button asChild>
                    <Link href="/symptom-checker">Check Symptoms Now</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health-records" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Health Records</CardTitle>
              <CardDescription>View all your symptom checks and health data</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingChecks ? (
                <div className="text-center py-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2">Loading your health records...</p>
                </div>
              ) : symptomChecks.length > 0 ? (
                <div className="space-y-4">
                  {symptomChecks.map((check) => (
                    <div key={check.id} className="flex items-start gap-4 p-4 border rounded-lg">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <Activity className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">Symptom Check #{check.id}</h4>
                            <p className="text-sm text-muted-foreground">
                              Symptoms: {check.symptoms.map((s) => s.name).join(", ")}
                            </p>
                            {check.additional_info && <p className="text-sm mt-1">Note: {check.additional_info}</p>}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="h-3 w-3 mr-1" />
                            {new Date(check.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <Button asChild size="sm" variant="outline" className="mt-2">
                          <Link href={`/symptom-checker/results/${check.id}`}>View Details</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">You haven't performed any symptom checks yet.</p>
                  <Button asChild>
                    <Link href="/symptom-checker">Check Symptoms Now</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appointments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Appointments</CardTitle>
              <CardDescription>Manage your teleconsultations and appointments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-primary mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">You don't have any upcoming appointments.</p>
                <Button asChild>
                  <Link href="/appointments">Book an Appointment</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
