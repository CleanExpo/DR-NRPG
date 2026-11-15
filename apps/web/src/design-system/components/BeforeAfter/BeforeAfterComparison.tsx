/**
 * DesignOS Before/After Comparison Component
 *
 * Expandable cards showing consequences of bad remediation
 * Strategic decisions:
 * - Homepage: Expandable cards (user opts-in to view detail)
 * - Click to expand modal with clinical annotations
 * - Not fear-mongering, educational with professional narration
 */

'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '../Button/Button';
import { ArrowRight, X } from 'lucide-react';

export interface BeforeAfterImage {
  url: string;
  alt: string;
  annotations?: {
    text: string;
    x: number; // Percentage from left
    y: number; // Percentage from top
  }[];
}

export interface BeforeAfterComparisonProps {
  title: string;
  description: string;
  beforeImage: BeforeAfterImage;
  afterImage: BeforeAfterImage;
  explanation: string;
  lesson: string;
  thumbnailUrl?: string;
  className?: string;
}

export function BeforeAfterComparison({
  title,
  description,
  beforeImage,
  afterImage,
  explanation,
  lesson,
  thumbnailUrl,
  className,
}: BeforeAfterComparisonProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {/* Thumbnail Card (Homepage) */}
      <DialogTrigger asChild>
        <div
          className={cn(
            'relative cursor-pointer group overflow-hidden rounded-lg border-2 border-gray-200',
            'hover:border-dr-education transition-[border-color] duration-200 [transition-timing-function:cubic-bezier(0.4,0,0.2,1)]',
            className
          )}
        >
          <img
            src={thumbnailUrl || beforeImage.url}
            alt={title}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end p-4">
            <div className="text-white">
              <p className="font-semibold mb-1">{title}</p>
              <p className="text-sm text-white/90 mb-2">{description}</p>
              <Button
                variant="outline"
                size="sm"
                className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(true);
                }}
              >
                View Comparison
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogTrigger>

      {/* Expanded Modal (Full Comparison) */}
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {/* Side-by-Side Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {/* Before */}
          <div className="space-y-3">
            <h4 className="font-semibold text-lg text-red-700">Before (Improper Remediation)</h4>
            <div className="relative">
              <img
                src={beforeImage.url}
                alt={beforeImage.alt}
                className="w-full rounded-lg border-2 border-red-200"
              />

              {/* Clinical Annotations */}
              {beforeImage.annotations?.map((annotation, idx) => (
                <div
                  key={idx}
                  className="absolute bg-red-600 text-white px-2 py-1 rounded text-xs font-medium"
                  style={{
                    left: `${annotation.x}%`,
                    top: `${annotation.y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  ↓ {annotation.text}
                </div>
              ))}
            </div>
          </div>

          {/* After */}
          <div className="space-y-3">
            <h4 className="font-semibold text-lg text-green-700">After (NRPG-Compliant Remediation)</h4>
            <div className="relative">
              <img
                src={afterImage.url}
                alt={afterImage.alt}
                className="w-full rounded-lg border-2 border-green-200"
              />

              {/* Clinical Annotations */}
              {afterImage.annotations?.map((annotation, idx) => (
                <div
                  key={idx}
                  className="absolute bg-green-600 text-white px-2 py-1 rounded text-xs font-medium"
                  style={{
                    left: `${annotation.x}%`,
                    top: `${annotation.y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  ✓ {annotation.text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Explanation */}
        <div className="mt-6 space-y-4">
          <div className="bg-gray-50 border-l-4 border-gray-400 p-4 rounded">
            <p className="text-sm text-gray-700">{explanation}</p>
          </div>

          {/* Lesson */}
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded">
            <p className="font-semibold text-amber-900 mb-1">Lesson:</p>
            <p className="text-sm text-amber-800">{lesson}</p>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-6 flex justify-center">
          <Button variant="education-primary" size="lg" asChild>
            <a href="/standards/iicrc">Learn About IICRC Standards →</a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Example usage:
 *
 * <BeforeAfterComparison
 *   title="Mold Return After Improper Remediation"
 *   description="Six months after initial 'remediation', mold returned due to improper moisture control"
 *   beforeImage={{
 *     url: '/images/mold-return-before.jpg',
 *     alt: 'Mold growth 6 months after improper remediation',
 *     annotations: [
 *       { text: 'Mold growth 6 months later', x: 30, y: 40 },
 *       { text: 'Moisture: 18% (should be <12%)', x: 60, y: 70 }
 *     ]
 *   }}
 *   afterImage={{
 *     url: '/images/mold-proper-after.jpg',
 *     alt: 'NRPG-compliant remediation with no mold return',
 *     annotations: [
 *       { text: 'No mold return after 12 months', x: 30, y: 40 },
 *       { text: 'Moisture: 8% (optimal)', x: 60, y: 70 }
 *     ]
 *   }}
 *   explanation="This property owner initially hired an unlicensed contractor to save money. Six months later, mold returned due to improper moisture control. NRPG re-remediated following industry standards. Total cost was 3x the original quote."
 *   lesson="Shortcuts cause long-term harm. IICRC-certified contractors may cost more upfront but prevent costly re-work."
 *   thumbnailUrl="/images/mold-thumbnail.jpg"
 * />
 */
