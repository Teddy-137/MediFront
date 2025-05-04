"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, Stethoscope, Users, Video } from "lucide-react"
import { useRouter } from "next/navigation"

type Availability = {
  id: number
  day: string
  start_time: string
  end_time: string
}

type Teleconsultation = {
  id: number
  patient: {
    id: number
    first_name: string
    last_name: string
  }
  scheduled_time: string
  duration: number
  status: "scheduled" | "completed" | "cancelled"
}

export default function DoctorDashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const [availabilities, setAvailabilities] = useState<Availability[]>([])
  const [consultations, setConsultations] = useState<Teleconsultation[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    } else if (!isLoading && isAuthenticated && !user?.is_doctor) {
      router.push("/dashboard") // Redirect to patient dashboard if not a doctor
    }
  }, [isLoading, isAuthenticated, router, user])

  useEffect(() => {
    const fetchDoctorData = async () => {
      if (!isAuthenticated || !user?.is_doctor) return

      try {
        const accessToken = localStorage.getItem("accessToken")
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://medihelp-backend.onrender.com/api"

        // Fetch availabilities
        const availResponse = await fetch(`${API_URL}/doctors/availability/`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })

        if (availResponse.ok) {
          const availData = await availResponse.json()
          setAvailabilities(availData.results || [])
        }

        // Fetch teleconsultations
        const consultResponse = await fetch(`${API_URL}/doctors/teleconsults/`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })

        if (consultResponse.ok) {
          const consultData = await consultResponse.json()
          setConsultations(consultData.results || [])
        }
      } catch (error) {
        console.error("Error fetching doctor data:", error)
      } finally {
        setIsLoadingData(false)
      }
    }

    fetchDoctorData()
  }, [isAuthenticated, user])

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

  if (!isAuthenticated || !user?.is_doctor) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-2">Doctor Dashboard</h1>
      <p className="text-muted-foreground mb-6">Welcome, Dr. {user?.last_name}!</p>

      <Tabs defaultValue="overview">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
          <TabsTrigger value="patients">Patients</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <Video className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Teleconsultations</CardTitle>
                  <CardDescription>Manage your online consultations</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href="/doctor-dashboard/teleconsults">View Consultations</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <Calendar className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Availability</CardTitle>
                  <CardDescription>Manage your schedule</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full" variant="outline">
                  <Link href="/doctor-dashboard/availability">Manage Schedule</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <Users className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Patients</CardTitle>
                  <CardDescription>View your patient records</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full" variant="outline">
                  <Link href="/doctor-dashboard/patients">View Patients</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Consultations</CardTitle>
              <CardDescription>Your scheduled teleconsultations</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingData ? (
                <div className="text-center py-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2">Loading your consultations...</p>
                </div>
              ) : consultations.length > 0 ? (
                <div className="space-y-4">
                  {consultations
                    .filter((consult) => consult.status === "scheduled")
                    .slice(0, 3)
                    .map((consult) => (
                      <div key={consult.id} className="flex items-start gap-4 p-4 border rounded-lg">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <Video className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">
                                {consult.patient.first_name} {consult.patient.last_name}
                              </h4>
                              <p className="text-sm text-muted-foreground">Duration: {consult.duration} minutes</p>
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Clock className="h-3 w-3 mr-1" />
                              {new Date(consult.scheduled_time).toLocaleString()}
                            </div>
                          </div>
                          <Button asChild size="sm" variant="outline" className="mt-2">
                            <Link href={`/doctor-dashboard/teleconsults/${consult.id}`}>View Details</Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  {consultations.filter((consult) => consult.status === "scheduled").length > 3 && (
                    <div className="text-center mt-4">
                      <Button asChild variant="link">
                        <Link href="/doctor-dashboard/teleconsults">View all consultations</Link>
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">You don't have any upcoming consultations.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appointments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Teleconsultations</CardTitle>
              <CardDescription>Manage your online consultations with patients</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingData ? (
                <div className="text-center py-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2">Loading your consultations...</p>
                </div>
              ) : consultations.length > 0 ? (
                <div className="space-y-4">
                  {consultations.map((consult) => (
                    <div key={consult.id} className="flex items-start gap-4 p-4 border rounded-lg">
                      <div
                        className={`p-2 rounded-full ${
                          consult.status === "scheduled"
                            ? "bg-blue-100"
                            : consult.status === "completed"
                              ? "bg-green-100"
                              : "bg-red-100"
                        }`}
                      >
                        <Video
                          className={`h-5 w-5 ${
                            consult.status === "scheduled"
                              ? "text-blue-500"
                              : consult.status === "completed"
                                ? "text-green-500"
                                : "text-red-500"
                          }`}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">
                              {consult.patient.first_name} {consult.patient.last_name}
                            </h4>
                            <p className="text-sm text-muted-foreground">Duration: {consult.duration} minutes</p>
                            <p className="text-sm mt-1 capitalize">
                              Status:{" "}
                              <span
                                className={`font-medium ${
                                  consult.status === "scheduled"
                                    ? "text-blue-500"
                                    : consult.status === "completed"
                                      ? "text-green-500"
                                      : "text-red-500"
                                }`}
                              >
                                {consult.status}
                              </span>
                            </p>
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="h-3 w-3 mr-1" />
                            {new Date(consult.scheduled_time).toLocaleString()}
                          </div>
                        </div>
                        <Button asChild size="sm" variant="outline" className="mt-2">
                          <Link href={`/doctor-dashboard/teleconsults/${consult.id}`}>View Details</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">You don't have any teleconsultations yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="availability" className="space-y-6">
          <Card>
            <CardHeader className="flex justify-between items-center">
              <div>
                <CardTitle>Your Availability</CardTitle>
                <CardDescription>Manage your available time slots</CardDescription>
              </div>
              <Button asChild>
                <Link href="/doctor-dashboard/availability/new">Add New Slot</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {isLoadingData ? (
                <div className="text-center py-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2">Loading your availability...</p>
                </div>
              ) : availabilities.length > 0 ? (
                <div className="space-y-4">
                  {availabilities.map((slot) => (
                    <div key={slot.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <Calendar className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">{new Date(slot.day).toLocaleDateString()}</h4>
                          <p className="text-sm text-muted-foreground">
                            {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/doctor-dashboard/availability/${slot.id}`}>Edit</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">You haven't set any availability slots yet.</p>
                  <Button asChild>
                    <Link href="/doctor-dashboard/availability/new">Add Availability</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patients" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Patients</CardTitle>
              <CardDescription>View and manage your patient records</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Stethoscope className="h-12 w-12 text-primary mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">Patient management features coming soon.</p>
                <Button asChild>
                  <Link href="/doctor-dashboard/teleconsults">View Consultations</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
