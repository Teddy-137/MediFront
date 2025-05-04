"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { AlertTriangle, Search, Pill, ArrowRight } from "lucide-react"

type FirstAidItem = {
  id: number
  title: string
  summary: string
  content: string
  type: "firstaid" | "homeremedy"
  severity_level?: "low" | "medium" | "high"
  created_at: string
}

export default function FirstAidPage() {
  const [firstAidGuides, setFirstAidGuides] = useState<FirstAidItem[]>([])
  const [homeRemedies, setHomeRemedies] = useState<FirstAidItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://medihelp-backend.onrender.com/api"

  useEffect(() => {
    // Function to fetch first aid guides
    const fetchFirstAidGuides = async () => {
      try {
        const url = `${API_URL}/firstaid/?type=firstaid`
        console.log("Fetching first aid guides from:", url)
        
        const response = await fetch(url)
        console.log("First aid response status:", response.status)
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }
        
        const data = await response.json()
        console.log("First aid data received:", data)
        
        // Process the data
        const items = Array.isArray(data) ? data : (data.results || [])
        
        const processedItems = items.map(item => ({
          id: item.id,
          title: item.title || "",
          summary: item.description || item.summary || "",
          content: item.steps ? item.steps.join("\n") : (item.content || ""),
          type: "firstaid" as const,
          severity_level: getSeverityLevel(item.severity_level),
          created_at: item.created_at || new Date().toISOString()
        }))
        
        setFirstAidGuides(processedItems)
        return true
      } catch (error) {
        console.error("Error fetching first aid guides:", error)
        return false
      }
    }
    
    // Function to fetch home remedies - updated to use the dedicated endpoint
    const fetchHomeRemedies = async () => {
      try {
        // Use the dedicated home remedies endpoint
        const url = `${API_URL}/firstaid/remedies/`
        console.log("Fetching home remedies from:", url)
        
        const response = await fetch(url)
        console.log("Home remedies response status:", response.status)
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }
        
        const data = await response.json()
        console.log("Home remedies data received:", data)
        
        // Process the data
        const items = Array.isArray(data) ? data : (data.results || [])
        
        const processedItems = items.map(item => ({
          id: item.id,
          title: item.name || item.title || "",
          summary: item.preparation || item.description || "",
          content: item.ingredients ? "Ingredients: " + item.ingredients.join(", ") : (item.content || ""),
          type: "homeremedy" as const,
          created_at: item.created_at || new Date().toISOString()
        }))
        
        setHomeRemedies(processedItems)
        return true
      } catch (error) {
        console.error("Error fetching home remedies:", error)
        return false
      }
    }
    
    // Helper function to normalize severity level
    const getSeverityLevel = (level: any): "low" | "medium" | "high" => {
      if (typeof level === 'number') {
        return level === 3 ? "high" : level === 2 ? "medium" : "low"
      }
      if (typeof level === 'string' && ["low", "medium", "high"].includes(level.toLowerCase())) {
        return level.toLowerCase() as "low" | "medium" | "high"
      }
      return "medium"
    }
    
    // Main fetch function
    const fetchData = async () => {
      setIsLoading(true)
      
      try {
        const [firstAidSuccess, remediesSuccess] = await Promise.all([
          fetchFirstAidGuides(),
          fetchHomeRemedies()
        ])
        
        if (!firstAidSuccess && !remediesSuccess) {
          toast({
            variant: "destructive",
            title: "Connection Error",
            description: "Failed to load first aid content. Please check your internet connection.",
          })
        }
      } catch (error) {
        console.error("Error in data fetching:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "An unexpected error occurred while loading content.",
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchData()
  }, [API_URL, toast])

  const filteredFirstAidGuides = firstAidGuides.filter(
    (guide) =>
      guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guide.summary.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredHomeRemedies = homeRemedies.filter(
    (remedy) =>
      remedy.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      remedy.summary.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="container py-10">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">First Aid & Home Remedies</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Access emergency first aid guides and home remedies for common health issues. Always seek professional
            medical help for serious conditions.
          </p>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search for first aid guides or remedies..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Tabs defaultValue="firstaid">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="firstaid" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              First Aid Guides
            </TabsTrigger>
            <TabsTrigger value="remedies" className="flex items-center gap-2">
              <Pill className="h-4 w-4" />
              Home Remedies
            </TabsTrigger>
          </TabsList>

          <TabsContent value="firstaid" className="space-y-6">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-lg">Loading first aid guides...</p>
              </div>
            ) : filteredFirstAidGuides.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2">
                {filteredFirstAidGuides.map((guide) => (
                  <Card key={guide.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-xl">{guide.title}</CardTitle>
                        {guide.severity_level && (
                          <div
                            className={`px-2 py-1 text-xs rounded-full ${
                              guide.severity_level === "high"
                                ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                                : guide.severity_level === "medium"
                                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                                  : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                            }`}
                          >
                            {guide.severity_level.charAt(0).toUpperCase() + guide.severity_level.slice(1)}
                          </div>
                        )}
                      </div>
                      <CardDescription>{guide.summary}</CardDescription>
                    </CardHeader>
                    <CardFooter>
                      <Button asChild className="w-full">
                        <Link href={`/first-aid/${guide.id}`} className="flex items-center justify-center">
                          View Guide
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No guides found</h3>
                <p className="text-muted-foreground mb-6">No first aid guides match your search criteria.</p>
                {searchQuery && <Button onClick={() => setSearchQuery("")}>Clear Search</Button>}
              </div>
            )}
          </TabsContent>

          <TabsContent value="remedies" className="space-y-6">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-lg">Loading home remedies...</p>
              </div>
            ) : filteredHomeRemedies.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2">
                {filteredHomeRemedies.map((remedy) => (
                  <Card key={remedy.id}>
                    <CardHeader>
                      <CardTitle className="text-xl">{remedy.title}</CardTitle>
                      <CardDescription>{remedy.summary}</CardDescription>
                    </CardHeader>
                    <CardFooter>
                      <Button asChild variant="outline" className="w-full">
                        <Link href={`/first-aid/remedies/${remedy.id}`} className="flex items-center justify-center">
                          View Remedy
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Pill className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No remedies found</h3>
                <p className="text-muted-foreground mb-6">No home remedies match your search criteria.</p>
                {searchQuery && <Button onClick={() => setSearchQuery("")}>Clear Search</Button>}
              </div>
            )}
          </TabsContent>
        </Tabs>

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
              <h3 className="text-xl font-bold mb-2">Need Professional Help?</h3>
              <p className="text-muted-foreground mb-4">
                Connect with healthcare professionals for personalized advice.
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
