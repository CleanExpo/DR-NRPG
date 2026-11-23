// @ts-nocheck

/**
 * Claim Wizard - Step 2: Location & Contact
 *
 * Second step in the AI-automated claim reporting wizard
 * Collects contact and location information:
 * - Property address (with GPS auto-detection)
 * - Suburb and postcode
 * - Name, phone, email
 */

'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronRight, ChevronLeft, MapPin, Loader2, AlertCircle } from 'lucide-react';

import { FormInput } from '@/src/design-system/components/Form/FormInput';
import { Button } from '@/src/design-system/components/Button/Button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CookieSettingsButton } from '@/components/analytics/CookieSettingsButton';
import { PageTransition } from '@/src/design-system/components/Layout/PageTransition';

import {
  type LocationContactData,
  type ClaimFormState,
  locationContactSchema,
} from '@/lib/claim-wizard/types';
import {
  saveClaimProgress,
  loadClaimProgress,
  getCurrentLocation,
} from '@/lib/claim-wizard/storage';

export default function ClaimStep2Page() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = React.useState(false);
  const [locationError, setLocationError] = React.useState<string | null>(null);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  // Load existing progress
  const existingState = React.useMemo(() => loadClaimProgress(), []);

  // Redirect if step 1 not completed
  React.useEffect(() => {
    if (!existingState?.step1) {
      router.push('/claim/step-1');
    }
  }, [existingState, router]);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
    getValues,
    trigger,
  } = useForm<LocationContactData>({
    resolver: zodResolver(locationContactSchema),
    mode: 'onChange', // Changed from 'onBlur' to validate as user types
    defaultValues: existingState?.step2 || {
      propertyAddress: '',
      suburb: '',
      postcode: '',
      name: '',
      phone: '',
      email: '',
    },
  });

  // GPS Location Detection
  const handleDetectLocation = async () => {
    setIsDetectingLocation(true);
    setLocationError(null);

    try {
      const result = await getCurrentLocation();

      if (result.success && result.latitude && result.longitude) {
        // In production, this would reverse geocode to get the actual address
        // For now, show success message and let user manually enter
        setLocationError(
          `Location detected (${result.latitude.toFixed(4)}, ${result.longitude.toFixed(
            4
          )}). Please enter your address manually for now.`
        );
      } else {
        setLocationError(result.error || 'Unable to detect location');
      }
    } catch (error) {
      setLocationError('Failed to detect location. Please enter manually.');
    } finally {
      setIsDetectingLocation(false);
    }
  };

  const onSubmit = async (data: LocationContactData) => {
    setIsLoading(true);
    setSubmitError(null);
    console.log('Step 2 form submitted with data:', data);

    try {
      // Validate data one more time before submit
      const validationResult = locationContactSchema.safeParse(data);
      if (!validationResult.success) {
        const errors = validationResult.error.flatten();
        setSubmitError('Please check all required fields are filled correctly');
        console.error('Validation failed:', errors);
        setIsLoading(false);
        return;
      }

      // Save progress to localStorage
      const formState: ClaimFormState = {
        ...existingState,
        step2: data,
        currentStep: 3,
        completedSteps: [...new Set([...(existingState?.completedSteps || []), 1, 2])],
        startedAt: existingState?.startedAt || new Date().toISOString(),
        lastUpdatedAt: new Date().toISOString(),
      };

      console.log('Saving step 2 progress:', formState);
      saveClaimProgress(formState);

      // Navigate to step 3
      console.log('Navigating to /claim/step-3');
      await router.push('/claim/step-3');
    } catch (error) {
      console.error('Failed to save progress:', error);
      setSubmitError('Failed to save progress. Please try again.');
      // Continue anyway
      await router.push('/claim/step-3');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    // Save current form data (using React Hook Form state, not DOM)
    const formData = getValues();

    const formState: ClaimFormState = {
      ...existingState,
      step2: formData,
      currentStep: 1,
      startedAt: existingState?.startedAt || new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString(),
    };

    saveClaimProgress(formState);
    router.push('/claim/step-1');
  };

  return (
    <PageTransition variant="fadeInUp">
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Report a Claim</h1>
            <div className="text-sm text-gray-400">Step 2 of 3</div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-dr-emergency h-2 rounded-full" style={{ width: '66%' }} />
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Location & Contact Information
          </h2>

          {/* Submit Error */}
          {submitError && (
            <Alert className="mb-6 border-red-600 bg-red-50">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <AlertDescription className="text-red-900">{submitError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* GPS Location Detection */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900 mb-2">
                    Auto-detect your location
                  </p>
                  <p className="text-xs text-blue-700">
                    We can use your device's GPS to help fill in your address
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleDetectLocation}
                  disabled={isDetectingLocation}
                  icon={
                    isDetectingLocation ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <MapPin className="h-4 w-4" />
                    )
                  }
                >
                  {isDetectingLocation ? 'Detecting...' : 'Detect'}
                </Button>
              </div>
              {locationError && (
                <p className="mt-2 text-xs text-blue-800">{locationError}</p>
              )}
            </div>

            {/* Property Address */}
            <FormInput
              type="text"
              label="Property Address"
              placeholder="123 Main Street"
              error={errors.propertyAddress?.message}
              helpText="Street address where the damage occurred"
              context="emergency"
              required
              id="property-address"
              {...register('propertyAddress')}
            />

            {/* Suburb */}
            <FormInput
              type="text"
              label="Suburb"
              placeholder="Sydney"
              error={errors.suburb?.message}
              context="emergency"
              required
              id="suburb"
              {...register('suburb')}
            />

            {/* Postcode */}
            <FormInput
              type="text"
              label="Postcode"
              placeholder="2000"
              error={errors.postcode?.message}
              helpText="4-digit Australian postcode"
              context="emergency"
              required
              maxLength={4}
              id="postcode"
              {...register('postcode')}
            />

            <div className="border-t border-gray-200 pt-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Your Contact Information
              </h3>

              {/* Name */}
              <div className="space-y-6">
                <FormInput
                  type="text"
                  label="Full Name"
                  placeholder="John Smith"
                  error={errors.name?.message}
                  context="emergency"
                  required
                  id="name"
                  {...register('name')}
                />

                {/* Phone */}
                <FormInput
                  type="tel"
                  label="Phone Number"
                  placeholder="0412 345 678"
                  error={errors.phone?.message}
                  helpText="Australian mobile or landline number"
                  context="emergency"
                  required
                  id="phone"
                  {...register('phone')}
                />

                {/* Email */}
                <FormInput
                  type="email"
                  label="Email Address"
                  placeholder="john@example.com"
                  error={errors.email?.message}
                  helpText="We'll send confirmation and updates to this email"
                  context="emergency"
                  required
                  id="email"
                  {...register('email')}
                />
              </div>
            </div>

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
                disabled={isLoading || !isValid}
                icon={<ChevronRight className="h-5 w-5" />}
                iconPosition="right"
                title={!isValid ? 'Please fill in all required fields' : ''}
              >
                {isLoading ? 'Processing...' : 'Next: Damage Details'}
              </Button>
            </div>
          </form>
        </div>

        {/* Privacy Notice */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400">
            Your contact information is kept private and only shared with matched contractors.
          </p>
          {/* The claim pages have no site footer, so the cookie control sits here. */}
          <CookieSettingsButton className="text-sm text-gray-600 underline hover:text-gray-900 transition-colors focus-visible:ring-blue-700 focus-visible:ring-offset-white" />
        </div>
      </div>
    </div>
    </PageTransition>
  );
}
