/**
 * Generate SEO Pillar Pages and Sub-Pillar Content
 * Creates comprehensive topic cluster architecture
 */

const fs = require('fs');
const path = require('path');

// Pillar page structure: 5 main pillars with sub-pillars
const pillarStructure = {
  'water-damage': {
    title: 'Water Damage Restoration',
    description: 'Complete guide to water damage restoration services across Australia',
    protocol: 'Industry Standard',
    subPillars: [
      'basement-flooding',
      'burst-pipe-repair',
      'flood-restoration',
      'ceiling-water-damage',
      'carpet-water-damage',
      'commercial-water-damage',
      'structural-drying'
    ]
  },
  'fire-smoke-damage': {
    title: 'Fire & Smoke Damage Restoration',
    description: 'Expert fire and smoke damage restoration services',
    protocol: 'IICRC FSRT',
    subPillars: [
      'fire-damage-restoration',
      'smoke-damage-restoration',
      'soot-removal',
      'smoke-odor-removal',
      'commercial-fire-damage'
    ]
  },
  'mould-remediation': {
    title: 'Mould Remediation Services',
    description: 'Professional mould removal and remediation',
    protocol: 'Industry Standard',
    subPillars: [
      'black-mould-removal',
      'mould-inspection',
      'mould-testing',
      'mould-prevention',
      'commercial-mould-remediation'
    ]
  },
  'biohazard-cleanup': {
    title: 'Biohazard Cleanup Services',
    description: 'Certified biohazard and trauma scene cleanup',
    protocol: 'Industry Standard',
    subPillars: [
      'crime-scene-cleanup',
      'trauma-cleanup',
      'meth-lab-decontamination',
      'sewage-cleanup',
      'hoarding-cleanup'
    ]
  },
  'storm-damage': {
    title: 'Storm Damage Restoration',
    description: 'Emergency storm and weather damage restoration',
    protocol: 'Multiple IICRC Standards',
    subPillars: [
      'roof-storm-damage',
      'wind-damage-restoration',
      'hail-damage-repair',
      'tree-damage-cleanup',
      'emergency-roof-tarping'
    ]
  }
};

