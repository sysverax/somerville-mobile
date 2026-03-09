import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface EmptyStateProps {
    title: string;
    description?: string;
    compact?: boolean;
    actionLabel?: string;
    onAction?: () => void;
    actionDisabled?: boolean;
}

const EmptyState = ({ title, description, compact = false, actionLabel, onAction, actionDisabled = false }: EmptyStateProps) => {
    return (
        <div className={`text-center ${compact ? 'py-8' : 'py-12'}`}>
            <p className="font-medium text-foreground">{title}</p>
            {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
            {actionLabel && onAction && (
                <Button onClick={onAction} variant="default" className="mt-4 gap-2" disabled={actionDisabled}>
                    <Plus className="h-4 w-4" />
                    {actionLabel}
                </Button>
            )}
        </div>
    );
};

export default EmptyState;
