/**
 * Gemini Image Generation Service
 * Uses Nano Banana Pro (Gemini 3 Pro Preview) for high-quality image generation
 * Released: November 2025
 * Capabilities: 2K/4K images, advanced control, text rendering, object blending
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export interface ImageGenerationOptions {
  prompt: string;
  resolution?: '1080p' | '2K' | '4K';
  aspectRatio?: '16:9' | '4:3' | '1:1' | '9:16';
  style?: string;
  negativePrompt?: string;
  outputPath?: string;
}

export class GeminiImageService {
  private model;

  constructor() {
    // Gemini 2.5 Flash Image (Latest recommended model - December 2025)
    // Higher quota limits, supports image generation with advanced control
    this.model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash-image', // Latest recommended model with higher quota
    });
  }

  async generateImage(options: ImageGenerationOptions): Promise<Buffer> {
    const {
      prompt,
      resolution = '2K',
      aspectRatio = '16:9',
      style = 'Professional photographic documentation',
      negativePrompt = '',
      outputPath,
    } = options;

    const fullPrompt = `
Generate a professional ${resolution} photograph with ${aspectRatio} aspect ratio.

STYLE: ${style}

SCENE: ${prompt}

${negativePrompt ? `AVOID: ${negativePrompt}` : ''}

TECHNICAL REQUIREMENTS:
- High detail and clarity
- Professional color grading
- Proper lighting and composition
- Sharp focus on main subject
- Realistic textures and materials
- Natural physics and perspective
`;

    console.log(`🎨 Generating ${resolution} image with Nano Banana Pro...`);
    console.log(`📝 Prompt: ${prompt.substring(0, 100)}...`);

    const response = await this.model.generateContent(fullPrompt);

    // Extract image data from response
    for (const part of response.response.candidates[0].content.parts) {
      if (part.inlineData) {
        const buffer = Buffer.from(part.inlineData.data, 'base64');

        // Save to file if output path provided
        if (outputPath) {
          const dir = path.dirname(outputPath);
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
          fs.writeFileSync(outputPath, buffer);
          console.log(`✅ Image saved: ${outputPath}`);
        }

        return buffer;
      }
    }

    throw new Error('No image generated in response');
  }

  /**
   * Generate hero carousel scenario images for NRPG platform
   * High-quality 4K images for main homepage carousel
   */
  async generateScenarioImage(
    scenario: 'residential-flood' | 'commercial-fire' | 'industrial-bio'
  ): Promise<Buffer> {
    const prompts = {
      'residential-flood': `
Professional insurance documentation photograph of a flooded Australian suburban home basement.

SCENE DETAILS:
- Modern Australian home basement, partially flooded
- 2-3 inches of clean water covering hardwood floor
- Wet carpet visible in background, some furniture with water damage
- Natural daylight streaming from small basement windows
- Water droplets and reflections visible on surfaces
- Clean but damaged aesthetic (not catastrophic destruction)
- White walls with water line marks
- Wooden stairs partially wet

CAMERA SETTINGS:
- Shot with professional wide angle 24mm lens
- f/2.8 aperture for shallow depth of field with background blur
- Focus on water and damaged flooring in foreground
- Natural color grading with slightly cool tones
- Professional photojournalism/insurance documentation style
- Eye-level perspective

LIGHTING:
- Soft natural window light from basement windows (main light source)
- Some ambient room lighting
- Subtle shadows for depth and realism
- Realistic water reflections catching light
- Professional documentation quality

COMPOSITION:
- Foreground: Water-covered floor (sharp focus)
- Midground: Damaged furniture/carpet
- Background: Basement stairs and windows (slight blur)

MOOD: Serious but hopeful, professional emergency response documentation, realistic disaster scene

AVOID: People, extreme destruction, dark/horror aesthetic, fake-looking CGI, dramatic flames, chaos, debris piles
`,

      'commercial-fire': `
Professional insurance documentation photograph of fire and smoke damage in Australian commercial office building.

SCENE DETAILS:
- Modern open-plan office interior with cubicles
- Smoke-damaged white walls and drop ceiling (visible black soot marks and stains)
- Water damage on commercial carpet from sprinkler system activation
- Damaged office furniture (desks, ergonomic chairs, computers)
- Overhead LED panel lighting partially working
- Some ceiling tiles damaged or missing
- Professional clean lines visible despite damage
- Glass partitions with smoke residue

CAMERA SETTINGS:
- Shot with professional 35mm lens
- f/4 aperture for good depth of field (most scene in focus)
- Focus on smoke-damaged walls and ceiling area
- Desaturated color grading for serious, documentary tone
- Wide establishing shot showing extent of damage
- Slight high angle for documentation perspective

LIGHTING:
- Overhead commercial LED lighting (60% working, 40% damaged/off)
- Natural daylight from large office windows
- Dramatic but professional lighting
- Clear visibility of all damaged areas
- Even exposure throughout frame

COMPOSITION:
- Foreground: Wet carpet and damaged office furniture
- Midground: Smoke-damaged walls and ceiling (hero element)
- Background: Office windows and structural elements

MOOD: Serious business emergency, business continuity focus, professional documentation, recoverable damage

AVOID: Active flames, people, extreme destruction, collapsed structures, horror aesthetic, unrealistic damage, debris everywhere
`,

      'industrial-bio': `
Professional photograph of large Australian industrial warehouse facility prepared for biohazard cleanup operation.

SCENE DETAILS:
- Massive warehouse interior with 30-foot high ceilings
- Industrial polished concrete floors (clean, professional)
- Metal industrial shelving and equipment visible
- Professional hazmat containment barriers staged (yellow/orange tape)
- HEPA filtration equipment on wheels, ready for deployment
- Industrial overhead lighting grid (bright, even)
- Clean professional technical aesthetic
- Safety equipment staged professionally
- Australian industrial safety standards visible

CAMERA SETTINGS:
- Shot with professional 24mm ultra-wide angle lens
- f/5.6 for maximum depth of field and clarity throughout
- Focus on industrial space showing scale and equipment
- Color graded for technical clarity and professionalism
- Wide establishing shot emphasizing facility size
- Eye-level industrial photography perspective

LIGHTING:
- Bright industrial overhead LED/fluorescent lighting
- Even, professional illumination throughout space
- No dark corners - technical documentation requires visibility
- Professional industrial photography lighting
- Clear visibility of all safety equipment

COMPOSITION:
- Foreground: Containment barriers and HEPA equipment (staged)
- Midground: Warehouse floor and industrial space
- Background: High ceilings with industrial lighting grid
- Emphasize scale, safety, professionalism

MOOD: Professional, technical, safety-focused, industrial documentation, organized preparedness

AVOID: People in frame, gore, medical/hospital content, dark/horror aesthetic, chaos, disorganization, contamination visible
`,
    };

    const outputPath = path.join(
      process.cwd(),
      'public',
      'images',
      'scenarios',
      `${scenario}.jpg`
    );

    return this.generateImage({
      prompt: prompts[scenario],
      resolution: '4K',
      aspectRatio: '16:9',
      style: 'Professional photographic documentation, photorealistic',
      negativePrompt:
        'people, faces, text, watermarks, logos, cartoon, illustration, drawing, 3D render, fake, CGI, unrealistic',
      outputPath,
    });
  }

  /**
   * Generate service card images for NRPG platform
   * Professional equipment/scene photography for service categories
   */
  async generateServiceCardImage(
    service: 'water' | 'fire' | 'mould' | 'bio'
  ): Promise<Buffer> {
    const prompts = {
      water: `
Professional product photography of industrial water damage restoration equipment in operation.

EQUIPMENT (HERO SUBJECTS):
- Large truck-mounted water extractor (blue/silver industrial equipment)
- Commercial-grade dehumidifier units (professional gray/white)
- High-velocity air movers (orange safety color)
- All equipment clean, professional-grade, operational
- qualified professional equipment

SETTING:
- Clean Australian residential interior (modern home)
- Natural hardwood or tile flooring
- Good natural window lighting
- Professional work environment
- Equipment arranged professionally

CAMERA SETTINGS:
- Shot with 50mm lens for natural perspective
- f/2.8 aperture for subject isolation
- Focus on main water extractor (hero)
- Background slightly blurred
- Professional commercial photography color grading

LIGHTING:
- Natural window light as main source
- Soft, even illumination
- Professional commercial product lighting
- Equipment details clearly visible

COMPOSITION:
- Equipment as hero subjects (foreground, sharp focus)
- Clean residential background (midground, slight blur)
- Professional workspace aesthetic

MOOD: Clean, professional, trustworthy, industrial quality equipment, technical competence

AVOID: People, dirty/messy environment, damaged equipment, text, logos, cartoon style, dark aesthetic
`,

      fire: `
Professional photograph of fire and smoke damage restoration equipment and setup.

EQUIPMENT:
- Industrial air scrubbers with visible HEPA filters (large gray units)
- Professional cleaning equipment and supplies
- Thermal imaging camera on tripod
- Safety equipment (hard hats, respirators) displayed professionally
- Negative air machine with ducting

SETTING:
- Professional job site (smoke-damaged commercial interior)
- Containment barriers visible (clean setup)
- Well-lit professional workspace
- Equipment in operational state
- Organized, professional presentation

CAMERA SETTINGS:
- Shot with 35mm lens
- f/4 aperture for equipment detail
- Focus on air scrubbers and HEPA equipment
- Professional technical documentation style
- Color graded for clarity and professionalism

LIGHTING:
- Professional work lighting (bright, even)
- Equipment details clearly visible
- No harsh shadows
- Technical photography illumination

COMPOSITION:
- Air scrubbers as hero equipment (foreground)
- Professional job site setup (midground)
- Clean organized workspace visible (background)

MOOD: Professional, safety-focused, technical expertise, organized response, industrial capability

AVOID: Active fire, people, extreme damage, dark/dramatic aesthetic, chaos, text, logos
`,

      mould: `
Professional photograph of mold remediation containment setup and equipment.

EQUIPMENT & SETUP:
- Clear 6-mil plastic containment barriers (professional installation)
- Industrial HEPA air filtration units (white/gray professional equipment)
- Negative air machines with ducting
- Professional protective equipment displayed (white Tyvek suits, respirators)
- Decontamination chamber visible
- Moisture meters and testing equipment

SETTING:
- Professional mold remediation job site
- Containment area properly sealed
- Clean, organized workspace
- Safety protocols clearly visible
- Professional technical environment

CAMERA SETTINGS:
- Shot with 28mm lens for workspace documentation
- f/5.6 for maximum clarity throughout scene
- Focus on containment barriers and HEPA equipment
- Professional safety documentation photography
- Clear, technical color grading

LIGHTING:
- Bright professional work lighting
- Even illumination throughout containment area
- Safety-focused visibility
- Technical documentation lighting
- All equipment and safety measures clearly visible

COMPOSITION:
- Containment barriers (foreground, clear detail)
- HEPA filtration equipment (midground, hero)
- Professional workspace (background, organized)

MOOD: Safety-first, professional, technical competence, organized, health-focused, meticulous

AVOID: Visible mold, people, contamination, dark aesthetic, chaos, medical/hospital content, text, logos
`,

      bio: `
Professional product photography of biohazard cleanup personal protective equipment and decontamination tools.

EQUIPMENT DISPLAY:
- Full Level A hazmat protective suits (yellow or white, clean and professional)
- Full-face respirators with P100 filters
- Chemical-resistant gloves and boots
- Professional decontamination equipment
- ATP testing devices
- Biohazard waste containers (proper labeling)
- Decon shower equipment

SETTING:
- Clean white or light gray background (studio style)
- OR professional clean room/staging area
- Professional equipment display
- Well-organized presentation
- Technical facility aesthetic

CAMERA SETTINGS:
- Shot with 50mm lens for product detail
- f/8 for maximum sharpness and detail
- Focus on hazmat suits and respiratory protection
- Professional product photography style
- Clean, technical color grading

LIGHTING:
- Professional studio lighting (soft, even)
- No harsh shadows
- Equipment details clearly visible
- Safety equipment features highlighted
- Technical product photography illumination

COMPOSITION:
- Hazmat suits as hero subjects (center, sharp focus)
- Professional equipment arranged around suits
- Clean, organized technical presentation
- Safety-focused product display

MOOD: Safety-focused, professional, technical expertise, clean, trustworthy, health protection, meticulous care

AVOID: People wearing equipment, gore, contamination, medical/hospital setting, dark aesthetic, chaos, biohazard symbols, text, logos
`,
    };

    const outputPath = path.join(
      process.cwd(),
      'public',
      'images',
      'services',
      `${service}-card.jpg`
    );

    return this.generateImage({
      prompt: prompts[service],
      resolution: '2K',
      aspectRatio: '4:3',
      style: 'Professional product/equipment photography, photorealistic',
      negativePrompt:
        'people, faces, gore, blood, extreme damage, dark horror aesthetic, cartoon, illustration, text, watermarks, logos',
      outputPath,
    });
  }

  /**
   * Generate sector card images for NRPG platform
   * Professional photography representing each client sector
   */
  async generateSectorImage(
    sector: 'residential' | 'commercial' | 'industrial' | 'insurance'
  ): Promise<Buffer> {
    const prompts = {
      residential: `
Professional architectural photograph of modern Australian suburban home exterior.

SCENE:
- Beautiful modern Australian family home
- Well-maintained front facade and landscaping
- Clear blue sky, natural daylight
- Lush green lawn and garden
- Professional real estate photography aesthetic
- Welcoming, aspirational home

STYLE: Professional real estate photography, natural colors, inviting
`,

      commercial: `
Professional architectural photograph of modern Australian commercial office building.

SCENE:
- Sleek modern office building exterior
- Glass and steel contemporary architecture
- Business district setting
- Clear professional atmosphere
- Blue sky background
- Professional corporate photography

STYLE: Commercial architectural photography, professional, modern, business-focused
`,

      industrial: `
Professional photograph of Australian industrial manufacturing facility exterior.

SCENE:
- Large industrial warehouse/factory building
- Modern industrial architecture
- Clean professional facility
- Industrial scale and capability visible
- Clear professional environment
- Well-maintained facility

STYLE: Industrial photography, professional, capability-focused, technical
`,

      insurance: `
Professional business photograph representing insurance industry partnership.

SCENE:
- Modern professional office handshake or partnership imagery
- Clean corporate environment
- Professional business aesthetic
- Trust and reliability visual
- Australian business setting

STYLE: Corporate photography, professional, trust-focused, partnership aesthetic
`,
    };

    const outputPath = path.join(
      process.cwd(),
      'public',
      'images',
      'sectors',
      `${sector}.jpg`
    );

    return this.generateImage({
      prompt: prompts[sector],
      resolution: '2K',
      aspectRatio: '16:9',
      style: 'Professional architectural/corporate photography',
      negativePrompt: 'people faces, text, logos, watermarks, damage, disaster',
      outputPath,
    });
  }

  /**
   * Test function to verify Gemini API is working
   */
  async testConnection(): Promise<boolean> {
    try {
      console.log('🧪 Testing Gemini API connection...');

      const testResponse = await this.model.generateContent(
        'Generate a simple test image: A blue circle on white background'
      );

      for (const part of testResponse.response.candidates[0].content.parts) {
        if (part.inlineData) {
          console.log('✅ Gemini API connection successful!');
          console.log(`📊 Image data received: ${part.inlineData.data.length} bytes`);
          return true;
        }
      }

      console.log('⚠️ No image data in response');
      return false;
    } catch (error) {
      console.error('❌ Gemini API connection failed:', error);
      return false;
    }
  }
}

export const geminiImageService = new GeminiImageService();
