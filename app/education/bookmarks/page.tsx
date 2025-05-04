"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, BookOpen, Calendar, ArrowRight, BookmarkX } from "lucide-react"

type Article = {
  id: number
  title: string
  summary: string
  tags: string[]
  published_date: string
}

export default function BookmarksPage() {
  const [bookmarkedArticles, setBookmarkedArticles] = useState<Article[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://medihelp-backend.onrender.com/api"

  useEffect(() => {
    const fetchBookmarkedArticles = async () => {
      try {
        // Get bookmarked article IDs from localStorage
        if (typeof window === "undefined") {
          setIsLoading(false)
          return
        }

        const bookmarkIds = JSON.parse(localStorage.getItem("bookmarkedArticles") || "[]")

        if (bookmarkIds.length === 0) {
          setBookmarkedArticles([])
          setIsLoading(false)
          return
        }

        // For each bookmarked ID, fetch the article details
        const articlePromises = bookmarkIds.map(async (id: number) => {
          try {
            const response = await fetch(`${API_URL}/content/articles/${id}/`)
            if (response.ok) {
              return await response.json()
            }
            return null
          } catch (error) {
            return null
          }
        })

        const articles = await Promise.all(articlePromises)
        const validArticles = articles.filter((article) => article !== null)

        // If API fails, use sample data for demo
        if (validArticles.length === 0 && bookmarkIds.length > 0) {
          const sampleArticles: Article[] = [
            {
              id: 1,
              title: "Understanding Diabetes: Symptoms, Causes, and Management",
              summary: "A comprehensive guide to diabetes, its types, symptoms, and how to manage it effectively.",
              tags: ["diabetes", "chronic conditions", "health management"],
              published_date: "2025-01-15",
            },
            {
              id: 2,
              title: "Heart Health: Prevention and Early Warning Signs",
              summary:
                "Learn about cardiovascular health, risk factors, and how to recognize early warning signs of heart problems.",
              tags: ["heart health", "cardiovascular", "prevention"],
              published_date: "2025-02-10",
            },
            {
              id: 3,
              title: "Mental Health Basics: Understanding Anxiety and Depression",
              summary: "An introduction to common mental health conditions, their symptoms, and treatment options.",
              tags: ["mental health", "anxiety", "depression"],
              published_date: "2025-03-05",
            },
          ].filter((article) => bookmarkIds.includes(article.id))

          setBookmarkedArticles(sampleArticles)
        } else {
          setBookmarkedArticles(validArticles)
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load bookmarked articles.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchBookmarkedArticles()
  }, [API_URL, toast])

  const removeBookmark = (id: number) => {
    try {
      const bookmarks = JSON.parse(localStorage.getItem("bookmarkedArticles") || "[]")
      const updatedBookmarks = bookmarks.filter((bookmarkId: number) => bookmarkId !== id)
      localStorage.setItem("bookmarkedArticles", JSON.stringify(updatedBookmarks))

      setBookmarkedArticles((prev) => prev.filter((article) => article.id !== id))

      toast({
        title: "Bookmark removed",
        description: "Article removed from your bookmarks",
      })
    } catch (error) {
      console.error("Error removing bookmark:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove bookmark",
      })
    }
  }

  return (
    <div className="container py-10">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Button asChild variant="ghost" className="mb-4">
            <Link href="/education" className="flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Education
            </Link>
          </Button>
          <h1 className="text-3xl font-bold mb-2">My Bookmarked Articles</h1>
          <p className="text-muted-foreground">Access your saved health articles for quick reference.</p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-lg">Loading your bookmarks...</p>
          </div>
        ) : bookmarkedArticles.length > 0 ? (
          <div className="grid gap-6">
            {bookmarkedArticles.map((article) => (
              <Card key={article.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">
                      <Link href={`/education/articles/${article.id}`} className="hover:text-primary transition-colors">
                        {article.title}
                      </Link>
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeBookmark(article.id)}
                      title="Remove bookmark"
                    >
                      <BookmarkX className="h-5 w-5 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </div>
                  <CardDescription className="flex items-center text-xs">
                    <Calendar className="h-3 w-3 mr-1" />
                    Published: {new Date(article.published_date).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
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
            <h3 className="text-lg font-medium mb-2">No bookmarked articles</h3>
            <p className="text-muted-foreground mb-6">
              You haven't bookmarked any articles yet. Browse our health articles and save your favorites for easy
              access.
            </p>
            <Button asChild>
              <Link href="/education">Browse Articles</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
