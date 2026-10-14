'use client';

import { SITE_URL } from '@/lib/seo/site-url';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useGA4ContractorTracking, useGA4CTATracking } from '@/hooks/useGA4';
import {
  Star,
  MapPin,
  Phone,
  Mail,
  Clock,
  DollarSign,
  Shield,
  Award,
  CheckCircle,
  ArrowLeft,
  MessageSquare,
  Calendar,
  Printer,
  QrCode
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ContractorProfile {
  id: string;
  businessName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  licenseNumber: string;
  insuranceProvider: string;
  insuranceExpiry: string;
  services: string[];
  serviceAreas: string[];
  hourlyRate: number;
  experience: number;
  rating: number;
  totalJobs: number;
  bio: string;
  availability: string;
  isVerified: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string;
  };
}

export default function ContractorProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [contractor, setContractor] = useState<ContractorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // GA4 tracking hooks
  const { trackContractorProfileViewed, trackContractorContacted } = useGA4ContractorTracking();
  const { trackCTA } = useGA4CTATracking();

  useEffect(() => {
    const fetchContractor = async () => {
      try {
        const response = await fetch(`/api/contractor/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setContractor(data.contractor);

          // Track profile view
          trackContractorProfileViewed({
            contractor_id: params.id as string,
            contractor_name: data.contractor.businessName,
            location: `${data.contractor.city}, ${data.contractor.state}`,
          });
        } else {
          setError('Contractor not found');
        }
      } catch (err) {
        setError('Error loading contractor profile');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchContractor();
    }
  }, [params.id, trackContractorProfileViewed]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00BFA6] mx-auto mb-4"></div>
          <p>Loading contractor profile...</p>
        </div>
      </div>
    );
  }

  if (error || !contractor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Contractor Not Found</h1>
          <p className="text-gray-400 mb-6">The contractor you're looking for doesn't exist.</p>
          <Button 
            onClick={() => router.back()}
            className="bg-[#00BFA6] hover:bg-[#00A693] text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'AVAILABLE':
        return 'bg-green-900/30 text-green-400 border-green-500';
      case 'BUSY':
        return 'bg-yellow-900/30 text-yellow-400 border-yellow-500';
      case 'UNAVAILABLE':
        return 'bg-red-900/30 text-red-400 border-red-500';
      default:
        return 'bg-gray-900/30 text-gray-400 border-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="w-full bg-gray-800/95 backdrop-blur-md shadow-lg border-b border-gray-700/50 sticky top-0 z-50">
        <div className="w-full px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-300 hover:text-white mr-4 transition-[color] duration-200 [transition-timing-function:cubic-bezier(0.4,0,0.2,1)]"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <span className="text-2xl font-bold text-[#00BFA6]">Contractor Profile</span>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-8">
        {/* Profile Header */}
        <Card className="bg-gray-800 border-gray-700 mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={contractor.user.avatar || ''} />
                <AvatarFallback className="text-2xl bg-[#00BFA6] text-white">
                  {contractor.user.name?.charAt(0) || 'C'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-white">{contractor.businessName}</h1>
                  {contractor.isVerified && (
                    <Badge className="bg-green-900/30 text-green-400 border-green-500">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                  <Badge className={getAvailabilityColor(contractor.availability)}>
                    {contractor.availability}
                  </Badge>
                </div>
                {/* NRPG Certified Contractor Badge */}
                {contractor.isVerified && (
                  <div className="no-print inline-flex items-center gap-3 mt-2 mb-4 px-4 py-3 rounded-sm border border-[#0d9488]/50 bg-[#0d9488]/10">
                    {/* Shield with check SVG */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#0d9488"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-9 w-9 flex-shrink-0"
                      aria-hidden="true"
                    >
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      <polyline points="9 12 11 14 15 10" />
                    </svg>
                    <div>
                      <p className="text-[#0d9488] font-semibold text-sm leading-tight">NRPG Certified Contractor</p>
                      <p className="text-[#0d9488]/70 text-xs leading-tight">Verified &amp; Compliant — NRPG Network Member</p>
                    </div>
                  </div>
                )}
                
                <p className="text-gray-400 text-lg mb-4">{contractor.user.name}</p>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {contractor.city}, {contractor.state}
                  </div>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 mr-1 text-yellow-500" />
                    {contractor.rating.toFixed(1)} ({contractor.totalJobs} jobs)
                  </div>
                  <div className="flex items-center">
                    <Award className="h-4 w-4 mr-1" />
                    {contractor.experience} years experience
                  </div>
                </div>
              </div>

              <div className="flex flex-col space-y-3">
                <Button
                  className="bg-[#00BFA6] hover:bg-[#00A693] text-white transition-[background-color] duration-200 [transition-timing-function:cubic-bezier(0.4,0,0.2,1)]"
                  onClick={() => {
                    trackContractorContacted({
                      contractor_id: contractor.id,
                      contractor_name: contractor.businessName,
                      location: `${contractor.city}, ${contractor.state}`,
                    });
                    trackCTA('Contact Contractor', 'Profile Header');
                  }}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contact
                </Button>
                <Button
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700 transition-[background-color] duration-200 [transition-timing-function:cubic-bezier(0.4,0,0.2,1)]"
                  onClick={() => {
                    trackCTA('Book Consultation', 'Profile Header');
                  }}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Book Consultation
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 leading-relaxed">
                  {contractor.bio || 'No bio available.'}
                </p>
              </CardContent>
            </Card>

            {/* Services */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Services Offered</CardTitle>
                <CardDescription className="text-gray-400">
                  Professional services this contractor provides
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {contractor.services.map((service) => (
                    <Badge key={service} className="bg-[#00BFA6] text-white">
                      {service}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Service Areas */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Service Areas</CardTitle>
                <CardDescription className="text-gray-400">
                  Areas where this contractor provides services
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {contractor.serviceAreas.map((area) => (
                    <Badge key={area} variant="outline" className="border-gray-600 text-gray-300">
                      {area}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-[#00BFA6]" />
                  <span className="text-gray-300">{contractor.phone}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-[#00BFA6]" />
                  <span className="text-gray-300">{contractor.user.email}</span>
                </div>
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-[#00BFA6] mt-1" />
                  <div className="text-gray-300">
                    <p>{contractor.address}</p>
                    <p>{contractor.city}, {contractor.state} {contractor.zipCode}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Pricing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3">
                  <DollarSign className="h-5 w-5 text-[#00BFA6]" />
                  <span className="text-2xl font-bold text-white">${contractor.hourlyRate}/hour</span>
                </div>
                <p className="text-gray-400 text-sm mt-2">Hourly rate</p>
              </CardContent>
            </Card>

            {/* Credentials */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Credentials</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {contractor.licenseNumber && (
                  <div className="flex items-center space-x-3">
                    <Award className="h-5 w-5 text-[#00BFA6]" />
                    <div>
                      <p className="text-gray-300 font-medium">License</p>
                      <p className="text-gray-400 text-sm">{contractor.licenseNumber}</p>
                    </div>
                  </div>
                )}
                
                {contractor.insuranceProvider && (
                  <div className="flex items-center space-x-3">
                    <Shield className="h-5 w-5 text-[#00BFA6]" />
                    <div>
                      <p className="text-gray-300 font-medium">Insurance</p>
                      <p className="text-gray-400 text-sm">{contractor.insuranceProvider}</p>
                      {contractor.insuranceExpiry && (
                        <p className="text-gray-400 text-xs">
                          Expires: {new Date(contractor.insuranceExpiry).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Availability */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Availability</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-[#00BFA6]" />
                  <Badge className={getAvailabilityColor(contractor.availability)}>
                    {contractor.availability}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* NRPG Certified — Van Decal QR Code Section */}
        {contractor.isVerified && (
          <div className="mt-8">
            {/* Print styles: only show print-target during print */}
            <style>{`
              @media print {
                .no-print { display: none !important; }
                .print-target {
                  display: flex !important;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  padding: 40px;
                  background: #ffffff;
                  color: #000000;
                }
                .print-target * { color: #000000 !important; }
                body > * { display: none !important; }
                #qr-print-section { display: flex !important; }
              }
              @media screen {
                .print-target { display: none; }
              }
            `}</style>

            {/* Printable target — hidden on screen, visible during print */}
            <div id="qr-print-section" className="print-target">
              <div style={{ textAlign: 'center', padding: '32px', border: '3px solid #0d9488', borderRadius: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '12px' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '28px', height: '28px' }}>
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  <span style={{ fontWeight: 700, fontSize: '18px', color: '#0d9488' }}>NRPG Certified Contractor</span>
                </div>
                <p style={{ fontWeight: 700, fontSize: '16px', marginBottom: '4px' }}>{contractor.businessName}</p>
                <p style={{ fontSize: '13px', color: '#555', marginBottom: '16px' }}>Verified &amp; Compliant — NRPG Network Member</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=${encodeURIComponent(`${SITE_URL}/contractor/${contractor.id}`)}&choe=UTF-8`}
                  alt={`QR code for ${contractor.businessName} NRPG profile`}
                  width={200}
                  height={200}
                  style={{ margin: '0 auto 12px', display: 'block' }}
                />
                <p style={{ fontSize: '12px', color: '#555' }}>Scan to verify certification</p>
                <p style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>nrpg.business</p>
              </div>
            </div>

            {/* On-screen QR Card */}
            <Card className="no-print border border-white/10 rounded-sm" style={{ background: '#0a0a0a' }}>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <QrCode className="h-5 w-5 text-[#0d9488]" />
                  <CardTitle className="text-white text-lg">NRPG Certified — Van Decal QR Code</CardTitle>
                </div>
                <CardDescription className="text-gray-400 mt-1">
                  Place this QR code on your NRPG van decal sticker so clients can verify your certification instantly.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                  {/* QR Code image */}
                  <div className="flex-shrink-0 p-3 rounded-sm border border-white/10 bg-white inline-block">
                    <Image
                      src={`https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=${encodeURIComponent(`${SITE_URL}/contractor/${contractor.id}`)}&choe=UTF-8`}
                      alt={`QR code for ${contractor.businessName} NRPG profile`}
                      width={160}
                      height={160}
                      unoptimized
                    />
                  </div>

                  {/* Info + button */}
                  <div className="space-y-3">
                    <div>
                      <p className="text-white font-medium text-sm mb-1">Scan to view profile</p>
                      <p className="text-gray-400 text-xs break-all font-mono">
                        {`${SITE_URL}/contractor/${contractor.id}`}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <Button
                        className="rounded-sm border border-[#0d9488] bg-[#0d9488]/10 text-[#0d9488] hover:bg-[#0d9488]/20 transition-[background-color] duration-200 [transition-timing-function:cubic-bezier(0.4,0,0.2,1)]"
                        onClick={() => {
                          window.print();
                        }}
                      >
                        <Printer className="h-4 w-4 mr-2" />
                        Download / Print
                      </Button>
                      <Button
                        variant="outline"
                        className="rounded-sm border border-white/10 text-gray-300 hover:bg-white/5 transition-[background-color] duration-200 [transition-timing-function:cubic-bezier(0.4,0,0.2,1)]"
                        asChild
                      >
                        <a
                          href={`https://chart.googleapis.com/chart?chs=400x400&cht=qr&chl=${encodeURIComponent(`${SITE_URL}/contractor/${contractor.id}`)}&choe=UTF-8`}
                          target="_blank"
                          rel="noopener noreferrer"
                          download="nrpg-qr-code.png"
                        >
                          <QrCode className="h-4 w-4 mr-2" />
                          Download QR (High-Res)
                        </a>
                      </Button>
                    </div>

                    <p className="text-gray-400 text-xs">
                      This QR code links clients directly to your verified NRPG profile page.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