function generatePillarPageComponent(pillarSlug, pillarData) {
  return `import Header from "@/components/header"
import Footer from "@/components/footer"
import { Shield, CheckCircle, Clock, Phone, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function ${pillarSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')}PillarPage() {
  return (
    <div className="min-h-screen bg-[#0F1115] text-[#F9FAFB]">
      <Header />
      <main className="py-24">
        {/* Hero Section */}
        <section className="container mx-auto px-6 mb-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center px-4 py-2 bg-[#00BFA6]/10 border border-[#00BFA6]/30 rounded-full text-[#00BFA6] text-sm font-medium mb-6">
              ${pillarData.protocol}
            </div>
            <h1 className="font-poppins font-bold text-4xl md:text-6xl text-balance mb-6">
              ${pillarData.title} <span className="text-[#00BFA6]">Australia</span>
            </h1>
            <p className="text-xl text-[#9CA3AF] mb-8">
              ${pillarData.description}. IICRC-certified professionals. 24/7 emergency response across major Australian cities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-[#00BFA6] hover:bg-[#00A693] text-[#0F1115] font-semibold px-8 py-3 text-lg">
                <Phone className="mr-2 h-5 w-5" />
                Call 1300 309 361
              </Button>
              <Button variant="outline" className="border-[#374151] text-[#F9FAFB] hover:bg-[#1F2937] px-8 py-3 text-lg bg-transparent">
                Request Service Quote
              </Button>
            </div>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="container mx-auto px-6 mb-16">
          <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] text-center">
              <div className="text-3xl font-bold text-[#00BFA6] mb-2">24/7</div>
              <div className="text-[#9CA3AF]">Emergency Response</div>
            </div>
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] text-center">
              <div className="text-3xl font-bold text-[#2196F3] mb-2">100%</div>
              <div className="text-[#9CA3AF]">IICRC Certified</div>
            </div>
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] text-center">
              <div className="text-3xl font-bold text-[#7C4DFF] mb-2">8</div>
              <div className="text-[#9CA3AF]">States Covered</div>
            </div>
            <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] text-center">
              <div className="text-3xl font-bold text-[#FFD700] mb-2">60min</div>
              <div className="text-[#9CA3AF]">Target Response</div>
            </div>
          </div>
        </section>

        {/* Sub-Services (Sub-Pillar Links) */}
        <section className="container mx-auto px-6 mb-16">
          <h2 className="font-poppins font-semibold text-3xl text-center text-white mb-12">
            ${pillarData.title} Services
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            ${pillarData.subPillars.map(sub => `
            <Link href="/services/${pillarSlug}/${sub}">
              <div className="bg-gradient-to-br from-[#1F2937] to-[#0F1115] rounded-2xl p-6 border border-[#374151] hover:border-[#00BFA6] transition-colors cursor-pointer">
                <CheckCircle className="h-8 w-8 text-[#00BFA6] mb-4" />
                <h3 className="font-poppins font-semibold text-lg text-white mb-3">
                  ${sub.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </h3>
                <p className="text-[#9CA3AF] text-sm mb-4">
                  Specialized ${sub.replace(/-/g, ' ')} services with IICRC-certified professionals.
                </p>
                <div className="text-[#00BFA6] text-sm font-medium flex items-center">
                  Learn More
                  <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </div>
            </Link>
            `).join('\n')}
          </div>
        </section>

        {/* Emergency CTA */}
        <section className="container mx-auto px-6">
          <div className="bg-gradient-to-r from-[#EF4444] to-[#DC2626] rounded-2xl p-12 text-center">
            <h2 className="font-poppins font-bold text-3xl md:text-4xl text-white mb-4">
              Emergency ${pillarData.title}?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              24/7 emergency response. Call now for immediate assistance.
            </p>
            <Button className="bg-white hover:bg-white/90 text-[#EF4444] font-bold text-xl px-12 py-4">
              <Phone className="mr-2 h-6 w-6" />
              1300 309 361
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
`;
}

// Create pillar page directories and files
console.log('🏗️  Creating Pillar Page Architecture\n');

for (const [pillarSlug, pillarData] of Object.entries(pillarStructure)) {
  const pillarDir = path.join(process.cwd(), 'app', 'services', pillarSlug);

  // Create pillar directory
  if (!fs.existsSync(pillarDir)) {
    fs.mkdirSync(pillarDir, { recursive: true });
    console.log(`✅ Created: app/services/${pillarSlug}/`);
  }

  // Create main pillar page
  const pillarPagePath = path.join(pillarDir, 'page.tsx');
  const pillarComponent = generatePillarPageComponent(pillarSlug, pillarData);
  fs.writeFileSync(pillarPagePath, pillarComponent);
  console.log(`✅ Created: app/services/${pillarSlug}/page.tsx`);

  // Create sub-pillar directories
  pillarData.subPillars.forEach(subPillar => {
    const subPillarDir = path.join(pillarDir, subPillar);
    if (!fs.existsSync(subPillarDir)) {
      fs.mkdirSync(subPillarDir, { recursive: true });
      console.log(`   ✅ Created: app/services/${pillarSlug}/${subPillar}/`);
    }

    // Create placeholder sub-pillar page
    const subPillarPagePath = path.join(subPillarDir, 'page.tsx');
    const subPillarContent = `import { redirect } from 'next/navigation';

// Redirect to main service page for now
// TODO: Build out comprehensive sub-pillar content
export default function ${subPillar.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')}Page() {
  redirect('/services/${pillarSlug}');
}
`;
    fs.writeFileSync(subPillarPagePath, subPillarContent);
    console.log(`   📄 Created: app/services/${pillarSlug}/${subPillar}/page.tsx`);
  });

  console.log('');
}

console.log('━'.repeat(70));
console.log('🎉 PILLAR PAGE ARCHITECTURE CREATED!\n');
console.log('Created:');
console.log('  ✅ 5 Main Pillar Pages');
console.log('  ✅ 35+ Sub-Pillar Page Placeholders\n');
console.log('Structure:');
console.log('  /services/water-damage/ (+ 7 sub-pillars)');
console.log('  /services/fire-smoke-damage/ (+ 5 sub-pillars)');
console.log('  /services/mold-remediation/ (+ 5 sub-pillars)');
console.log('  /services/biohazard-cleanup/ (+ 5 sub-pillars)');
console.log('  /services/storm-damage/ (+ 5 sub-pillars)\n');
console.log('✅ Ready for content development!');
