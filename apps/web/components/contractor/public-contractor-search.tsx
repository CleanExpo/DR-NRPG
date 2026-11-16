'use client';

import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import Link from 'next/link';
import {
  MapPin,
  Star,
  Briefcase,
  Shield,
  Award,
  Loader2,
  Search,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  GitCompare,
  X,
} from 'lucide-react';
import { ContractorComparison } from './ContractorComparison';
import type { ContractorComparisonData } from './ContractorComparison';

// Australian states for postcode validation
const AUSTRALIAN_STATES: Record<string, { name: string; postcodeRange: [number, number] }> = {
  NSW: { name: 'New South Wales', postcodeRange: [1000, 2999] },
  VIC: { name: 'Victoria', postcodeRange: [3000, 3999] },
  QLD: { name: 'Queensland', postcodeRange: [4000, 4999] },
  WA: { name: 'Western Australia', postcodeRange: [6000, 6999] },
  SA: { name: 'South Australia', postcodeRange: [5000, 5999] },
  TAS: { name: 'Tasmania', postcodeRange: [7000, 7999] },
  ACT: { name: 'Australian Capital Territory', postcodeRange: [200, 999] },
  NT: { name: 'Northern Territory', postcodeRange: [800, 899] },
};

const SERVICE_TYPES = [
  { value: 'WATER_DAMAGE', label: 'Water Damage' },
  { value: 'FIRE_DAMAGE', label: 'Fire Damage' },
  { value: 'SMOKE_DAMAGE', label: 'Smoke Damage' },
  { value: 'MOULD_REMEDIATION', label: 'Mould Remediation' },
  { value: 'ODOUR_REMEDIATION', label: 'Odour Remediation' },
  { value: 'CARPET_CLEANING', label: 'Carpet Cleaning' },
  { value: 'COMMERCIAL_WATER_DAMAGE', label: 'Commercial Water Damage' },
  { value: 'COMMERCIAL_FIRE_DAMAGE', label: 'Commercial Fire Damage' },
  { value: 'CRIME_SCENE_CLEANING', label: 'Crime Scene Cleaning' },
  { value: 'BIOHAZARD_REMEDIATION', label: 'Biohazard Remediation' },
];

const EMERGENCY_LEVELS = [
  { value: 'URGENT', label: 'Urgent (< 2 hours)' },
  { value: 'HIGH', label: 'High (Same day)' },
  { value: 'STANDARD', label: 'Standard (Next day)' },
  { value: 'SCHEDULED', label: 'Scheduled' },
];

interface Contractor {
  id: string;
  businessName: string;
  nrpgMemberId?: string;
  rating: number;
  reviewCount: number;
  completedJobs: number;
  responseTimeMinutes?: number;
  iicrcLevels: string[];
  specialties: string[];
  operatingStates: string[];
  matchScore: number;
}

