// src/components/common/VerticalHeader.tsx
// Header component specific to current vertical

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useVertical } from '../../hooks/useVertical';
import VerticalNav from './VerticalNav';

interface VerticalHeaderProps {
  showNav?: boolean;
  sticky?: boolean;
  className?: string;
}

import { SHOW_VERTICAL_NAV } from '../../config/appConfig';

/**
 * Header that displays current vertical navigation if enabled
 */
export default function VerticalHeader({
  showNav = true,
  sticky = true,
  className = ''
}: VerticalHeaderProps) {
  const { currentConfig } = useVertical();
  const navigate = useNavigate();

  if (!currentConfig || !SHOW_VERTICAL_NAV) {
    return null;
  }

  return (
    <div 
      className={`
        bg-white border-b border-gray-100 px-4 pt-2 pb-1
        ${sticky ? 'sticky top-0 z-30' : ''}
        ${className}
      `}
    >
      <div className="max-w-7xl mx-auto">
        {showNav && <VerticalNav />}
      </div>
    </div>
  );
}
