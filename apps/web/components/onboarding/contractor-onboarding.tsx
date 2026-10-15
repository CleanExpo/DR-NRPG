// @ts-nocheck

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft, 
  MapPin, 
  Wrench, 
  Star, 
  Clock, 
  DollarSign,
  Users,
  Award,
  Briefcase,
  GraduationCap,
  Shield,
  Zap,
  Home,
  Building,
  Car,
  Droplets,
  Flame,
  CloudRain
} from 'lucide-react';
import { THEMES, useTheme } from "@/contexts/ThemeContext";
import { CertificationCheckoutPanel } from '@/components/payments/certification-checkout-panel';

interface ContractorOnboardingProps {
  onComplete: (preferences: ContractorPreferences) => void;
  onSkip: () => void;
}

interface ContractorPreferences {
  serviceCategories: string[];
  locations: string[];
  experience: string;
  expertise: string[];
  background: string;
  hourlyRate: string;
  availability: string;
  maxDistance: string;
  selectedTheme: string;
  isOnboardingComplete: boolean;
}

const SERVICE_CATEGORIES = [
  { id: 'water-damage', name: 'Water Damage Restoration', icon: Droplets, description: 'Emergency water damage cleanup and restoration' },
  { id: 'fire-damage', name: 'Fire Damage Restoration', icon: Flame, description: 'Fire damage cleanup and restoration services' },
  { id: 'mold-remediation', name: 'Mould Remediation', icon: Shield, description: 'Professional mould removal and prevention' },
  { id: 'storm-damage', name: 'Storm Damage Repair', icon: CloudRain, description: 'Storm and weather damage repair' },
  { id: 'home-maintenance', name: 'Home Maintenance', icon: Home, description: 'Regular home maintenance and repair' },
  { id: 'emergency-services', name: 'Emergency Services', icon: Zap, description: '24/7 emergency response services' },
  { id: 'construction', name: 'Construction & Trades', icon: Building, description: 'General construction and trade work' },
  { id: 'automotive', name: 'Automotive Services', icon: Car, description: 'Vehicle repair and maintenance' }
];

const EXPERIENCE_LEVELS = [
  { value: 'entry', label: 'Entry Level (0-2 years)', description: 'Just starting out in the field' },
  { value: 'intermediate', label: 'Intermediate (2-5 years)', description: 'Some experience and growing skills' },
  { value: 'experienced', label: 'Experienced (5-10 years)', description: 'Well-established professional' },
  { value: 'expert', label: 'Expert (10+ years)', description: 'Industry veteran with deep expertise' }
];

const EXPERTISE_AREAS = [
  { id: 'emergency-response', name: 'Emergency Response', icon: Zap },
  { id: 'insurance-work', name: 'Insurance Work', icon: Shield },
  { id: 'commercial', name: 'Commercial Projects', icon: Building },
  { id: 'residential', name: 'Residential Work', icon: Home },
  { id: 'restoration', name: 'Restoration Specialist', icon: Wrench },
  { id: 'preventive', name: 'Preventive Maintenance', icon: Clock },
  { id: 'consulting', name: 'Consulting Services', icon: Briefcase },
  { id: 'training', name: 'Training & Education', icon: GraduationCap }
];

const AVAILABILITY_OPTIONS = [
  { value: '24-7', label: '24/7 Emergency Response', description: 'Available around the clock' },
  { value: 'business-hours', label: 'Business Hours Only', description: 'Monday-Friday, 9 AM - 5 PM' },
  { value: 'extended-hours', label: 'Extended Hours', description: 'Early morning to late evening' },
  { value: 'weekends', label: 'Weekends & Evenings', description: 'Flexible scheduling' }
];

const DISTANCE_OPTIONS = [
  { value: '10', label: '10 miles', description: 'Local area only' },
  { value: '25', label: '25 miles', description: 'Regional coverage' },
  { value: '50', label: '50 miles', description: 'Wide area coverage' },
  { value: '100', label: '100+ miles', description: 'Statewide coverage' }
];


