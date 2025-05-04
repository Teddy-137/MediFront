"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { CalendarIcon, Clock, MapPin, Stethoscope, Video } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

type Doctor = {
  id: number
  user: {
    first_name: string
    last_name: string
  }
  specialty?: string
  specialization?: string
  hospital?: string
  image?: string
  rating?: number
  reviews_count?: number
  consultation_fee: number
  available_slots?: string[]
}

type Appointment = {
  id: number
  doctor: Doctor
  date: string
  time: string
  type: "video" | "in-person"
  status: "upcoming" | "completed" | "cancelled"
}

export default function AppointmentsPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [appointmentType, setAppointmentType] = useState<"video" | "in-person">("video")
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(true)
  const [isBooking, setIsBooking] = useState(false)
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://medihelp-backend.onrender.com/api"

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setIsLoadingDoctors(true)
        const accessToken = localStorage.getItem("accessToken")
        const response = await fetch(`${API_URL}/doctors/profiles/`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          console.log("Doctors API response:", data)

          // Check if data has results property (paginated response)
          const doctorsList = data.results || data

          // Ensure doctorsList is an array
          if (Array.isArray(doctorsList)) {
            // Add mock available slots for demo purposes
            const doctorsWithSlots = doctorsList.map((doctor: Doctor) => ({
              ...doctor,
              available_slots: ["09:00 AM", "10:00 AM", "11:00 AM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM"],
            }))
            setDoctors(doctorsWithSlots)
          } else {
            console.error("Expected array but got:", typeof doctorsList)
            // Fallback to empty array
            setDoctors([])
            toast({
              variant: "destructive",
              title: "Error",
              description: "Failed to load doctors. Unexpected data format.",
            })
          }
        } else {
          console.error("Failed to fetch doctors:", response.status)
          // Fallback to sample data
          setDoctors(getSampleDoctors())
        }
      } catch (error) {
        console.error("Error fetching doctors:", error)
        // Fallback to sample data
        setDoctors(getSampleDoctors())
      } finally {
        setIsLoadingDoctors(false)
      }
    }

    const fetchAppointments = async () => {
      // Mock appointments for demo
      setAppointments([
        {
          id: 1,
          doctor: {
            id: 1,
            user: {
              first_name: "John",
              last_name: "Smith",
            },
            specialty: "Cardiologist",
            hospital: "City Hospital",
            consultation_fee: 100,
          },
          date: "2023-06-15",
          time: "10:00 AM",
          type: "video",
          status: "upcoming",
        },
      ])
    }

    if (isAuthenticated) {
      fetchDoctors()
      fetchAppointments()
    }
  }, [isAuthenticated, API_URL, toast])

  // Sample doctors data for fallback
  const getSampleDoctors = (): Doctor[] => {
    return [
      {
        id: 1,
        user: { first_name: "John", last_name: "Smith" },
        specialization: "Cardiologist",
        consultation_fee: 150,
        available_slots: ["09:00 AM", "10:00 AM", "11:00 AM", "01:00 PM", "02:00 PM"],
      },
      {
        id: 2,
        user: { first_name: "Sarah", last_name: "Johnson" },
        specialization: "Dermatologist",
        consultation_fee: 120,
        available_slots: ["10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM"],
      },
      {
        id: 3,
        user: { first_name: "Michael", last_name: "Chen" },
        specialization: "Pediatrician",
        consultation_fee: 100,
        available_slots: ["09:00 AM", "01:00 PM", "03:00 PM", "04:00 PM"],
      },
    ]
  }

  const handleBookAppointment = async () => {
    if (!selectedDoctor || !date || !selectedTime) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please select a doctor, date, and time for your appointment.",
      })
      return
    }

    setIsBooking(true)

    // Simulate API call
    setTimeout(() => {
      const newAppointment: Appointment = {
        id: Math.floor(Math.random() * 1000),
        doctor: selectedDoctor,
        date: format(date, "yyyy-MM-dd"),
        time: selectedTime,
        type: appointmentType,
        status: "upcoming",
      }

      setAppointments([...appointments, newAppointment])

      toast({
        title: "Appointment booked",
        description: `Your appointment with Dr. ${selectedDoctor.user.last_name} on ${format(date, "MMMM d, yyyy")} at ${selectedTime} has been confirmed.`,
      })

      // Reset form
      setSelectedDoctor(null)
      setDate(new Date())
      setSelectedTime(null)
      setAppointmentType("video")
      setIsBooking(false)
    }, 1500)
  }

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
      <h1 className="text-3xl font-bold mb-6">Appointments</h1>

      <Tabs defaultValue="upcoming">
        <TabsList className="mb-6">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="book">Book Appointment</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-6">
          {appointments.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
              {appointments
                .filter((app) => app.status === "upcoming")
                .map((appointment) => (
                  <Card key={appointment.id}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>
                            Dr. {appointment.doctor.user.first_name} {appointment.doctor.user.last_name}
                          </CardTitle>
                          <CardDescription>
                            {appointment.doctor.specialty || appointment.doctor.specialization}
                          </CardDescription>
                        </div>
                        {appointment.type === "video" ? (
                          <div className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-xs flex items-center">
                            <Video className="h-3 w-3 mr-1" />
                            Video
                          </div>
                        ) : (
                          <div className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-3 py-1 rounded-full text-xs flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            In-person
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center mb-3">
                        <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>
                          {new Date(appointment.date).toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{appointment.time}</span>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline">Cancel</Button>
                      {appointment.type === "video" && <Button>Join Call</Button>}
                    </CardFooter>
                  </Card>
                ))}
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No Upcoming Appointments</CardTitle>
                <CardDescription>You don't have any upcoming appointments scheduled.</CardDescription>
              </CardHeader>
              <CardContent className="text-center py-6">
                <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="mb-4">Book an appointment with one of our healthcare professionals.</p>
                <Button onClick={() => document.querySelector('[data-value="book"]')?.click()}>Book Appointment</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="book" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Book a New Appointment</CardTitle>
              <CardDescription>Schedule a consultation with one of our healthcare professionals.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="doctor">Select Doctor</Label>
                <Select
                  onValueChange={(value) =>
                    setSelectedDoctor(doctors.find((d) => d.id === Number.parseInt(value)) || null)
                  }
                >
                  <SelectTrigger id="doctor">
                    <SelectValue placeholder="Select a doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingDoctors ? (
                      <div className="text-center py-2">Loading doctors...</div>
                    ) : doctors.length > 0 ? (
                      doctors.map((doctor) => (
                        <SelectItem key={doctor.id} value={doctor.id.toString()}>
                          Dr. {doctor.user.first_name} {doctor.user.last_name} -{" "}
                          {doctor.specialization || doctor.specialty || "Specialist"}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="text-center py-2">No doctors available</div>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {selectedDoctor && (
                <>
                  <div className="space-y-2">
                    <Label>Appointment Type</Label>
                    <RadioGroup
                      defaultValue="video"
                      onValueChange={(value) => setAppointmentType(value as "video" | "in-person")}
                    >
                      <div className="flex space-x-4">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="video" id="video" />
                          <Label htmlFor="video" className="flex items-center">
                            <Video className="h-4 w-4 mr-1" /> Video Consultation
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="in-person" id="in-person" />
                          <Label htmlFor="in-person" className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" /> In-person Visit
                          </Label>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label>Select Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          initialFocus
                          disabled={(date) =>
                            date < new Date(new Date().setHours(0, 0, 0, 0)) ||
                            date > new Date(new Date().setDate(new Date().getDate() + 30))
                          }
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {date && selectedDoctor.available_slots && selectedDoctor.available_slots.length > 0 && (
                    <div className="space-y-2">
                      <Label>Available Time Slots</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {selectedDoctor.available_slots.map((slot) => (
                          <Button
                            key={slot}
                            variant={selectedTime === slot ? "default" : "outline"}
                            className="text-sm"
                            onClick={() => setSelectedTime(slot)}
                          >
                            {slot}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleBookAppointment}
                disabled={!selectedDoctor || !date || !selectedTime || isBooking}
                className="w-full"
              >
                {isBooking ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Booking...
                  </>
                ) : (
                  "Book Appointment"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Appointment History</CardTitle>
              <CardDescription>View your past appointments and consultations.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Stethoscope className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">You don't have any past appointments.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
