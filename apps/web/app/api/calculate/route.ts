/**
 * Cost Calculator API — DR-56/DR-57
 *
 * Public endpoint for disaster recovery cost estimates.
 * Uses NRPG rate card with standardised cost increases.
 *
 * Rate Card (NRPG Standard):
 *   Labour (Qualified):    $85/hr
 *   Labour (Non-Qualified): $65/hr
 *   Equipment markup:      +20%
 *   Chemicals markup:      +20%
 *   Admin fee:             $165/claim
 *   Estimator fee:         $275/claim
 *   Outside services:      Cost + 20%
 *   Minimum callout:       $2,750 ex GST
 *   GST:                   10%
 */

import { NextRequest, NextResponse } from 'next/server';

// ============================================================================
// NRPG Rate Card — DR-56/57
// ============================================================================

const NRPG_RATES = {
  labour: {
    qualified: 85,      // $/hr — Qualified Technician, Normal Hours, Non-Biohazard
    nonQualified: 65,   // $/hr — Non-Qualified / Additional Technician
    biohazard: 110,     // $/hr — Biohazard premium
    afterHours: 1.5,    // Multiplier for after-hours
    weekend: 1.75,      // Multiplier for weekends
  },
  markups: {
    equipment: 0.20,    // 20% on equipment
    chemicals: 0.20,    // 20% on chemicals
    outsideServices: 0.20, // 20% on outside specialised services
  },
  fees: {
    admin: 165,         // $/claim — Admin fee
    estimator: 275,     // $/claim — Estimator fee
  },
  minimumCallout: 2750, // Minimum ex GST
  gstRate: 0.10,

  // Per-service base rates ($/m²) — ASCORA-aligned
  services: {
    water_damage: {
      extraction: 45,           // $/m²
      structuralDrying: 38,     // $/m²/day
      avgDryingDays: 4,
      moistureMonitoring: 85,   // per visit
      antimicrobial: 12,        // $/m²
    },
    mould_remediation: {
      treatment: 55,            // $/m²
      containment: 650,         // per setup
      airScrubbing: 180,        // per day
      avgScrubbingDays: 3,
      hepaVacuum: 18,           // $/m²
    },
    fire_smoke: {
      sootRemoval: 42,          // $/m²
      odourTreatment: 28,       // $/m² (thermal fog + ozone)
      contentsCleaning: 35,     // $/m²
      structuralClean: 48,      // $/m²
    },
    storm_damage: {
      tarping: 32,              // $/m²
      debrisRemoval: 28,        // $/m²
      waterExtraction: 45,      // $/m²
      structuralAssessment: 550, // per assessment
    },
    biohazard: {
      cleaning: 85,             // $/m²
      disposal: 45,             // $/m²
      decontamination: 65,      // $/m²
    },
  },
} as const;

// ============================================================================
// Route Handler
// ============================================================================

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { job_type, inputs } = body;

  if (!job_type || !inputs) {
    return NextResponse.json(
      { error: 'Invalid input. Please provide job_type and inputs.' },
      { status: 400 }
    );
  }

  let calculationResult;
  switch (job_type) {
    case 'water_damage':
      calculationResult = calculateWaterDamage(inputs);
      break;
    case 'mould_remediation':
      calculationResult = calculateMouldRemediation(inputs);
      break;
    case 'fire_smoke':
      calculationResult = calculateFireSmoke(inputs);
      break;
    case 'storm_damage':
      calculationResult = calculateStormDamage(inputs);
      break;
    case 'biohazard':
      calculationResult = calculateBiohazard(inputs);
      break;
    default:
      return NextResponse.json({ error: 'Unknown job type.' }, { status: 400 });
  }

  return NextResponse.json(calculationResult);
}

// ============================================================================
// Helpers
// ============================================================================