export default function ContractorOnboarding({ onComplete, onSkip }: ContractorOnboardingProps) {
  const { setTheme } = useTheme();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [preferences, setPreferences] = useState<ContractorPreferences>({
    serviceCategories: [],
    locations: [],
    experience: '',
    expertise: [],
    background: '',
    hourlyRate: '',
    availability: '',
    maxDistance: '',
    selectedTheme: '',
    isOnboardingComplete: false
  });

  const totalSteps = 5;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      // Apply the selected theme immediately
      if (preferences.selectedTheme) {
        setTheme(preferences.selectedTheme);
      }
      
      const completedPreferences = {
        ...preferences,
        isOnboardingComplete: true
      };
      await onComplete(completedPreferences);
    } catch (error) {
      console.error('Error completing onboarding:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCategory = (categoryId: string) => {
    setPreferences(prev => ({
      ...prev,
      serviceCategories: prev.serviceCategories.includes(categoryId)
        ? prev.serviceCategories.filter(id => id !== categoryId)
        : [...prev.serviceCategories, categoryId]
    }));
  };

  const toggleExpertise = (expertiseId: string) => {
    setPreferences(prev => ({
      ...prev,
      expertise: prev.expertise.includes(expertiseId)
        ? prev.expertise.filter(id => id !== expertiseId)
        : [...prev.expertise, expertiseId]
    }));
  };

  const toggleTheme = (themeId: string) => {
    setPreferences(prev => ({
      ...prev,
      selectedTheme: prev.selectedTheme === themeId ? '' : themeId
    }));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">What services do you provide?</h2>
              <p className="text-gray-400 text-lg">Select the service categories you specialize in</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {SERVICE_CATEGORIES.map((category) => {
                const IconComponent = category.icon;
                const isSelected = preferences.serviceCategories.includes(category.id);
                return (
                  <Card
                    key={category.id}
                    className={`cursor-pointer transition-[transform,background-color,border-color,color] duration-200 [transition-timing-function:cubic-bezier(0.19,1,0.22,1)] hover:scale-105 ${
                      isSelected 
                        ? 'bg-[#00BFA6] border-[#00BFA6] text-white' 
                        : 'bg-gray-800 border-gray-700 hover:border-[#00BFA6] text-gray-300'
                    }`}
                    onClick={() => toggleCategory(category.id)}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="mb-4">
                        <IconComponent className={`h-12 w-12 mx-auto ${isSelected ? 'text-white' : 'text-[#00BFA6]'}`} />
                      </div>
                      <h3 className="font-semibold text-lg mb-2">{category.name}</h3>
                      <p className="text-sm opacity-80">{category.description}</p>
                      {isSelected && (
                        <div className="mt-4">
                          <CheckCircle className="h-6 w-6 mx-auto text-white" />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">Where do you work?</h2>
              <p className="text-gray-400 text-lg">Add the locations where you provide services</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="locations" className="text-white text-lg font-medium mb-2 block">
                  Service Locations
                </Label>
                <Input
                  id="locations"
                  placeholder="Enter service locations (e.g., New York, NY or Los Angeles County, CA)"
                  value={preferences.locations.join(', ')}
                  onChange={(e) => setPreferences(prev => ({
                    ...prev,
                    locations: e.target.value.split(',').map(loc => loc.trim()).filter(Boolean)
                  }))}
                  className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                />
                <p className="text-gray-400 text-sm mt-2">
                  Separate multiple locations with commas
                </p>
              </div>
              
              <div>
                <Label htmlFor="maxDistance" className="text-white text-lg font-medium mb-2 block">
                  Maximum Travel Distance
                </Label>
                <Select value={preferences.maxDistance} onValueChange={(value) => setPreferences(prev => ({ ...prev, maxDistance: value }))}>
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400" style={{color: 'white !important'}}>
                    <SelectValue placeholder="Select maximum distance" className="text-white" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600 text-white">
                    {DISTANCE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="text-white hover:bg-gray-700 hover:text-white focus:bg-gray-700 focus:text-white">
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-sm text-gray-400">{option.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">Tell us about your experience</h2>
              <p className="text-gray-400 text-lg">Help us understand your professional background</p>
            </div>
            
            <div className="space-y-6">
              <div>
                <Label className="text-white text-lg font-medium mb-4 block">Experience Level</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {EXPERIENCE_LEVELS.map((level) => (
                    <Card
                      key={level.value}
                      className={`cursor-pointer transition-[background-color,border-color,box-shadow] duration-200 [transition-timing-function:cubic-bezier(0.4,0,0.2,1)] ${
                        preferences.experience === level.value
                          ? 'bg-[#00BFA6] border-[#00BFA6] text-white'
                          : 'bg-gray-800 border-gray-700 hover:border-[#00BFA6] text-gray-300'
                      }`}
                      onClick={() => setPreferences(prev => ({ ...prev, experience: level.value }))}
                    >
                      <CardContent className="p-4">
                        <h3 className="font-semibold mb-2">{level.label}</h3>
                        <p className="text-sm opacity-80">{level.description}</p>
                        {preferences.experience === level.value && (
                          <CheckCircle className="h-5 w-5 text-white mt-2" />
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
              
              <div>
                <Label className="text-white text-lg font-medium mb-4 block">Areas of Expertise</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-3">
                  {EXPERTISE_AREAS.map((area) => {
                    const IconComponent = area.icon;
                    const isSelected = preferences.expertise.includes(area.id);
                    return (
                      <Card
                        key={area.id}
                        className={`cursor-pointer transition-[background-color,border-color,box-shadow] duration-200 [transition-timing-function:cubic-bezier(0.4,0,0.2,1)] ${
                          isSelected
                            ? 'bg-[#00BFA6] border-[#00BFA6] text-white'
                            : 'bg-gray-800 border-gray-700 hover:border-[#00BFA6] text-gray-300'
                        }`}
                        onClick={() => toggleExpertise(area.id)}
                      >
                        <CardContent className="p-4 text-center">
                          <IconComponent className="h-6 w-6 mx-auto mb-2" />
                          <p className="text-sm font-medium">{area.name}</p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
              
              <div>
                <Label htmlFor="background" className="text-white text-lg font-medium mb-2 block">
                  Professional Background
                </Label>
                <Textarea
                  id="background"
                  placeholder="Describe your professional background, certifications, special skills, and notable projects..."
                  value={preferences.background}
                  onChange={(e) => setPreferences(prev => ({ ...prev, background: e.target.value }))}
                  className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 min-h-[120px]"
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">Set your preferences</h2>
              <p className="text-gray-400 text-lg">Configure your work preferences and availability</p>
            </div>
            
            <div className="space-y-6">
              <div>
                <Label htmlFor="hourlyRate" className="text-white text-lg font-medium mb-2 block">
                  Hourly Rate
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    id="hourlyRate"
                    type="number"
                    placeholder="Enter hourly rate (e.g., 75)"
                    value={preferences.hourlyRate}
                    onChange={(e) => setPreferences(prev => ({ ...prev, hourlyRate: e.target.value }))}
                    className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 pl-10"
                  />
                </div>
                <p className="text-gray-400 text-sm mt-2">Enter your preferred hourly rate in USD</p>
              </div>
              
              <div>
                <Label className="text-white text-lg font-medium mb-4 block">Availability</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {AVAILABILITY_OPTIONS.map((option) => (
                    <Card
                      key={option.value}
                      className={`cursor-pointer transition-[background-color,border-color,box-shadow] duration-200 [transition-timing-function:cubic-bezier(0.4,0,0.2,1)] ${
                        preferences.availability === option.value
                          ? 'bg-[#00BFA6] border-[#00BFA6] text-white'
                          : 'bg-gray-800 border-gray-700 hover:border-[#00BFA6] text-gray-300'
                      }`}
                      onClick={() => setPreferences(prev => ({ ...prev, availability: option.value }))}
                    >
                      <CardContent className="p-4">
                        <h3 className="font-semibold mb-2">{option.label}</h3>
                        <p className="text-sm opacity-80">{option.description}</p>
                        {preferences.availability === option.value && (
                          <CheckCircle className="h-5 w-5 text-white mt-2" />
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );


      case 5:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-4">Choose Your Theme</h2>
              <p className="text-gray-400 text-lg">Select a theme that matches your style and preferences</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {THEMES.map((theme) => (
                <Card
                  key={theme.id}
                  className={`cursor-pointer transition-[background-color,border-color,box-shadow] duration-200 [transition-timing-function:cubic-bezier(0.4,0,0.2,1)] ${
                    preferences.selectedTheme === theme.id
                      ? 'border-2 border-white'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                  style={{
                    backgroundColor: preferences.selectedTheme === theme.id 
                      ? theme.primaryColor 
                      : '#1F2937'
                  }}
                  onClick={() => toggleTheme(theme.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="flex space-x-1">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: theme.primaryColor }}
                        ></div>
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: theme.secondaryColor }}
                        ></div>
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: theme.accentColor }}
                        ></div>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1 text-white">{theme.name}</h3>
                        <p className="text-sm opacity-80 text-gray-300">{theme.description}</p>
                      </div>
                      {preferences.selectedTheme === theme.id && (
                        <CheckCircle className="h-5 w-5 text-white ml-auto" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <CertificationCheckoutPanel />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white">Contractor Setup</h1>
              <p className="text-gray-400">Step {currentStep} of {totalSteps}</p>
            </div>
            <Button
              variant="ghost"
              onClick={onSkip}
              className="text-gray-400 hover:text-white"
            >
              Skip for now
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-700 rounded-full h-2 mb-8">
            <div
              className="bg-[#00BFA6] h-2 rounded-full transition-[width] duration-300 [transition-timing-function:cubic-bezier(0.4,0,0.2,1)]"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>

          {/* Step Content */}
          {renderStepContent()}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            {currentStep === totalSteps ? (
              <Button
                onClick={handleComplete}
                disabled={isLoading}
                className="bg-[#00BFA6] hover:bg-[#00A693] text-white"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Complete Setup
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                className="bg-[#00BFA6] hover:bg-[#00A693] text-white"
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
