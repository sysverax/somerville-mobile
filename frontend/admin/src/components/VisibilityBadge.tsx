import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertTriangle } from 'lucide-react';
import { VisibilityResult } from '@/lib/visibility';

interface VisibilityBadgeProps {
    visibility: VisibilityResult;
    showIcon?: boolean;
}

export function VisibilityBadge({ visibility, showIcon = true }: VisibilityBadgeProps) {
    const isVisible = visibility.status === 'visible';

    if (isVisible) {
        return (
            <Badge
                variant="default"
                className="text-xs"
            >
                Visible
            </Badge>
        );
    }

    // Hidden badge with tooltip showing reasons
    return (
        <TooltipProvider>
            <Tooltip delayDuration={200}>
                <TooltipTrigger asChild>
                    <Badge
                        variant="secondary"
                        className="cursor-help text-xs gap-1 bg-muted text-muted-foreground"
                    >
                        {showIcon && <AlertTriangle className="h-3 w-3" />}
                        Hidden
                    </Badge>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                    <div className="space-y-1">
                        <p className="font-semibold text-xs">Hidden Reasons:</p>
                        <ul className="text-xs list-disc pl-4 space-y-0.5">
                            {visibility.reasons.map((reason, idx) => (
                                <li key={idx}>{reason}</li>
                            ))}
                        </ul>
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

interface HiddenReasonCellProps {
    visibility: VisibilityResult;
}

export function HiddenReasonCell({ visibility }: HiddenReasonCellProps) {
    if (visibility.status === 'visible') {
        return <span className="text-muted-foreground text-xs">—</span>;
    }

    return (
        <div className="text-xs text-destructive">
            {visibility.reasons.join(', ')}
        </div>
    );
}

interface ParentNameCellProps {
    name: string;
    isInactive: boolean;
}

export function ParentNameCell({ name, isInactive }: ParentNameCellProps) {
    if (isInactive) {
        return (
            <TooltipProvider>
                <Tooltip delayDuration={200}>
                    <TooltipTrigger asChild>
                        <span className="text-destructive font-medium flex items-center gap-1 cursor-help">
                            <AlertTriangle className="h-3 w-3" />
                            {name}
                        </span>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                        <p className="text-xs">This parent is inactive</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }

    return <span className="text-muted-foreground">{name}</span>;
}
