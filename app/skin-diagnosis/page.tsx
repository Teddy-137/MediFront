"use client"

import Link from "next/link"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Camera, Upload, AlertTriangle, Loader2, ImageIcon, RefreshCw, Info } from "lucide-react"

export default function SkinDiagnosisPage() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [diagnosisResult, setDiagnosisResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://medihelp-backend.onrender.com/api"

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload an image file (JPEG, PNG, etc.)",
      })
      return
    }

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
      })
      return
    }

    setSelectedImage(file)
    setPreviewUrl(URL.createObjectURL(file))
    setDiagnosisResult(null)
    setError(null)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()

    const file = e.dataTransfer.files?.[0]
    if (!file) return

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload an image file (JPEG, PNG, etc.)",
      })
      return
    }

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
      })
      return
    }

    setSelectedImage(file)
    setPreviewUrl(URL.createObjectURL(file))
    setDiagnosisResult(null)
    setError(null)
  }

  const handleSubmit = async () => {
    if (!selectedImage) return

    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to use the skin diagnosis feature.",
      })
      router.push("/login")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const accessToken = localStorage.getItem("accessToken")
      const formData = new FormData()
      formData.append("image", selectedImage)

      const response = await fetch(`${API_URL}/skin-diagnosis/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          // Don't set Content-Type for multipart/form-data
        },
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        console.log("Diagnosis response:", data)
        
        // Transform backend response format to match frontend expected format
        const transformedData = {
          condition: data.diagnosis?.conditions?.[0] || "Unknown condition",
          confidence: data.diagnosis?.confidence || 0.5,
          description: "Description based on AI analysis of your skin condition.",
          recommendations: data.diagnosis?.recommendations || ["Consult a dermatologist"],
          severity: data.diagnosis?.urgency || "moderate",
          similar_conditions: data.diagnosis?.conditions?.slice(1).map((name, index) => ({
            name,
            similarity: 0.8 - (index * 0.2)
          })) || [],
        }
        
        setDiagnosisResult(transformedData)
        toast({
          title: "Diagnosis Complete",
          description: "Your skin image has been analyzed successfully.",
        })
      } else {
        let errorMessage = "Failed to analyze the image. Please try again."
        try {
          const errorData = await response.json()
          errorMessage = errorData.detail || errorData.error || errorMessage
        } catch (e) {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage
        }
        
        setError(errorMessage)
        toast({
          variant: "destructive",
          title: "Diagnosis Failed",
          description: errorMessage,
        })
        
        // Only use demo data in development environment
        if (process.env.NODE_ENV === "development") {
          console.log("Using demo data in development mode")
          setDiagnosisResult({
            condition: "Eczema",
            confidence: 0.87,
            description:
              "Eczema is a condition that causes the skin to become itchy, red, dry and cracked. It's more common in children, often developing before their first birthday.",
            recommendations: [
              "Keep the affected area moisturized",
              "Avoid scratching the affected area",
              "Use mild soaps and detergents",
              "Apply prescribed topical treatments as directed",
            ],
            severity: "moderate",
            similar_conditions: [
              { name: "Contact Dermatitis", similarity: 0.65 },
              { name: "Psoriasis", similarity: 0.42 },
            ],
          })
        }
      }
    } catch (error) {
      console.error("Error during diagnosis:", error)
      setError("An error occurred. Please try again.")
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setSelectedImage(null)
    setPreviewUrl(null)
    setDiagnosisResult(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  if (authLoading) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Skin Condition Diagnosis</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Upload a clear image of your skin condition to receive an AI-powered analysis and recommendations.
          </p>
        </div>

        <Alert className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Important Disclaimer</AlertTitle>
          <AlertDescription>
            This tool provides preliminary analysis only and is not a substitute for professional medical diagnosis.
            Always consult with a healthcare professional for proper evaluation and treatment.
          </AlertDescription>
        </Alert>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-primary" />
                Upload Skin Image
              </CardTitle>
              <CardDescription>
                Upload a clear, well-lit image of the affected skin area. For best results, ensure good lighting and
                focus.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!previewUrl ? (
                <div
                  className="border-2 border-dashed rounded-lg p-12 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                    <h3 className="text-lg font-medium">Drag and drop your image here</h3>
                    <p className="text-sm text-muted-foreground mb-4">or click to browse files</p>
                    <Button
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation()
                        fileInputRef.current?.click()
                      }}
                    >
                      Select Image
                    </Button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                    <p className="text-xs text-muted-foreground mt-4">
                      Supported formats: JPEG, PNG, WebP • Max size: 5MB
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <div className="relative w-full max-w-md aspect-square mx-auto">
                    <Image
                      src={previewUrl || "/placeholder.svg"}
                      alt="Selected skin image"
                      fill
                      className="object-contain rounded-lg"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={resetForm}>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Change Image
                    </Button>
                    <Button onClick={handleSubmit} disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <ImageIcon className="mr-2 h-4 w-4" />
                          Analyze Image
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {diagnosisResult && (
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-primary" />
                  Diagnosis Results
                </CardTitle>
                <CardDescription>
                  Based on the image analysis, here are the potential findings and recommendations.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="overview">
                  <TabsList className="mb-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                    <TabsTrigger value="similar">Similar Conditions</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4">
                    <div className="flex flex-col md:flex-row gap-4 items-start">
                      <div className="flex-1 space-y-4">
                        <div>
                          <h3 className="text-lg font-medium mb-1">Potential Condition</h3>
                          <p className="text-2xl font-bold text-primary">{diagnosisResult.condition}</p>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="text-sm font-medium">Confidence Level</h3>
                            <span className="text-sm">{Math.round(diagnosisResult.confidence * 100)}%</span>
                          </div>
                          <Progress value={diagnosisResult.confidence * 100} className="h-2" />
                        </div>

                        <div>
                          <h3 className="text-sm font-medium mb-1">Severity</h3>
                          <div
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                              diagnosisResult.severity === "high"
                                ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                                : diagnosisResult.severity === "moderate"
                                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                                  : diagnosisResult.severity === "low"
                                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                    : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                            }`}
                            
                          >
{diagnosisResult.severity
  ? diagnosisResult.severity.charAt(0).toUpperCase() + diagnosisResult.severity.slice(1)
  : "Unknown"}                          </div>
                        </div>
                      </div>

                      <div className="flex-1">
                        <h3 className="text-lg font-medium mb-1">Description</h3>
                        <p className="text-muted-foreground">{diagnosisResult.description}</p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="recommendations" className="space-y-4">
                    <h3 className="text-lg font-medium mb-2">Recommended Actions</h3>
                    <ul className="space-y-2">
                      {diagnosisResult.recommendations.map((recommendation: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="bg-primary/10 p-1 rounded-full mt-0.5">
                            <div className="h-2 w-2 rounded-full bg-primary" />
                          </div>
                          <span>{recommendation}</span>
                        </li>
                      ))}
                    </ul>
                  </TabsContent>

                  <TabsContent value="similar" className="space-y-4">
                    <h3 className="text-lg font-medium mb-2">Similar Conditions</h3>
                    <div className="space-y-3">
                      {diagnosisResult.similar_conditions.map((condition: any, index: number) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium">{condition.name}</h4>
                            <span className="text-sm">{Math.round(condition.similarity * 100)}% similarity</span>
                          </div>
                          <Progress value={condition.similarity * 100} className="h-1.5" />
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Important Note</AlertTitle>
                  <AlertDescription>
                    This is an AI-assisted analysis and should not replace professional medical advice.
                  </AlertDescription>
                </Alert>
                <div className="flex gap-2 w-full">
                  <Button asChild variant="outline" className="flex-1">
                    <Link href="/doctors">Find a Dermatologist</Link>
                  </Button>
                  <Button asChild className="flex-1">
                    <Link href="/education?q=skin+conditions">Learn About Skin Conditions</Link>
                  </Button>
                </div>
              </CardFooter>
            </Card>
          )}
        </div>

        <div className="mt-12 p-6 border rounded-lg bg-muted/50">
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">Need Professional Help?</h3>
              <p className="text-muted-foreground mb-4">
                Connect with a dermatologist for a thorough evaluation of your skin condition.
              </p>
              <Button asChild size="lg">
                <Link href="/doctors?specialization=Dermatologist">Find a Dermatologist</Link>
              </Button>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">Learn More</h3>
              <p className="text-muted-foreground mb-4">
                Explore our educational resources about common skin conditions and treatments.
              </p>
              <Button asChild size="lg" variant="outline">
                <Link href="/education?q=skin">Skin Health Articles</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
