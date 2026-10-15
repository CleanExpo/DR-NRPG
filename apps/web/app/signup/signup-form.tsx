'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Loader2, Eye, EyeOff, ArrowLeft, CheckCircle, User, Briefcase } from 'lucide-react';
import PreferenceSelector from '@/components/onboarding/preference-selector';
import ContractorOnboarding from '@/components/onboarding/contractor-onboarding';
import ClientOnboarding from '@/components/client-onboarding';
import { GA4_EVENTS, trackEvent } from '@/lib/analytics';

/**
 * Signup form. Server-rendered with the page (no useSearchParams bailout), so the
 * served HTML carries the heading, form and the page's value-proposition `children`.
 */
export function SignupForm({ children }: { children?: ReactNode }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'CLIENT' as 'CONTRACTOR' | 'CLIENT'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showServiceSelection, setShowServiceSelection] = useState(false);
  const [showContractorOnboarding, setShowContractorOnboarding] = useState(false);
  const [showClientOnboarding, setShowClientOnboarding] = useState(false);
  const [registeredUser, setRegisteredUser] = useState<any>(null);
  const [contractorPreferences, setContractorPreferences] = useState<any>(null);
  const [clientPreferences, setClientPreferences] = useState<any>(null);
  const [consentAccepted, setConsentAccepted] = useState(false);

  const { register } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const typeParam = new URLSearchParams(window.location.search).get('type')?.toLowerCase();
    if (typeParam === 'contractor') {
      setFormData(prev => ({ ...prev, userType: 'CONTRACTOR' }));
    }
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Please enter your full name');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Please enter your email address');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (!consentAccepted) {
      setError('You must accept the Terms of Service and Privacy Policy to continue');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      const user = await register(formData.email, formData.password, formData.name, formData.userType, consentAccepted);
      setRegisteredUser(user);
      setSuccess(true);
      if (formData.userType === 'CONTRACTOR') {
        trackEvent(GA4_EVENTS.CONTRACTOR_SIGNUP, { event_category: 'Contractor', method: 'email' });
      }
      
      // Show onboarding for both clients and contractors
      if (formData.userType === 'CLIENT') {
        setTimeout(() => {
          setShowClientOnboarding(true);
        }, 1500);
      } else if (formData.userType === 'CONTRACTOR') {
        setTimeout(() => {
          setShowContractorOnboarding(true);
        }, 1500);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardingComplete = async (preferences: any) => {
    try {
      const response = await fetch('/api/user/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...preferences,
          isOnboardingComplete: true
        })
      });

      if (response.ok) {
        setShowOnboarding(false);
        setShowServiceSelection(false); // Skip service selection completely
        router.push('/dashboard'); // Redirect directly to dashboard
      } else {
        setShowOnboarding(false);
        setShowServiceSelection(false); // Skip service selection completely
        router.push('/dashboard'); // Redirect directly to dashboard
      }
    } catch (error) {
      console.error('Failed to save preferences:', error);
      setShowOnboarding(false);
      setShowServiceSelection(false); // Skip service selection completely
      router.push('/dashboard'); // Redirect directly to dashboard
    }
  };

  const handleOnboardingSkip = () => {
    setShowOnboarding(false);
    setShowServiceSelection(false); // Skip service selection completely
    router.push('/dashboard'); // Redirect directly to dashboard
  };

  const handleContractorOnboardingComplete = async (preferences: any) => {
    try {
      // Save contractor preferences
      const preferencesResponse = await fetch('/api/contractor/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(preferences)
      });

      if (!preferencesResponse.ok) {
        console.error('Failed to save contractor preferences');
        return;
      }

      // Create basic contractor profile
      const profileData = {
        businessName: `${registeredUser?.name || 'Contractor'}'s Business`,
        phone: '', // Will be filled in profile setup
        address: '',
        city: '',
        state: '',
        zipCode: '',
        services: preferences.serviceCategories || [],
        serviceAreas: preferences.locations || [],
        hourlyRate: parseFloat(preferences.hourlyRate) || 0,
        experience: parseInt(preferences.experience) || 0,
        bio: `Experienced contractor specializing in ${preferences.serviceCategories?.join(', ') || 'various services'}`,
        availability: 'AVAILABLE'
      };

      const profileResponse = await fetch('/api/contractor/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      });

      if (profileResponse.ok) {
        setContractorPreferences(preferences);
        setShowContractorOnboarding(false);
        router.push('/dashboard/contractor');
      } else {
        console.error('Failed to create contractor profile');
        // Still redirect to the contractor dashboard; profile can be completed later
        setShowContractorOnboarding(false);
        router.push('/dashboard/contractor');
      }
    } catch (error) {
      console.error('Error saving contractor data:', error);
      // Still redirect to the contractor dashboard; profile can be completed later
      setShowContractorOnboarding(false);
      router.push('/dashboard/contractor');
    }
  };

  const handleContractorOnboardingSkip = () => {
    setShowContractorOnboarding(false);
    router.push('/dashboard/contractor');
  };

  const handleClientOnboardingComplete = async (preferences: any) => {
    try {
      // Save preferences to database
      const response = await fetch('/api/user/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences)
      });

      if (response.ok) {
        const savedPreferences = await response.json();
        setClientPreferences(savedPreferences);
      } else {
        console.error('Failed to save client preferences');
      }
      
      setShowClientOnboarding(false);
      router.push('/dashboard');
    } catch (error) {
      console.error('Error saving client preferences:', error);
      // Still redirect even if saving fails
      setShowClientOnboarding(false);
      router.push('/dashboard');
    }
  };

  const handleClientOnboardingSkip = () => {
    setShowClientOnboarding(false);
    router.push('/dashboard');
  };

  // Service selection handlers removed - service selection step is now skipped

  // Show onboarding for clients
  if (showOnboarding) {
    return (
      <PreferenceSelector
        onComplete={handleOnboardingComplete}
        onSkip={handleOnboardingSkip}
      />
    );
  }

  // Show onboarding for contractors
  if (showContractorOnboarding) {
    return (
      <ContractorOnboarding
        onComplete={handleContractorOnboardingComplete}
        onSkip={handleContractorOnboardingSkip}
      />
    );
  }

  // Show onboarding for clients
  if (showClientOnboarding) {
    return (
      <ClientOnboarding
        onComplete={handleClientOnboardingComplete}
        onSkip={handleClientOnboardingSkip}
      />
    );
  }

  // Service selection is now skipped - users go directly to dashboard after preferences

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Account created!</h2>
              <p className="text-gray-100">Welcome to the restoration marketplace. Redirecting you to your dashboard...</p>
              <div className="mt-4">
                <Loader2 className="h-6 w-6 animate-spin mx-auto text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#00BFA6] to-[#2196F3] rounded-2xl mb-4">
            <span className="text-white font-bold text-2xl">N</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Join the NRPG marketplace</h1>
          <p className="text-gray-400">Create your account and start your restoration journey</p>
        </div>

        <Card className="backdrop-blur-sm bg-white/10 border-white/20">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl text-center text-white">Create account</CardTitle>
            <CardDescription className="text-center text-gray-400">
              Choose your account type and get started
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white font-medium">
                  Full name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                  disabled={loading}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-[#00BFA6] focus:ring-[#00BFA6]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-white font-medium">
                  Email address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  disabled={loading}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-[#00BFA6] focus:ring-[#00BFA6]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="userType" className="text-white font-medium">
                  Account type
                </Label>
                <Select 
                  value={formData.userType} 
                  onValueChange={(value: 'CONTRACTOR' | 'CLIENT') => handleInputChange('userType', value)}
                >
                  <SelectTrigger className="w-full bg-white/10 border-white/20 text-white focus:border-[#00BFA6] focus:ring-[#00BFA6]">
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 w-full text-white">
                    <SelectItem value="CLIENT" className="text-white hover:bg-slate-700 hover:text-white focus:bg-slate-700 focus:text-white">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        Client (Property Owner)
                      </div>
                    </SelectItem>
                    <SelectItem value="CONTRACTOR" className="text-white hover:bg-slate-700 hover:text-white focus:bg-slate-700 focus:text-white">
                      <div className="flex items-center">
                        <Briefcase className="h-4 w-4 mr-2" />
                        Contractor
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    required
                    disabled={loading}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-[#00BFA6] focus:ring-[#00BFA6] pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-white font-medium">
                  Confirm password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    required
                    disabled={loading}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-[#00BFA6] focus:ring-[#00BFA6] pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <input
                  id="terms"
                  type="checkbox"
                  required
                  checked={consentAccepted}
                  onChange={(e) => {
                    setConsentAccepted(e.target.checked);
                    if (error) setError('');
                  }}
                  className="h-4 w-4 text-[#00BFA6] focus:ring-[#00BFA6] border-gray-300 rounded mt-1"
                />
                <Label htmlFor="terms" className="text-sm text-gray-400 leading-relaxed">
                  I agree to the{' '}
                  <Link href="/terms" className="text-[#00BFA6] hover:text-[#00A693]">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-[#00BFA6] hover:text-[#00A693]">
                    Privacy Policy
                  </Link>
                </Label>
              </div>

              {error && (
                <Alert variant="destructive" className="bg-red-500/10 border-red-500/20">
                  <AlertDescription className="text-red-200">{error}</AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="w-full bg-[#00BFA6] hover:bg-[#00A693] text-white font-semibold py-3 rounded-lg transition-all duration-200 transform hover:scale-[1.02]"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create account'
                )}
              </Button>
            </form>

            <div className="text-center">
              <p className="text-gray-400">
                Already have an account?{' '}
                <Link
                  href="/login"
                  className="text-[#00BFA6] hover:text-[#00A693] font-medium transition-colors"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {children}

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400">
            By creating an account, you agree to our{' '}
            <Link href="/terms" className="text-[#00BFA6] hover:text-[#00A693]">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-[#00BFA6] hover:text-[#00A693]">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
