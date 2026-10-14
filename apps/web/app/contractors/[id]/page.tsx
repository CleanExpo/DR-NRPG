import type { Metadata } from "next"
import { SITE_URL } from "@/lib/seo/site-url"
import { notFound } from "next/navigation"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { prisma } from "@/lib/prisma"
import {
  Star,
  Briefcase,
  Clock,
  Shield,
  Award,
  MapPin,
  ArrowLeft,
  CheckCircle,
  Mail,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ReviewList } from "@/components/reviews/review-list"
import { ServiceAreaMap } from "@/components/contractor/ServiceAreaMap"
import {
  LicenseVerificationBadge,
  InsuranceVerificationBadge,
  FullyInsuredBadge,
} from "@/components/contractor/LicenseVerificationBadge"
import Link from "next/link"

const BASE_URL =
  SITE_URL

interface Props {
  params: Promise<{ id: string }>
}

async function getContractor(id: string) {
  const contractor = await prisma.contractor.findUnique({
    where: { id },
    select: {
      id: true,
      businessName: true,
      isVerified: true,
      isActive: true,
      isSuspended: true,
      nrpgVerificationLevel: true,
      nrpgMemberId: true,
      operatingStates: true,
      primaryState: true,
      averageRating: true,
      completedJobs: true,
      averageResponseTimeMinutes: true,
      australianSpecialties: true,
      supportedEmergencyLevels: true,
      licenseNumber: true,
      licenseState: true,
      licenseExpiry: true,
      licenseVerifiedAt: true,
      publicLiabilityPolicyNumber: true,
      publicLiabilityExpiryDate: true,
      publicLiabilityCoverageAmount: true,
      workCoverNumber: true,
      workCoverExpiryDate: true,
      iicrcCertifications: {
        where: {
          isActive: true,
          expiryDate: { gt: new Date() },
        },
        select: {
          certificationLevel: true,
          certificationCode: true,
        },
      },
      serviceAreas: {
        where: { isActive: true },
        select: { state: true },
      },
    },
  })

  // Only return verified, active, non-suspended contractors
  if (
    !contractor ||
    !contractor.isVerified ||
    !contractor.isActive ||
    contractor.isSuspended ||
    contractor.nrpgVerificationLevel !== "VERIFIED"
  ) {
    return null
  }

  return contractor
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const contractor = await getContractor(params.id)
  if (!contractor) {
    return { title: "Contractor Not Found" }
  }

  const title = `${contractor.businessName} | NRPG Verified Contractor`
  const description = `${contractor.businessName} is an NRPG verified disaster recovery contractor with ${contractor.completedJobs} completed jobs and a ${Number(contractor.averageRating).toFixed(1)} star rating. IICRC certified across ${contractor.operatingStates.join(", ")}.`

  return {
    title,
    description,
    alternates: {
      canonical: `${BASE_URL}/contractors/${params.id}`,
    },
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/contractors/${params.id}`,
      siteName: "NRPG - Disaster Recovery Australia",
      type: "profile",
      locale: "en_AU",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  }
}

function formatServiceType(type: string): string {
  return type
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default async function PublicContractorProfilePage(props: Props) {
  const params = await props.params;
  const contractor = await getContractor(params.id)

  if (!contractor) {
    notFound()
  }

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "ProfessionalService",
      name: contractor.businessName,
      description: `NRPG verified disaster recovery contractor specialising in ${contractor.australianSpecialties.slice(0, 3).map(formatServiceType).join(", ")}.`,
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: Number(contractor.averageRating).toFixed(1),
        reviewCount: contractor.completedJobs,
        bestRating: "5",
        worstRating: "1",
      },
      areaServed: contractor.operatingStates.map((state) => ({
        "@type": "State",
        name: state,
        containedInPlace: {
          "@type": "Country",
          name: "Australia",
        },
      })),
      hasCredential: contractor.iicrcCertifications.map((cert) => ({
        "@type": "EducationalOccupationalCredential",
        name: `IICRC ${cert.certificationLevel}${cert.certificationCode ? ` (${cert.certificationCode})` : ''}`,
        credentialCategory: "certification",
        recognizedBy: {
          "@type": "Organization",
          name: "IICRC \u2014 Institute of Inspection, Cleaning and Restoration Certification",
        },
      })),
      url: `${BASE_URL}/contractors/${params.id}`,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
        {
          "@type": "ListItem",
          position: 2,
          name: "Find a Contractor",
          item: `${BASE_URL}/contractors/directory`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: contractor.businessName,
          item: `${BASE_URL}/contractors/${params.id}`,
        },
      ],
    },
  ]

  // Deduplicate operating states from service areas
  const serviceStates = [
    ...new Set(contractor.serviceAreas.map((sa) => sa.state)),
  ]

  return (
    <div className="min-h-screen bg-[#0F1115] text-[#F9FAFB]">
      <Header />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="py-24">
        {/* Breadcrumb */}
        <section className="container mx-auto px-6 mb-8">
          <Link
            href="/contractors/directory"
            className="inline-flex items-center text-[#9CA3AF] hover:text-[#00BFA6] transition-colors text-sm"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Contractor Directory
          </Link>
        </section>

        {/* Profile Header */}
        <section className="container mx-auto px-6 mb-12">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-8 border border-[#374151]">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                <div>
                  {/* Business Name & Verified Badge */}
                  <div className="flex items-center gap-3 mb-3">
                    <h1 className="font-poppins font-bold text-3xl md:text-4xl text-[#F9FAFB]">
                      {contractor.businessName}
                    </h1>
                    <Badge className="bg-[#00BFA6]/10 text-[#00BFA6] border-[#00BFA6]/30 flex items-center gap-1">
                      <CheckCircle className="h-3.5 w-3.5" />
                      Verified
                    </Badge>
                  </div>

                  {/* NRPG Member ID */}
                  {contractor.nrpgMemberId && (
                    <div className="flex items-center gap-2 mb-4">
                      <Shield className="h-4 w-4 text-[#00BFA6]" />
                      <span className="text-sm text-[#00BFA6] font-medium">
                        NRPG Member: {contractor.nrpgMemberId}
                      </span>
                    </div>
                  )}

                  {/* Operating States */}
                  <div className="flex items-center gap-2 text-[#9CA3AF]">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm">
                      {contractor.operatingStates.join(", ")}
                    </span>
                  </div>
                </div>

                {/* CTA */}
                <div className="flex flex-col gap-3 md:items-end">
                  <Link href="/claim">
                    <Button className="bg-[#00BFA6] hover:bg-[#00A693] text-[#0F1115] font-semibold px-8 py-3 text-lg">
                      Request a Quote
                    </Button>
                  </Link>
                  <Link
                    href="/contact"
                    className="text-sm text-[#9CA3AF] hover:text-[#00BFA6] transition-colors flex items-center gap-1.5"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    Contact via NRPG
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* License & Insurance Verification */}
        {(contractor.licenseState || contractor.publicLiabilityPolicyNumber) && (
          <section className="container mx-auto px-6 mb-12">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-poppins font-semibold text-2xl text-white mb-6">
                Licensing & Insurance
              </h2>

              <div className="space-y-4">
                {/* Fully Insured Badge */}
                {contractor.publicLiabilityPolicyNumber && contractor.workCoverNumber && (
                  <div className="flex justify-center mb-6">
                    <FullyInsuredBadge
                      hasPublicLiability={!!contractor.publicLiabilityPolicyNumber}
                      hasWorkCover={!!contractor.workCoverNumber}
                    />
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  {/* License Verification */}
                  {contractor.licenseState && contractor.licenseVerifiedAt && (
                    <LicenseVerificationBadge
                      licenseState={contractor.licenseState}
                      licenseExpiry={contractor.licenseExpiry}
                      isVerified={true}
                      licenseNumber={contractor.licenseNumber || undefined}
                    />
                  )}

                  {/* Public Liability Insurance */}
                  {contractor.publicLiabilityPolicyNumber && (
                    <InsuranceVerificationBadge
                      coverageAmount={contractor.publicLiabilityCoverageAmount || ''}
                      expiryDate={contractor.publicLiabilityExpiryDate}
                      policyNumber={contractor.publicLiabilityPolicyNumber}
                      insuranceType="public_liability"
                    />
                  )}

                  {/* WorkCover */}
                  {contractor.workCoverNumber && (
                    <InsuranceVerificationBadge
                      coverageAmount="Active"
                      expiryDate={contractor.workCoverExpiryDate}
                      policyNumber={contractor.workCoverNumber}
                      insuranceType="work_cover"
                    />
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Stats */}
        <section className="container mx-auto px-6 mb-12">
          <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] text-center">
              <div className="flex items-center justify-center gap-2 text-[#FFD700] mb-2">
                <Star className="h-6 w-6 fill-current" />
                <span className="text-3xl font-bold">
                  {Number(contractor.averageRating).toFixed(1)}
                </span>
              </div>
              <div className="text-[#9CA3AF] text-sm">Rating</div>
            </div>
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] text-center">
              <div className="flex items-center justify-center gap-2 text-[#2196F3] mb-2">
                <Briefcase className="h-6 w-6" />
                <span className="text-3xl font-bold">
                  {contractor.completedJobs}
                </span>
              </div>
              <div className="text-[#9CA3AF] text-sm">Jobs Completed</div>
            </div>
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] text-center">
              <div className="flex items-center justify-center gap-2 text-[#7C4DFF] mb-2">
                <Clock className="h-6 w-6" />
                <span className="text-3xl font-bold">
                  {contractor.averageResponseTimeMinutes > 0
                    ? `${contractor.averageResponseTimeMinutes}m`
                    : "N/A"}
                </span>
              </div>
              <div className="text-[#9CA3AF] text-sm">Avg Response Time</div>
            </div>
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] text-center">
              <div className="flex items-center justify-center gap-2 text-[#00BFA6] mb-2">
                <Award className="h-6 w-6" />
                <span className="text-3xl font-bold">
                  {contractor.iicrcCertifications.length}
                </span>
              </div>
              <div className="text-[#9CA3AF] text-sm">IICRC Certifications</div>
            </div>
          </div>
        </section>

        {/* Specialties */}
        {contractor.australianSpecialties.length > 0 && (
          <section className="container mx-auto px-6 mb-12">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-poppins font-semibold text-2xl text-white mb-6">
                Services Offered
              </h2>
              <div className="flex flex-wrap gap-3">
                {contractor.australianSpecialties.map((spec) => (
                  <Badge
                    key={spec}
                    variant="outline"
                    className="border-[#2196F3]/30 text-[#2196F3] px-4 py-2 text-sm"
                  >
                    {formatServiceType(spec)}
                  </Badge>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* IICRC Certifications */}
        {contractor.iicrcCertifications.length > 0 && (
          <section className="container mx-auto px-6 mb-12">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-poppins font-semibold text-2xl text-white mb-6">
                IICRC Certifications
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {contractor.iicrcCertifications.map((cert, i) => (
                  <div
                    key={i}
                    className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-xl p-4 border border-[#374151] flex items-center gap-3"
                  >
                    <Award className="h-6 w-6 text-[#00BFA6] flex-shrink-0" />
                    <div>
                      <div className="font-medium text-[#F9FAFB] text-sm">
                        {cert.certificationLevel}
                      </div>
                      {cert.certificationCode && (
                        <div className="text-xs text-[#6B7280]">
                          Code: {cert.certificationCode}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Service Areas */}
        {(contractor.operatingStates.length > 0 ||
          serviceStates.length > 0) && (
          <section className="container mx-auto px-6 mb-12">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-poppins font-semibold text-2xl text-white mb-6">
                Service Areas
              </h2>
              <div className="flex flex-wrap gap-3">
                {contractor.operatingStates.map((state) => (
                  <Badge
                    key={state}
                    variant="outline"
                    className="border-[#7C4DFF]/30 text-[#7C4DFF] px-4 py-2 text-sm"
                  >
                    <MapPin className="h-3.5 w-3.5 mr-1.5" />
                    {state}
                  </Badge>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Service Coverage Map */}
        <section className="container mx-auto px-6 mb-12">
          <div className="max-w-4xl mx-auto">
            <ServiceAreaMap
              contractorId={contractor.id}
              primaryState={contractor.primaryState || contractor.operatingStates[0]}
            />
          </div>
        </section>

        {/* Emergency Levels */}
        {contractor.supportedEmergencyLevels.length > 0 && (
          <section className="container mx-auto px-6 mb-12">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-poppins font-semibold text-2xl text-white mb-6">
                Response Capability
              </h2>
              <div className="flex flex-wrap gap-3">
                {contractor.supportedEmergencyLevels.map((level) => (
                  <Badge
                    key={level}
                    variant="outline"
                    className="border-[#FFD700]/30 text-[#FFD700] px-4 py-2 text-sm"
                  >
                    <Clock className="h-3.5 w-3.5 mr-1.5" />
                    {formatServiceType(level)}
                  </Badge>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Client Reviews */}
        <section className="container mx-auto px-6 mb-12">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-poppins font-semibold text-2xl text-white mb-6">
              Client Reviews
            </h2>
            <ReviewList
              contractorId={contractor.id}
              showClientNames={true}
              editable={false}
              limit={5}
            />
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-[#00BFA6] to-[#2196F3] rounded-2xl p-12 text-center">
            <h2 className="font-poppins font-bold text-3xl text-white mb-4">
              Need {contractor.businessName}&apos;s Services?
            </h2>
            <p className="text-lg text-white/90 mb-8">
              Submit a service request and we&apos;ll connect you with this
              contractor.
            </p>
            <Link href="/claim">
              <Button className="bg-white hover:bg-white/90 text-[#0F1115] font-bold text-xl px-12 py-4">
                Request a Quote
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