interface SearchResult {
  contractors: Contractor[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}

interface PublicContractorSearchProps {
  initialPostcode?: string;
  initialServiceType?: string;
}

function getStateFromPostcode(postcode: string): string | null {
  const num = parseInt(postcode, 10);
  for (const [state, info] of Object.entries(AUSTRALIAN_STATES)) {
    if (num >= info.postcodeRange[0] && num <= info.postcodeRange[1]) {
      return state;
    }
  }
  return null;
}

function formatServiceType(type: string): string {
  return type
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function PublicContractorSearch({
  initialPostcode = '',
  initialServiceType = '',
}: PublicContractorSearchProps) {
  const [postcode, setPostcode] = useState(initialPostcode);
  const [serviceType, setServiceType] = useState(initialServiceType);
  const [emergencyLevel, setEmergencyLevel] = useState('');
  const [minRating, setMinRating] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedContractors, setSelectedContractors] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  // Load selected contractors from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('selectedContractors');
    if (saved) {
      try {
        setSelectedContractors(JSON.parse(saved));
      } catch (e) {
        // Invalid data, reset
        localStorage.removeItem('selectedContractors');
      }
    }
  }, []);

  // Save selected contractors to localStorage
  useEffect(() => {
    localStorage.setItem('selectedContractors', JSON.stringify(selectedContractors));
  }, [selectedContractors]);

  // Toggle contractor selection
  const toggleContractorSelection = (contractorId: string) => {
    setSelectedContractors((prev) => {
      if (prev.includes(contractorId)) {
        // Remove from selection
        return prev.filter((id) => id !== contractorId);
      } else {
        // Add to selection (max 3)
        if (prev.length >= 3) {
          toast.error('You can compare up to 3 contractors at a time');
          return prev;
        }
        return [...prev, contractorId];
      }
    });
  };

  // Clear all selections
  const clearSelection = () => {
    setSelectedContractors([]);
    localStorage.removeItem('selectedContractors');
  };

  // Get selected contractor data for comparison
  const getSelectedContractorData = (): ContractorComparisonData[] => {
    if (!result) return [];
    return result.contractors
      .filter((c) => selectedContractors.includes(c.id))
      .map((c) => ({
        id: c.id,
        businessName: c.businessName,
        averageRating: c.rating,
        reviewCount: c.reviewCount,
        completedJobs: c.completedJobs,
        averageResponseTimeMinutes: c.responseTimeMinutes || 0,
        iicrcCount: c.iicrcLevels.length,
        specialties: c.specialties.map(formatServiceType),
        operatingStates: c.operatingStates,
        isLicensed: true, // All public contractors are verified/licensed
        matchScore: c.matchScore,
      }));
  };

  const detectedState = postcode.length === 4 ? getStateFromPostcode(postcode) : null;
  const isPostcodeValid = !postcode || (postcode.length === 4 && detectedState !== null);

  const handleSearch = useCallback(async (page = 1) => {
    setIsLoading(true);
    setHasSearched(true);
    setCurrentPage(page);

    try {
      const params = new URLSearchParams();
      if (postcode) params.set('postcode', postcode);
      if (serviceType) params.set('serviceType', serviceType);
      if (emergencyLevel) params.set('emergencyLevel', emergencyLevel);
      if (minRating) params.set('minRating', minRating);
      params.set('page', String(page));
      params.set('limit', '12');

      const res = await fetch(`/api/public/contractors/search?${params}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Search failed');
      }

      setResult(data.data);
    } catch (err: any) {
      toast.error(err.message || 'Failed to search contractors');
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  }, [postcode, serviceType, emergencyLevel, minRating]);

  const handleClear = () => {
    setPostcode('');
    setServiceType('');
    setEmergencyLevel('');
    setMinRating('');
    setResult(null);
    setHasSearched(false);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-8">
      {/* Search Filters */}
      <Card className="bg-[#1F2937] border-[#374151]">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Postcode */}
            <div>
              <label className="block text-sm font-medium text-[#9CA3AF] mb-2">
                <MapPin className="inline h-4 w-4 mr-1" />
                Postcode
              </label>
              <div className="relative">
                <Input
                  placeholder="e.g. 2000"
                  value={postcode}
                  onChange={(e) => setPostcode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  className="bg-[#0F1115] border-[#374151] text-[#F9FAFB] placeholder:text-[#6B7280]"
                  maxLength={4}
                />
                {postcode.length === 4 && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {detectedState ? (
                      <span className="flex items-center text-xs text-[#00BFA6]">
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                        {detectedState}
                      </span>
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-400" />
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Service Type */}
            <div>
              <label className="block text-sm font-medium text-[#9CA3AF] mb-2">
                <Briefcase className="inline h-4 w-4 mr-1" />
                Service Type
              </label>
              <Select value={serviceType} onValueChange={setServiceType}>
                <SelectTrigger className="bg-[#0F1115] border-[#374151] text-[#F9FAFB]">
                  <SelectValue placeholder="All services" />
                </SelectTrigger>
                <SelectContent className="bg-[#1F2937] border-[#374151]">
                  {SERVICE_TYPES.map((st) => (
                    <SelectItem key={st.value} value={st.value} className="text-[#F9FAFB]">
                      {st.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Emergency Level */}
            <div>
              <label className="block text-sm font-medium text-[#9CA3AF] mb-2">
                <Clock className="inline h-4 w-4 mr-1" />
                Response Time
              </label>
              <Select value={emergencyLevel} onValueChange={setEmergencyLevel}>
                <SelectTrigger className="bg-[#0F1115] border-[#374151] text-[#F9FAFB]">
                  <SelectValue placeholder="Any response time" />
                </SelectTrigger>
                <SelectContent className="bg-[#1F2937] border-[#374151]">
                  {EMERGENCY_LEVELS.map((el) => (
                    <SelectItem key={el.value} value={el.value} className="text-[#F9FAFB]">
                      {el.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Min Rating */}
            <div>
              <label className="block text-sm font-medium text-[#9CA3AF] mb-2">
                <Star className="inline h-4 w-4 mr-1" />
                Minimum Rating
              </label>
              <Select value={minRating} onValueChange={setMinRating}>
                <SelectTrigger className="bg-[#0F1115] border-[#374151] text-[#F9FAFB]">
                  <SelectValue placeholder="Any rating" />
                </SelectTrigger>
                <SelectContent className="bg-[#1F2937] border-[#374151]">
                  <SelectItem value="3" className="text-[#F9FAFB]">3+ Stars</SelectItem>
                  <SelectItem value="3.5" className="text-[#F9FAFB]">3.5+ Stars</SelectItem>
                  <SelectItem value="4" className="text-[#F9FAFB]">4+ Stars</SelectItem>
                  <SelectItem value="4.5" className="text-[#F9FAFB]">4.5+ Stars</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              onClick={() => handleSearch(1)}
              disabled={isLoading || (!!postcode && !isPostcodeValid)}
              className="bg-[#00BFA6] hover:bg-[#00A693] text-[#0F1115] font-semibold px-8"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              Search Contractors
            </Button>
            {hasSearched && (
              <Button
                onClick={handleClear}
                variant="outline"
                className="border-[#374151] text-[#9CA3AF] hover:bg-[#1F2937] bg-transparent"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-[#00BFA6]" />
          <span className="ml-3 text-[#9CA3AF]">Searching contractors...</span>
        </div>
      )}

      {!isLoading && hasSearched && result && (
        <>
          {/* Results count */}
          <div className="flex items-center justify-between">
            <p className="text-[#9CA3AF]">
              {result.total === 0
                ? 'No contractors found'
                : `Showing ${result.contractors.length} of ${result.total} verified contractor${result.total !== 1 ? 's' : ''}`}
            </p>
          </div>

          {result.contractors.length === 0 ? (
            /* Empty state */
            <Card className="bg-[#1F2937] border-[#374151]">
              <CardContent className="p-12 text-center">
                <Search className="h-12 w-12 text-[#374151] mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-[#F9FAFB] mb-2">
                  No contractors found
                </h3>
                <p className="text-[#9CA3AF] mb-6 max-w-md mx-auto">
                  Try broadening your search by removing filters or searching a different postcode. Our contractor network is growing across Australia.
                </p>
                <Button
                  onClick={handleClear}
                  variant="outline"
                  className="border-[#374151] text-[#F9FAFB] hover:bg-[#1F2937] bg-transparent"
                >
                  Clear All Filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            /* Contractor cards grid */
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {result.contractors.map((contractor) => (
                <Card
                  key={contractor.id}
                  className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] border-[#374151] hover:border-[#00BFA6] transition-colors"
                >
                  <CardContent className="p-6">
                    {/* Header with Compare Checkbox */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3">
                          {/* Compare Checkbox */}
                          <div className="pt-1">
                            <Checkbox
                              checked={selectedContractors.includes(contractor.id)}
                              onCheckedChange={() => toggleContractorSelection(contractor.id)}
                              className="border-[#374151] data-[state=checked]:bg-[#00BFA6] data-[state=checked]:border-[#00BFA6]"
                            />
                          </div>
                          <div>
                            <h3 className="font-poppins font-semibold text-lg text-[#F9FAFB]">
                              {contractor.businessName}
                            </h3>
                            {contractor.nrpgMemberId && (
                              <div className="flex items-center gap-1.5 mt-1">
                                <Shield className="h-3.5 w-3.5 text-[#00BFA6]" />
                                <span className="text-xs text-[#00BFA6] font-medium">
                                  NRPG {contractor.nrpgMemberId}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <Badge className="bg-[#00BFA6]/10 text-[#00BFA6] border-[#00BFA6]/30 ml-2">
                        {contractor.matchScore}% match
                      </Badge>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-[#FFD700]">
                          <Star className="h-3.5 w-3.5 fill-current" />
                          <span className="font-semibold text-sm">{contractor.rating.toFixed(1)}</span>
                        </div>
                        <span className="text-[10px] text-[#6B7280]">
                          {contractor.reviewCount} {contractor.reviewCount === 1 ? 'review' : 'reviews'}
                        </span>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-[#2196F3]">
                          <Briefcase className="h-3.5 w-3.5" />
                          <span className="font-semibold text-sm">{contractor.completedJobs}</span>
                        </div>
                        <span className="text-[10px] text-[#6B7280]">Jobs</span>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-[#7C4DFF]">
                          <Clock className="h-3.5 w-3.5" />
                          <span className="font-semibold text-sm">
                            {contractor.responseTimeMinutes
                              ? `${contractor.responseTimeMinutes}m`
                              : 'N/A'}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#6B7280]">Response</span>
                      </div>
                    </div>

                    {/* Industry Certifications */}
                    {contractor.iicrcLevels.length > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center gap-1.5 mb-2">
                          <Award className="h-3.5 w-3.5 text-[#00BFA6]" />
                          <span className="text-xs text-[#9CA3AF]">Industry certification held</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {contractor.iicrcLevels.slice(0, 3).map((level, i) => (
                            <Badge
                              key={i}
                              variant="outline"
                              className="text-[10px] border-[#00BFA6]/30 text-[#00BFA6]"
                            >
                              {level}
                            </Badge>
                          ))}
                          {contractor.iicrcLevels.length > 3 && (
                            <Badge
                              variant="outline"
                              className="text-[10px] border-[#374151] text-[#6B7280]"
                            >
                              +{contractor.iicrcLevels.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Specialties */}
                    {contractor.specialties.length > 0 && (
                      <div className="mb-5">
                        <div className="flex flex-wrap gap-1.5">
                          {contractor.specialties.slice(0, 3).map((spec) => (
                            <Badge
                              key={spec}
                              variant="outline"
                              className="text-[10px] border-[#2196F3]/30 text-[#2196F3]"
                            >
                              {formatServiceType(spec)}
                            </Badge>
                          ))}
                          {contractor.specialties.length > 3 && (
                            <Badge
                              variant="outline"
                              className="text-[10px] border-[#374151] text-[#6B7280]"
                            >
                              +{contractor.specialties.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3">
                      <Link href={`/contractors/${contractor.id}`} className="flex-1">
                        <Button
                          variant="outline"
                          className="w-full border-[#374151] text-[#F9FAFB] hover:bg-[#1F2937] bg-transparent text-sm"
                        >
                          View Profile
                          <ArrowRight className="ml-2 h-3.5 w-3.5" />
                        </Button>
                      </Link>
                      <Link href="/claim">
                        <Button className="bg-[#00BFA6] hover:bg-[#00A693] text-[#0F1115] font-semibold text-sm">
                          Request Quote
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {result.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSearch(currentPage - 1)}
                disabled={currentPage <= 1 || isLoading}
                className="border-[#374151] text-[#9CA3AF] hover:bg-[#1F2937] bg-transparent"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-[#9CA3AF]">
                Page {result.page} of {result.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSearch(currentPage + 1)}
                disabled={currentPage >= result.totalPages || isLoading}
                className="border-[#374151] text-[#9CA3AF] hover:bg-[#1F2937] bg-transparent"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}

      {/* Initial state — before any search */}
      {!hasSearched && !isLoading && (
        <div className="text-center py-12">
          <Search className="h-16 w-16 text-[#374151] mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-[#F9FAFB] mb-2">
            Search for contractors
          </h3>
          <p className="text-[#9CA3AF] max-w-md mx-auto">
            Use the filters above to find qualified disaster recovery contractors in your area. All listed contractors are verified and vetted by the NRPG network.
          </p>
        </div>
      )}

      {/* Comparison Bar (Fixed at bottom) */}
      {selectedContractors.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-[#1F2937] to-[#0F1115] border-t border-[#374151] p-4 shadow-lg z-50">
          <div className="container mx-auto px-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <GitCompare className="h-5 w-5 text-[#00BFA6]" />
              <div>
                <div className="font-semibold text-[#F9FAFB]">
                  {selectedContractors.length} contractor{selectedContractors.length !== 1 ? 's' : ''} selected
                </div>
                <div className="text-xs text-[#9CA3AF]">
                  {selectedContractors.length < 2
                    ? 'Select at least 2 to compare'
                    : `Select up to ${3 - selectedContractors.length} more`}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={clearSelection}
                className="border-[#374151] text-[#9CA3AF] hover:bg-[#1F2937] bg-transparent"
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
              <Button
                onClick={() => setShowComparison(true)}
                disabled={selectedContractors.length < 2}
                className="bg-[#00BFA6] hover:bg-[#00A693] text-[#0F1115] font-semibold"
              >
                <GitCompare className="h-4 w-4 mr-2" />
                Compare Now
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Comparison Dialog */}
      <Dialog open={showComparison} onOpenChange={setShowComparison}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl">Contractor Comparison</DialogTitle>
            <DialogDescription>
              Compare key metrics side-by-side to make an informed decision
            </DialogDescription>
          </DialogHeader>
          <ContractorComparison
            contractors={getSelectedContractorData()}
            onRemove={(id) => {
              toggleContractorSelection(id);
              // Close dialog if less than 2 contractors left
              if (selectedContractors.length <= 2) {
                setShowComparison(false);
              }
            }}
            onClear={() => {
              clearSelection();
              setShowComparison(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
