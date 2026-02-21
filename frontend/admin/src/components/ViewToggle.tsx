import { LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';

type ViewMode = 'card' | 'table';

interface ViewToggleProps {
  view: ViewMode;
  onChange: (view: ViewMode) => void;
}

const ViewToggle = ({ view, onChange }: ViewToggleProps) => (
  <div className="flex items-center border border-border rounded-lg overflow-hidden">
    <Button
      variant={view === 'card' ? 'default' : 'ghost'}
      size="sm"
      className="rounded-none h-8 px-2.5"
      onClick={() => onChange('card')}
    >
      <LayoutGrid className="h-4 w-4" />
    </Button>
    <Button
      variant={view === 'table' ? 'default' : 'ghost'}
      size="sm"
      className="rounded-none h-8 px-2.5"
      onClick={() => onChange('table')}
    >
      <List className="h-4 w-4" />
    </Button>
  </div>
);

export { ViewToggle };
export type { ViewMode };
