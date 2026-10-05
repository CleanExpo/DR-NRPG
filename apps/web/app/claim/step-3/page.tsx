// @ts-nocheck

/**
 * Claim Wizard - Step 3: Details & Insurance
 *
 * Final step in the AI-automated claim reporting wizard
 * Collects detailed damage information:
 * - Damage description
 * - Photo uploads (optional)
 * - Insurance information
 * - CAPTCHA verification
 * - Final submission
 */

'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronLeft, CheckCircle, AlertCircle } from 'lucide-react';

import { FormInput } from '@/src/design-system/components/Form/FormInput';
import { FormTextarea } from '@/src/design-system/components/Form/FormTextarea';
import { Button } from '@/src/design-system/components/Button/Button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PageTransition } from '@/src/design-system/components/Layout/PageTransition';
import { HCaptcha } from '@/components/captcha/HCaptcha';
import { PhotoUpload, type UploadedPhoto } from '@/components/upload/PhotoUpload';

import {
  type DetailsInsuranceData,
  type ClaimFormState,
  type CompleteClaimData,
  detailsInsuranceSchema,
  calculatePriority,
} from '@/lib/claim-wizard/types';
import {
  saveClaimProgress,
  loadClaimProgress,
  clearClaimProgress,
} from '@/lib/claim-wizard/storage';

