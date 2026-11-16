'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, TrendingUp, Target } from 'lucide-react';

interface CategoryBreakdown {
  govCert4: { current: number; max: number; percentage: number };
  iicrc: { current: number; bonus: number; max: number; percentage: number };
  carsi: { current: number; max: number; percentage: number };
  associations: { current: number; max: number; percentage: number };
}

interface LevelInfo {
  name: string;
  minPoints: number;
  maxPoints: number;
  description: string;
  colour: string;
}

interface NRPGCertificationCardProps {
  totalPoints: number;
  partnershipLevel: 'CANDIDATE' | 'ASSOCIATE' | 'PROFESSIONAL' | 'EXCELLENCE';
  levelInfo: LevelInfo;
  pointsToNextLevel: number;
  categoryBreakdown: CategoryBreakdown;
}

export function NRPGCertificationCard({
  totalPoints,
  partnershipLevel,
  levelInfo,
  pointsToNextLevel,
  categoryBreakdown,
}: NRPGCertificationCardProps) {
  // Calculate progress ring values
  const maxPoints = 100;
  const progressPercentage = Math.min((totalPoints / maxPoints) * 100, 100);
  const circumference = 2 * Math.PI * 45; // radius of 45
  const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;

  const levelColours = {
    CANDIDATE: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    ASSOCIATE: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    PROFESSIONAL: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    EXCELLENCE: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl text-white flex items-center gap-2">
              <Award className="h-5 w-5 text-[#00BFA6]" />
              NRPG Certification
            </CardTitle>
            <CardDescription className="text-gray-400">
              100-Point Professional Certification System
            </CardDescription>
          </div>
          <Badge className={`${levelColours[partnershipLevel]} border`}>
            {levelInfo.name}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-8">
          {/* Progress Ring */}
          <div className="relative">
            <svg className="w-32 h-32 transform -rotate-90">
              {/* Background circle */}
              <circle
                cx="64"
                cy="64"
                r="45"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-gray-700"
              />
              {/* Progress circle */}
              <circle
                cx="64"
                cy="64"
                r="45"
                stroke={levelInfo.colour}
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-[stroke-dashoffset] duration-1000 [transition-timing-function:cubic-bezier(0.19,1,0.22,1)]"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-white">{totalPoints}</span>
              <span className="text-xs text-gray-400">points</span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Partnership Level</span>
              <span className="text-white font-medium">{levelInfo.name}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Category Progress</span>
              <span className="text-white font-medium">
                {Object.values(categoryBreakdown).filter(c => c.percentage >= 50).length}/4 on track
              </span>
            </div>
            {pointsToNextLevel > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="h-4 w-4 text-[#00BFA6]" />
                <span className="text-gray-400">
                  <span className="text-[#00BFA6] font-medium">{pointsToNextLevel} points</span> to next level
                </span>
              </div>
            )}
            {pointsToNextLevel === 0 && (
              <div className="flex items-center gap-2 text-sm">
                <Target className="h-4 w-4 text-emerald-500" />
                <span className="text-emerald-400 font-medium">Maximum level achieved!</span>
              </div>
            )}
          </div>
        </div>

        {/* Mini category bars */}
        <div className="mt-6 grid grid-cols-4 gap-2">
          {[
            { key: 'govCert4', label: 'Cert IV', data: categoryBreakdown.govCert4 },
            { key: 'iicrc', label: 'Industry', data: categoryBreakdown.iicrc },
            { key: 'carsi', label: 'CARSI', data: categoryBreakdown.carsi },
            { key: 'associations', label: 'Assoc.', data: categoryBreakdown.associations },
          ].map(cat => (
            <div key={cat.key} className="text-center">
              <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#00BFA6] rounded-full transition-[width] duration-500 [transition-timing-function:cubic-bezier(0.4,0,0.2,1)]"
                  style={{ width: `${cat.data.percentage}%` }}
                />
              </div>
              <span className="text-xs text-gray-500 mt-1 block">{cat.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
