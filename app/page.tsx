import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, AlertTriangle, BookOpen, Stethoscope, MessageSquare, MapPin, Camera } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 health-gradient">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter text-white sm:text-5xl xl:text-6xl/none">
                  Your Complete Health Companion
                </h1>
                <p className="max-w-[600px] text-white md:text-xl">
                  Get instant symptom checking, first aid guidance, and connect with healthcare professionals all in one
                  place.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90">
                  <Link href="/symptom-checker">Check Symptoms</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  <Link href="/register">Create Account</Link>
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative w-full max-w-[400px] aspect-square">
                <div className="absolute inset-0 rounded-full bg-white/10 pulse-animation"></div>
                <Image
                  src="/placeholder.svg?height=400&width=400"
                  width={400}
                  height={400}
                  alt="Medical illustration"
                  className="relative z-10 rounded-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Complete Healthcare Solutions</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                MediHelp provides comprehensive tools to manage your health and get the care you need.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <Activity className="h-8 w-8 text-primary" />
                <CardTitle className="text-xl">Symptom Checker</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Check your symptoms and get preliminary insights about possible conditions.
                </CardDescription>
                <Button asChild className="mt-4 w-full" variant="outline">
                  <Link href="/symptom-checker">Check Symptoms</Link>
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <Camera className="h-8 w-8 text-primary" />
                <CardTitle className="text-xl">Skin Diagnosis</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Upload a photo of your skin condition for AI-powered analysis and recommendations.
                </CardDescription>
                <Button asChild className="mt-4 w-full" variant="outline">
                  <Link href="/skin-diagnosis">Check Skin Condition</Link>
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <AlertTriangle className="h-8 w-8 text-primary" />
                <CardTitle className="text-xl">First Aid Guides</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Access comprehensive first aid guides and home remedies for common issues.
                </CardDescription>
                <Button asChild className="mt-4 w-full" variant="outline">
                  <Link href="/first-aid">View Guides</Link>
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <BookOpen className="h-8 w-8 text-primary" />
                <CardTitle className="text-xl">Health Education</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Learn about various health conditions through articles and educational videos.
                </CardDescription>
                <Button asChild className="mt-4 w-full" variant="outline">
                  <Link href="/education">Learn More</Link>
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <Stethoscope className="h-8 w-8 text-primary" />
                <CardTitle className="text-xl">Find Doctors</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Connect with qualified healthcare professionals for teleconsultations.
                </CardDescription>
                <Button asChild className="mt-4 w-full" variant="outline">
                  <Link href="/doctors">Find Doctors</Link>
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <MapPin className="h-8 w-8 text-primary" />
                <CardTitle className="text-xl">Nearby Clinics</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Locate healthcare facilities near you when you need in-person care.
                </CardDescription>
                <Button asChild className="mt-4 w-full" variant="outline">
                  <Link href="/clinics">Find Clinics</Link>
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <MessageSquare className="h-8 w-8 text-primary" />
                <CardTitle className="text-xl">Health Chat</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Get answers to your health questions through our AI-powered health assistant.
                </CardDescription>
                <Button asChild className="mt-4 w-full" variant="outline">
                  <Link href="/chat">Start Chatting</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Trusted by Thousands</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                See what our users have to say about their experience with MediHelp.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3">
            {[
              {
                quote: "MediHelp helped me understand my symptoms and find the right doctor when I needed it most.",
                name: "Sarah Johnson",
                title: "Patient",
              },
              {
                quote:
                  "The first aid guides were invaluable when my child had a minor accident at home. Clear and easy to follow.",
                name: "Michael Chen",
                title: "Parent",
              },
              {
                quote:
                  "As a healthcare provider, I appreciate how MediHelp connects patients with accurate information.",
                name: "Dr. Emily Rodriguez",
                title: "Cardiologist",
              },
            ].map((testimonial, index) => (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <p className="mb-4 italic">"{testimonial.quote}"</p>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.title}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 health-gradient">
        <div className="container px-4 md:px-6 text-center">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
            <h2 className="text-3xl font-bold tracking-tighter text-white sm:text-5xl">
              Take Control of Your Health Today
            </h2>
            <p className="max-w-[85%] text-white md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Join thousands of users who trust MediHelp for their healthcare needs.
            </p>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90">
                <Link href="/register">Create Free Account</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                <Link href="/symptom-checker">Try Symptom Checker</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
