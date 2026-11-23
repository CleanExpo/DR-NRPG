'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import {
  MapPin,
  Star,
  Briefcase,
  Shield,
  Award,
  Loader2,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Phone,
  Clock,
  Sparkles,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import SemanticSearchInput from '@/components/ai/semantic-search-input';

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

const AUSTRALIAN_SERVICE_TYPES = [
  'WATER_DAMAGE',
  'FIRE_DAMAGE',
  'SMOKE_DAMAGE',
  'MOULD_REMEDIATION',
  'ODOUR_REMEDIATION',
  'CARPET_CLEANING',
  'COMMERCIAL_WATER_DAMAGE',
  'COMMERCIAL_FIRE_DAMAGE',
  'CRIME_SCENE_CLEANING',
  'BIOHAZARD_REMEDIATION',
];

const EMERGENCY_LEVELS = ['URGENT', 'HIGH', 'STANDARD', 'SCHEDULED'];

interface Contractor {
  id: string;
  businessName: string;
  nrpgMemberId?: string;
  rating: number;
  completedJobs: number;
  responseTimeMinutes?: number;
  iicrcLevels: string[];
  specialties: string[];
  matchScore: number;
  phone?: string;
  location?: string;
}

interface ContractorSearchInterfaceProps {
  initialPostcode?: string;
  initialServiceType?: string;
  onSelectContractor?: (contractor: Contractor) => void;
}

