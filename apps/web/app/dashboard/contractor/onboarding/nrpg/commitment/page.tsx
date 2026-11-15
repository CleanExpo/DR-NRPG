'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Loader2,
  ArrowLeft,
  FileSignature,
  CheckCircle2,
  AlertCircle,
  Shield,
  Users,
  Target,
  Award,
  Calendar,
} from 'lucide-react';

const commitmentSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  signature: z.string().min(2, 'Digital signature is required'),
  agreedToEthics: z.boolean().refine((val) => val === true, 'You must agree to the ethics standards'),
  agreedToQuality: z.boolean().refine((val) => val === true, 'You must agree to the quality standards'),
  agreedToCustomer: z.boolean().refine((val) => val === true, 'You must agree to the customer commitment'),
  agreedToContinuousImprovement: z.boolean().refine((val) => val === true, 'You must agree to continuous improvement'),
});

type CommitmentFormValues = z.infer<typeof commitmentSchema>;

interface CommitmentData {
  signed: boolean;
  signedAt: string | null;
  signedName: string | null;
  renewalDue: string | null;
}

const COMMITMENT_SECTIONS = [
  {
    id: 'ethics',
    title: 'Professional Ethics',
    icon: Shield,
    colour: '#EF4444',
    formField: 'agreedToEthics',
    commitments: [
      'Maintain the highest standards of professional integrity',
      'Act with honesty and transparency in all dealings',
      'Protect client confidentiality and privacy',
      'Avoid conflicts of interest and disclose any potential issues',
      'Uphold the reputation of the restoration industry',
    ],
  },
  {
    id: 'quality',
    title: 'Quality Standards',
    icon: Target,
    colour: '#3B82F6',
    formField: 'agreedToQuality',
    commitments: [
      'Follow industry standards for all restoration work',
      'Use proper documentation and moisture mapping protocols',
      'Maintain equipment to manufacturer specifications',
      'Complete work within agreed timeframes',
      'Provide accurate assessments and scopes of work',
    ],
  },
  {
    id: 'customer',
    title: 'Customer Excellence',
    icon: Users,
    colour: '#10B981',
    formField: 'agreedToCustomer',
    commitments: [
      'Treat all clients with respect and empathy',
      'Communicate clearly and proactively throughout projects',
      'Respond to enquiries within 2 business hours',
      'Address complaints promptly and professionally',
      'Strive to exceed customer expectations',
    ],
  },
  {
    id: 'improvement',
    title: 'Continuous Improvement',
    icon: Award,
    colour: '#8B5CF6',
    formField: 'agreedToContinuousImprovement',
    commitments: [
      'Maintain current industry certifications',
      'Complete minimum 20 CECs annually',
      'Attend industry conferences and training',
      'Stay updated on new techniques and technologies',
      'Share knowledge with fellow professionals',
    ],
  },
];

