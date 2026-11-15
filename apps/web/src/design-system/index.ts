/**
 * DesignOS - Design System Exports
 *
 * Central export point for all design system components, tokens, and hooks
 */

// Tokens
export * from './tokens/colors';
export * from './tokens/typography';
export * from './tokens/spacing';

// Hooks
export * from './hooks/useContextualTheme';
export * from './hooks/useBrandTheme';

// Components
export { Button, buttonVariants, type ButtonProps } from './components/Button/Button';
export { PriorityCard, priorityCardVariants, type PriorityCardProps } from './components/Card/PriorityCard';
export { EmergencyCTA, StickyEmergencyCTA, type EmergencyCTAProps } from './components/EmergencyCTA/EmergencyCTA';
export { FormInput, type FormInputProps } from './components/Form/FormInput';
export { FormSelect, type FormSelectProps, type FormSelectOption } from './components/Form/FormSelect';
export { FormTextarea, type FormTextareaProps } from './components/Form/FormTextarea';
export { FormCheckbox, type FormCheckboxProps } from './components/Form/FormCheckbox';
export { LoadingProgress, LoadingOverlay, type LoadingProgressProps } from './components/LoadingProgress/LoadingProgress';
export { Header, type HeaderProps } from './components/Navigation/Header';
export { ErrorState, type ErrorStateProps, type AlternativeAction } from './components/ErrorState/ErrorState';
export { DecisionTree, type DecisionTreeProps, type DisasterType } from './components/DecisionTree/DecisionTree';
export { Timeline, type TimelineProps, type TimelineStep } from './components/Timeline/Timeline';
export { StatCard, type StatCardProps, type TrendDirection } from './components/StatCard/StatCard';
export { BeforeAfterComparison, type BeforeAfterComparisonProps } from './components/BeforeAfter/BeforeAfterComparison';
export { IncidentTable, type IncidentTableProps, type Incident, type IncidentPriority, type IncidentStatus } from './components/CRM/IncidentTable';
export { SuccessState, type SuccessStateProps, type NextStep } from './components/SuccessState/SuccessState';
export { Toast, type ToastProps, type ToastVariant } from './components/Toast/Toast';

// Page Templates
export { EmergencyIntakePageTemplate } from './templates/EmergencyIntakePage';
export { EducationalArticlePageTemplate } from './templates/EducationalArticlePage';
export { NRPGDashboardPageTemplate } from './templates/NRPGDashboardPage';

// Marketing Components - Hero Variants
export { Hero, type HeroProps } from './components/Marketing/Hero';
export { HeroFullWidth, type HeroFullWidthProps } from './components/Marketing/HeroFullWidth';
export { HeroVideo, type HeroVideoProps } from './components/Marketing/HeroVideo';
export { HeroSplitScreen, type HeroSplitScreenProps } from './components/Marketing/HeroSplitScreen';

// Marketing Components - Testimonials
export { TestimonialCard, type TestimonialCardProps } from './components/Marketing/TestimonialCard';
export { ClientTestimonialCard, type ClientTestimonialCardProps } from './components/Marketing/ClientTestimonialCard';
export { TestimonialCarousel, type TestimonialCarouselProps, type TestimonialItem } from './components/Marketing/TestimonialCarousel';
export { VideoTestimonial, type VideoTestimonialProps } from './components/Marketing/VideoTestimonial';

// Marketing Components - Interactive Tools
export { DamageCostCalculator, type DamageCostCalculatorProps, type CalculatorStep, type CalculatorResult } from './components/Marketing/DamageCostCalculator';
export { RiskAssessmentQuiz, type RiskAssessmentQuizProps, type QuizQuestion, type QuizResult } from './components/Marketing/RiskAssessmentQuiz';
export { TriageTool, type TriageToolProps, type TriageNode, type TriageResult } from './components/Marketing/TriageTool';

// Marketing Components - Location
export { AustraliaMap, type AustraliaMapProps, type StateData } from './components/Marketing/AustraliaMap';
export { ServiceAreaVisualization, type ServiceAreaVisualizationProps, type RegionData } from './components/Marketing/ServiceAreaVisualization';
export { LocalContractorCounter, type LocalContractorCounterProps } from './components/Marketing/LocalContractorCounter';

// Marketing Components - Other
export { PricingCard, type PricingCardProps, type PricingFeature } from './components/Marketing/PricingCard';
export { LeadPreview, type LeadPreviewProps } from './components/Marketing/LeadPreview';
export { ROICalculator, type ROICalculatorProps } from './components/Marketing/ROICalculator';

// Utilities
export * from './utils/animations';
