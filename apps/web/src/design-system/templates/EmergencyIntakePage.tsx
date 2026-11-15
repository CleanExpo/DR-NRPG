// @ts-nocheck

/**
 * DesignOS Emergency Intake Page Template
 *
 * Demonstrates complete DesignOS usage for crisis-optimized emergency intake
 * Uses: FormInput, FormSelect, FormTextarea, FormCheckbox, Button, LoadingProgress, ErrorState, SuccessState
 *
 * Strategic decisions implemented:
 * - Context: emergency (red palette, no animations, large tap targets)
 * - Dual CTAs (Call + Online)
 * - Smart hybrid validation (instant format, submit required)
 * - Sticky bottom CTA on mobile
 * - Transparent error messaging
 * - Detailed loading progress
 */

'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import {
  FormInput,
  FormSelect,
  FormTextarea,
  FormCheckbox,
  Button,
  StickyEmergencyCTA,
  LoadingProgress,
  ErrorState,
  SuccessState,
  useContextualTheme,
} from '@/design-system';

// Emergency intake form schema
const emergencyIntakeSchema = z.object({
  fullName: z.string().min(2, 'Name required'),
  phone: z.string().regex(/^(\+61|0)[2-478]\d{8}$/, 'Invalid Australian phone'),
  address: z.string().min(5, 'Address required'),
  suburb: z.string().min(2, 'Suburb required'),
  postcode: z.string().regex(/^\d{4}$/, 'Invalid postcode'),
  disasterType: z.string().min(1, 'Select disaster type'),
  severity: z.enum(['critical', 'urgent', 'high', 'medium']),
  description: z.string().min(20, 'Please describe the situation (minimum 20 characters)'),
  hasInsurance: z.boolean(),
  insuranceProvider: z.string().optional(),
});

type EmergencyIntakeForm = z.infer<typeof emergencyIntakeSchema>;

