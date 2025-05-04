"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Calendar, Search, Stethoscope, User } from "lucide-react"

type Doctor = {
  id: number
  user: {
    first_name: string
    last_name: string
  }
  specialization: string
  consultation_fee: number
  license_number: string
  bio?: string
  rating?: number
  available?: boolean
}

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [specialization, setSpecialization] = useState("")
  const { isAuthenticated } = useAuth()
  const { toast } = useToast()
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://medihelp-backend.onrender.com/api"

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken")
        const headers: HeadersInit = {}

        if (accessToken) {
          headers.Authorization = `Bearer ${accessToken}`
        }

        const response = await fetch(`${API_URL}/doctors/profiles/`, { headers })
        console.log("Doctors API response status:", response.status)

        if (response.ok) {
          const data = await response.json()
          console.log("Doctors API response data:", data)

          // Check if data has results property (paginated response)
          const doctorsList = data.results || data

          // Ensure doctorsList is an array
          if (Array.isArray(doctorsList)) {
            setDoctors(doctorsList)
          } else {
            console.error("Expected array but got:", typeof doctorsList)
            // Fallback to sample doctors
            setDoctors(getSampleDoctors())
          }
        } else {
          console.error("Failed to fetch doctors:", response.status)
          // For demo purposes, create some sample doctors
          setDoctors(getSampleDoctors())
        }
      } catch (error) {
        console.error("Error fetching doctors:", error)
        // For demo purposes, create some sample doctors
        setDoctors(getSampleDoctors())
      } finally {
        setIsLoading(false)
      }
    }

    fetchDoctors()
  }, [API_URL, toast])

  // Sample doctors data for fallback
  const getSampleDoctors = (): Doctor[] => {
    return [
      {
        id: 1,
        user: { first_name: "John", last_name: "Smith" },
        specialization: "Cardiologist",
        consultation_fee: 150,
        license_number: "MED123456",
        bio: "Experienced cardiologist with over 10 years of practice.",
        rating: 4.8,
        available: true,
      },
      {
        id: 2,
        user: { first_name: "Sarah", last_name: "Johnson" },
        specialization: "Dermatologist",
        consultation_fee: 120,
        license_number: "MED789012",
        bio: "Specializing in skin conditions and treatments.",
        rating: 4.7,
        available: true,
      },
      {
        id: 3,
        user: { first_name: "Michael", last_name: "Chen" },
        specialization: "Pediatrician",
        consultation_fee: 100,
        license_number: "MED345678",
        bio: "Dedicated to providing quality care for children of all ages.",
        rating: 4.9,
        available: false,
      },
      {
        id: 4,
        user: { first_name: "Emily", last_name: "Rodriguez" },
        specialization: "Neurologist",
        consultation_fee: 180,
        license_number: "MED901234",
        bio: "Specializing in neurological disorders and treatments.",
        rating: 4.6,
        available: true,
      },
      {
        id: 5,
        user: { first_name: "David", last_name: "Wilson" },
        specialization: "Orthopedic Surgeon",
        consultation_fee: 200,
        license_number: "MED567890",
        bio: "Expert in musculoskeletal conditions and surgical interventions.",
        rating: 4.5,
        available: true,
      },
      {
        id: 6,
        user: { first_name: "Lisa", last_name: "Brown" },
        specialization: "Psychiatrist",
        consultation_fee: 160,
        license_number: "MED123789",
        bio: "Helping patients with mental health concerns for over 15 years.",
        rating: 4.8,
        available: false,
      },
    ]
  }

  // Get unique specializations from doctors array
  const specializations =
    doctors && doctors.length > 0 ? [...new Set(doctors.map((doctor) => doctor.specialization))] : []

  const filteredDoctors = doctors.filter((doctor) => {
    const nameMatch = `${doctor.user.first_name} ${doctor.user.last_name}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())

    const specializationMatch = specialization ? doctor.specialization === specialization : true

    return nameMatch && specializationMatch
  })

  return (
    <div className="container py-10">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Find a Doctor</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Connect with qualified healthcare professionals for teleconsultations and get the care you need from the
            comfort of your home.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by doctor name..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={specialization} onValueChange={setSpecialization}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Specialization" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Specializations</SelectItem>
              {specializations.map((spec) => (
                <SelectItem key={spec} value={spec}>
                  {spec}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-lg">Loading doctors...</p>
          </div>
        ) : filteredDoctors.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredDoctors.map((doctor) => (
              <Card key={doctor.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">
                      Dr. {doctor.user.first_name} {doctor.user.last_name}
                    </CardTitle>
                    {doctor.available !== undefined && (
                      <div
                        className={`px-2 py-1 text-xs rounded-full ${
                          doctor.available
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                            : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                        }`}
                      >
                        {doctor.available ? "Available" : "Unavailable"}
                      </div>
                    )}
                  </div>
                  <CardDescription className="flex items-center">
                    <Stethoscope className="h-3 w-3 mr-1" />
                    {doctor.specialization}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Consultation Fee</p>
                      <p className="text-sm text-muted-foreground">${doctor.consultation_fee}</p>
                    </div>
                  </div>
                  {doctor.bio && <p className="text-sm text-muted-foreground mt-2">{doctor.bio}</p>}
                  {doctor.rating !== undefined && (
                    <div className="flex items-center mt-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(doctor.rating!) ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"
                            }`}
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="currentColor"
                            viewBox="0 0 22 20"
                          >
                            <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
                          </svg>
                        ))}
                      </div>
                      <p className="ml-1 text-sm text-muted-foreground">{doctor.rating} out of 5</p>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button asChild className="flex-1" disabled={doctor.available === false}>
                    <Link href={`/doctors/${doctor.id}/book`}>
                      <Calendar className="mr-2 h-4 w-4" />
                      Book Appointment
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="flex-1">
                    <Link href={`/doctors/${doctor.id}`}>View Profile</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Stethoscope className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No doctors found</h3>
            <p className="text-muted-foreground mb-6">
              No doctors match your search criteria. Try adjusting your filters.
            </p>
            {(searchQuery || specialization) && (
              <Button
                onClick={() => {
                  setSearchQuery("")
                  setSpecialization("")
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        )}

        <div className="mt-12 p-6 border rounded-lg bg-muted/50 text-center">
          <h3 className="text-xl font-bold mb-2">Are you a healthcare professional?</h3>
          <p className="text-muted-foreground mb-4 max-w-lg mx-auto">
            Join our platform to connect with patients and offer teleconsultations.
          </p>
          <Button asChild size="lg">
            <Link href="/register-doctor">Register as a Doctor</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
