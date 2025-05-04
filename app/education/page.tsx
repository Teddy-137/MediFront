"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { BookOpen, Search, VideoIcon, Clock, Calendar, ArrowRight, X } from "lucide-react"
import { Dialog, DialogContent, DialogClose, DialogTitle } from "@/components/ui/dialog"

// Type definition for Article
type Article = {
  id: number
  title: string
  summary: string
  content: string
  tags?: string[]
  is_published: boolean
  published_date: string
  related_conditions?: { id: number; name: string }[]
}

// Function to extract YouTube video ID from various YouTube URL formats
const extractYouTubeVideoId = (url: string): string | null => {
  if (!url) return null;
  
  // Match patterns like:
  // - https://www.youtube.com/watch?v=VIDEO_ID
  // - https://youtu.be/VIDEO_ID
  // - https://www.youtube.com/embed/VIDEO_ID
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([^&?\/\s]{11})/,
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=))([^"&?\/\s]{11})/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
};

// Function to get YouTube thumbnail URL from video ID
const getYouTubeThumbnailUrl = (videoId: string): string => {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
};

// Add VideoPlayerModal component
type VideoPlayerProps = {
  isOpen: boolean
  onClose: () => void
  videoId: string | null
  videoUrl: string | null
  title: string
}

const VideoPlayerModal = ({ isOpen, onClose, videoId, videoUrl, title }: VideoPlayerProps) => {
  const embedUrl = videoId 
    ? `https://www.youtube.com/embed/${videoId}?autoplay=1` 
    : videoUrl;
  
  if (!isOpen) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden bg-black">
        {/* Add DialogTitle for accessibility, but visually hide it */}
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <div className="relative pt-[56.25%] w-full">
          <iframe
            className="absolute top-0 left-0 w-full h-full"
            src={embedUrl}
            title={title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
        <DialogClose className="absolute top-2 right-2 rounded-full p-2 bg-black/70 text-white hover:bg-black/90">
          <X className="h-4 w-4" />
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};

type VideoContent = {
  id: number
  title: string
  video_url?: string
  youtube_url?: string
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
  
  // Add state for video player modal
  const [videoPlayerOpen, setVideoPlayerOpen] = useState(false)
  const [currentVideo, setCurrentVideo] = useState<{id: string | null, url: string | null, title: string}>({
    id: null,
    url: null,
    title: ""
  })
  
  // Track which videos are currently playing inline
  const [playingVideos, setPlayingVideos] = useState<Record<number, boolean>>({})
  
  // Function to open video player modal
  const openVideoPlayer = (video: VideoContent) => {
    const videoUrl = video.video_url || video.youtube_url;
    const youtubeId = extractYouTubeVideoId(videoUrl || "");
    
    setCurrentVideo({
      id: youtubeId,
      url: youtubeId ? null : videoUrl,
      title: video.title
    });
    
    setVideoPlayerOpen(true);
  };
  
  // Function to toggle inline video playback
  const toggleVideoPlay = (videoId: number) => {
    setPlayingVideos(prev => ({
      ...prev,
      [videoId]: !prev[videoId]
    }))
  }
  
  useEffect(() => {
    const fetchEducationalContent = async () => {
      try {
        console.log("Fetching educational content from API:", API_URL);
        
        // Fetch articles
        const articlesResponse = await fetch(`${API_URL}/content/articles/`);
        console.log("Articles response status:", articlesResponse.status);

        // Fetch videos
        const videosResponse = await fetch(`${API_URL}/content/videos/`);
        console.log("Videos response status:", videosResponse.status);

        if (articlesResponse.ok && videosResponse.ok) {
          const articlesData = await articlesResponse.json();
          const videosData = await videosResponse.json();
          
          console.log("Articles data:", articlesData);
          console.log("Videos data:", videosData);

          // Process articles data
          const processedArticles = articlesData.results || articlesData || [];
          setArticles(processedArticles);
          
          // Process videos data - handle both video_url and youtube_url fields
          const processedVideos = (videosData.results || videosData || []).map((video: any) => {
            // Get the video URL (prefer video_url, fall back to youtube_url)
            const videoUrl = video.video_url || video.youtube_url;
            
            // Extract YouTube video ID if it's a YouTube URL
            const youtubeId = extractYouTubeVideoId(videoUrl);
            
            // Generate thumbnail URL if it's a YouTube video
            const thumbnailUrl = youtubeId 
              ? getYouTubeThumbnailUrl(youtubeId)
              : (video.thumbnail_url || "/placeholder.svg?height=180&width=320");
            
            return {
              ...video,
              // Ensure video_url exists
              video_url: videoUrl || "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
              // Use YouTube thumbnail or fallback
              thumbnail_url: thumbnailUrl
            };
          });
          
          setVideos(processedVideos);
        } else {
          // For demo purposes, create some sample content
          console.log("Using sample data due to API response issues");
          
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
        console.error("Error fetching educational content:", error);
        
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
                {filteredVideos.map((video) => {
                  const videoUrl = video.video_url || video.youtube_url || "";
                  const youtubeId = extractYouTubeVideoId(videoUrl);
                  const isPlaying = playingVideos[video.id] || false;
                  
                  return (
                    <Card key={video.id} className="flex flex-col h-full overflow-hidden">
                      <div className="relative">
                        {isPlaying && youtubeId ? (
                          <div className="relative pt-[56.25%] w-full" aria-label={`Now playing: ${video.title}`}>
                            <iframe
                              className="absolute top-0 left-0 w-full h-full"
                              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
                              title={video.title}
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            ></iframe>
                            <button 
                              className="absolute top-2 right-2 rounded-full p-2 bg-black/70 text-white hover:bg-black/90 z-10"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleVideoPlay(video.id);
                              }}
                              aria-label={`Close ${video.title} video`}
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="relative group">
                            <Image
                              src={video.thumbnail_url || "/placeholder.svg?height=180&width=320"}
                              alt={`Thumbnail for ${video.title}`}
                              width={320}
                              height={180}
                              className="w-full h-[180px] object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            {/* YouTube-style play button overlay */}
                            <button 
                              className="absolute inset-0 flex items-center justify-center bg-transparent border-0 cursor-pointer w-full h-full"
                              onClick={(e) => {
                                e.preventDefault();
                                toggleVideoPlay(video.id);
                              }}
                              aria-label={`Play ${video.title} video`}
                            >
                              <div className="w-12 h-12 rounded-full bg-black/70 flex items-center justify-center group-hover:bg-red-600 transition-colors">
                                <VideoIcon className="h-6 w-6 text-white" />
                              </div>
                            </button>
                            {/* Duration badge - only show if available */}
                            {video.duration_minutes > 0 && (
                              <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-white text-xs rounded">
                                {video.duration_minutes} min
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg line-clamp-2">
                          {video.title}
                        </CardTitle>
                        <CardDescription className="flex items-center text-xs">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(video.published_date).toLocaleDateString()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex-1 pt-0">
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
                        <Button 
                          className="w-full"
                          onClick={(e) => {
                            e.preventDefault();
                            toggleVideoPlay(video.id);
                          }}
                          aria-label={isPlaying ? `Close ${video.title} video` : `Watch ${video.title} video`}
                        >
                          <span className="flex items-center justify-center">
                            {isPlaying ? "Close Video" : "Watch Video"}
                            {isPlaying ? <X className="ml-2 h-4 w-4" /> : <VideoIcon className="ml-2 h-4 w-4" />}
                          </span>
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
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

        {/* Video Player Modal */}
        <VideoPlayerModal
          isOpen={videoPlayerOpen}
          onClose={() => setVideoPlayerOpen(false)}
          videoId={currentVideo.id}
          videoUrl={currentVideo.url}
          title={currentVideo.title}
        />

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
