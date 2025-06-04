
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle, Loader, Circle, ChevronRight, Activity } from 'react-feather';
import { cn } from '@/lib/utils';

interface Stage {
  name: string;
}

interface WorkProgressTrackerProps {
  stages: Stage[];
  currentStageName: string;
  title?: string;
  description?: string;
}

export function WorkProgressTracker({
  stages,
  currentStageName,
  title = "Project Workflow",
  description = "Current progress through project milestones."
}: WorkProgressTrackerProps) {
  const currentStageIndex = stages.findIndex(stage => stage.name === currentStageName);

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow transition-transform duration-300 hover:-translate-y-1">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground font-headline flex items-center">
          <Activity className="mr-2 h-5 w-5 text-primary" />
          {title}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto pb-2">
          {stages.map((stage, index) => {
            const isCompleted = index < currentStageIndex;
            const isCurrent = index === currentStageIndex;
            const isPending = index > currentStageIndex;

            let IconComponent = Circle;
            let iconColor = "text-muted-foreground";
            let textColor = "text-muted-foreground";
            let animateSpin = false;

            if (isCompleted) {
              IconComponent = CheckCircle;
              iconColor = "text-green-500";
              textColor = "text-foreground";
            } else if (isCurrent) {
              IconComponent = Loader; // Using Loader for current stage
              iconColor = "text-primary";
              textColor = "text-primary font-semibold";
              animateSpin = true;
            }
            // For pending, default Circle and muted color is fine

            return (
              <React.Fragment key={stage.name}>
                <div className={cn("flex flex-col items-center text-center min-w-[80px] sm:min-w-[100px] p-1", textColor)}>
                  <div className={cn(
                    "flex items-center justify-center h-8 w-8 mb-1 rounded-full",
                    isCurrent ? "bg-primary/10" : isCompleted ? "bg-green-500/10" : "bg-muted/50"
                  )}>
                    <IconComponent className={cn("h-5 w-5", iconColor, animateSpin && "animate-spin")} />
                  </div>
                  <span className="text-xs leading-tight">{stage.name}</span>
                </div>
                {index < stages.length - 1 && (
                  <ChevronRight className="h-5 w-5 text-border self-center shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
