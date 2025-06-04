
'use client';

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckSquare, ListChecks } from "react-feather"; // ListChecks may not be available, use CheckSquare or similar

export function ProjectStatusProgress() {
  const [progress, setProgress] = React.useState(13)

  React.useEffect(() => {
    // Mock progress increase
    const timer = setTimeout(() => setProgress(66), 500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow transition-transform duration-300 hover:-translate-y-1">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-foreground font-headline">Overall Project Status</CardTitle>
        <CardDescription>Current quarter's main project milestones.</CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Completed Milestones</p>
            <p className="text-sm font-bold text-primary">{progress}%</p>
        </div>
        <Progress value={progress} aria-label={`${progress}% completed`} className="w-full h-3" />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>Initiation</span>
            <span>Planning</span>
            <span>Execution</span>
            <span>Closure</span>
        </div>
      </CardContent>
    </Card>
  );
}
