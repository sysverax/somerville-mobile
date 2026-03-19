import { Badge } from '@/components/ui/badge';
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

    // Hidden badge without tooltip
    return (
        <Badge
            variant="secondary"
            className="text-xs gap-1 bg-muted text-muted-foreground"
        >
            {showIcon && <AlertTriangle className="h-3 w-3 shrink-0" />}
            Hidden
        </Badge>
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
            <span className="text-destructive font-medium flex items-center gap-1 min-w-0">
                <AlertTriangle className="h-3 w-3 shrink-0" />
                <span className="truncate">{name}</span>
            </span>
        );
    }

    return <span className="text-muted-foreground truncate block">{name}</span>;
}
