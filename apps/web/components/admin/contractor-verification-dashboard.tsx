'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  MapPin,
  Award,
  FileCheck,
  User,
  Loader2,
  Search,
  Filter,
  Phone,
  Mail,
  Building2,
  Shield,
  TrendingUp,
  Calendar,
  DollarSign,
} from 'lucide-react';

interface PendingContractor {
  id: string;
  businessName: string;
  abnNumber: string;
  operatingStates: string[];
  email?: string;
  phone?: string;
  certifications: {
    level: string;
    certificationCode: string;
    expiryDate: string;
  }[];
  createdAt: string;
  nrpgMemberId?: string;
}

interface ContractorVerificationDashboardProps {
  adminToken?: string;
}

const VERIFICATION_STATUSES = ['PENDING', 'VERIFIED', 'SUSPENDED', 'REJECTED'] as const;

const STATUS_COLORS: Record<string, { badge: string; icon: React.ReactNode }> = {
  PENDING: {
    badge: 'bg-yellow-900/30 text-yellow-400 border-yellow-500',
    icon: <Clock className="h-4 w-4" />,
  },
  VERIFIED: {
    badge: 'bg-green-900/30 text-green-400 border-green-500',
    icon: <CheckCircle2 className="h-4 w-4" />,
  },
  SUSPENDED: {
    badge: 'bg-orange-900/30 text-orange-400 border-orange-500',
    icon: <AlertCircle className="h-4 w-4" />,
  },
  REJECTED: {
    badge: 'bg-red-900/30 text-red-400 border-red-500',
    icon: <AlertCircle className="h-4 w-4" />,
  },
};

const IICRC_LEVEL_LABELS: Record<string, string> = {
  TECHNICIAN: 'IICRC Technician',
  SUPERVISOR: 'IICRC Supervisor',
  INSPECTOR: 'IICRC Inspector',
  MASTER: 'IICRC Master',
};

