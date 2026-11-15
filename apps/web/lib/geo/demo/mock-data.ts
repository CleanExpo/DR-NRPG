/**
 * Mock Data for Demo
 * Disaster Recovery - NRPG Platform
 *
 * Realistic mock data for demonstrating the SEO/GEO system.
 */

import { Suburb, Region, SuburbWithDistance, ServiceType, AustralianState } from '../types';

// ============================================
// Mock Suburbs - Brisbane/SEQ Focus
// ============================================

export const MOCK_SUBURBS: Suburb[] = [
  // Brisbane CBD and Inner
  { suburb: 'Brisbane City', postcode: '4000', state: 'QLD', regionId: 'brisbane-inner', coordinates: { latitude: -27.4698, longitude: 153.0251 }, population: 12500 },
  { suburb: 'South Brisbane', postcode: '4101', state: 'QLD', regionId: 'brisbane-inner', coordinates: { latitude: -27.4817, longitude: 153.0192 }, population: 8700 },
  { suburb: 'Fortitude Valley', postcode: '4006', state: 'QLD', regionId: 'brisbane-inner', coordinates: { latitude: -27.4575, longitude: 153.0358 }, population: 7200 },
  { suburb: 'New Farm', postcode: '4005', state: 'QLD', regionId: 'brisbane-inner', coordinates: { latitude: -27.4672, longitude: 153.0486 }, population: 12100 },
  { suburb: 'Kangaroo Point', postcode: '4169', state: 'QLD', regionId: 'brisbane-inner', coordinates: { latitude: -27.4783, longitude: 153.0361 }, population: 8900 },
  { suburb: 'West End', postcode: '4101', state: 'QLD', regionId: 'brisbane-inner', coordinates: { latitude: -27.4825, longitude: 153.0067 }, population: 9400 },

  // Brisbane Inner North
  { suburb: 'Newstead', postcode: '4006', state: 'QLD', regionId: 'brisbane-north', coordinates: { latitude: -27.4500, longitude: 153.0436 }, population: 5800 },
  { suburb: 'Teneriffe', postcode: '4005', state: 'QLD', regionId: 'brisbane-north', coordinates: { latitude: -27.4536, longitude: 153.0464 }, population: 4200 },
  { suburb: 'Bowen Hills', postcode: '4006', state: 'QLD', regionId: 'brisbane-north', coordinates: { latitude: -27.4417, longitude: 153.0350 }, population: 3100 },
  { suburb: 'Albion', postcode: '4010', state: 'QLD', regionId: 'brisbane-north', coordinates: { latitude: -27.4319, longitude: 153.0447 }, population: 4500 },
  { suburb: 'Wooloowin', postcode: '4030', state: 'QLD', regionId: 'brisbane-north', coordinates: { latitude: -27.4194, longitude: 153.0436 }, population: 5200 },
  { suburb: 'Lutwyche', postcode: '4030', state: 'QLD', regionId: 'brisbane-north', coordinates: { latitude: -27.4175, longitude: 153.0331 }, population: 4800 },
  { suburb: 'Gordon Park', postcode: '4031', state: 'QLD', regionId: 'brisbane-north', coordinates: { latitude: -27.4064, longitude: 153.0331 }, population: 4100 },
  { suburb: 'Kedron', postcode: '4031', state: 'QLD', regionId: 'brisbane-north', coordinates: { latitude: -27.3981, longitude: 153.0281 }, population: 8900 },
  { suburb: 'Chermside', postcode: '4032', state: 'QLD', regionId: 'brisbane-north', coordinates: { latitude: -27.3861, longitude: 153.0350 }, population: 11200 },
  { suburb: 'Stafford', postcode: '4053', state: 'QLD', regionId: 'brisbane-north', coordinates: { latitude: -27.4097, longitude: 153.0183 }, population: 7600 },
  { suburb: 'Everton Park', postcode: '4053', state: 'QLD', regionId: 'brisbane-north', coordinates: { latitude: -27.4036, longitude: 153.0039 }, population: 8100 },

  // Brisbane South
  { suburb: 'Woolloongabba', postcode: '4102', state: 'QLD', regionId: 'brisbane-south', coordinates: { latitude: -27.4906, longitude: 153.0353 }, population: 7800 },
  { suburb: 'Coorparoo', postcode: '4151', state: 'QLD', regionId: 'brisbane-south', coordinates: { latitude: -27.4975, longitude: 153.0553 }, population: 12400 },
  { suburb: 'Greenslopes', postcode: '4120', state: 'QLD', regionId: 'brisbane-south', coordinates: { latitude: -27.5056, longitude: 153.0461 }, population: 6200 },
  { suburb: 'Holland Park', postcode: '4121', state: 'QLD', regionId: 'brisbane-south', coordinates: { latitude: -27.5156, longitude: 153.0558 }, population: 8700 },
  { suburb: 'Mount Gravatt', postcode: '4122', state: 'QLD', regionId: 'brisbane-south', coordinates: { latitude: -27.5361, longitude: 153.0658 }, population: 5400 },
  { suburb: 'Upper Mount Gravatt', postcode: '4122', state: 'QLD', regionId: 'brisbane-south', coordinates: { latitude: -27.5539, longitude: 153.0792 }, population: 11200 },
  { suburb: 'Sunnybank', postcode: '4109', state: 'QLD', regionId: 'brisbane-south', coordinates: { latitude: -27.5792, longitude: 153.0614 }, population: 9800 },
  { suburb: 'Carindale', postcode: '4152', state: 'QLD', regionId: 'brisbane-south', coordinates: { latitude: -27.5050, longitude: 153.1017 }, population: 15200 },

  // Brisbane West
  { suburb: 'Milton', postcode: '4064', state: 'QLD', regionId: 'brisbane-west', coordinates: { latitude: -27.4714, longitude: 153.0019 }, population: 4600 },
  { suburb: 'Paddington', postcode: '4064', state: 'QLD', regionId: 'brisbane-west', coordinates: { latitude: -27.4603, longitude: 152.9992 }, population: 8200 },
  { suburb: 'Auchenflower', postcode: '4066', state: 'QLD', regionId: 'brisbane-west', coordinates: { latitude: -27.4772, longitude: 152.9928 }, population: 5100 },
  { suburb: 'Toowong', postcode: '4066', state: 'QLD', regionId: 'brisbane-west', coordinates: { latitude: -27.4850, longitude: 152.9872 }, population: 13400 },
  { suburb: 'Taringa', postcode: '4068', state: 'QLD', regionId: 'brisbane-west', coordinates: { latitude: -27.4939, longitude: 152.9803 }, population: 8900 },
  { suburb: 'Indooroopilly', postcode: '4068', state: 'QLD', regionId: 'brisbane-west', coordinates: { latitude: -27.5028, longitude: 152.9711 }, population: 12100 },
  { suburb: 'St Lucia', postcode: '4067', state: 'QLD', regionId: 'brisbane-west', coordinates: { latitude: -27.5022, longitude: 153.0008 }, population: 11800 },
  { suburb: 'Chapel Hill', postcode: '4069', state: 'QLD', regionId: 'brisbane-west', coordinates: { latitude: -27.5092, longitude: 152.9483 }, population: 7200 },
  { suburb: 'Kenmore', postcode: '4069', state: 'QLD', regionId: 'brisbane-west', coordinates: { latitude: -27.5117, longitude: 152.9342 }, population: 8900 },
  { suburb: 'Brookfield', postcode: '4069', state: 'QLD', regionId: 'brisbane-west', coordinates: { latitude: -27.4933, longitude: 152.9067 }, population: 3100 },

  // Ipswich Region
  { suburb: 'Ipswich', postcode: '4305', state: 'QLD', regionId: 'ipswich', coordinates: { latitude: -27.6167, longitude: 152.7667 }, population: 8200 },
  { suburb: 'Booval', postcode: '4304', state: 'QLD', regionId: 'ipswich', coordinates: { latitude: -27.6114, longitude: 152.7894 }, population: 5100 },
  { suburb: 'Bundamba', postcode: '4304', state: 'QLD', regionId: 'ipswich', coordinates: { latitude: -27.6106, longitude: 152.8125 }, population: 6800 },
  { suburb: 'Goodna', postcode: '4300', state: 'QLD', regionId: 'ipswich', coordinates: { latitude: -27.6033, longitude: 152.8936 }, population: 10200 },
  { suburb: 'Springfield', postcode: '4300', state: 'QLD', regionId: 'ipswich', coordinates: { latitude: -27.6667, longitude: 152.9000 }, population: 18500 },
  { suburb: 'Redbank Plains', postcode: '4301', state: 'QLD', regionId: 'ipswich', coordinates: { latitude: -27.6461, longitude: 152.8656 }, population: 22100 },

  // Logan Region
  { suburb: 'Logan Central', postcode: '4114', state: 'QLD', regionId: 'logan', coordinates: { latitude: -27.6419, longitude: 153.1094 }, population: 6800 },
  { suburb: 'Woodridge', postcode: '4114', state: 'QLD', regionId: 'logan', coordinates: { latitude: -27.6292, longitude: 153.1083 }, population: 12400 },
  { suburb: 'Springwood', postcode: '4127', state: 'QLD', regionId: 'logan', coordinates: { latitude: -27.6064, longitude: 153.1300 }, population: 9200 },
  { suburb: 'Underwood', postcode: '4119', state: 'QLD', regionId: 'logan', coordinates: { latitude: -27.5917, longitude: 153.1158 }, population: 8100 },
  { suburb: 'Slacks Creek', postcode: '4127', state: 'QLD', regionId: 'logan', coordinates: { latitude: -27.6500, longitude: 153.1347 }, population: 8900 },
  { suburb: 'Browns Plains', postcode: '4118', state: 'QLD', regionId: 'logan', coordinates: { latitude: -27.6667, longitude: 153.0500 }, population: 14200 },
  { suburb: 'Beenleigh', postcode: '4207', state: 'QLD', regionId: 'logan', coordinates: { latitude: -27.7167, longitude: 153.2000 }, population: 8800 },

  // Gold Coast
  { suburb: 'Southport', postcode: '4215', state: 'QLD', regionId: 'gold-coast', coordinates: { latitude: -27.9667, longitude: 153.4000 }, population: 31200 },
  { suburb: 'Surfers Paradise', postcode: '4217', state: 'QLD', regionId: 'gold-coast', coordinates: { latitude: -28.0028, longitude: 153.4300 }, population: 22500 },
  { suburb: 'Broadbeach', postcode: '4218', state: 'QLD', regionId: 'gold-coast', coordinates: { latitude: -28.0333, longitude: 153.4333 }, population: 8200 },
  { suburb: 'Burleigh Heads', postcode: '4220', state: 'QLD', regionId: 'gold-coast', coordinates: { latitude: -28.0833, longitude: 153.4500 }, population: 9100 },
  { suburb: 'Robina', postcode: '4226', state: 'QLD', regionId: 'gold-coast', coordinates: { latitude: -28.0750, longitude: 153.3833 }, population: 21400 },
  { suburb: 'Nerang', postcode: '4211', state: 'QLD', regionId: 'gold-coast', coordinates: { latitude: -27.9917, longitude: 153.3250 }, population: 16800 },
  { suburb: 'Coolangatta', postcode: '4225', state: 'QLD', regionId: 'gold-coast', coordinates: { latitude: -28.1667, longitude: 153.5333 }, population: 5400 },

  // Sunshine Coast
  { suburb: 'Maroochydore', postcode: '4558', state: 'QLD', regionId: 'sunshine-coast', coordinates: { latitude: -26.6500, longitude: 153.1000 }, population: 18200 },
  { suburb: 'Mooloolaba', postcode: '4557', state: 'QLD', regionId: 'sunshine-coast', coordinates: { latitude: -26.6833, longitude: 153.1167 }, population: 8400 },
  { suburb: 'Caloundra', postcode: '4551', state: 'QLD', regionId: 'sunshine-coast', coordinates: { latitude: -26.8000, longitude: 153.1333 }, population: 12600 },
  { suburb: 'Noosa Heads', postcode: '4567', state: 'QLD', regionId: 'sunshine-coast', coordinates: { latitude: -26.3833, longitude: 153.0833 }, population: 4200 },
  { suburb: 'Buderim', postcode: '4556', state: 'QLD', regionId: 'sunshine-coast', coordinates: { latitude: -26.6833, longitude: 153.0500 }, population: 28500 },
  { suburb: 'Nambour', postcode: '4560', state: 'QLD', regionId: 'sunshine-coast', coordinates: { latitude: -26.6333, longitude: 152.9500 }, population: 11200 },

  // NSW - Regional Examples
  { suburb: 'Urunga', postcode: '2455', state: 'NSW', regionId: 'coffs-harbour', coordinates: { latitude: -30.4962, longitude: 153.0153 }, population: 2800 },
  { suburb: 'Coffs Harbour', postcode: '2450', state: 'NSW', regionId: 'coffs-harbour', coordinates: { latitude: -30.2986, longitude: 153.1119 }, population: 52000 },
  { suburb: 'Sawtell', postcode: '2452', state: 'NSW', regionId: 'coffs-harbour', coordinates: { latitude: -30.3681, longitude: 153.1006 }, population: 5100 },
  { suburb: 'Woolgoolga', postcode: '2456', state: 'NSW', regionId: 'coffs-harbour', coordinates: { latitude: -30.1100, longitude: 153.1900 }, population: 5400 },
];

