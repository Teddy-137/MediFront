import { Activity } from "lucide-react"

export default function Loading() {
  return (
    <div className="container py-10">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Symptom Checker</h1>
          <p className="text-muted-foreground">Loading symptom checker...</p>
        </div>
        
        <div className="flex flex-col items-center justify-center min-h-[300px] border rounded-lg p-8 bg-card">
          <Activity className="h-12 w-12 text-primary animate-pulse mb-4" />
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-lg font-medium">Loading symptom data...</p>
          <p className="text-muted-foreground mt-2">Please wait while we prepare the symptom checker.</p>
        </div>
      </div>
    </div>
  )
}
