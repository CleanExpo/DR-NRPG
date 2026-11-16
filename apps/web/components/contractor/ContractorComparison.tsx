'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Briefcase, Clock, Award, MapPin, CheckCircle, X, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export interface ContractorComparisonData {
  id: string;
  businessName: string;
  averageRating: number;
  reviewCount: number;
  completedJobs: number;
  averageResponseTimeMinutes: number;
  iicrcCount: number;
  specialties: string[];
  operatingStates: string[];
  isLicensed: boolean;
  matchScore?: number;
}

interface ContractorComparisonProps {
  contractors: ContractorComparisonData[];
  onRemove?: (contractorId: string) => void;
  onClear?: () => void;
  className?: string;
}

export function ContractorComparison({
  contractors,
  onRemove,
  onClear,
  className,
}: ContractorComparisonProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || contractors.length === 0) {
    return null;
  }

  // Find best values for highlighting
  const bestRating = Math.max(...contractors.map((c) => c.averageRating));
  const mostJobs = Math.max(...contractors.map((c) => c.completedJobs));
  const fastestResponse = Math.min(
    ...contractors.map((c) => c.averageResponseTimeMinutes).filter((r) => r > 0)
  );
  const mostCerts = Math.max(...contractors.map((c) => c.iicrcCount));

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Contractor Comparison ({contractors.length})</CardTitle>
          {onClear && (
            <Button variant="outline" size="sm" onClick={onClear}>
              Clear All
            </Button>
          )}
        </div>
        <p className="text-sm text-gray-400 mt-1">
          Compare key metrics side-by-side to make an informed decision
        </p>
      </CardHeader>
      <CardContent>
        {/* Mobile: Stack cards vertically */}
        <div className="md:hidden space-y-6">
          {contractors.map((contractor) => (
            <div key={contractor.id} className="border border-gray-200 rounded-lg p-4">
              {/* Header with Remove Button */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-900 mb-1">
                    {contractor.businessName}
                  </h3>
                  {contractor.isLicensed && (
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Licensed
                    </Badge>
                  )}
                </div>
                {onRemove && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemove(contractor.id)}
                    className="ml-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Stats */}
              <div className="space-y-3">
                <ComparisonRow
                  label="Rating"
                  value={
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{contractor.averageRating.toFixed(1)}</span>
                      <span className="text-xs text-gray-400">
                        ({contractor.reviewCount} reviews)
                      </span>
                    </div>
                  }
                  isBest={contractor.averageRating === bestRating}
                />

                <ComparisonRow
                  label="Completed Jobs"
                  value={
                    <div className="flex items-center gap-1">
                      <Briefcase className="h-4 w-4 text-blue-600" />
                      <span className="font-semibold">{contractor.completedJobs}</span>
                    </div>
                  }
                  isBest={contractor.completedJobs === mostJobs}
                />

                <ComparisonRow
                  label="Response Time"
                  value={
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-purple-600" />
                      <span className="font-semibold">
                        {contractor.averageResponseTimeMinutes > 0
                          ? `${contractor.averageResponseTimeMinutes}m`
                          : 'N/A'}
                      </span>
                    </div>
                  }
                  isBest={
                    contractor.averageResponseTimeMinutes === fastestResponse &&
                    contractor.averageResponseTimeMinutes > 0
                  }
                />

                <ComparisonRow
                  label="Industry Certs"
                  value={
                    <div className="flex items-center gap-1">
                      <Award className="h-4 w-4 text-teal-600" />
                      <span className="font-semibold">{contractor.iicrcCount}</span>
                    </div>
                  }
                  isBest={contractor.iicrcCount === mostCerts}
                />

                <ComparisonRow
                  label="Operating States"
                  value={
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{contractor.operatingStates.join(', ')}</span>
                    </div>
                  }
                />

                {contractor.specialties.length > 0 && (
                  <div>
                    <div className="text-xs text-gray-400 mb-2">Specialties</div>
                    <div className="flex flex-wrap gap-1">
                      {contractor.specialties.slice(0, 3).map((spec) => (
                        <Badge key={spec} variant="outline" className="text-xs">
                          {spec}
                        </Badge>
                      ))}
                      {contractor.specialties.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{contractor.specialties.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* View Profile Button */}
              <Link href={`/contractors/${contractor.id}`} className="mt-4 block">
                <Button variant="outline" className="w-full" size="sm">
                  <ExternalLink className="h-3.5 w-3.5 mr-1" />
                  View Full Profile
                </Button>
              </Link>
            </div>
          ))}
        </div>

        {/* Desktop: Side-by-side table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-4 px-4 font-semibold text-gray-900 w-40">Attribute</th>
                {contractors.map((contractor) => (
                  <th key={contractor.id} className="py-4 px-4 text-center align-top">
                    <div className="mb-2">
                      <div className="font-semibold text-gray-900 mb-1">
                        {contractor.businessName}
                      </div>
                      {contractor.isLicensed && (
                        <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Licensed
                        </Badge>
                      )}
                    </div>
                    {onRemove && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemove(contractor.id)}
                        className="mx-auto"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Rating */}
              <tr className="border-b border-gray-100">
                <td className="py-4 px-4 font-medium text-gray-700">Rating</td>
                {contractors.map((contractor) => (
                  <td
                    key={contractor.id}
                    className={cn(
                      'py-4 px-4 text-center',
                      contractor.averageRating === bestRating && 'bg-green-50'
                    )}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{contractor.averageRating.toFixed(1)}</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {contractor.reviewCount} reviews
                    </div>
                    {contractor.averageRating === bestRating && (
                      <Badge className="bg-green-600 text-white text-xs mt-1">Best</Badge>
                    )}
                  </td>
                ))}
              </tr>

              {/* Completed Jobs */}
              <tr className="border-b border-gray-100">
                <td className="py-4 px-4 font-medium text-gray-700">Completed Jobs</td>
                {contractors.map((contractor) => (
                  <td
                    key={contractor.id}
                    className={cn(
                      'py-4 px-4 text-center',
                      contractor.completedJobs === mostJobs && 'bg-green-50'
                    )}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <Briefcase className="h-4 w-4 text-blue-600" />
                      <span className="font-semibold">{contractor.completedJobs}</span>
                    </div>
                    {contractor.completedJobs === mostJobs && (
                      <Badge className="bg-green-600 text-white text-xs mt-1">Best</Badge>
                    )}
                  </td>
                ))}
              </tr>

              {/* Response Time */}
              <tr className="border-b border-gray-100">
                <td className="py-4 px-4 font-medium text-gray-700">Response Time</td>
                {contractors.map((contractor) => (
                  <td
                    key={contractor.id}
                    className={cn(
                      'py-4 px-4 text-center',
                      contractor.averageResponseTimeMinutes === fastestResponse &&
                        contractor.averageResponseTimeMinutes > 0 &&
                        'bg-green-50'
                    )}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <Clock className="h-4 w-4 text-purple-600" />
                      <span className="font-semibold">
                        {contractor.averageResponseTimeMinutes > 0
                          ? `${contractor.averageResponseTimeMinutes}m`
                          : 'N/A'}
                      </span>
                    </div>
                    {contractor.averageResponseTimeMinutes === fastestResponse &&
                      contractor.averageResponseTimeMinutes > 0 && (
                        <Badge className="bg-green-600 text-white text-xs mt-1">Best</Badge>
                      )}
                  </td>
                ))}
              </tr>

              {/* Industry Certifications */}
              <tr className="border-b border-gray-100">
                <td className="py-4 px-4 font-medium text-gray-700">Industry Certifications</td>
                {contractors.map((contractor) => (
                  <td
                    key={contractor.id}
                    className={cn(
                      'py-4 px-4 text-center',
                      contractor.iicrcCount === mostCerts && 'bg-green-50'
                    )}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <Award className="h-4 w-4 text-teal-600" />
                      <span className="font-semibold">{contractor.iicrcCount}</span>
                    </div>
                    {contractor.iicrcCount === mostCerts && (
                      <Badge className="bg-green-600 text-white text-xs mt-1">Best</Badge>
                    )}
                  </td>
                ))}
              </tr>

              {/* Operating States */}
              <tr className="border-b border-gray-100">
                <td className="py-4 px-4 font-medium text-gray-700">Operating States</td>
                {contractors.map((contractor) => (
                  <td key={contractor.id} className="py-4 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{contractor.operatingStates.join(', ')}</span>
                    </div>
                  </td>
                ))}
              </tr>

              {/* Specialties */}
              <tr className="border-b border-gray-100">
                <td className="py-4 px-4 font-medium text-gray-700">Specialties</td>
                {contractors.map((contractor) => (
                  <td key={contractor.id} className="py-4 px-4">
                    <div className="flex flex-wrap gap-1 justify-center">
                      {contractor.specialties.slice(0, 3).map((spec) => (
                        <Badge key={spec} variant="outline" className="text-xs">
                          {spec}
                        </Badge>
                      ))}
                      {contractor.specialties.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{contractor.specialties.length - 3}
                        </Badge>
                      )}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Match Score (if available) */}
              {contractors.some((c) => c.matchScore !== undefined) && (
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4 font-medium text-gray-700">Match Score</td>
                  {contractors.map((contractor) => (
                    <td key={contractor.id} className="py-4 px-4 text-center">
                      {contractor.matchScore !== undefined && (
                        <div className="font-semibold text-blue-600">
                          {contractor.matchScore}%
                        </div>
                      )}
                    </td>
                  ))}
                </tr>
              )}

              {/* Actions */}
              <tr>
                <td className="py-4 px-4 font-medium text-gray-700">View Profile</td>
                {contractors.map((contractor) => (
                  <td key={contractor.id} className="py-4 px-4 text-center">
                    <Link href={`/contractors/${contractor.id}`}>
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-3.5 w-3.5 mr-1" />
                        View
                      </Button>
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

interface ComparisonRowProps {
  label: string;
  value: React.ReactNode;
  isBest?: boolean;
}

function ComparisonRow({ label, value, isBest }: ComparisonRowProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between py-2 px-3 rounded',
        isBest && 'bg-green-50'
      )}
    >
      <span className="text-sm text-gray-400">{label}</span>
      <div className="flex items-center gap-2">
        {value}
        {isBest && (
          <Badge className="bg-green-600 text-white text-xs">Best</Badge>
        )}
      </div>
    </div>
  );
}