// ============================================
// Mock Regions
// ============================================

// Mock regions - simplified for demo purposes
// Using centre point as boundaryCoordinates placeholder
export const MOCK_REGIONS: Region[] = [
  {
    id: 'brisbane-inner',
    name: 'Brisbane Inner City',
    state: 'QLD',
    population: 58800,
    areaKm2: 15.8,
    suburbs: ['4000', '4101', '4006', '4005', '4169'],
    boundaryCoordinates: [{ latitude: -27.4698, longitude: 153.0251 }],
  },
  {
    id: 'brisbane-north',
    name: 'Brisbane North',
    state: 'QLD',
    population: 72500,
    areaKm2: 42.5,
    suburbs: ['4006', '4005', '4010', '4030', '4031', '4032', '4053'],
    boundaryCoordinates: [{ latitude: -27.4000, longitude: 153.0350 }],
  },
  {
    id: 'brisbane-south',
    name: 'Brisbane South',
    state: 'QLD',
    population: 89500,
    areaKm2: 55.2,
    suburbs: ['4102', '4151', '4120', '4121', '4122', '4109', '4152'],
    boundaryCoordinates: [{ latitude: -27.5200, longitude: 153.0600 }],
  },
  {
    id: 'brisbane-west',
    name: 'Brisbane West',
    state: 'QLD',
    population: 94300,
    areaKm2: 68.9,
    suburbs: ['4064', '4066', '4067', '4068', '4069'],
    boundaryCoordinates: [{ latitude: -27.4900, longitude: 152.9700 }],
  },
  {
    id: 'ipswich',
    name: 'Ipswich Region',
    state: 'QLD',
    population: 70900,
    areaKm2: 125.4,
    suburbs: ['4305', '4304', '4300', '4301'],
    boundaryCoordinates: [{ latitude: -27.6167, longitude: 152.7667 }],
  },
  {
    id: 'logan',
    name: 'Logan City',
    state: 'QLD',
    population: 68400,
    areaKm2: 78.3,
    suburbs: ['4114', '4127', '4119', '4118', '4207'],
    boundaryCoordinates: [{ latitude: -27.6419, longitude: 153.1094 }],
  },
  {
    id: 'gold-coast',
    name: 'Gold Coast',
    state: 'QLD',
    population: 679000,
    areaKm2: 1334.0,
    suburbs: ['4215', '4217', '4218', '4220', '4226', '4211', '4225'],
    boundaryCoordinates: [{ latitude: -28.0167, longitude: 153.4000 }],
  },
  {
    id: 'sunshine-coast',
    name: 'Sunshine Coast',
    state: 'QLD',
    population: 347000,
    areaKm2: 2292.0,
    suburbs: ['4558', '4557', '4551', '4567', '4556', '4560'],
    boundaryCoordinates: [{ latitude: -26.6500, longitude: 153.0667 }],
  },
  {
    id: 'coffs-harbour',
    name: 'Coffs Harbour Region',
    state: 'NSW',
    population: 75000,
    areaKm2: 892.0,
    suburbs: ['2455', '2450', '2452', '2456'],
    boundaryCoordinates: [{ latitude: -30.2986, longitude: 153.1119 }],
  },
];

