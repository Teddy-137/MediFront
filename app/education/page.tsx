"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { BookOpen, Search, VideoIcon, Clock, Calendar, ArrowRight } from "lucide-react"

type Article = {
  id: number
  title: string
  summary: string
  content: string
  tags: string[]
  is_published: boolean
  published_date: string
  related_conditions?: { id: number; name: string }[]
}

type VideoContent = {
  id: number
  title: string
  youtube_url: string
  duration_minutes: number
  is_published: boolean
  published_date: string
  thumbnail_url?: string
  related_symptoms?: { id: number; name: string }[]
}

export default function EducationPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [videos, setVideos] = useState<VideoContent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://medihelp-backend.onrender.com/api"

  useEffect(() => {
    const fetchEducationalContent = async () => {
      try {
        // Fetch articles
        const articlesResponse = await fetch(`${API_URL}/content/articles/`)

        // Fetch videos
        const videosResponse = await fetch(`${API_URL}/content/videos/`)

        if (articlesResponse.ok && videosResponse.ok) {
          const articlesData = await articlesResponse.json()
          const videosData = await videosResponse.json()

          setArticles(articlesData.results || [])
          setVideos(videosData.results || [])
        } else {
          // For demo purposes, create some sample content
          const sampleArticles: Article[] = [
            {
              id: 1,
              title: "Understanding Diabetes: Symptoms, Causes, and Management",
              summary: "A comprehensive guide to diabetes, its types, symptoms, and how to manage it effectively.",
              content: "Diabetes is a chronic condition that affects how your body turns food into energy...",
              tags: ["diabetes", "chronic conditions", "health management"],
              is_published: true,
              published_date: "2025-01-15",
              related_conditions: [{ id: 1, name: "Diabetes" }],
            },
            {
              id: 2,
              title: "Heart Health: Prevention and Early Warning Signs",
              summary:
                "Learn about cardiovascular health, risk factors, and how to recognize early warning signs of heart problems.",
              content: "Heart disease remains one of the leading causes of death worldwide...",
              tags: ["heart health", "cardiovascular", "prevention"],
              is_published: true,
              published_date: "2025-02-10",
              related_conditions: [
                { id: 2, name: "Hypertension" },
                { id: 3, name: "Coronary Artery Disease" },
              ],
            },
            {
              id: 3,
              title: "Mental Health Basics: Understanding Anxiety and Depression",
              summary: "An introduction to common mental health conditions, their symptoms, and treatment options.",
              content: "Mental health is just as important as physical health...",
              tags: ["mental health", "anxiety", "depression"],
              is_published: true,
              published_date: "2025-03-05",
              related_conditions: [
                { id: 4, name: "Anxiety" },
                { id: 5, name: "Depression" },
              ],
            },
            {
              id: 4,
              title: "Nutrition Fundamentals: Building a Balanced Diet",
              summary:
                "Essential information about nutrition, food groups, and creating a balanced diet for optimal health.",
              content: "Good nutrition is a cornerstone of health and well-being...",
              tags: ["nutrition", "diet", "healthy eating"],
              is_published: true,
              published_date: "2025-03-20",
            },
            {
              id: 5,
              title: "Sleep Hygiene: Improving Your Sleep Quality",
              summary: "Tips and strategies for better sleep habits and addressing common sleep problems.",
              content:
                "Quality sleep is essential for physical health, mental well-being, and overall quality of life...",
              tags: ["sleep", "insomnia", "health habits"],
              is_published: true,
              published_date: "2025-04-12",
              related_conditions: [{ id: 6, name: "Insomnia" }],
            },
            {
              id: 6,
              title: "Childhood Vaccinations: What Parents Need to Know",
              summary: "A guide to childhood immunizations, their importance, and addressing common concerns.",
              content: "Vaccines are one of the most effective ways to protect children from serious diseases...",
              tags: ["vaccines", "children's health", "preventive care"],
              is_published: true,
              published_date: "2025-05-08",
            },
          ]

          const sampleVideos: VideoContent[] = [
            {
              id: 1,
              title: "First Aid for Burns: What to Do Immediately",
              youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
              duration_minutes: 8,
              is_published: true,
              published_date: "2025-01-20",
              thumbnail_url: "/placeholder.svg?height=180&width=320",
              related_symptoms: [{ id: 1, name: "Burns" }],
            },
            {
              id: 2,
              title: "Understanding Blood Pressure Readings",
              youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
              duration_minutes: 12,
              is_published: true,
              published_date: "2025-02-15",
              thumbnail_url: "/placeholder.svg?height=180&width=320",
              related_symptoms: [{ id: 2, name: "Hypertension" }],
            },
            {
              id: 3,
              title: "Proper Handwashing Technique to Prevent Illness",
              youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
              duration_minutes: 5,
              is_published: true,
              published_date: "2025-03-10",
              thumbnail_url: "/placeholder.svg?height=180&width=320",
            },
            {
              id: 4,
              title: "How to Perform CPR: Step-by-Step Guide",
              youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
              duration_minutes: 15,
              is_published: true,
              published_date: "2025-04-05",
              thumbnail_url: "/placeholder.svg?height=180&width=320",
            },
            {
              id: 5,
              title: "Managing Stress Through Mindfulness",
              youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
              duration_minutes: 20,
              is_published: true,
              published_date: "2025-05-12",
              thumbnail_url: "/placeholder.svg?height=180&width=320",
              related_symptoms: [
                { id: 3, name: "Stress" },
                { id: 4, name: "Anxiety" },
              ],
            },
            {
              id: 6,
              title: "Diabetes Management: Monitoring Blood Sugar",
              youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
              duration_minutes: 18,
              is_published: true,
              published_date: "2025-06-08",
              thumbnail_url: "/placeholder.svg?height=180&width=320",
              related_symptoms: [{ id: 5, name: "Diabetes" }],
            },
          ]

          setArticles(sampleArticles)
          setVideos(sampleVideos)
        }
      } catch (error) {
        // For demo purposes, create some sample content
        const sampleArticles: Article[] = [
          {
            id: 1,
            title: "Understanding Diabetes: Symptoms, Causes, and Management",
            summary: "A comprehensive guide to diabetes, its types, symptoms, and how to manage it effectively.",
            content: "Diabetes is a chronic condition that affects how your body turns food into energy...",
            tags: ["diabetes", "chronic conditions", "health management"],
            is_published: true,
            published_date: "2025-01-15",
            related_conditions: [{ id: 1, name: "Diabetes" }],
          },
          {
            id: 2,
            title: "Heart Health: Prevention and Early Warning Signs",
            summary:
              "Learn about cardiovascular health, risk factors, and how to recognize early warning signs of heart problems.",
            content: "Heart disease remains one of the leading causes of death worldwide...",
            tags: ["heart health", "cardiovascular", "prevention"],
            is_published: true,
            published_date: "2025-02-10",
            related_conditions: [
              { id: 2, name: "Hypertension" },
              { id: 3, name: "Coronary Artery Disease" },
            ],
          },
          {
            id: 3,
            title: "Mental Health Basics: Understanding Anxiety and Depression",
            summary: "An introduction to common mental health conditions, their symptoms, and treatment options.",
            content: "Mental health is just as important as physical health...",
            tags: ["mental health", "anxiety", "depression"],
            is_published: true,
            published_date: "2025-03-05",
            related_conditions: [
              { id: 4, name: "Anxiety" },
              { id: 5, name: "Depression" },
            ],
          },
          {
            id: 4,
            title: "Nutrition Fundamentals: Building a Balanced Diet",
            summary:
              "Essential information about nutrition, food groups, and creating a balanced diet for optimal health.",
            content: "Good nutrition is a cornerstone of health and well-being...",
            tags: ["nutrition", "diet", "healthy eating"],
            is_published: true,
            published_date: "2025-03-20",
          },
          {
            id: 5,
            title: "Sleep Hygiene: Improving Your Sleep Quality",
            summary: "Tips and strategies for better sleep habits and addressing common sleep problems.",
            content:
              "Quality sleep is essential for physical health, mental well-being, and overall quality of life...",
            tags: ["sleep", "insomnia", "health habits"],
            is_published: true,
            published_date: "2025-04-12",
            related_conditions: [{ id: 6, name: "Insomnia" }],
          },
          {
            id: 6,
            title: "Childhood Vaccinations: What Parents Need to Know",
            summary: "A guide to childhood immunizations, their importance, and addressing common concerns.",
            content: "Vaccines are one of the most effective ways to protect children from serious diseases...",
            tags: ["vaccines", "children's health", "preventive care"],
            is_published: true,
            published_date: "2025-05-08",
          },
        ]

        const sampleVideos: VideoContent[] = [
          {
            id: 1,
            title: "First Aid for Burns: What to Do Immediately",
            youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            duration_minutes: 8,
            is_published: true,
            published_date: "2025-01-20",
            thumbnail_url: "/placeholder.svg?height=180&width=320",
            related_symptoms: [{ id: 1, name: "Burns" }],
          },
          {
            id: 2,
            title: "Understanding Blood Pressure Readings",
            youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            duration_minutes: 12,
            is_published: true,
            published_date: "2025-02-15",
            thumbnail_url: "/placeholder.svg?height=180&width=320",
            related_symptoms: [{ id: 2, name: "Hypertension" }],
          },
          {
            id: 3,
            title: "Proper Handwashing Technique to Prevent Illness",
            youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            duration_minutes: 5,
            is_published: true,
            published_date: "2025-03-10",
            thumbnail_url: "/placeholder.svg?height=180&width=320",
          },
          {
            id: 4,
            title: "How to Perform CPR: Step-by-Step Guide",
            youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            duration_minutes: 15,
            is_published: true,
            published_date: "2025-04-05",
            thumbnail_url: "/placeholder.svg?height=180&width=320",
          },
          {
            id: 5,
            title: "Managing Stress Through Mindfulness",
            youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            duration_minutes: 20,
            is_published: true,
            published_date: "2025-05-12",
            thumbnail_url: "/placeholder.svg?height=180&width=320",
            related_symptoms: [
              { id: 3, name: "Stress" },
              { id: 4, name: "Anxiety" },
            ],
          },
          {
            id: 6,
            title: "Diabetes Management: Monitoring Blood Sugar",
            youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            duration_minutes: 18,
            is_published: true,
            published_date: "2025-06-08",
            thumbnail_url: "/placeholder.svg?height=180&width=320",
            related_symptoms: [{ id: 5, name: "Diabetes" }],
          },
        ]

        setArticles(sampleArticles)
        setVideos(sampleVideos)
      } finally {
        setIsLoading(false)
      }
    }

    fetchEducationalContent()
  }, [API_URL, toast])

  const filteredArticles = articles.filter(
    (article) =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const filteredVideos = videos.filter((video) => video.title.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="container py-10">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Health Education</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore our collection of articles and videos to learn more about various health topics, conditions, and
            wellness practices.
          </p>
        </div>

        <div className="relative mb-8">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search for health topics..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Tabs defaultValue="articles">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="articles" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Articles
            </TabsTrigger>
            <TabsTrigger value="videos" className="flex items-center gap-2">
              <VideoIcon className="h-4 w-4" />
              Videos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="articles" className="space-y-6">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-lg">Loading articles...</p>
              </div>
            ) : filteredArticles.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2">
                {filteredArticles.map((article) => (
                  <Card key={article.id} className="flex flex-col h-full">
                    <CardHeader>
                      <CardTitle className="text-xl">
                        <Link
                          href={`/education/articles/${article.id}`}
                          className="hover:text-primary transition-colors"
                        >
                          {article.title}
                        </Link>
                      </CardTitle>
                      <CardDescription className="flex items-center text-xs">
                        <Calendar className="h-3 w-3 mr-1" />
                        Published: {new Date(article.published_date).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <p className="text-muted-foreground">{article.summary}</p>
                      {article.tags && article.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-4">
                          {article.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </CardContent>
                    <CardFooter>
                      <Button asChild className="w-full">
                        <Link href={`/education/articles/${article.id}`} className="flex items-center justify-center">
                          Read Article
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No articles found</h3>
                <p className="text-muted-foreground mb-6">
                  No articles match your search criteria. Try adjusting your search.
                </p>
                {searchQuery && <Button onClick={() => setSearchQuery("")}>Clear Search</Button>}
              </div>
            )}
          </TabsContent>

          <TabsContent value="videos" className="space-y-6">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-lg">Loading videos...</p>
              </div>
            ) : filteredVideos.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2">
                {filteredVideos.map((video) => (
                  <Card key={video.id} className="flex flex-col h-full">
                    <div className="relative">
                      <Image
                        src={video.thumbnail_url || "/placeholder.svg?height=180&width=320"}
                        alt={video.title}
                        width={320}
                        height={180}
                        className="w-full h-[180px] object-cover rounded-t-lg"
                      />
                      <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-white rounded-md text-xs flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {video.duration_minutes} min
                      </div>
                    </div>
                    <CardHeader>
                      <CardTitle className="text-xl">{video.title}</CardTitle>
                      <CardDescription className="flex items-center text-xs">
                        <Calendar className="h-3 w-3 mr-1" />
                        Published: {new Date(video.published_date).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                      {video.related_symptoms && video.related_symptoms.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          <p className="text-xs font-medium mr-1">Related:</p>
                          {video.related_symptoms.map((symptom) => (
                            <span
                              key={symptom.id}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary"
                            >
                              {symptom.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </CardContent>
                    <CardFooter>
                      <Button asChild className="w-full">
                        <a
                          href={video.youtube_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center"
                        >
                          Watch Video
                          <VideoIcon className="ml-2 h-4 w-4" />
                        </a>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <VideoIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No videos found</h3>
                <p className="text-muted-foreground mb-6">
                  No videos match your search criteria. Try adjusting your search.
                </p>
                {searchQuery && <Button onClick={() => setSearchQuery("")}>Clear Search</Button>}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="mt-12 p-6 border rounded-lg bg-muted/50 text-center">
          <h3 className="text-xl font-bold mb-2">Have a specific health question?</h3>
          <p className="text-muted-foreground mb-4 max-w-lg mx-auto">
            Our health assistant can provide information on various health topics and conditions.
          </p>
          <Button asChild size="lg">
            <Link href="/chat">Chat with Health Assistant</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