export default function ContractorVerificationDashboard({
  adminToken: _adminToken,
}: ContractorVerificationDashboardProps) {
  const [pendingContractors, setPendingContractors] = useState<PendingContractor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedContractor, setSelectedContractor] = useState<PendingContractor | null>(null);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'reviewed'>('pending');

  const fetchPendingContractors = useCallback(async () => {
    try {
      setLoading(true);
      const url = selectedState
        ? `/api/contractors/register?state=${selectedState}`
        : '/api/contractors/register';

      const response = await fetch(url, { cache: 'no-store' });

      if (!response.ok) throw new Error('Failed to fetch pending contractors');

      const result = await response.json();
      setPendingContractors(result.data || []);
    } catch (error) {
      console.error('Error fetching contractors:', error);
      toast.error('Failed to load pending contractors');
    } finally {
      setLoading(false);
    }
  }, [selectedState]);

  useEffect(() => {
    fetchPendingContractors();
  }, [fetchPendingContractors]);

  const handleVerify = async (
    contractorId: string,
    verificationLevel: 'VERIFIED' | 'SUSPENDED' | 'REJECTED'
  ) => {
    try {
      setVerifying(true);

      const response = await fetch(`/api/contractors/${contractorId}/verify`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          verificationLevel,
          notes: verificationNotes,
        }),
      });

      if (!response.ok) throw new Error('Failed to update verification');

      toast.success(`Contractor ${verificationLevel.toLowerCase()}`);
      setVerificationNotes('');
      setSelectedContractor(null);
      fetchPendingContractors();
    } catch (error) {
      console.error('Verification error:', error);
      toast.error('Failed to process verification');
    } finally {
      setVerifying(false);
    }
  };

  const validateABN = (abn: string): boolean => {
    if (!/^\d{11}$/.test(abn)) return false;
    const weights = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
    const digits = abn.split('');
    let checksum = 0;
    for (let i = 0; i < 11; i++) {
      checksum += parseInt(digits[i], 10) * weights[i];
    }
    return (checksum % 89) === 0;
  };

  const getCertificationStatus = (expiryDate: string): 'valid' | 'expiring' | 'expired' => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) return 'expired';
    if (daysUntilExpiry < 30) return 'expiring';
    return 'valid';
  };

  const filteredContractors = pendingContractors.filter((contractor) => {
    if (selectedState && !contractor.operatingStates.includes(selectedState)) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-[#00BFA6] animate-spin mx-auto mb-4" />
          <p className="text-gray-300">Loading contractors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Contractor Verification</h1>
          <p className="text-gray-400 mt-1">Review and verify NRPG contractor applications</p>
        </div>
        <Button
          onClick={fetchPendingContractors}
          className="bg-[#00BFA6] hover:bg-[#00A693] text-white"
        >
          <Search className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Pending</p>
                <p className="text-3xl font-bold text-white">
                  {filteredContractors.length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">IICRC certification held</p>
                <p className="text-3xl font-bold text-green-400">
                  {filteredContractors.filter((c) => c.certifications.length > 0).length}
                </p>
              </div>
              <Award className="h-8 w-8 text-green-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">ABN Valid</p>
                <p className="text-3xl font-bold text-blue-400">
                  {filteredContractors.filter((c) => validateABN(c.abnNumber)).length}
                </p>
              </div>
              <Building2 className="h-8 w-8 text-blue-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Average Wait</p>
                <p className="text-3xl font-bold text-[#00BFA6]">
                  {filteredContractors.length > 0
                    ? Math.floor(
                        filteredContractors.reduce((sum, c) => {
                          const days = Math.floor(
                            (Date.now() - new Date(c.createdAt).getTime()) / (1000 * 60 * 60 * 24)
                          );
                          return sum + days;
                        }, 0) / filteredContractors.length
                      )
                    : 0}
                  d
                </p>
              </div>
              <Calendar className="h-8 w-8 text-[#00BFA6] opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Filter className="h-5 w-5 text-[#00BFA6]" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => setSelectedState(null)}
              variant={selectedState === null ? 'default' : 'outline'}
              className={
                selectedState === null
                  ? 'bg-[#00BFA6] text-white hover:bg-[#00A693]'
                  : 'border-gray-600 text-gray-300 hover:bg-gray-700'
              }
            >
              All States
            </Button>
            {['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'].map((state) => (
              <Button
                key={state}
                onClick={() => setSelectedState(state)}
                variant={selectedState === state ? 'default' : 'outline'}
                className={
                  selectedState === state
                    ? 'bg-[#00BFA6] text-white hover:bg-[#00A693]'
                    : 'border-gray-600 text-gray-300 hover:bg-gray-700'
                }
              >
                {state}
                <span className="ml-2 text-xs">
                  (
                  {filteredContractors.filter((c) =>
                    c.operatingStates.includes(state)
                  ).length}
                  )
                </span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Contractors List */}
      {filteredContractors.length === 0 ? (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-12 text-center">
            <CheckCircle2 className="h-12 w-12 text-green-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No pending contractors</h3>
            <p className="text-gray-400">All contractor applications have been reviewed</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredContractors.map((contractor) => (
            <Card
              key={contractor.id}
              className="bg-gray-800 border-gray-700 hover:border-[#00BFA6] transition-colors"
            >
              <CardContent className="p-6 space-y-4">
                {/* Header Row */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white">{contractor.businessName}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                      {contractor.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          {contractor.email}
                        </div>
                      )}
                      {contractor.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          {contractor.phone}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Applied{' '}
                        {Math.floor(
                          (Date.now() - new Date(contractor.createdAt).getTime()) /
                            (1000 * 60 * 60 * 24)
                        )}{' '}
                        days ago
                      </div>
                    </div>
                  </div>

                  <Badge className="bg-yellow-900/30 text-yellow-400 border-yellow-500">
                    <Clock className="h-3 w-3 mr-1" />
                    PENDING
                  </Badge>
                </div>

                {/* ABN and Business Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-3 border-t border-b border-gray-700">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">ABN</p>
                    <div className="flex items-center gap-2">
                      <p className="text-white font-mono">{contractor.abnNumber}</p>
                      {validateABN(contractor.abnNumber) ? (
                        <Badge className="bg-green-900/30 text-green-400 border-green-500 text-xs">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Valid
                        </Badge>
                      ) : (
                        <Badge className="bg-red-900/30 text-red-400 border-red-500 text-xs">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Invalid
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-400 mb-1">Operating States</p>
                    <div className="flex flex-wrap gap-1">
                      {contractor.operatingStates.map((state) => (
                        <Badge
                          key={state}
                          className="bg-blue-900/30 text-blue-400 border-blue-500 text-xs"
                        >
                          {state}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* IICRC Certifications */}
                {contractor.certifications.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-300 flex items-center gap-2">
                      <Award className="h-4 w-4 text-[#00BFA6]" />
                      IICRC Certifications
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {contractor.certifications.map((cert, index) => {
                        const certStatus = getCertificationStatus(cert.expiryDate);
                        const statusColor =
                          certStatus === 'valid'
                            ? 'bg-green-900/20 border-green-500'
                            : certStatus === 'expiring'
                              ? 'bg-yellow-900/20 border-yellow-500'
                              : 'bg-red-900/20 border-red-500';

                        return (
                          <div key={index} className={`p-3 rounded border ${statusColor}`}>
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-medium text-white text-sm">
                                  {IICRC_LEVEL_LABELS[cert.level] || cert.level}
                                </p>
                                <p className="text-xs text-gray-400 font-mono mt-1">
                                  {cert.certificationCode}
                                </p>
                              </div>
                              {certStatus === 'valid' && (
                                <CheckCircle2 className="h-5 w-5 text-green-400" />
                              )}
                              {certStatus === 'expiring' && (
                                <AlertCircle className="h-5 w-5 text-yellow-400" />
                              )}
                              {certStatus === 'expired' && (
                                <AlertCircle className="h-5 w-5 text-red-400" />
                              )}
                            </div>
                            <p className="text-xs text-gray-400 mt-2">
                              Expires: {new Date(cert.expiryDate).toLocaleDateString()}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => setSelectedContractor(contractor)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 border-red-600 text-red-400 hover:bg-red-900/20"
                    onClick={() => {
                      setSelectedContractor(contractor);
                      // This would show a reject confirmation
                    }}
                  >
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                    onClick={() => console.log('View details:', contractor.id)}
                  >
                    Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Verification Modal */}
      {selectedContractor && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedContractor(null)}
        >
          <Card className="bg-gray-800 border-gray-700 w-full max-w-2xl">
            <CardHeader className="bg-gradient-to-r from-[#00BFA6] to-[#3B82F6]">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Verify Contractor</CardTitle>
                <Button
                  variant="ghost"
                  className="text-white"
                  onClick={() => setSelectedContractor(null)}
                >
                  ✕
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {/* Contractor Summary */}
              <div className="space-y-2">
                <h3 className="font-semibold text-white">{selectedContractor.businessName}</h3>
                <p className="text-sm text-gray-400">ABN: {selectedContractor.abnNumber}</p>
              </div>

              {/* Verification Actions */}
              <div className="space-y-3">
                <div>
                  <label className="text-gray-300 font-medium text-sm block mb-2">
                    Verification Notes
                  </label>
                  <textarea
                    value={verificationNotes}
                    onChange={(e) => setVerificationNotes(e.target.value)}
                    placeholder="Add notes about this verification decision..."
                    className="w-full bg-gray-700 border-gray-600 text-white placeholder-gray-400 p-3 rounded border"
                    rows={4}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleVerify(selectedContractor.id, 'VERIFIED')}
                    disabled={verifying}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    {verifying ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Approve Contractor
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={() => handleVerify(selectedContractor.id, 'REJECTED')}
                    disabled={verifying}
                    variant="outline"
                    className="flex-1 border-red-600 text-red-400 hover:bg-red-900/20"
                  >
                    {verifying ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Rejecting...
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-4 w-4 mr-2" />
                        Reject
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