// ============================================
// Mock Contractor Generation
// ============================================

export interface MockContractor {
  id: string;
  businessName: string;
  abn: string;
  baseSuburb: string;
  basePostcode: string;
  state: AustralianState;
  selectedRadius: 25 | 50 | 100;
  services: ServiceType[];
  contactName: string;
  email: string;
  phone: string;
  certifications: string[];
}

const BUSINESS_NAME_PREFIXES = [
  'Elite', 'Pro', 'Premium', 'Rapid', 'First Response', 'Emergency',
  'Metro', 'Regional', 'Local', 'Expert', 'Certified', 'All-State',
];

const BUSINESS_NAME_SUFFIXES = [
  'Restoration Services', 'Recovery Solutions', 'Damage Specialists',
  'Emergency Response', 'Building Services', 'Property Solutions',
];

const CERTIFICATIONS = [
  'Water Restoration Technician (WRT)',
  'Fire & Smoke Restoration Technician (FSRT)',
  'Applied Microbial Remediation Technician (AMRT)',
  'Applied Structural Drying (ASD)',
  'Carpet Cleaning Technician (CCT)',
  'AS/NZS 4801 OHS',
  'ISO 9001 Quality Management',
  'Working at Heights Certified',
  'Asbestos Awareness',
  'Licensed Builder',
];

