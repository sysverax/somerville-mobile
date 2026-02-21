import { useRef, useState } from 'react';
import { Upload, X, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
const MAX_SIZE = 2 * 1024 * 1024; // 2MB

interface ImageUploadProps {
  value: string | null;
  onChange: (value: string | null) => void;
  size?: number;
  className?: string;
}

const ImageUpload = ({ value, onChange, size = 120, className }: ImageUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');

  const hasImage = value && value !== '/placeholder.svg';

  const handleFile = (file: File) => {
    setError('');
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Invalid file format. Use PNG, JPG, or WEBP.');
      return;
    }
    if (file.size > MAX_SIZE) {
      setError('File size exceeds 2MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      onChange(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  const handleRemove = () => {
    setError('');
    onChange(null);
  };

  return (
    <div className={cn('space-y-2', className)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        hidden
        onChange={handleChange}
      />
      {hasImage ? (
        <div className="relative inline-block">
          <img
            src={value}
            alt="Preview"
            className="rounded-lg border border-border object-cover bg-muted"
            style={{ width: size, height: size }}
          />
          <div className="absolute -top-2 -right-2 flex gap-1">
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="h-6 w-6 rounded-full shadow-sm"
              onClick={() => inputRef.current?.click()}
              title="Replace"
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="h-6 w-6 rounded-full shadow-sm"
              onClick={handleRemove}
              title="Remove"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/50 text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
          style={{ width: size, height: size }}
        >
          <Upload className="h-6 w-6" />
          <span className="text-xs text-center px-2">Click to upload image</span>
        </button>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
};

export default ImageUpload;