function applyFeesAndMinimum(lineItems: LineItem[], rawSubtotal: number) {
  const adminFee = NRPG_RATES.fees.admin;
  const estimatorFee = NRPG_RATES.fees.estimator;

  lineItems.push(
    { name: 'Administration Fee', rate_source: 'NRPG', quantity: 1, unit_rate: adminFee, subtotal: adminFee },
    { name: 'Estimator Fee', rate_source: 'NRPG', quantity: 1, unit_rate: estimatorFee, subtotal: estimatorFee }
  );

  const subtotalExGst = Math.max(rawSubtotal + adminFee + estimatorFee, NRPG_RATES.minimumCallout);
  const gstAmount = Math.round(subtotalExGst * NRPG_RATES.gstRate * 100) / 100;
  const totalIncGst = Math.round((subtotalExGst + gstAmount) * 100) / 100;

  return {
    subtotal_ex_gst: subtotalExGst,
    gst_amount: gstAmount,
    total_inc_gst: totalIncGst,
    minimum_applied: subtotalExGst === NRPG_RATES.minimumCallout,
  };
}

interface LineItem {
  name: string;
  rate_source: string;
  quantity: number;
  unit_rate: number;
  subtotal: number;
}

// ============================================================================
// Calculators
// ============================================================================

function calculateWaterDamage(inputs: Record<string, number>) {
  const area = Number(inputs.area) || Number(inputs.area_m2) || 0;
  const rates = NRPG_RATES.services.water_damage;

  const extractionCost = rates.extraction * area;
  const dryingCost = rates.structuralDrying * area * rates.avgDryingDays;
  const monitoringCost = rates.moistureMonitoring * rates.avgDryingDays;
  const antimicrobialCost = rates.antimicrobial * area;

  const lineItems: LineItem[] = [
    { name: 'Water Extraction', rate_source: 'NRPG', quantity: area, unit_rate: rates.extraction, subtotal: extractionCost },
    { name: `Structural Drying (${rates.avgDryingDays} days)`, rate_source: 'NRPG', quantity: area, unit_rate: rates.structuralDrying * rates.avgDryingDays, subtotal: dryingCost },
    { name: 'Moisture Monitoring', rate_source: 'NRPG', quantity: rates.avgDryingDays, unit_rate: rates.moistureMonitoring, subtotal: monitoringCost },
    { name: 'Antimicrobial Treatment', rate_source: 'NRPG', quantity: area, unit_rate: rates.antimicrobial, subtotal: antimicrobialCost },
  ];

  const rawSubtotal = extractionCost + dryingCost + monitoringCost + antimicrobialCost;
  const totals = applyFeesAndMinimum(lineItems, rawSubtotal);

  return {
    job_type: 'water_damage',
    inputs_received: inputs,
    line_items: lineItems,
    ...totals,
    validation_band: { p25: 3500, median: 8500, p75: 15000 },
  };
}

function calculateMouldRemediation(inputs: Record<string, number | boolean>) {
  const area = Number(inputs.area_m2) || Number(inputs.area) || 0;
  const rates = NRPG_RATES.services.mould_remediation;

  const treatmentCost = rates.treatment * area;
  const containmentCost = inputs.containment_required ? rates.containment : 0;
  const scrubbingCost = rates.airScrubbing * rates.avgScrubbingDays;
  const hepaCost = rates.hepaVacuum * area;

  const lineItems: LineItem[] = [
    { name: 'Mould Remediation', rate_source: 'NRPG', quantity: area, unit_rate: rates.treatment, subtotal: treatmentCost },
    { name: 'HEPA Vacuum', rate_source: 'NRPG', quantity: area, unit_rate: rates.hepaVacuum, subtotal: hepaCost },
    ...(inputs.containment_required ? [{ name: 'Containment Setup', rate_source: 'NRPG', quantity: 1, unit_rate: rates.containment, subtotal: containmentCost }] : []),
    { name: `Air Scrubbing (${rates.avgScrubbingDays} days)`, rate_source: 'NRPG', quantity: rates.avgScrubbingDays, unit_rate: rates.airScrubbing, subtotal: scrubbingCost },
  ];

  const rawSubtotal = treatmentCost + hepaCost + containmentCost + scrubbingCost;
  const totals = applyFeesAndMinimum(lineItems, rawSubtotal);

  return { job_type: 'mould_remediation', inputs_received: inputs, line_items: lineItems, ...totals };
}