/**
 * Generate a realistic mock contractor
 */
export function generateMockContractor(
  baseSuburb?: Suburb,
  services?: ServiceType[],
  radius?: 25 | 50 | 100
): MockContractor {
  const suburb = baseSuburb || MOCK_SUBURBS[Math.floor(Math.random() * MOCK_SUBURBS.length)];
  const prefix = BUSINESS_NAME_PREFIXES[Math.floor(Math.random() * BUSINESS_NAME_PREFIXES.length)];
  const suffix = BUSINESS_NAME_SUFFIXES[Math.floor(Math.random() * BUSINESS_NAME_SUFFIXES.length)];

  // Select random services if not provided
  const allServices: ServiceType[] = [
    'WATER_DAMAGE', 'FIRE_DAMAGE', 'SMOKE_DAMAGE', 'MOULD_REMEDIATION',
    'STORM_DAMAGE', 'SEWAGE_CLEANUP', 'BIOHAZARD_CLEANUP',
  ];
  const selectedServices = services || allServices.slice(0, Math.floor(Math.random() * 4) + 2);

  // Select random certifications
  const selectedCerts = CERTIFICATIONS
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.floor(Math.random() * 4) + 2);

  return {
    id: `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    businessName: `${prefix} ${suffix}`,
    abn: generateMockABN(),
    baseSuburb: suburb.suburb,
    basePostcode: suburb.postcode,
    state: suburb.state,
    selectedRadius: radius || [25, 50, 100][Math.floor(Math.random() * 3)] as 25 | 50 | 100,
    services: selectedServices,
    contactName: generateMockName(),
    email: `contact@${prefix.toLowerCase().replace(/\s/g, '')}restoration.com.au`,
    phone: generateMockPhone(),
    certifications: selectedCerts,
  };
}

/**
 * Generate suburbs within a radius of a base point
 */
export function generateMockSuburbs(
  baseSuburb: Suburb,
  radiusKm: number
): SuburbWithDistance[] {
  return MOCK_SUBURBS
    .map((suburb) => {
      const distance = calculateDistance(baseSuburb.coordinates, suburb.coordinates);
      return {
        ...suburb,
        distanceKm: Math.round(distance * 10) / 10,
      };
    })
    .filter((suburb) => suburb.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

// ============================================
// Utility Functions
// ============================================

function generateMockABN(): string {
  const digits = Array.from({ length: 11 }, () => Math.floor(Math.random() * 10));
  return `${digits.slice(0, 2).join('')} ${digits.slice(2, 5).join('')} ${digits.slice(5, 8).join('')} ${digits.slice(8).join('')}`;
}

function generateMockName(): string {
  const firstNames = ['Michael', 'David', 'James', 'Robert', 'Sarah', 'Emma', 'Jessica', 'Linda'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Wilson'];
  return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
}

function generateMockPhone(): string {
  const prefix = ['0412', '0421', '0431', '0442', '0451', '0402'][Math.floor(Math.random() * 6)];
  const suffix = Array.from({ length: 6 }, () => Math.floor(Math.random() * 10)).join('');
  return `${prefix} ${suffix.slice(0, 3)} ${suffix.slice(3)}`;
}

function calculateDistance(
  point1: { latitude: number; longitude: number },
  point2: { latitude: number; longitude: number }
): number {
  const EARTH_RADIUS_KM = 6371;

  const toRadians = (degrees: number) => degrees * (Math.PI / 180);

  const lat1Rad = toRadians(point1.latitude);
  const lat2Rad = toRadians(point2.latitude);
  const deltaLat = toRadians(point2.latitude - point1.latitude);
  const deltaLon = toRadians(point2.longitude - point1.longitude);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_KM * c;
}