export default function CommitmentPage() {
  const { data: session, status: authStatus } = useSession();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [commitment, setCommitment] = useState<CommitmentData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const form = useForm<CommitmentFormValues>({
    resolver: zodResolver(commitmentSchema),
    defaultValues: {
      fullName: '',
      signature: '',
      agreedToEthics: false,
      agreedToQuality: false,
      agreedToCustomer: false,
      agreedToContinuousImprovement: false,
    },
  });

  const signatureValue = form.watch('signature');

  const fetchCommitment = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/onboarding/nrpg/commitment');
      const data = await res.json();

      if (data.success) {
        setCommitment(data.data);
      } else {
        setError(data.error || 'Failed to load commitment status');
      }
    } catch (err) {
      console.error('Error fetching commitment:', err);
      setError('Failed to load commitment status');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authStatus === 'authenticated') {
      fetchCommitment();
    }
  }, [authStatus, fetchCommitment]);

  const onSubmit = async (values: CommitmentFormValues) => {
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/onboarding/nrpg/commitment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (data.success) {
        setSuccess(true);
        setCommitment(data.data);
      } else {
        setError(data.error || 'Failed to sign commitment');
      }
    } catch (err) {
      console.error('Error signing commitment:', err);
      setError('Failed to sign commitment framework');
    } finally {
      setSubmitting(false);
    }
  };

  if (authStatus === 'loading' || loading) {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="py-12 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#00BFA6]" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (authStatus === 'unauthenticated') {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="py-12 text-center">
            <p className="text-gray-400 mb-4">Please sign in to view the commitment framework</p>
            <Button className="bg-[#00BFA6] hover:bg-[#00A693]">Sign In</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Already signed
  if (commitment?.signed) {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <div className="mb-6">
          <Link
            href="/dashboard/contractor/onboarding/nrpg"
            className="inline-flex items-center text-sm text-gray-400 hover:text-white mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to NRPG Dashboard
          </Link>
        </div>

        <Card className="bg-emerald-500/10 border-emerald-500/20">
          <CardContent className="py-8 text-center">
            <CheckCircle2 className="h-16 w-16 text-emerald-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Commitment Framework Signed</h2>
            <p className="text-gray-400 mb-6">
              Thank you for signing the NRPG Professional Commitment Framework
            </p>

            <div className="bg-gray-800 rounded-lg p-6 max-w-md mx-auto text-left space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Signed by:</span>
                <span className="text-white font-medium">{commitment.signedName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Date signed:</span>
                <span className="text-white font-medium">
                  {commitment.signedAt
                    ? new Date(commitment.signedAt).toLocaleDateString('en-AU', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })
                    : 'N/A'}
                </span>
              </div>
              {commitment.renewalDue && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Renewal due:</span>
                  <span className="text-white font-medium">
                    {new Date(commitment.renewalDue).toLocaleDateString('en-AU', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-6">
              <Link href="/dashboard/contractor/onboarding/nrpg">
                <Button className="bg-[#00BFA6] hover:bg-[#00A693]">
                  Return to Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/dashboard/contractor/onboarding/nrpg"
          className="inline-flex items-center text-sm text-gray-400 hover:text-white mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to NRPG Dashboard
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <FileSignature className="h-6 w-6 text-purple-500" />
              Professional Commitment Framework
            </h1>
            <p className="text-gray-400">
              Review and sign the NRPG commitment to professional standards
            </p>
          </div>
          <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20">
            Required
          </Badge>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6 bg-red-500/10 border-red-500/20">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-6 bg-emerald-500/10 border-emerald-500/20">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <AlertTitle className="text-emerald-400">Success</AlertTitle>
          <AlertDescription className="text-gray-300">
            Commitment framework signed successfully!
          </AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Commitment Sections */}
          {COMMITMENT_SECTIONS.map((section) => {
            const Icon = section.icon;
            return (
              <Card key={section.id} className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div
                      className="p-3 rounded-xl flex-shrink-0"
                      style={{ backgroundColor: `${section.colour}20` }}
                    >
                      <Icon className="h-6 w-6" style={{ color: section.colour }} />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg text-white">{section.title}</CardTitle>
                      <CardDescription className="text-gray-400">
                        I commit to the following standards:
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-4">
                    {section.commitments.map((commitment, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                        <CheckCircle2 className="h-4 w-4 mt-0.5 text-gray-400 flex-shrink-0" />
                        {commitment}
                      </li>
                    ))}
                  </ul>

                  <FormField
                    control={form.control}
                    name={section.formField as keyof CommitmentFormValues}
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border border-gray-700 p-4 bg-gray-900/50">
                        <FormControl>
                          <Checkbox
                            checked={field.value as boolean}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-white">
                            I agree to uphold these {section.title.toLowerCase()} standards
                          </FormLabel>
                          <FormDescription className="text-gray-400 text-xs">
                            This commitment is binding for the duration of your NRPG membership
                          </FormDescription>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            );
          })}

          {/* Signature Section */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg text-white">Digital Signature</CardTitle>
              <CardDescription className="text-gray-400">
                Complete your commitment by providing your digital signature
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Full Legal Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your full name"
                        className="bg-gray-900 border-gray-700 text-white"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="signature"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Electronic Signature</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Type your full legal name to sign"
                        className="bg-gray-900 border-gray-700 text-white font-serif italic"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-gray-400">
                      Typing your full legal name here constitutes your electronic
                      signature on the NRPG Professional Commitment Framework, with
                      the same effect as a handwritten signature.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Signature-styled preview of the typed name (DR-922) */}
              <div className="rounded-lg border border-gray-700 bg-gray-900 px-5 py-4">
                <p className="text-xs uppercase tracking-wider text-gray-500 mb-3">
                  Signature preview
                </p>
                <p
                  aria-live="polite"
                  className={`font-serif italic text-3xl leading-tight break-words ${
                    signatureValue ? 'text-white' : 'text-gray-500'
                  }`}
                >
                  {signatureValue || 'Your signature will appear here'}
                </p>
                <div className="mt-3 border-t border-gray-700 pt-2 flex items-center justify-between text-xs text-gray-500">
                  <span>Signed electronically</span>
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Link href="/dashboard/contractor/onboarding/nrpg">
              <Button variant="outline" className="border-gray-600 text-gray-300">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-[#00BFA6] hover:bg-[#00A693]"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Signing...
                </>
              ) : (
                <>
                  <FileSignature className="h-4 w-4 mr-2" />
                  Sign Commitment Framework
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
