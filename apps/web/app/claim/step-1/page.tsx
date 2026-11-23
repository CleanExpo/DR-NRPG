/**
 * Claim Wizard - Step 1: Triage (Emergency Assessment)
 *
 * First step in the AI-automated claim reporting wizard
 * Collects critical triage information:
 * - Disaster type
 * - Incident timing
 * - Ongoing status
 * - Emergency/danger status
 */

'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, ChevronRight, ChevronLeft } from 'lucide-react';

import { FormInput } from '@/src/design-system/components/Form/FormInput';
import { FormSelect } from '@/src/design-system/components/Form/FormSelect';
import { Button } from '@/src/design-system/components/Button/Button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CookieSettingsButton } from '@/components/analytics/CookieSettingsButton';
import { PageTransition, AnimatedItem } from '@/src/design-system/components/Layout/PageTransition';

import {
  type TriageData,
  type ClaimFormState,
  triageSchema,
  disasterTypes,
  getDisasterTypeDetails,
} from '@/lib/claim-wizard/types';
import {
  saveClaimProgress,
  loadClaimProgress,
} from '@/lib/claim-wizard/storage';
import { AUSTRALIAN_DISASTER_TYPES } from '@/lib/disaster-types/australian-disasters';

export default function ClaimStep1Page() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  // Load existing progress
  const existingState = React.useMemo(() => loadClaimProgress(), []);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    trigger,
  } = useForm<TriageData>({
    resolver: zodResolver(triageSchema),
    mode: 'onChange', // Changed from 'onBlur' to validate as user types
    defaultValues: existingState?.step1 || {
      disasterType: '', // Changed from undefined to empty string
      incidentDate: '',
      isOngoing: 'no', // Changed from undefined to default value
      isEmergency: 'no', // Changed from undefined to default value
    },
  });

  // Watch emergency status and disaster type for conditional UI
  const isEmergency = watch('isEmergency');
  const selectedDisasterType = watch('disasterType');

  // Get disaster type details for contextual help
  const disasterTypeDetails = React.useMemo(() => {
    return selectedDisasterType ? getDisasterTypeDetails(selectedDisasterType) : null;
  }, [selectedDisasterType]);

  // Debug: Log validation errors whenever they change
  React.useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.log('Form validation errors:', errors);
    }
  }, [errors]);

  const onSubmit = async (data: TriageData) => {
    setIsLoading(true);
    setSubmitError(null);
    console.log('Form submitted with data:', data);

    try {
      // Validate data one more time before submit
      const validationResult = triageSchema.safeParse(data);
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
        step1: data,
        currentStep: 2,
        completedSteps: [...(existingState?.completedSteps || []), 1],
        startedAt: existingState?.startedAt || new Date().toISOString(),
        lastUpdatedAt: new Date().toISOString(),
      };

      console.log('Saving form state:', formState);
      saveClaimProgress(formState);
      console.log('Form state saved successfully');

      // Navigate to step 2
      console.log('Navigating to /claim/step-2');
      await router.push('/claim/step-2');
      console.log('Navigation completed');
    } catch (error) {
      console.error('Failed to save progress:', error);
      setSubmitError('Failed to save progress. Please try again.');
      // Continue anyway - don't block user
      await router.push('/claim/step-2');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageTransition variant="fadeInUp">
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Report a Claim</h1>
            <div className="text-sm text-gray-400">Step 1 of 3</div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-dr-emergency h-2 rounded-full" style={{ width: '33%' }} />
          </div>
        </div>

        {/* Emergency Alert */}
        {isEmergency === 'yes' && (
          <Alert className="mb-6 border-red-600 bg-red-50">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <AlertDescription className="text-red-900">
              <strong>Emergency Detected:</strong> Your claim will be marked as critical priority.
              Contractors will be notified immediately.
            </AlertDescription>
          </Alert>
        )}

        {/* Submit Error */}
        {submitError && (
          <Alert className="mb-6 border-red-600 bg-red-50">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <AlertDescription className="text-red-900">{submitError}</AlertDescription>
          </Alert>
        )}

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Emergency Assessment
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Disaster Type */}
            <FormSelect
              label="What happened?"
              options={disasterTypes}
              placeholder="Select disaster type"
              error={errors.disasterType?.message}
              context="emergency"
              required
              {...register('disasterType')}
            />

            {/* Incident Date */}
            <FormInput
              type="datetime-local"
              label="When did this happen?"
              error={errors.incidentDate?.message}
              helpText="Select the date and time when the damage occurred"
              context="emergency"
              required
              {...register('incidentDate')}
            />

            {/* Is Ongoing */}
            <div className="space-y-2">
              <label className="block text-base font-medium text-foreground">
                Is it still happening? <span className="text-destructive ml-1">*</span>
              </label>
              <div className="space-y-3">
                <label className="flex items-center space-x-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    value="yes"
                    className="h-5 w-5 text-dr-emergency focus:ring-dr-emergency"
                    {...register('isOngoing')}
                  />
                  <span className="text-base">Yes, the damage is ongoing</span>
                </label>
                <label className="flex items-center space-x-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    value="no"
                    className="h-5 w-5 text-dr-emergency focus:ring-dr-emergency"
                    {...register('isOngoing')}
                  />
                  <span className="text-base">No, it has stopped</span>
                </label>
              </div>
              {errors.isOngoing && (
                <p className="text-sm text-destructive font-medium" role="alert">
                  {errors.isOngoing.message}
                </p>
              )}
            </div>

            {/* Is Emergency */}
            <div className="space-y-2">
              <label className="block text-base font-medium text-foreground">
                Is anyone in danger? <span className="text-destructive ml-1">*</span>
              </label>
              <div className="space-y-3">
                <label className="flex items-center space-x-3 p-4 border border-red-400 bg-red-50 rounded-lg cursor-pointer hover:bg-red-100 transition-colors">
                  <input
                    type="radio"
                    value="yes"
                    className="h-5 w-5 text-red-600 focus:ring-red-600"
                    {...register('isEmergency')}
                  />
                  <span className="text-base font-semibold text-red-900">
                    YES - Someone is in danger
                  </span>
                </label>
                <label className="flex items-center space-x-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    value="no"
                    className="h-5 w-5 text-dr-emergency focus:ring-dr-emergency"
                    {...register('isEmergency')}
                  />
                  <span className="text-base">No, everyone is safe</span>
                </label>
              </div>
              {errors.isEmergency && (
                <p className="text-sm text-destructive font-medium" role="alert">
                  {errors.isEmergency.message}
                </p>
              )}
            </div>

            {/* Contextual Help based on selected disaster type */}
            {disasterTypeDetails && (
              <Alert className="border-blue-600 bg-blue-50">
                <AlertCircle className="h-5 w-5 text-blue-600" />
                <AlertDescription className="text-blue-900">
                  <strong>{disasterTypeDetails.label}:</strong> {disasterTypeDetails.description}
                  {disasterTypeDetails.seasonal && (
                    <span className="block mt-2">
                      <strong>Season:</strong> {disasterTypeDetails.seasonal.start} - {disasterTypeDetails.seasonal.end}
                    </span>
                  )}
                  {disasterTypeDetails.buildingCode && (
                    <span className="block mt-1">
                      <strong>Building Code:</strong> {disasterTypeDetails.buildingCode}
                    </span>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {/* Conditional: Bushfire zone question */}
            {selectedDisasterType === 'bushfire' && (
              <div className="space-y-2 border-l-4 border-orange-500 pl-4">
                <label className="block text-base font-medium text-foreground">
                  Is your property in a designated bushfire zone?
                </label>
                <p className="text-sm text-gray-400 mb-3">
                  Check your local council's bushfire overlay map. This affects insurance and contractor requirements.
                </p>
                <div className="space-y-2">
                  <label className="flex items-center space-x-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      value="yes"
                      className="h-4 w-4 text-dr-emergency focus:ring-dr-emergency"
                      {...register('inBushfireZone')}
                    />
                    <span className="text-sm">Yes, in bushfire zone</span>
                  </label>
                  <label className="flex items-center space-x-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      value="no"
                      className="h-4 w-4 text-dr-emergency focus:ring-dr-emergency"
                      {...register('inBushfireZone')}
                    />
                    <span className="text-sm">No</span>
                  </label>
                  <label className="flex items-center space-x-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      value="unsure"
                      className="h-4 w-4 text-dr-emergency focus:ring-dr-emergency"
                      {...register('inBushfireZone')}
                    />
                    <span className="text-sm">Not sure</span>
                  </label>
                </div>
              </div>
            )}

            {/* Conditional: Cyclone rating question */}
            {selectedDisasterType === 'cyclone' && (
              <div className="space-y-2 border-l-4 border-purple-500 pl-4">
                <label className="block text-base font-medium text-foreground">
                  What is your property's cyclone rating?
                </label>
                <p className="text-sm text-gray-400 mb-3">
                  This is based on your building approval documents (AS 1170.2 Wind Actions).
                </p>
                <FormSelect
                  label=""
                  options={[
                    { value: 'C1', label: 'C1 (Category 1 - Weakest)' },
                    { value: 'C2', label: 'C2 (Category 2)' },
                    { value: 'C3', label: 'C3 (Category 3)' },
                    { value: 'C4', label: 'C4 (Category 4 - Strongest)' },
                    { value: 'not-sure', label: 'Not sure' },
                  ]}
                  placeholder="Select cyclone rating"
                  context="emergency"
                  {...register('propertyCycloneRating')}
                />
              </div>
            )}

            {/* Conditional: Flood zone question */}
            {(selectedDisasterType === 'flood' || selectedDisasterType === 'storm-water') && (
              <div className="space-y-2 border-l-4 border-blue-500 pl-4">
                <label className="block text-base font-medium text-foreground">
                  Is your property in a flood zone?
                </label>
                <p className="text-sm text-gray-400 mb-3">
                  Check your property's flood overlay on your council website. This affects insurance coverage.
                </p>
                <div className="space-y-2">
                  <label className="flex items-center space-x-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      value="yes"
                      className="h-4 w-4 text-dr-emergency focus:ring-dr-emergency"
                      {...register('inFloodZone')}
                    />
                    <span className="text-sm">Yes, in flood zone</span>
                  </label>
                  <label className="flex items-center space-x-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      value="no"
                      className="h-4 w-4 text-dr-emergency focus:ring-dr-emergency"
                      {...register('inFloodZone')}
                    />
                    <span className="text-sm">No</span>
                  </label>
                  <label className="flex items-center space-x-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      value="unsure"
                      className="h-4 w-4 text-dr-emergency focus:ring-dr-emergency"
                      {...register('inFloodZone')}
                    />
                    <span className="text-sm">Not sure</span>
                  </label>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => router.push('/')}
                icon={<ChevronLeft className="h-5 w-5" />}
                iconPosition="left"
              >
                Cancel
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
                {isLoading ? 'Processing...' : 'Next: Location & Contact'}
              </Button>
            </div>
          </form>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400">
            Your information is encrypted and secure. We never share your data.
          </p>
          {/* The claim pages have no site footer, so the cookie control sits here. */}
          <CookieSettingsButton className="text-sm text-gray-600 underline hover:text-gray-900 transition-colors focus-visible:ring-blue-700 focus-visible:ring-offset-white" />
        </div>
      </div>
    </div>
    </PageTransition>
  );
}
