"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { MapPin, Phone, Clock, Search } from "lucide-react"

type Clinic = {
  id: number
  name: string
  address: string
  phone: string
  opening_hours: string
  services: string[]
  distance?: number
  latitude: number
  longitude: number
}

export default function ClinicsPage() {
  const [clinics, setClinics] = useState<Clinic[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const { toast } = useToast()
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://medihelp-backend.onrender.com/api"

  useEffect(() => {
    // Try to get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        () => {
          toast({
            title: "Location access denied",
            description: "We can't show nearby clinics without your location.",
          })
        },
      )
    }

    const fetchClinics = async () => {
      try {
        let url = `${API_URL}/clinics/`

        if (userLocation) {
          url = `${API_URL}/clinics/nearby/?lat=${userLocation.lat}&lng=${userLocation.lng}`
        }

        const response = await fetch(url)

        if (response.ok) {
          const data = await response.json()
          setClinics(data.results || [])
        } else {
          // For demo purposes, create some sample clinics
          const sampleClinics: Clinic[] = [
            {
              id: 1,
              name: "City Health Center",
              address: "123 Main St, Cityville",
              phone: "+251-111-222-333",
              opening_hours: "Mon-Fri: 8:00 AM - 6:00 PM",
              services: ["General Medicine", "Pediatrics", "Vaccinations"],
              distance: 1.2,
              latitude: 9.0054,
              longitude: 38.7636,
            },
            {
              id: 2,
              name: "Community Medical Clinic",
              address: "456 Oak Ave, Townsburg",
              phone: "+251-444-555-666",
              opening_hours: "Mon-Sat: 9:00 AM - 8:00 PM",
              services: ["Family Medicine", "Laboratory", "Pharmacy"],
              distance: 2.5,
              latitude: 9.0154,
              longitude: 38.7736,
            },
            {
              id: 3,
              name: "Riverside Hospital",
              address: "789 River Rd, Riverside",
              phone: "+251-777-888-999",
              opening_hours: "24/7",
              services: ["Emergency Care", "Surgery", "Intensive Care"],
              distance: 3.8,
              latitude: 9.0254,
              longitude: 38.7836,
            },
            {
              id: 4,
              name: "Wellness Medical Center",
              address: "101 Health Blvd, Welltown",
              phone: "+251-222-333-444",
              opening_hours: "Mon-Fri: 8:00 AM - 5:00 PM",
              services: ["Preventive Care", "Nutrition Counseling", "Physical Therapy"],
              distance: 4.2,
              latitude: 9.0354,
              longitude: 38.7936,
            },
            {
              id: 5,
              name: "Children's Health Clinic",
              address: "202 Kid's Way, Familyville",
              phone: "+251-555-666-777",
              opening_hours: "Mon-Sat: 8:00 AM - 7:00 PM",
              services: ["Pediatrics", "Child Psychology", "Vaccinations"],
              distance: 5.1,
              latitude: 9.0454,
              longitude: 38.8036,
            },
            {
              id: 6,
              name: "Urgent Care Center",
              address: "303 Emergency St, Quickhelp",
              phone: "+251-888-999-000",
              opening_hours: "Daily: 7:00 AM - 10:00 PM",
              services: ["Urgent Care", "X-Ray", "Minor Procedures"],
              distance: 6.3,
              latitude: 9.0554,
              longitude: 38.8136,
            },
          ]

          setClinics(sampleClinics)
        }
      } catch (error) {
        // For demo purposes, create some sample clinics
        const sampleClinics: Clinic[] = [
          {
            id: 1,
            name: "City Health Center",
            address: "123 Main St, Cityville",
            phone: "+251-111-222-333",
            opening_hours: "Mon-Fri: 8:00 AM - 6:00 PM",
            services: ["General Medicine", "Pediatrics", "Vaccinations"],
            distance: 1.2,
            latitude: 9.0054,
            longitude: 38.7636,
          },
          {
            id: 2,
            name: "Community Medical Clinic",
            address: "456 Oak Ave, Townsburg",
            phone: "+251-444-555-666",
            opening_hours: "Mon-Sat: 9:00 AM - 8:00 PM",
            services: ["Family Medicine", "Laboratory", "Pharmacy"],
            distance: 2.5,
            latitude: 9.0154,
            longitude: 38.7736,
          },
          {
            id: 3,
            name: "Riverside Hospital",
            address: "789 River Rd, Riverside",
            phone: "+251-777-888-999",
            opening_hours: "24/7",
            services: ["Emergency Care", "Surgery", "Intensive Care"],
            distance: 3.8,
            latitude: 9.0254,
            longitude: 38.7836,
          },
          {
            id: 4,
            name: "Wellness Medical Center",
            address: "101 Health Blvd, Welltown",
            phone: "+251-222-333-444",
            opening_hours: "Mon-Fri: 8:00 AM - 5:00 PM",
            services: ["Preventive Care", "Nutrition Counseling", "Physical Therapy"],
            distance: 4.2,
            latitude: 9.0354,
            longitude: 38.7936,
          },
          {
            id: 5,
            name: "Children's Health Clinic",
            address: "202 Kid's Way, Familyville",
            phone: "+251-555-666-777",
            opening_hours: "Mon-Sat: 8:00 AM - 7:00 PM",
            services: ["Pediatrics", "Child Psychology", "Vaccinations"],
            distance: 5.1,
            latitude: 9.0454,
            longitude: 38.8036,
          },
          {
            id: 6,
            name: "Urgent Care Center",
            address: "303 Emergency St, Quickhelp",
            phone: "+251-888-999-000",
            opening_hours: "Daily: 7:00 AM - 10:00 PM",
            services: ["Urgent Care", "X-Ray", "Minor Procedures"],
            distance: 6.3,
            latitude: 9.0554,
            longitude: 38.8136,
          },
        ]

        setClinics(sampleClinics)
      } finally {
        setIsLoading(false)
      }
    }

    fetchClinics()
  }, [API_URL, toast, userLocation])

  const filteredClinics = clinics.filter(
    (clinic) =>
      clinic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clinic.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clinic.services.some((service) => service.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  // Sort clinics by distance if available
  const sortedClinics = [...filteredClinics].sort((a, b) => {
    if (a.distance !== undefined && b.distance !== undefined) {
      return a.distance - b.distance
    }
    return 0
  })

  return (
    <div className="container py-10">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Find Nearby Clinics</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Locate healthcare facilities near you when you need in-person care.
          </p>
        </div>

        <div className="relative mb-8">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by clinic name, address, or services..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-lg">Finding clinics near you...</p>
          </div>
        ) : sortedClinics.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {sortedClinics.map((clinic) => (
              <Card key={clinic.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{clinic.name}</CardTitle>
                    {clinic.distance !== undefined && (
                      <div className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
                        {clinic.distance.toFixed(1)} km away
                      </div>
                    )}
                  </div>
                  <CardDescription className="flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    {clinic.address}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{clinic.phone}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{clinic.opening_hours}</span>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm font-medium mb-1">Services:</p>
                    <div className="flex flex-wrap gap-1">
                      {clinic.services.map((service, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary"
                        >
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button asChild className="flex-1">
                    <Link href={`tel:${clinic.phone.replace(/[^0-9+]/g, "")}`}>
                      <Phone className="mr-2 h-4 w-4" />
                      Call
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="flex-1">
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${clinic.latitude},${clinic.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MapPin className="mr-2 h-4 w-4" />
                      Directions
                    </a>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No clinics found</h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery
                ? "No clinics match your search criteria. Try adjusting your search."
                : "We couldn't find any clinics near your location."}
            </p>
            {searchQuery && <Button onClick={() => setSearchQuery("")}>Clear Search</Button>}
          </div>
        )}

        <div className="mt-12 p-6 border rounded-lg bg-muted/50">
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">Emergency?</h3>
              <p className="text-muted-foreground mb-4">
                If you're experiencing a medical emergency, please call emergency services immediately.
              </p>
              <Button size="lg" className="bg-red-600 hover:bg-red-700">
                Call Emergency Services
              </Button>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">Need Remote Consultation?</h3>
              <p className="text-muted-foreground mb-4">
                Connect with healthcare professionals online for non-emergency situations.
              </p>
              <Button asChild size="lg" variant="outline">
                <Link href="/doctors">Find a Doctor</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