function calculateFireSmoke(inputs: Record<string, number | boolean>) {
  const area = Number(inputs.area_m2) || Number(inputs.area) || 0;
  const rates = NRPG_RATES.services.fire_smoke;

  const sootCost = rates.sootRemoval * area;
  const odourCost = inputs.has_odour_treatment ? rates.odourTreatment * area : 0;
  const contentsCost = inputs.contents_cleaning ? rates.contentsCleaning * area : 0;
  const structuralCost = rates.structuralClean * area;

  const lineItems: LineItem[] = [
    { name: 'Soot & Smoke Residue Removal', rate_source: 'NRPG', quantity: area, unit_rate: rates.sootRemoval, subtotal: sootCost },
    { name: 'Structural Cleaning', rate_source: 'NRPG', quantity: area, unit_rate: rates.structuralClean, subtotal: structuralCost },
    ...(inputs.has_odour_treatment ? [{ name: 'Deodorisation (Thermal Fog + Ozone)', rate_source: 'NRPG', quantity: area, unit_rate: rates.odourTreatment, subtotal: odourCost }] : []),
    ...(inputs.contents_cleaning ? [{ name: 'Contents Cleaning', rate_source: 'NRPG', quantity: area, unit_rate: rates.contentsCleaning, subtotal: contentsCost }] : []),
  ];

  const rawSubtotal = sootCost + structuralCost + odourCost + contentsCost;
  const totals = applyFeesAndMinimum(lineItems, rawSubtotal);

  return { job_type: 'fire_smoke', inputs_received: inputs, line_items: lineItems, ...totals };
}

function calculateStormDamage(inputs: Record<string, number | boolean>) {
  const area = Number(inputs.area_m2) || Number(inputs.area) || 0;
  const rates = NRPG_RATES.services.storm_damage;

  const tarpingCost = rates.tarping * area;
  const debrisCost = rates.debrisRemoval * area;
  const waterCost = inputs.water_ingress ? rates.waterExtraction * area : 0;
  const assessmentCost = inputs.structural_assessment ? rates.structuralAssessment : 0;

  const lineItems: LineItem[] = [
    { name: 'Emergency Tarping', rate_source: 'NRPG', quantity: area, unit_rate: rates.tarping, subtotal: tarpingCost },
    { name: 'Debris Removal', rate_source: 'NRPG', quantity: area, unit_rate: rates.debrisRemoval, subtotal: debrisCost },
    ...(inputs.water_ingress ? [{ name: 'Water Extraction', rate_source: 'NRPG', quantity: area, unit_rate: rates.waterExtraction, subtotal: waterCost }] : []),
    ...(inputs.structural_assessment ? [{ name: 'Structural Assessment', rate_source: 'NRPG', quantity: 1, unit_rate: rates.structuralAssessment, subtotal: assessmentCost }] : []),
  ];

  const rawSubtotal = tarpingCost + debrisCost + waterCost + assessmentCost;
  const totals = applyFeesAndMinimum(lineItems, rawSubtotal);

  return { job_type: 'storm_damage', inputs_received: inputs, line_items: lineItems, ...totals };
}

function calculateBiohazard(inputs: Record<string, number | string>) {
  const area = Number(inputs.area_m2) || Number(inputs.area) || 0;
  const rates = NRPG_RATES.services.biohazard;

  const cleaningCost = rates.cleaning * area;
  const disposalCost = rates.disposal * area;
  const decontaminationCost = rates.decontamination * area;

  const lineItems: LineItem[] = [
    { name: 'Biohazard Cleaning', rate_source: 'NRPG', quantity: area, unit_rate: rates.cleaning, subtotal: cleaningCost },
    { name: 'Waste Disposal', rate_source: 'NRPG', quantity: area, unit_rate: rates.disposal, subtotal: disposalCost },
    { name: 'Decontamination', rate_source: 'NRPG', quantity: area, unit_rate: rates.decontamination, subtotal: decontaminationCost },
  ];

  const rawSubtotal = cleaningCost + disposalCost + decontaminationCost;
  const totals = applyFeesAndMinimum(lineItems, rawSubtotal);

  return { job_type: 'biohazard', inputs_received: inputs, line_items: lineItems, ...totals };
}
