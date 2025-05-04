"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Share2,
  Bookmark,
  BookmarkCheck,
  Facebook,
  Twitter,
  Linkedin,
  Copy,
  Tag,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

type Article = {
  id: number
  title: string
  summary: string
  content: string
  tags: string[]
  is_published: boolean
  published_date: string
  author?: string
  author_title?: string
  related_conditions?: { id: number; name: string }[]
  image_url?: string
}

export default function ArticlePage() {
  const [article, setArticle] = useState<Article | null>(null)
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const articleId = params.id
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://medihelp-backend.onrender.com/api"

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await fetch(`${API_URL}/content/articles/${articleId}/`)

        if (response.ok) {
          const data = await response.json()
          setArticle(data)

          // Fetch related articles
          const relatedResponse = await fetch(`${API_URL}/content/articles/?page=1&page_size=3`)
          if (relatedResponse.ok) {
            const relatedData = await relatedResponse.json()
            setRelatedArticles(
              (relatedData.results || [])
                .filter((a: Article) => a.id !== Number.parseInt(articleId as string))
                .slice(0, 3),
            )
          }
        } else {
          // For demo purposes, create a sample article
          const sampleArticle: Article = {
            id: Number.parseInt(articleId as string),
            title: "Understanding Diabetes: Symptoms, Causes, and Management",
            summary: "A comprehensive guide to diabetes, its types, symptoms, and how to manage it effectively.",
            content: `
              <h2>What is Diabetes?</h2>
              <p>Diabetes is a chronic health condition that affects how your body turns food into energy. Most of the food you eat is broken down into sugar (glucose) and released into your bloodstream. When your blood sugar goes up, it signals your pancreas to release insulin. Insulin acts like a key to let the blood sugar into your body's cells for use as energy.</p>
              
              <p>If you have diabetes, your body either doesn't make enough insulin or can't use the insulin it makes as well as it should. When there isn't enough insulin or cells stop responding to insulin, too much blood sugar stays in your bloodstream. Over time, that can cause serious health problems, such as heart disease, vision loss, and kidney disease.</p>
              
              <h2>Types of Diabetes</h2>
              <p>There are three main types of diabetes: type 1, type 2, and gestational diabetes.</p>
              
              <h3>Type 1 Diabetes</h3>
              <p>Type 1 diabetes is thought to be caused by an autoimmune reaction (the body attacks itself by mistake) that stops your body from making insulin. Approximately 5-10% of the people who have diabetes have type 1. Symptoms of type 1 diabetes often develop quickly. It's usually diagnosed in children, teens, and young adults. If you have type 1 diabetes, you'll need to take insulin every day to survive. Currently, no one knows how to prevent type 1 diabetes.</p>
              
              <h3>Type 2 Diabetes</h3>
              <p>With type 2 diabetes, your body doesn't use insulin well and can't keep blood sugar at normal levels. About 90-95% of people with diabetes have type 2. It develops over many years and is usually diagnosed in adults (but more and more in children, teens, and young adults). You may not notice any symptoms, so it's important to get your blood sugar tested if you're at risk. Type 2 diabetes can be prevented or delayed with healthy lifestyle changes, such as losing weight, eating healthy food, and being active.</p>
              
              <h3>Gestational Diabetes</h3>
              <p>Gestational diabetes develops in pregnant women who have never had diabetes. If you have gestational diabetes, your baby could be at higher risk for health problems. Gestational diabetes usually goes away after your baby is born but increases your risk for type 2 diabetes later in life. Your baby is more likely to have obesity as a child or teen, and more likely to develop type 2 diabetes later in life too.</p>
              
              <h2>Symptoms of Diabetes</h2>
              <p>The symptoms of diabetes can vary depending on how much your blood sugar is elevated. Some people, especially those with prediabetes or type 2 diabetes, may not experience symptoms initially. In type 1 diabetes, symptoms tend to come on quickly and be more severe.</p>
              
              <p>Some of the signs and symptoms of type 1 and type 2 diabetes are:</p>
              <ul>
                <li>Increased thirst</li>
                <li>Frequent urination</li>
                <li>Extreme hunger</li>
                <li>Unexplained weight loss</li>
                <li>Presence of ketones in the urine (ketones are a byproduct of the breakdown of muscle and fat that happens when there's not enough available insulin)</li>
                <li>Fatigue</li>
                <li>Irritability</li>
                <li>Blurred vision</li>
                <li>Slow-healing sores</li>
                <li>Frequent infections, such as gums or skin infections and vaginal infections</li>
              </ul>
              
              <h2>Managing Diabetes</h2>
              <p>Managing diabetes requires daily care. Taking proper care of yourself can help you feel better and reduce your risk of developing complications, including:</p>
              
              <h3>Healthy Eating</h3>
              <p>There's no specific diabetes diet. However, it's important to center your diet around:</p>
              <ul>
                <li>A regular schedule for meals and snacks</li>
                <li>Smaller portion sizes</li>
                <li>More high-fiber foods, such as fruits, vegetables and whole grains</li>
                <li>Fewer refined carbohydrates, especially sweets</li>
                <li>Fewer animal products and more plant-based proteins</li>
                <li>Less salt and fat, especially trans fat and saturated fat</li>
              </ul>
              
              <h3>Physical Activity</h3>
              <p>Everyone needs regular aerobic exercise, and people who have diabetes are no exception. Exercise lowers your blood sugar level by moving sugar into your cells, where it's used for energy. Exercise also increases your sensitivity to insulin, which means your body needs less insulin to transport sugar to your cells.</p>
              
              <h3>Monitoring Blood Sugar</h3>
              <p>Depending on your treatment plan, you may need to check and record your blood sugar level every now and then or, if you're on insulin, multiple times a day. Careful monitoring is the only way to make sure that your blood sugar level remains within your target range.</p>
              
              <h3>Medication</h3>
              <p>Some people who have type 2 diabetes can manage their blood sugar with diet and exercise alone, but many need diabetes medications or insulin therapy. The decision about which medications are best depends on many factors, including your blood sugar level and any other health problems you have.</p>
              
              <h2>Conclusion</h2>
              <p>Diabetes is a serious condition that requires daily management. However, with proper care and lifestyle adjustments, people with diabetes can lead long, healthy lives. Regular check-ups with healthcare providers, monitoring blood sugar levels, taking prescribed medications, maintaining a healthy diet, and staying physically active are all important aspects of diabetes management.</p>
              
              <p>If you suspect you might have diabetes or are at risk for developing it, consult with a healthcare professional for proper diagnosis and treatment.</p>
            `,
            tags: ["diabetes", "chronic conditions", "health management", "insulin", "blood sugar"],
            is_published: true,
            published_date: "2025-01-15",
            author: "Dr. Maria Rodriguez",
            author_title: "Endocrinologist",
            related_conditions: [{ id: 1, name: "Diabetes" }],
            image_url: "/placeholder.svg?height=400&width=800",
          }

          setArticle(sampleArticle)

          // Sample related articles
          const sampleRelatedArticles: Article[] = [
            {
              id: 101,
              title: "Nutrition Guidelines for Diabetic Patients",
              summary: "Learn about the best dietary practices for managing diabetes effectively.",
              content: "...",
              tags: ["diabetes", "nutrition", "diet"],
              is_published: true,
              published_date: "2025-02-10",
            },
            {
              id: 102,
              title: "Exercise and Diabetes: Finding the Right Balance",
              summary: "How physical activity affects blood sugar and tips for safe exercising with diabetes.",
              content: "...",
              tags: ["diabetes", "exercise", "physical activity"],
              is_published: true,
              published_date: "2025-03-05",
            },
            {
              id: 103,
              title: "Understanding Insulin Resistance",
              summary: "What causes insulin resistance and how it relates to type 2 diabetes.",
              content: "...",
              tags: ["insulin resistance", "type 2 diabetes", "metabolic health"],
              is_published: true,
              published_date: "2025-01-25",
            },
          ]

          setRelatedArticles(sampleRelatedArticles)
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load article. Please try again.",
        })

        // For demo purposes, create a sample article
        const sampleArticle: Article = {
          id: Number.parseInt(articleId as string),
          title: "Understanding Diabetes: Symptoms, Causes, and Management",
          summary: "A comprehensive guide to diabetes, its types, symptoms, and how to manage it effectively.",
          content: `
            <h2>What is Diabetes?</h2>
            <p>Diabetes is a chronic health condition that affects how your body turns food into energy. Most of the food you eat is broken down into sugar (glucose) and released into your bloodstream. When your blood sugar goes up, it signals your pancreas to release insulin. Insulin acts like a key to let the blood sugar into your body's cells for use as energy.</p>
            
            <p>If you have diabetes, your body either doesn't make enough insulin or can't use the insulin it makes as well as it should. When there isn't enough insulin or cells stop responding to insulin, too much blood sugar stays in your bloodstream. Over time, that can cause serious health problems, such as heart disease, vision loss, and kidney disease.</p>
            
            <h2>Types of Diabetes</h2>
            <p>There are three main types of diabetes: type 1, type 2, and gestational diabetes.</p>
            
            <h3>Type 1 Diabetes</h3>
            <p>Type 1 diabetes is thought to be caused by an autoimmune reaction (the body attacks itself by mistake) that stops your body from making insulin. Approximately 5-10% of the people who have diabetes have type 1. Symptoms of type 1 diabetes often develop quickly. It's usually diagnosed in children, teens, and young adults. If you have type 1 diabetes, you'll need to take insulin every day to survive. Currently, no one knows how to prevent type 1 diabetes.</p>
            
            <h3>Type 2 Diabetes</h3>
            <p>With type 2 diabetes, your body doesn't use insulin well and can't keep blood sugar at normal levels. About 90-95% of people with diabetes have type 2. It develops over many years and is usually diagnosed in adults (but more and more in children, teens, and young adults). You may not notice any symptoms, so it's important to get your blood sugar tested if you're at risk. Type 2 diabetes can be prevented or delayed with healthy lifestyle changes, such as losing weight, eating healthy food, and being active.</p>
            
            <h3>Gestational Diabetes</h3>
            <p>Gestational diabetes develops in pregnant women who have never had diabetes. If you have gestational diabetes, your baby could be at higher risk for health problems. Gestational diabetes usually goes away after your baby is born but increases your risk for type 2 diabetes later in life. Your baby is more likely to have obesity as a child or teen, and more likely to develop type 2 diabetes later in life too.</p>
            
            <h2>Symptoms of Diabetes</h2>
            <p>The symptoms of diabetes can vary depending on how much your blood sugar is elevated. Some people, especially those with prediabetes or type 2 diabetes, may not experience symptoms initially. In type 1 diabetes, symptoms tend to come on quickly and be more severe.</p>
            
            <p>Some of the signs and symptoms of type 1 and type 2 diabetes are:</p>
            <ul>
              <li>Increased thirst</li>
              <li>Frequent urination</li>
              <li>Extreme hunger</li>
              <li>Unexplained weight loss</li>
              <li>Presence of ketones in the urine (ketones are a byproduct of the breakdown of muscle and fat that happens when there's not enough available insulin)</li>
              <li>Fatigue</li>
              <li>Irritability</li>
              <li>Blurred vision</li>
              <li>Slow-healing sores</li>
              <li>Frequent infections, such as gums or skin infections and vaginal infections</li>
            </ul>
            
            <h2>Managing Diabetes</h2>
            <p>Managing diabetes requires daily care. Taking proper care of yourself can help you feel better and reduce your risk of developing complications, including:</p>
            
            <h3>Healthy Eating</h3>
            <p>There's no specific diabetes diet. However, it's important to center your diet around:</p>
            <ul>
              <li>A regular schedule for meals and snacks</li>
              <li>Smaller portion sizes</li>
              <li>More high-fiber foods, such as fruits, vegetables and whole grains</li>
              <li>Fewer refined carbohydrates, especially sweets</li>
              <li>Fewer animal products and more plant-based proteins</li>
              <li>Less salt and fat, especially trans fat and saturated fat</li>
            </ul>
            
            <h3>Physical Activity</h3>
            <p>Everyone needs regular aerobic exercise, and people who have diabetes are no exception. Exercise lowers your blood sugar level by moving sugar into your cells, where it's used for energy. Exercise also increases your sensitivity to insulin, which means your body needs less insulin to transport sugar to your cells.</p>
            
            <h3>Monitoring Blood Sugar</h3>
            <p>Depending on your treatment plan, you may need to check and record your blood sugar level every now and then or, if you're on insulin, multiple times a day. Careful monitoring is the only way to make sure that your blood sugar level remains within your target range.</p>
            
            <h3>Medication</h3>
            <p>Some people who have type 2 diabetes can manage their blood sugar with diet and exercise alone, but many need diabetes medications or insulin therapy. The decision about which medications are best depends on many factors, including your blood sugar level and any other health problems you have.</p>
            
            <h2>Conclusion</h2>
            <p>Diabetes is a serious condition that requires daily management. However, with proper care and lifestyle adjustments, people with diabetes can lead long, healthy lives. Regular check-ups with healthcare providers, monitoring blood sugar levels, taking prescribed medications, maintaining a healthy diet, and staying physically active are all important aspects of diabetes management.</p>
            
            <p>If you suspect you might have diabetes or are at risk for developing it, consult with a healthcare professional for proper diagnosis and treatment.</p>
          `,
          tags: ["diabetes", "chronic conditions", "health management", "insulin", "blood sugar"],
          is_published: true,
          published_date: "2025-01-15",
          author: "Dr. Maria Rodriguez",
          author_title: "Endocrinologist",
          related_conditions: [{ id: 1, name: "Diabetes" }],
          image_url: "/placeholder.svg?height=400&width=800",
        }

        setArticle(sampleArticle)

        // Sample related articles
        const sampleRelatedArticles: Article[] = [
          {
            id: 101,
            title: "Nutrition Guidelines for Diabetic Patients",
            summary: "Learn about the best dietary practices for managing diabetes effectively.",
            content: "...",
            tags: ["diabetes", "nutrition", "diet"],
            is_published: true,
            published_date: "2025-02-10",
          },
          {
            id: 102,
            title: "Exercise and Diabetes: Finding the Right Balance",
            summary: "How physical activity affects blood sugar and tips for safe exercising with diabetes.",
            content: "...",
            tags: ["diabetes", "exercise", "physical activity"],
            is_published: true,
            published_date: "2025-03-05",
          },
          {
            id: 103,
            title: "Understanding Insulin Resistance",
            summary: "What causes insulin resistance and how it relates to type 2 diabetes.",
            content: "...",
            tags: ["insulin resistance", "type 2 diabetes", "metabolic health"],
            is_published: true,
            published_date: "2025-01-25",
          },
        ]

        setRelatedArticles(sampleRelatedArticles)
      } finally {
        setIsLoading(false)
      }
    }

    // Check if article is bookmarked
    const checkBookmarkStatus = () => {
      try {
        if (typeof window !== "undefined") {
          const bookmarks = JSON.parse(localStorage.getItem("bookmarkedArticles") || "[]")
          setIsBookmarked(bookmarks.includes(Number.parseInt(articleId as string)))
        }
      } catch (error) {
        console.error("Error checking bookmark status:", error)
      }
    }

    fetchArticle()
    checkBookmarkStatus()
  }, [articleId, API_URL, toast])

  const handleBookmark = () => {
    try {
      const bookmarks = JSON.parse(localStorage.getItem("bookmarkedArticles") || "[]")
      const articleIdNum = Number.parseInt(articleId as string)

      if (isBookmarked) {
        // Remove from bookmarks
        const updatedBookmarks = bookmarks.filter((id: number) => id !== articleIdNum)
        localStorage.setItem("bookmarkedArticles", JSON.stringify(updatedBookmarks))
        setIsBookmarked(false)
        toast({
          title: "Bookmark removed",
          description: "Article removed from your bookmarks",
        })
      } else {
        // Add to bookmarks
        const updatedBookmarks = [...bookmarks, articleIdNum]
        localStorage.setItem("bookmarkedArticles", JSON.stringify(updatedBookmarks))
        setIsBookmarked(true)
        toast({
          title: "Bookmarked",
          description: "Article saved to your bookmarks",
        })
      }
    } catch (error) {
      console.error("Error handling bookmark:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update bookmark status",
      })
    }
  }

  const handleCopyLink = () => {
    try {
      navigator.clipboard.writeText(window.location.href)
      setLinkCopied(true)
      toast({
        title: "Link copied",
        description: "Article link copied to clipboard",
      })

      setTimeout(() => {
        setLinkCopied(false)
      }, 2000)
    } catch (error) {
      console.error("Error copying link:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to copy link",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="container py-10">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Articles
            </Button>
            <Skeleton className="h-10 w-3/4 mb-2" />
            <Skeleton className="h-6 w-1/2 mb-4" />
            <div className="flex items-center gap-2 mb-6">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-5 w-32" />
            </div>
          </div>
          <Skeleton className="h-64 w-full mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-5/6" />
          </div>
        </div>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="container py-10">
        <div className="max-w-4xl mx-auto text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Article Not Found</h1>
          <p className="mb-6">The article you're looking for could not be found.</p>
          <Button asChild>
            <Link href="/education">Back to Articles</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button asChild variant="ghost" className="mb-4">
            <Link href="/education" className="flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Articles
            </Link>
          </Button>
          <h1 className="text-3xl font-bold mb-2">{article.title}</h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground mb-4">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              <time dateTime={article.published_date}>
                {new Date(article.published_date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            </div>
            {article.author && (
              <div>
                By {article.author}
                {article.author_title && <span className="text-xs ml-1">({article.author_title})</span>}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div className="flex flex-wrap gap-2">
            {article.tags?.map((tag, index) => (
              <Link
                key={index}
                href={`/education?q=${encodeURIComponent(tag)}`}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                <Tag className="h-3 w-3 mr-1" />
                {tag}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBookmark}
              title={isBookmarked ? "Remove bookmark" : "Bookmark this article"}
            >
              {isBookmarked ? <BookmarkCheck className="h-5 w-5 text-primary" /> : <Bookmark className="h-5 w-5" />}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" title="Share article">
                  <Share2 className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center"
                  >
                    <Facebook className="mr-2 h-4 w-4" />
                    <span>Facebook</span>
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a
                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
                      window.location.href,
                    )}&text=${encodeURIComponent(article.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center"
                  >
                    <Twitter className="mr-2 h-4 w-4" />
                    <span>Twitter</span>
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a
                    href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(
                      window.location.href,
                    )}&title=${encodeURIComponent(article.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center"
                  >
                    <Linkedin className="mr-2 h-4 w-4" />
                    <span>LinkedIn</span>
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCopyLink} className="flex items-center">
                  <Copy className="mr-2 h-4 w-4" />
                  <span>{linkCopied ? "Copied!" : "Copy link"}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {article.image_url && (
          <div className="mb-8 rounded-lg overflow-hidden">
            <img
              src={article.image_url || "/placeholder.svg"}
              alt={article.title}
              className="w-full h-auto object-cover max-h-[400px]"
            />
          </div>
        )}

        {/* Fix: Use className instead of dangerouslySetInnerHTML for article content */}
        <div className="article-content mb-10">
          {article.content.split("\n").map((paragraph, index) => {
            // Simple parsing of HTML-like content
            if (paragraph.trim().startsWith("<h2>")) {
              const text = paragraph.replace(/<\/?h2>/g, "").trim()
              return <h2 key={index}>{text}</h2>
            } else if (paragraph.trim().startsWith("<h3>")) {
              const text = paragraph.replace(/<\/?h3>/g, "").trim()
              return <h3 key={index}>{text}</h3>
            } else if (paragraph.trim().startsWith("<p>")) {
              const text = paragraph.replace(/<\/?p>/g, "").trim()
              return <p key={index}>{text}</p>
            } else if (paragraph.trim().startsWith("<ul>")) {
              // Skip the ul tag itself
              return null
            } else if (paragraph.trim().startsWith("</ul>")) {
              // Skip the closing ul tag
              return null
            } else if (paragraph.trim().startsWith("<li>")) {
              const text = paragraph.replace(/<\/?li>/g, "").trim()
              return <li key={index}>{text}</li>
            } else if (paragraph.trim()) {
              return <p key={index}>{paragraph.trim()}</p>
            }
            return null
          })}
        </div>

        <Separator className="my-10" />

        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {relatedArticles.map((relatedArticle) => (
              <Card key={relatedArticle.id} className="flex flex-col h-full">
                <CardContent className="flex flex-col flex-1 p-6">
                  <Link
                    href={`/education/articles/${relatedArticle.id}`}
                    className="text-lg font-medium hover:text-primary transition-colors mb-2"
                  >
                    {relatedArticle.title}
                  </Link>
                  <p className="text-muted-foreground text-sm flex-1">{relatedArticle.summary}</p>
                  <div className="flex items-center text-xs text-muted-foreground mt-4">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date(relatedArticle.published_date).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="bg-muted p-6 rounded-lg">
          <h3 className="text-xl font-bold mb-2">Have a specific health question?</h3>
          <p className="text-muted-foreground mb-4">
            Our health assistant can provide information on various health topics and conditions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild className="flex-1">
              <Link href="/chat">Chat with Health Assistant</Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link href="/symptom-checker">Check Your Symptoms</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
