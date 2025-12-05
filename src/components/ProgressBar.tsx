import { cn } from '@/lib/utils';

interface ProgressBarProps {
  current: number;
  total: number;
  showLabel?: boolean;
  className?: string;
}

export function ProgressBar({ current, total, showLabel = true, className }: ProgressBarProps) {
  const percentage = total > 0 ? Math.min((current / total) * 100, 100) : 0;
  const isComplete = percentage >= 100;

  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="flex justify-between text-sm mb-2">
          <span className="text-muted-foreground">
            {current.toFixed(1)}h / {total.toFixed(1)}h
          </span>
          <span className={cn(
            "font-medium",
            isComplete ? "text-success" : "text-primary"
          )}>
            {percentage.toFixed(0)}%
          </span>
        </div>
      )}
      <div className="progress-bar">
        <div
          className={cn("progress-fill", isComplete && "complete")}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
