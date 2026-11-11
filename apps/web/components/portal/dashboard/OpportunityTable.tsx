/**
 * NRPG Growth Portal - Partnership Opportunities Table
 *
 * Magazine-style data table with:
 * - Image thumbnails
 * - Priority badges
 * - Location info
 * - Value estimates
 * - Express Interest CTA
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface Opportunity {
  id: string;
  type: string;
  priority: 'Elite' | 'Strategic' | 'New Market' | 'Standard';
  location: string;
  distance: string;
  potentialValue: string;
  imageUrl?: string;
}

interface OpportunityTableProps {
  opportunities: Opportunity[];
  title?: string;
  viewAllHref?: string;
  className?: string;
}

const priorityColors: Record<string, string> = {
  'Elite': 'text-amber-600',
  'Strategic': 'text-nrpg-teal',
  'New Market': 'text-purple-600',
  'Standard': 'text-portal-muted',
};

export function OpportunityTable({
  opportunities,
  title = 'Partnership Opportunities',
  viewAllHref = '/dashboard/contractor/opportunities',
  className,
}: OpportunityTableProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-portal-text flex items-center gap-2 font-heading">
          <svg className="size-8 text-nrpg-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          {title}
        </h3>
        <Link
          href={viewAllHref}
          className="text-earth-primary text-xs font-bold font-heading uppercase tracking-widest hover:underline"
        >
          View All Opportunities
        </Link>
      </div>

      {/* Table */}
      <div className="bg-portal-card rounded-xl border border-portal-border shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-portal-border/50 border-b border-portal-border">
              <tr>
                <th className="px-6 py-4 text-portal-muted text-xs font-bold font-heading uppercase tracking-wider">
                  Opportunity Type
                </th>
                <th className="px-6 py-4 text-portal-muted text-xs font-bold font-heading uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-4 text-portal-muted text-xs font-bold font-heading uppercase tracking-wider">
                  Potential Growth
                </th>
                <th className="px-6 py-4 text-portal-muted text-xs font-bold font-heading uppercase tracking-wider text-right">
                  Engage
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-portal-border">
              {opportunities.map((opp) => (
                <tr
                  key={opp.id}
                  className="hover:bg-portal-border/30 transition-colors group"
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="size-10 bg-earth-secondary/10 rounded-lg flex items-center justify-center overflow-hidden">
                        {opp.imageUrl ? (
                          <img
                            src={opp.imageUrl}
                            alt={opp.type}
                            className="size-10 object-cover"
                          />
                        ) : (
                          <div className="size-10 bg-earth-secondary/20 rounded-lg" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-portal-text font-heading">
                          {opp.type}
                        </p>
                        <p className={cn('text-xs font-body', priorityColors[opp.priority])}>
                          Priority: {opp.priority}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-sm text-portal-text font-body">{opp.location}</p>
                    <p className="text-xs text-portal-muted font-body">{opp.distance}</p>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-sm font-bold text-portal-text font-heading">
                      {opp.potentialValue}
                    </p>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button className="px-4 py-1.5 bg-nrpg-teal hover:bg-nrpg-teal-dark text-white text-xs font-bold font-heading rounded transition-[background-color,box-shadow] duration-200 [transition-timing-function:cubic-bezier(0.4,0,0.2,1)] shadow-sm hover:shadow-md">
                      Express Interest
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {opportunities.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-portal-muted font-body">No opportunities available at this time.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default OpportunityTable;