export default function ClaimStep3Page() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [uploadedPhotos, setUploadedPhotos] = React.useState<UploadedPhoto[]>([]);
  const [captchaToken, setCaptchaToken] = React.useState<string>('');
  // DR-949: the widget used to render only after a submit click, but Submit is
  // disabled until a token exists, so it could never appear. It now renders up
  // front; if it cannot load, an in-flow fallback (retry / contact form) shows.
  const [captchaUnavailable, setCaptchaUnavailable] = React.useState(false);
  const [captchaAttempt, setCaptchaAttempt] = React.useState(0);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  // Load existing progress
  const existingState = React.useMemo(() => loadClaimProgress(), []);

  // Redirect if previous steps not completed
  React.useEffect(() => {
    if (!existingState?.step1 || !existingState?.step2) {
      router.push('/claim/step-1');
    }
  }, [existingState, router]);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
    getValues,
  } = useForm<DetailsInsuranceData>({
    resolver: zodResolver(detailsInsuranceSchema),
    mode: 'onChange', // Validate as user types for real-time feedback
    defaultValues: existingState?.step3 || {
      damageDescription: '',
      hasInsurance: undefined,
      insuranceProvider: '',
      policyNumber: '',
      photoUrls: [],
    },
  });

  const hasInsurance = watch('hasInsurance');
  const damageDescription = watch('damageDescription');

  // Handle photo changes from PhotoUpload component
  const handlePhotosChange = (photos: UploadedPhoto[]) => {
    setUploadedPhotos(photos);
    // Store URLs for form submission
    setValue('photoUrls', photos.map((p) => p.url));
  };

  // Handle CAPTCHA verification
  const handleCaptchaVerify = (token: string) => {
    setCaptchaToken(token);
    setCaptchaUnavailable(false);
  };

  // Handle CAPTCHA expiry
  const handleCaptchaExpire = () => {
    setCaptchaToken('');
  };

  // Handle CAPTCHA error
  const handleCaptchaError = (error: string) => {
    console.error('CAPTCHA error:', error);
    setCaptchaUnavailable(true);
  };

  // Remount the widget for another attempt
  const handleCaptchaRetry = () => {
    setCaptchaUnavailable(false);
    setCaptchaAttempt((n) => n + 1);
  };

  const onSubmit = async (data: DetailsInsuranceData) => {
    // Never submit without a CAPTCHA token; the server verifies it as well
    if (!captchaToken) {
      return;
    }

    setIsLoading(true);

    try {
      // Prepare complete claim data
      const completeData: CompleteClaimData = {
        step1: existingState!.step1!,
        step2: existingState!.step2!,
        step3: data,
        captchaToken,
      };

      // Calculate priority
      const priority = calculatePriority(existingState!);

      // Submit to API with timeout
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      try {
        const response = await fetch('/api/public/claims/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...completeData,
            priority,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeout);

        // Handle rate limiting
        if (response.status === 429) {
          setSubmitError(
            'Too many claim submissions from your location. Please wait an hour before submitting another claim.'
          );
          setIsLoading(false);
          return;
        }

        // Handle validation errors
        if (response.status === 400) {
          const errorData = await response.json();
          setSubmitError(
            errorData.error || 'Please check all required fields are filled correctly.'
          );
          setIsLoading(false);
          return;
        }

        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }

        const result = await response.json();

        // Clear saved progress
        clearClaimProgress();

        // Navigate to success page
        router.push(`/claim/success?claimId=${result.claimId}`);
      } catch (fetchError) {
        clearTimeout(timeout);

        if (fetchError instanceof TypeError && fetchError.message === 'Failed to fetch') {
          setSubmitError(
            'Network connection failed. Please check your internet connection and try again.'
          );
        } else if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          setSubmitError(
            'Request timeout. Your connection may be slow. Please check your connection and try again.'
          );
        } else {
          setSubmitError(
            'Failed to submit claim. Please check your connection and try again.'
          );
        }
      }
    } catch (error) {
      console.error('Unexpected error during claim submission:', error);
      setSubmitError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    // Save current form data (using React Hook Form state, not DOM)
    const formData = getValues();

    const formState: ClaimFormState = {
      ...existingState,
      step3: formData,
      currentStep: 2,
      startedAt: existingState?.startedAt || new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString(),
    };

    saveClaimProgress(formState);
    router.push('/claim/step-2');
  };

  return (
    <PageTransition variant="fadeInUp">
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Report a Claim</h1>
            <div className="text-sm text-gray-400">Step 3 of 3</div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-dr-emergency h-2 rounded-full" style={{ width: '100%' }} />
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Damage Details & Insurance
          </h2>

          {/* Submit Error */}
          {submitError && (
            <Alert className="mb-6 border-red-600 bg-red-50">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <AlertDescription className="text-red-900">{submitError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Damage Description */}
            <FormTextarea
              label="Describe the damage"
              placeholder="Please describe what happened and the extent of the damage. Include details like affected rooms, visible damage, and any immediate concerns..."
              error={errors.damageDescription?.message}
              helpText={`${damageDescription?.length || 0}/1000 characters (minimum 20)`}
              context="emergency"
              required
              showCharCount
              maxLength={1000}
              rows={6}
              {...register('damageDescription')}
            />

            {/* Photo Upload */}
            <div className="space-y-3">
              <label className="block text-base font-medium text-foreground">
                Upload Photos (Optional)
              </label>
              <p className="text-sm text-gray-400">
                Photos help contractors assess the damage faster. You can upload up to 5 photos.
              </p>

              <PhotoUpload
                photos={uploadedPhotos}
                onPhotosChange={handlePhotosChange}
                maxPhotos={5}
                folder="claims"
              />
            </div>

            {/* Insurance Information */}
            <div className="border-t border-gray-200 pt-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Insurance Information
              </h3>

              {/* Has Insurance */}
              <div className="space-y-2 mb-6">
                <label className="block text-base font-medium text-foreground">
                  Do you have insurance? <span className="text-destructive ml-1">*</span>
                </label>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      value="yes"
                      className="h-5 w-5 text-dr-emergency focus:ring-dr-emergency"
                      {...register('hasInsurance')}
                    />
                    <span className="text-base">Yes, I have insurance</span>
                  </label>
                  <label className="flex items-center space-x-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      value="no"
                      className="h-5 w-5 text-dr-emergency focus:ring-dr-emergency"
                      {...register('hasInsurance')}
                    />
                    <span className="text-base">No, I'll be paying directly</span>
                  </label>
                </div>
                {errors.hasInsurance && (
                  <p className="text-sm text-destructive font-medium" role="alert">
                    {errors.hasInsurance.message}
                  </p>
                )}
              </div>

              {/* Insurance Provider (conditional) */}
              {hasInsurance === 'yes' && (
                <div className="space-y-6">
                  <FormInput
                    type="text"
                    label="Insurance Provider"
                    placeholder="e.g., NRMA, Allianz, QBE"
                    error={errors.insuranceProvider?.message}
                    context="emergency"
                    required={hasInsurance === 'yes'}
                    id="insurance-provider"
                    {...register('insuranceProvider')}
                  />

                  <FormInput
                    type="text"
                    label="Policy Number (Optional)"
                    placeholder="Your policy number"
                    error={errors.policyNumber?.message}
                    helpText="This helps contractors process your claim faster"
                    context="emergency"
                    id="policy-number"
                    {...register('policyNumber')}
                  />
                </div>
              )}
            </div>

            {/* CAPTCHA Verification */}
            {!captchaToken && (
              <div className="border border-gray-300 rounded-lg p-6" data-testid="claim-captcha">
                <p className="text-sm text-gray-700 mb-4 text-center">
                  Please verify you're human before submitting
                </p>
                {captchaUnavailable && (
                  <Alert className="mb-4 border-red-600 bg-red-50" data-testid="claim-captcha-fallback">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <AlertDescription className="text-red-900">
                      <p className="mb-3">
                        We couldn't load the security check, so your claim can't be submitted
                        yet. Please try the check again to submit your claim. If it still won't
                        load, our support team can help with the problem, but the contact form
                        does not submit your claim.
                      </p>
                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={handleCaptchaRetry}
                          className="underline font-medium"
                        >
                          Try the security check again
                        </button>
                        <Link href="/contact" className="underline font-medium">
                          Get help from support
                        </Link>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
                <HCaptcha
                  key={captchaAttempt}
                  onVerify={handleCaptchaVerify}
                  onExpire={handleCaptchaExpire}
                  onError={handleCaptchaError}
                  theme="light"
                  size="normal"
                />
              </div>
            )}

            {/* CAPTCHA Verified */}
            {captchaToken && (
              <Alert className="border-green-600 bg-green-50">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <AlertDescription className="text-green-900">
                  Verification complete. You can now submit your claim.
                </AlertDescription>
              </Alert>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={handleBack}
                icon={<ChevronLeft className="h-5 w-5" />}
                iconPosition="left"
              >
                Back
              </Button>

              <Button
                type="submit"
                variant="emergency-primary"
                size="crisis"
                loading={isLoading}
                disabled={isLoading || !isValid || !captchaToken}
                title={!isValid ? 'Please fill in all required fields' : !captchaToken ? 'Please complete CAPTCHA verification' : ''}
              >
                {isLoading ? 'Submitting...' : 'Submit Claim'}
              </Button>
            </div>
          </form>
        </div>

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400">
            Your claim is encrypted and will be matched with certified contractors in your area.
          </p>
        </div>
      </div>
    </div>
    </PageTransition>
  );
}
