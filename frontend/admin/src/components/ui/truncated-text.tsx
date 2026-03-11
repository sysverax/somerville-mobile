import * as React from 'react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface TruncatedTextProps {
  text: string;
  className?: string;
  maxLines?: number;
  children?: React.ReactNode;
}

const TruncatedText = React.forwardRef<HTMLDivElement, TruncatedTextProps>(
  ({ text, className, maxLines = 1, children }, ref) => {
    const [isTruncated, setIsTruncated] = React.useState(false);
    const elementRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
      const checkTruncation = () => {
        if (elementRef.current) {
          const element = elementRef.current;
          // Check if text is truncated by comparing scrollHeight/scrollWidth with clientHeight/clientWidth
          if (maxLines === 1) {
            setIsTruncated(element.scrollWidth > element.clientWidth);
          } else {
            setIsTruncated(element.scrollHeight > element.clientHeight);
          }
        }
      };

      checkTruncation();
      // Re-check on window resize
      window.addEventListener('resize', checkTruncation);
      return () => window.removeEventListener('resize', checkTruncation);
    }, [text, maxLines]);

    const content = children || text;

    const textElement = (
      <div
        ref={elementRef}
        className={cn(
          maxLines === 1 ? 'truncate' : `line-clamp-${maxLines}`,
          className
        )}
        style={maxLines > 1 ? {
          display: '-webkit-box',
          WebkitLineClamp: maxLines,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        } : undefined}
      >
        {content}
      </div>
    );

    if (isTruncated) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            {textElement}
          </TooltipTrigger>
          <TooltipContent>
            <p className="max-w-xs">{text}</p>
          </TooltipContent>
        </Tooltip>
      );
    }

    return textElement;
  }
);

TruncatedText.displayName = 'TruncatedText';

export { TruncatedText };
