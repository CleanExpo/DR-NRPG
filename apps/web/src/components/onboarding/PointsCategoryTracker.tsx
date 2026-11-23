'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  GraduationCap,
  Award,
  BookOpen,
  Users,
  ChevronRight,
  CheckCircle2,
  Circle,
} from 'lucide-react';

interface CategoryData {
  current: number;
  max: number;
  percentage: number;
  bonus?: number;
}

interface CertificationData {
  govCert4Points: number;
  govCert4Status: string | null;
  iicrcCorePoints: number;
  iicrcAdvancedPoints: number;
  iicrcMasterBonus: number;
  carsiMembershipPoints: number;
  carsiCoursePoints: number;
  carsiCECPoints: number;
  annualCECCredits: number;
  primaryAssocPoints: number;
  secondaryAssocPoints: number;
  primaryAssociation: string | null;
}

interface PointsCategoryTrackerProps {
  certification: CertificationData;
  onCategoryClick?: (category: string) => void;
}

export function PointsCategoryTracker({
  certification,
  onCategoryClick,
}: PointsCategoryTrackerProps) {
  const categories = [
    {
      id: 'govCert4',
      title: 'Government Cert IV',
      subtitle: 'Cleaning (Restoration Specialisation)',
      icon: GraduationCap,
      current: certification.govCert4Points,
      max: 40,
      colour: '#F59E0B',
      details: [
        { label: 'Status', value: certification.govCert4Status || 'Not enrolled' },
        { label: 'Points earned', value: `${certification.govCert4Points}/40` },
      ],
      breakdown: [
        { label: 'Enrolled', points: 3, achieved: certification.govCert4Points >= 3 },
        { label: '50% Complete', points: 6, achieved: certification.govCert4Points >= 6 },
        { label: 'Experience-based', points: 15, achieved: certification.govCert4Status === 'experience_based' },
        { label: 'Completed', points: 40, achieved: certification.govCert4Points >= 40 },
      ],
    },
    {
      id: 'iicrc',
      title: 'Industry Certifications',
      subtitle: 'Industry-recognised credentials',
      icon: Award,
      current: certification.iicrcCorePoints + certification.iicrcAdvancedPoints,
      max: 30,
      bonus: certification.iicrcMasterBonus,
      colour: '#3B82F6',
      details: [
        { label: 'Core certs', value: `${certification.iicrcCorePoints}/24 pts` },
        { label: 'Advanced', value: `${certification.iicrcAdvancedPoints}/8 pts` },
        { label: 'Master bonus', value: `+${certification.iicrcMasterBonus} pts` },
      ],
      breakdown: [
        { label: 'Water damage', points: 8, achieved: certification.iicrcCorePoints >= 8 },
        { label: 'Structural drying', points: 7, achieved: certification.iicrcCorePoints >= 15 },
        { label: 'Mould remediation', points: 5, achieved: certification.iicrcCorePoints >= 20 },
        { label: 'Carpet cleaning', points: 4, achieved: certification.iicrcCorePoints >= 24 },
      ],
    },
    {
      id: 'carsi',
      title: 'CARSI Membership',
      subtitle: 'Continuing education credits',
      icon: BookOpen,
      current: certification.carsiMembershipPoints + certification.carsiCoursePoints + certification.carsiCECPoints,
      max: 25,
      colour: '#8B5CF6',
      details: [
        { label: 'Membership', value: `${certification.carsiMembershipPoints}/8 pts` },
        { label: 'Courses', value: `${certification.carsiCoursePoints}/12 pts` },
        { label: 'CECs', value: `${certification.carsiCECPoints}/5 pts (${certification.annualCECCredits} credits)` },
      ],
      breakdown: [
        { label: 'Active member', points: 5, achieved: certification.carsiMembershipPoints >= 5 },
        { label: 'Professional level', points: 8, achieved: certification.carsiMembershipPoints >= 8 },
        { label: 'Courses complete', points: 12, achieved: certification.carsiCoursePoints >= 12 },
        { label: '20+ CECs/year', points: 5, achieved: certification.carsiCECPoints >= 3 },
      ],
    },
    {
      id: 'associations',
      title: 'Industry Associations',
      subtitle: 'Professional network participation',
      icon: Users,
      current: certification.primaryAssocPoints + certification.secondaryAssocPoints,
      max: 20,
      colour: '#10B981',
      details: [
        { label: 'Primary', value: certification.primaryAssociation || 'None' },
        { label: 'Primary pts', value: `${certification.primaryAssocPoints}/10 pts` },
        { label: 'Secondary pts', value: `${certification.secondaryAssocPoints}/10 pts` },
      ],
      breakdown: [
        { label: 'Primary member', points: 4, achieved: certification.primaryAssocPoints >= 4 },
        { label: 'Committee role', points: 6, achieved: certification.primaryAssocPoints >= 6 },
        { label: 'Board/exec', points: 10, achieved: certification.primaryAssocPoints >= 10 },
        { label: 'Secondary assoc', points: 10, achieved: certification.secondaryAssocPoints >= 5 },
      ],
    },
  ];

  return (
    <div className="space-y-4">
      {categories.map((category) => {
        const percentage = Math.round((category.current / category.max) * 100);
        const Icon = category.icon;

        return (
          <Card
            key={category.id}
            className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors cursor-pointer"
            onClick={() => onCategoryClick?.(category.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: `${category.colour}20` }}
                >
                  <Icon className="h-5 w-5" style={{ color: category.colour }} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <h3 className="text-sm font-medium text-white">{category.title}</h3>
                      <p className="text-xs text-gray-500">{category.subtitle}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-white">{category.current}</span>
                      <span className="text-sm text-gray-500">/{category.max}</span>
                      {category.bonus && category.bonus > 0 && (
                        <Badge className="ml-2 bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                          +{category.bonus}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-2">
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-[width] duration-500 [transition-timing-function:cubic-bezier(0.4,0,0.2,1)]"
                        style={{
                          width: `${Math.min(percentage, 100)}%`,
                          backgroundColor: category.colour,
                        }}
                      />
                    </div>
                  </div>

                  {/* Breakdown pills */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {category.breakdown.map((item, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                          item.achieved
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-gray-700 text-gray-500'
                        }`}
                      >
                        {item.achieved ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : (
                          <Circle className="h-3 w-3" />
                        )}
                        {item.label}
                      </div>
                    ))}
                  </div>
                </div>

                <ChevronRight className="h-5 w-5 text-gray-600 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
