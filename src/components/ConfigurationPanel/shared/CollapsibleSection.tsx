import { useState } from 'react';
import { ChevronRight } from 'lucide-react';

interface CollapsibleSectionProps {
  title: string;
  count?: number;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function CollapsibleSection({
  title,
  count,
  children,
  defaultOpen = false,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-t pt-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-sm font-medium text-gray-700 hover:text-gray-900"
      >
        <div className="flex items-center gap-2">
          <ChevronRight
            className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-90' : ''}`}
          />
          <span className="uppercase">{title}</span>
          {count !== undefined && (
            <span className="text-gray-500">({count})</span>
          )}
        </div>
      </button>

      {isOpen && <div className="mt-4 pl-6">{children}</div>}
    </div>
  );
}
