import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useVertical } from '../../hooks/useVertical';
import * as LucideIcons from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

interface VerticalNavProps {
  className?: string;
  showLabels?: boolean;
  compact?: boolean;
}

/**
 * Navigation component for switching between verticals
 * Displays all enabled verticals as navigable options
 */
export default function VerticalNav({ 
  className = '', 
  showLabels = true,
  compact = false 
}: VerticalNavProps) {
  const { currentVertical, verticals, switchVertical } = useVertical();
  const navigate = useNavigate();

  if (verticals.length <= 1) {
    return null; // Don't show if only one vertical is enabled
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div className={`flex items-center gap-2 md:gap-4 overflow-x-auto pb-1 px-2 md:px-0 ${className}`}>
        {verticals.map((vertical) => {
          // Get the icon component from lucide-react
          const IconComponent = (LucideIcons as any)[vertical.icon];
          const isActive = currentVertical === vertical.id;

          return (
            <Tooltip key={vertical.id}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => {
                    switchVertical(vertical.id);
                    navigate(vertical.route);
                  }}
                  className={`
                    flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 rounded-lg
                    transition-all duration-200 whitespace-nowrap flex-shrink-0
                    ${isActive
                      ? 'bg-white shadow-md border-b-2'
                      : 'hover:bg-gray-50'
                    }
                  `}
                  style={isActive ? { borderBottomColor: vertical.color } : {}}
                  aria-label={vertical.name}
                >
                  {IconComponent && (
                    <IconComponent 
                      size={compact ? 16 : 18} 
                      style={isActive ? { color: vertical.color } : {}}
                    />
                  )}
                  {showLabels && !compact && (
                    <span 
                      className={`text-sm font-medium hidden md:inline ${
                        isActive ? 'text-gray-900' : 'text-gray-600'
                      }`}
                    >
                      {vertical.name}
                    </span>
                  )}
                </button>
              </TooltipTrigger>
              {/* Only show tooltip on mobile (where label text is hidden) */}
              <TooltipContent side="bottom" className="bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg z-[100] md:hidden">
                {vertical.name}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
