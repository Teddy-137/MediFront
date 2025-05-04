"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bell, Calendar, CheckCircle, Clock, MessageSquare, X } from "lucide-react"
import { format } from "date-fns"

type Notification = {
  id: number
  type: "appointment" | "message" | "reminder" | "system"
  title: string
  message: string
  date: string
  read: boolean
}

export default function NotificationsPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(true)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    // Mock notifications data
    const mockNotifications: Notification[] = [
      {
        id: 1,
        type: "appointment",
        title: "Appointment Reminder",
        message: "You have an appointment with Dr. Smith tomorrow at 10:00 AM.",
        date: new Date(Date.now() + 86400000).toISOString(),
        read: false,
      },
      {
        id: 2,
        type: "message",
        title: "New Message",
        message: "Dr. Johnson has responded to your query about medication.",
        date: new Date(Date.now() - 3600000).toISOString(),
        read: false,
      },
      {
        id: 3,
        type: "reminder",
        title: "Medication Reminder",
        message: "Remember to take your medication at 8:00 PM today.",
        date: new Date(Date.now() + 21600000).toISOString(),
        read: false,
      },
      {
        id: 4,
        type: "system",
        title: "System Update",
        message: "We've updated our privacy policy. Please review the changes.",
        date: new Date(Date.now() - 86400000).toISOString(),
        read: true,
      },
      {
        id: 5,
        type: "appointment",
        title: "Appointment Confirmed",
        message: "Your appointment with Dr. Williams has been confirmed for Friday at 2:00 PM.",
        date: new Date(Date.now() - 43200000).toISOString(),
        read: true,
      },
    ]

    setTimeout(() => {
      setNotifications(mockNotifications)
      setIsLoadingNotifications(false)
    }, 1000)
  }, [])

  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
  }

  const deleteNotification = (id: number) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id))
  }

  const getUnreadCount = () => {
    return notifications.filter((n) => !n.read).length
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "appointment":
        return <Calendar className="h-5 w-5 text-blue-500" />
      case "message":
        return <MessageSquare className="h-5 w-5 text-green-500" />
      case "reminder":
        return <Clock className="h-5 w-5 text-yellow-500" />
      case "system":
        return <Bell className="h-5 w-5 text-purple-500" />
      default:
        return <Bell className="h-5 w-5 text-gray-500" />
    }
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Notifications</h1>
        {getUnreadCount() > 0 && (
          <Button variant="outline" onClick={markAllAsRead}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Mark all as read
          </Button>
        )}
      </div>

      <Tabs defaultValue="all">
        <TabsList className="mb-6">
          <TabsTrigger value="all">
            All
            {notifications.length > 0 && (
              <span className="ml-2 bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs">
                {notifications.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="unread">
            Unread
            {getUnreadCount() > 0 && (
              <span className="ml-2 bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                {getUnreadCount()}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {isLoadingNotifications ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4">Loading notifications...</p>
            </div>
          ) : notifications.length > 0 ? (
            notifications.map((notification) => (
              <Card key={notification.id} className={notification.read ? "opacity-70" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="bg-muted p-2 rounded-full">{getNotificationIcon(notification.type)}</div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{notification.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(notification.date), "MMM d, h:mm a")}
                          </span>
                          <div className="flex gap-1">
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => markAsRead(notification.id)}
                              >
                                <CheckCircle className="h-4 w-4" />
                                <span className="sr-only">Mark as read</span>
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => deleteNotification(notification.id)}
                            >
                              <X className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                      {!notification.read && (
                        <div className="mt-2">
                          <span className="inline-block bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                            New
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No Notifications</CardTitle>
                <CardDescription>You don't have any notifications at the moment.</CardDescription>
              </CardHeader>
              <CardContent className="text-center py-6">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  We'll notify you when there are new messages, appointment reminders, or updates.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="unread" className="space-y-4">
          {isLoadingNotifications ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4">Loading notifications...</p>
            </div>
          ) : notifications.filter((n) => !n.read).length > 0 ? (
            notifications
              .filter((n) => !n.read)
              .map((notification) => (
                <Card key={notification.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="bg-muted p-2 rounded-full">{getNotificationIcon(notification.type)}</div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{notification.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(notification.date), "MMM d, h:mm a")}
                            </span>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => markAsRead(notification.id)}
                              >
                                <CheckCircle className="h-4 w-4" />
                                <span className="sr-only">Mark as read</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => deleteNotification(notification.id)}
                              >
                                <X className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                        <div className="mt-2">
                          <span className="inline-block bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                            New
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No Unread Notifications</CardTitle>
                <CardDescription>You've read all your notifications.</CardDescription>
              </CardHeader>
              <CardContent className="text-center py-6">
                <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">All caught up! Check back later for new notifications.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="appointments" className="space-y-4">
          {isLoadingNotifications ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4">Loading notifications...</p>
            </div>
          ) : notifications.filter((n) => n.type === "appointment").length > 0 ? (
            notifications
              .filter((n) => n.type === "appointment")
              .map((notification) => (
                <Card key={notification.id} className={notification.read ? "opacity-70" : ""}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="bg-muted p-2 rounded-full">
                        <Calendar className="h-5 w-5 text-blue-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{notification.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(notification.date), "MMM d, h:mm a")}
                            </span>
                            <div className="flex gap-1">
                              {!notification.read && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => markAsRead(notification.id)}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                  <span className="sr-only">Mark as read</span>
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => deleteNotification(notification.id)}
                              >
                                <X className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                        {!notification.read && (
                          <div className="mt-2">
                            <span className="inline-block bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                              New
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No Appointment Notifications</CardTitle>
                <CardDescription>You don't have any appointment notifications.</CardDescription>
              </CardHeader>
              <CardContent className="text-center py-6">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Book an appointment to receive reminders and updates.</p>
                <Button className="mt-4" asChild>
                  <a href="/appointments">Book Appointment</a>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="messages" className="space-y-4">
          {isLoadingNotifications ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4">Loading notifications...</p>
            </div>
          ) : notifications.filter((n) => n.type === "message").length > 0 ? (
            notifications
              .filter((n) => n.type === "message")
              .map((notification) => (
                <Card key={notification.id} className={notification.read ? "opacity-70" : ""}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="bg-muted p-2 rounded-full">
                        <MessageSquare className="h-5 w-5 text-green-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{notification.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(notification.date), "MMM d, h:mm a")}
                            </span>
                            <div className="flex gap-1">
                              {!notification.read && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => markAsRead(notification.id)}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                  <span className="sr-only">Mark as read</span>
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => deleteNotification(notification.id)}
                              >
                                <X className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                        {!notification.read && (
                          <div className="mt-2">
                            <span className="inline-block bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                              New
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No Message Notifications</CardTitle>
                <CardDescription>You don't have any message notifications.</CardDescription>
              </CardHeader>
              <CardContent className="text-center py-6">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Start a chat with a healthcare professional to receive message notifications.
                </p>
                <Button className="mt-4" asChild>
                  <a href="/chat">Start Chat</a>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