export default function ContractorSearchInterface({
  initialPostcode,
  initialServiceType,
  onSelectContractor,
}: ContractorSearchInterfaceProps) {
  const [postcode, setPostcode] = useState(initialPostcode || '');
  const [serviceType, setServiceType] = useState(initialServiceType || '');
  const [emergencyLevel, setEmergencyLevel] = useState('STANDARD');
  const [minRating, setMinRating] = useState(3.5);
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selectedContractor, setSelectedContractor] = useState<Contractor | null>(null);
  const [useAISearch, setUseAISearch] = useState(true);
  const [aiSearchQuery, setAISearchQuery] = useState('');

  const getStateFromPostcode = (code: string): string | null => {
    const num = parseInt(code, 10);
    for (const [state, { postcodeRange }] of Object.entries(AUSTRALIAN_STATES)) {
      const [min, max] = postcodeRange;
      if (num >= min && num <= max) return state;
    }
    return null;
  };

  const validatePostcode = (code: string): boolean => {
    if (!/^\d{4}$/.test(code)) return false;
    return getStateFromPostcode(code) !== null;
  };

  const searchContractors = async () => {
    try {
      if (!postcode || !postcode.trim()) {
        toast.error('Please enter a postcode');
        return;
      }

      if (!validatePostcode(postcode)) {
        toast.error('Invalid Australian postcode');
        return;
      }

      setLoading(true);
      setSearched(true);

      // Build search URL with parameters
      const searchParams = new URLSearchParams({
        postcode,
        ...(serviceType && { serviceType }),
        ...(emergencyLevel && { emergencyLevel }),
        ...(minRating && { minRating: minRating.toString() }),
      });

      const response = await fetch(`/api/contractors/search?${searchParams}`, { cache: 'no-store' });

      if (!response.ok) {
        throw new Error('Failed to search contractors');
      }

      const result = await response.json();
      setContractors(result.contractors || []);

      if (result.contractors.length === 0) {
        toast.info('No contractors found matching your criteria. Try adjusting your filters.');
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to search contractors');
    } finally {
      setLoading(false);
    }
  };

  const formatServiceType = (type: string): string => {
    return type
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  // Handle AI semantic search
  const handleSemanticSearch = useCallback(
    async (
      query: string,
      filters: {
        serviceTypes: string[];
        urgencyLevel: string;
        location: { suburb?: string; state?: string; postcode?: string; city?: string };
      },
      parsed: { intent: string; confidence: number }
    ) => {
      setAISearchQuery(query);
      setLoading(true);
      setSearched(true);

      try {
        // Apply parsed filters to state
        if (filters.serviceTypes.length > 0) {
          setServiceType(filters.serviceTypes[0]);
        }

        if (filters.location.postcode) {
          setPostcode(filters.location.postcode);
        }

        // Map urgency level to emergency level
        const urgencyMap: Record<string, string> = {
          EMERGENCY: 'URGENT',
          URGENT: 'URGENT',
          HIGH: 'HIGH',
          STANDARD: 'STANDARD',
          FLEXIBLE: 'SCHEDULED',
        };
        if (filters.urgencyLevel) {
          setEmergencyLevel(urgencyMap[filters.urgencyLevel] || 'STANDARD');
        }

        // Build search params from AI-parsed filters
        const searchParams = new URLSearchParams({
          ...(filters.location.postcode && { postcode: filters.location.postcode }),
          ...(filters.location.state && { state: filters.location.state }),
          ...(filters.serviceTypes.length > 0 && { serviceType: filters.serviceTypes[0] }),
          ...(filters.urgencyLevel && { emergencyLevel: urgencyMap[filters.urgencyLevel] || 'STANDARD' }),
          ...(minRating && { minRating: minRating.toString() }),
          aiQuery: query, // Include original query for backend logging/ML
        });

        const response = await fetch(`/api/contractors/search?${searchParams}`, {
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error('Failed to search contractors');
        }

        const result = await response.json();
        setContractors(result.contractors || []);

        if (result.contractors.length === 0) {
          toast.info('No contractors found. Try adjusting your search.');
        } else {
          toast.success(
            `Found ${result.contractors.length} contractor${result.contractors.length !== 1 ? 's' : ''} matching your needs`
          );
        }
      } catch (error) {
        console.error('AI Search error:', error);
        toast.error(error instanceof Error ? error.message : 'Search failed');
      } finally {
        setLoading(false);
      }
    },
    [minRating]
  );

  return (
    <div className="w-full space-y-6">
      {/* Search Form Card */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="bg-gradient-to-r from-[#00BFA6] to-[#3B82F6]">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white text-2xl flex items-center gap-2">
                {useAISearch ? (
                  <Sparkles className="h-6 w-6" />
                ) : (
                  <Search className="h-6 w-6" />
                )}
                Find Qualified Contractors
              </CardTitle>
              <CardDescription className="text-gray-100">
                {useAISearch
                  ? 'Describe what you need in plain English'
                  : 'Search for verified NRPG contractors in your area'}
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setUseAISearch(!useAISearch)}
              className="text-white hover:bg-white/20 flex items-center gap-2"
            >
              {useAISearch ? (
                <ToggleRight className="h-5 w-5" />
              ) : (
                <ToggleLeft className="h-5 w-5" />
              )}
              <span className="text-sm">{useAISearch ? 'AI Search' : 'Classic'}</span>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          {/* AI Semantic Search */}
          {useAISearch && (
            <div className="space-y-4">
              <SemanticSearchInput
                onSearch={handleSemanticSearch}
                placeholder="e.g., 'Water damage in Sydney, need help today' or 'Mould removal Melbourne urgent'"
                showFiltersPreview={true}
              />
              <div className="flex items-center justify-center">
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <div className="h-px bg-gray-600 w-12" />
                  <span>or use manual filters below</span>
                  <div className="h-px bg-gray-600 w-12" />
                </div>
              </div>
            </div>
          )}

          {/* Location Input */}
          <div className="space-y-2">
            <label className="text-gray-300 font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#00BFA6]" />
              Australian Postcode
            </label>
            <Input
              placeholder="e.g., 2000"
              value={postcode}
              onChange={(e) => setPostcode(e.target.value.slice(0, 4))}
              maxLength={4}
              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              onKeyPress={(e) => e.key === 'Enter' && searchContractors()}
            />
            {postcode && validatePostcode(postcode) && (
              <p className="text-xs text-green-400 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                {getStateFromPostcode(postcode)} detected
              </p>
            )}
            {postcode && !validatePostcode(postcode) && postcode.length === 4 && (
              <p className="text-xs text-red-400 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Invalid Australian postcode
              </p>
            )}
          </div>

          {/* Filters Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Service Type */}
            <div className="space-y-2">
              <label className="text-gray-300 font-medium flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-[#00BFA6]" />
                Service Type (Optional)
              </label>
              <Select value={serviceType} onValueChange={setServiceType}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="All services" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600 text-white">
                  <SelectItem value="">All Services</SelectItem>
                  {AUSTRALIAN_SERVICE_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {formatServiceType(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Emergency Level */}
            <div className="space-y-2">
              <label className="text-gray-300 font-medium flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-[#00BFA6]" />
                Response Time
              </label>
              <Select value={emergencyLevel} onValueChange={setEmergencyLevel}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600 text-white">
                  <SelectItem value="URGENT">Urgent (&lt; 2 hours)</SelectItem>
                  <SelectItem value="HIGH">High (Same day)</SelectItem>
                  <SelectItem value="STANDARD">Standard (Next day)</SelectItem>
                  <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Minimum Rating */}
          <div className="space-y-3">
            <label className="text-gray-300 font-medium flex items-center gap-2">
              <Star className="h-4 w-4 text-[#00BFA6]" />
              Minimum Rating: {minRating.toFixed(1)} ⭐
            </label>
            <Slider
              value={[minRating]}
              onValueChange={(value) => setMinRating(value[0])}
              min={0}
              max={5}
              step={0.5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>Any</span>
              <span>5.0 stars</span>
            </div>
          </div>

          {/* Search Button */}
          <Button
            onClick={searchContractors}
            disabled={loading || !postcode || !validatePostcode(postcode)}
            className="w-full h-12 bg-gradient-to-r from-[#00BFA6] to-[#3B82F6] hover:from-[#00A693] hover:to-[#2E7FD6] text-white font-semibold"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Searching Contractors...
              </>
            ) : (
              <>
                <Search className="mr-2 h-5 w-5" />
                Search Contractors
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {searched && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">
              Available Contractors
              {contractors.length > 0 && (
                <span className="text-[#00BFA6] ml-2">({contractors.length})</span>
              )}
            </h2>
          </div>

          {loading ? (
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-12 flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 text-[#00BFA6] animate-spin mx-auto mb-4" />
                  <p className="text-gray-300">Searching for contractors...</p>
                </div>
              </CardContent>
            </Card>
          ) : contractors.length === 0 ? (
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-12 text-center">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No contractors found</h3>
                <p className="text-gray-400 mb-4">
                  Try adjusting your filters or checking a different postcode
                </p>
                <Button
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  onClick={() => setSearched(false)}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Modify Search
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {contractors.map((contractor) => (
                <Card
                  key={contractor.id}
                  className="bg-gray-800 border-gray-700 hover:border-[#00BFA6] transition-[border-color] duration-200 [transition-timing-function:cubic-bezier(0.4,0,0.2,1)] cursor-pointer"
                  onClick={() => {
                    setSelectedContractor(contractor);
                    if (onSelectContractor) {
                      onSelectContractor(contractor);
                    }
                  }}
                >
                  <CardContent className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4 flex-1">
                        <Avatar className="h-12 w-12 bg-gradient-to-br from-[#00BFA6] to-[#3B82F6]">
                          <AvatarFallback className="text-white font-bold">
                            {contractor.businessName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white">
                            {contractor.businessName}
                          </h3>
                          {contractor.nrpgMemberId && (
                            <p className="text-xs text-[#00BFA6] flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              NRPG Member: {contractor.nrpgMemberId}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Match Score Badge */}
                      <div className="text-center">
                        <div className="text-2xl font-bold text-[#00BFA6]">
                          {Math.round(contractor.matchScore)}%
                        </div>
                        <p className="text-xs text-gray-400">Match Score</p>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                      {/* Rating */}
                      <div className="bg-gray-700 p-3 rounded text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-lg font-bold text-white">
                            {contractor.rating.toFixed(1)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400">Rating</p>
                      </div>

                      {/* Completed Jobs */}
                      <div className="bg-gray-700 p-3 rounded text-center">
                        <p className="text-lg font-bold text-white">{contractor.completedJobs}</p>
                        <p className="text-xs text-gray-400">Jobs Completed</p>
                      </div>

                      {/* Response Time */}
                      {contractor.responseTimeMinutes && (
                        <div className="bg-gray-700 p-3 rounded text-center">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <Clock className="h-4 w-4 text-[#00BFA6]" />
                            <span className="text-lg font-bold text-white">
                              {Math.round(contractor.responseTimeMinutes / 60)}h
                            </span>
                          </div>
                          <p className="text-xs text-gray-400">Avg Response</p>
                        </div>
                      )}

                      {/* Industry Certifications */}
                      <div className="bg-gray-700 p-3 rounded text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Award className="h-4 w-4 text-[#00BFA6]" />
                          <span className="text-lg font-bold text-white">
                            {contractor.iicrcLevels.length}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400">Industry Certs</p>
                      </div>
                    </div>

                    {/* Certifications and Specialties */}
                    {(contractor.iicrcLevels.length > 0 || contractor.specialties.length > 0) && (
                      <div className="mb-4 space-y-2">
                        {contractor.iicrcLevels.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-gray-400 mb-1 flex items-center gap-1">
                              <Shield className="h-3 w-3 text-[#00BFA6]" />
                              Industry Certifications
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {contractor.iicrcLevels.map((level) => (
                                <Badge
                                  key={level}
                                  className="bg-[#00BFA6]/20 text-[#00BFA6] border-[#00BFA6]/30 text-xs"
                                >
                                  {level}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {contractor.specialties.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-gray-400 mb-1 flex items-center gap-1">
                              <Briefcase className="h-3 w-3 text-[#00BFA6]" />
                              Specialties
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {contractor.specialties.slice(0, 3).map((specialty) => (
                                <Badge
                                  key={specialty}
                                  className="bg-blue-900/30 text-blue-400 border-blue-500/30 text-xs"
                                >
                                  {formatServiceType(specialty)}
                                </Badge>
                              ))}
                              {contractor.specialties.length > 3 && (
                                <Badge className="bg-gray-700 text-gray-400 border-gray-600 text-xs">
                                  +{contractor.specialties.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Contact Info */}
                    {contractor.phone && (
                      <div className="text-sm text-gray-300 mb-4 flex items-center gap-2">
                        <Phone className="h-4 w-4 text-[#00BFA6]" />
                        {contractor.phone}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        className="flex-1 bg-[#00BFA6] hover:bg-[#00A693] text-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onSelectContractor) {
                            onSelectContractor(contractor);
                          }
                          toast.success('Contractor selected!');
                        }}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Select Contractor
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log('Message contractor:', contractor.id);
                        }}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Message
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Selected Contractor Preview */}
      {selectedContractor && (
        <Card className="bg-gradient-to-r from-[#00BFA6]/10 to-[#3B82F6]/10 border-2 border-[#00BFA6]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6 text-[#00BFA6]" />
                <div>
                  <p className="font-semibold text-white">{selectedContractor.businessName}</p>
                  <p className="text-sm text-gray-400">Selected contractor</p>
                </div>
              </div>
              <Button
                variant="outline"
                className="border-[#00BFA6] text-[#00BFA6] hover:bg-[#00BFA6]/10"
                onClick={() => setSelectedContractor(null)}
              >
                Change Selection
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