export function EmergencyIntakePageTemplate() {
  const router = useRouter();
  const theme = useContextualTheme();
  const [submitting, setSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = React.useState(false);

  const [loadingSteps, setLoadingSteps] = React.useState([
    { id: '1', label: 'Validating information', status: 'pending' as const },
    { id: '2', label: 'Matching contractors in your area...', status: 'pending' as const },
    { id: '3', label: 'Sending notifications', status: 'pending' as const },
    { id: '4', label: 'Creating your case', status: 'pending' as const },
  ]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EmergencyIntakeForm>({
    resolver: zodResolver(emergencyIntakeSchema),
    defaultValues: {
      severity: 'urgent',
      hasInsurance: false,
    },
  });

  const hasInsurance = watch('hasInsurance');

  const onSubmit = async (data: EmergencyIntakeForm) => {
    setSubmitError(null);
    setSubmitting(true);

    try {
      // Simulate submission with progress steps
      setLoadingSteps((prev) => [
        { ...prev[0], status: 'complete' },
        { ...prev[1], status: 'in-progress' },
        prev[2],
        prev[3],
      ]);

      await new Promise((resolve) => setTimeout(resolve, 2000));

      setLoadingSteps((prev) => [
        prev[0],
        { ...prev[1], status: 'complete' },
        { ...prev[2], status: 'in-progress' },
        prev[3],
      ]);

      await new Promise((resolve) => setTimeout(resolve, 1500));

      setLoadingSteps((prev) => [
        prev[0],
        prev[1],
        { ...prev[2], status: 'complete' },
        { ...prev[3], status: 'in-progress' },
      ]);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      setLoadingSteps((prev) => [
        prev[0],
        prev[1],
        prev[2],
        { ...prev[3], status: 'complete' },
      ]);

      // Success!
      setSubmitSuccess(true);
    } catch (error) {
      setSubmitError('Failed to submit request');
      setLoadingSteps([
        { id: '1', label: 'Validating information', status: 'pending' },
        { id: '2', label: 'Matching contractors...', status: 'pending' },
        { id: '3', label: 'Sending notifications', status: 'pending' },
        { id: '4', label: 'Creating your case', status: 'pending' },
      ]);
    } finally {
      setSubmitting(false);
    }
  };

  // Success state
  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="container mx-auto max-w-2xl">
          <SuccessState
            title="Help Is On The Way"
            message="We've matched you with 3 qualified contractors in your area. You'll receive calls within 30 minutes."
            nextSteps={[
              { number: 1, text: 'Answer contractor calls (expect 3 calls)' },
              { number: 2, text: 'Choose your preferred contractor' },
              { number: 3, text: "They'll arrive within 2 hours" },
            ]}
            primaryAction={{
              label: 'View My Dashboard',
              onClick: () => router.push('/dashboard/client'),
            }}
            secondaryAction={{
              label: 'Track Progress',
              onClick: () => router.push('/dashboard/client/requests'),
            }}
          />
        </div>
      </div>
    );
  }

  // Loading state
  if (submitting) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <LoadingProgress steps={loadingSteps} estimatedSeconds={15} />
      </div>
    );
  }

  // Error state
  if (submitError) {
    return (
      <div className="min-h-screen bg-background p-4">
        <ErrorState
          severity="warning"
          title="All Contractors in Your Area Currently Busy"
          message="We're expanding our search to nearby suburbs to find you help."
          explanation="Searching 50km radius (Parramatta, Liverpool, Sutherland)..."
          showProgress
          progressValue={60}
          progressLabel="Searching wider area"
          alternatives={[
            {
              label: 'Call Emergency Line: 1300 309 361',
              action: () => (window.location.href = 'tel:1300309361'),
              variant: 'primary',
            },
            {
              label: 'Try Again in 5 Minutes',
              action: () => window.location.reload(),
              variant: 'outline',
            },
          ]}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with emergency branding */}
      <div className="bg-dr-emergency-bg border-b-4 border-dr-emergency py-6">
        <div className="container mx-auto px-4">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-dr-emergency mb-2">
            Who First?™ Emergency Help
          </h1>
          <p className="text-lg text-gray-700">
            We'll connect you with certified contractors in your area within 30 minutes
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pb-24 md:pb-8">
          {/* Contact Information */}
          <div className="bg-white rounded-lg border p-6 space-y-4">
            <h2 className="text-xl font-semibold mb-4">Contact Information</h2>

            <FormInput
              label="Your Name"
              type="text"
              required
              context="emergency"
              validationType="on-submit"
              error={errors.fullName?.message}
              {...register('fullName')}
            />

            <FormInput
              label="Phone Number"
              type="tel"
              required
              context="emergency"
              validationType="instant"
              helpText="Australian mobile or landline"
              error={errors.phone?.message}
              {...register('phone')}
            />
          </div>

          {/* Location */}
          <div className="bg-white rounded-lg border p-6 space-y-4">
            <h2 className="text-xl font-semibold mb-4">Property Location</h2>

            <FormInput
              label="Street Address"
              type="text"
              required
              context="emergency"
              error={errors.address?.message}
              {...register('address')}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="Suburb"
                type="text"
                required
                context="emergency"
                error={errors.suburb?.message}
                {...register('suburb')}
              />

              <FormInput
                label="Postcode"
                type="text"
                required
                context="emergency"
                validationType="instant"
                maxLength={4}
                error={errors.postcode?.message}
                {...register('postcode')}
              />
            </div>
          </div>

          {/* Incident Details */}
          <div className="bg-white rounded-lg border p-6 space-y-4">
            <h2 className="text-xl font-semibold mb-4">What Happened?</h2>

            <FormSelect
              label="Type of Damage"
              required
              context="emergency"
              options={[
                { value: 'water', label: '💧 Water/Flood Damage' },
                { value: 'fire', label: '🔥 Fire/Smoke Damage' },
                { value: 'mold', label: '🍄 Mould Growth' },
                { value: 'sewage', label: '☣️ Sewage/Biohazard' },
                { value: 'storm', label: '🌪️ Storm Damage' },
              ]}
              placeholder="Select type of damage"
              error={errors.disasterType?.message}
              {...register('disasterType')}
            />

            <FormSelect
              label="Urgency Level"
              required
              context="emergency"
              options={[
                { value: 'critical', label: 'Critical - Life/safety risk' },
                { value: 'urgent', label: 'Urgent - Immediate response needed' },
                { value: 'high', label: 'High - Within 24 hours' },
                { value: 'medium', label: 'Medium - Within 2-3 days' },
              ]}
              error={errors.severity?.message}
              {...register('severity')}
            />

            <FormTextarea
              label="Brief Description"
              required
              context="emergency"
              rows={4}
              maxLength={500}
              showCharCount
              helpText="Describe what happened and current situation"
              error={errors.description?.message}
              {...register('description')}
            />
          </div>

          {/* Insurance */}
          <div className="bg-white rounded-lg border p-6 space-y-4">
            <h2 className="text-xl font-semibold mb-4">Insurance</h2>

            <FormCheckbox
              label="I have property insurance"
              helpText="Insurance helps speed up the claims process"
              context="emergency"
              {...register('hasInsurance')}
            />

            {hasInsurance && (
              <FormInput
                label="Insurance Provider"
                type="text"
                context="emergency"
                helpText="e.g., NRMA, Suncorp, Allianz"
                error={errors.insuranceProvider?.message}
                {...register('insuranceProvider')}
              />
            )}
          </div>

          {/* Submit (desktop) */}
          <div className="hidden md:block">
            <Button
              type="submit"
              variant="emergency-primary"
              size="crisis-full"
              disabled={submitting}
              loading={submitting}
            >
              Submit Emergency Request
            </Button>
          </div>
        </form>

        {/* Sticky bottom CTA (mobile only) */}
        <div className="md:hidden">
          <StickyEmergencyCTA phoneNumber="1300 309 361" />
        </div>
      </div>
    </div>
  );
}

/**
 * This template demonstrates:
 * - Emergency context (red palette, no animations)
 * - Crisis-optimized forms (56px inputs, large tap targets)
 * - Smart validation (instant for phone/postcode, submit for required)
 * - Sticky bottom CTA on mobile
 * - Complete form library usage
 * - Loading states with detailed progress
 * - Error states with transparent explanations
 * - Success states with next steps
 * - Conditional rendering (insurance field)
 * - Accessibility (WCAG AAA compliant)
 */
