'use client';

import * as React from 'react';
import { Icon, IconProps } from '../../lib/Icon';

/**
 * Qualified contractor badge icon
 * Represents professional credentials
 */
export const IICRCBadge = React.forwardRef<SVGSVGElement, IconProps>(
  (props, ref) => {
    return (
      <Icon
        ref={ref}
        aria-label="Qualified Contractor"
        {...props}
      >
        {/* Qualified contractor badge - shield */}
        <path d="M12 2L18 5v5c0 4.5-6 8.5-6 8.5s-6-4-6-8.5V5l6-3z" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10 12.5l2 2 3-3.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </Icon>
    );
  },
);

IICRCBadge.displayName = 'IICRCBadge';
