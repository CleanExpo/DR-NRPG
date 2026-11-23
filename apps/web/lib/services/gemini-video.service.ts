// @ts-nocheck

/**
 * Gemini Video Generation Service
 * Uses Veo 3.1 for high-quality video generation
 * Released: October 2025
 * Capabilities: 8s videos, 720p/1080p, native audio, image-to-video, video extension
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export interface VideoGenerationOptions {
  prompt: string;
  resolution?: '720p' | '1080p';
  aspectRatio?: '16:9' | '9:16' | '1:1';
  duration?: 8; // Veo 3.1 generates 8-second clips
  negativePrompt?: string;
  audioStyle?: string;
  outputPath?: string;
  referenceImage?: Buffer;
}

export class GeminiVideoService {
  private model;

  constructor() {
    // Veo 3.1 Generate Preview - Latest video generation model (October 2025)
    this.model = genAI.getGenerativeModel({
      model: 'veo-3.1-generate-preview',
    });
  }

  async generateVideo(options: VideoGenerationOptions): Promise<Buffer> {
    const {
      prompt,
      resolution = '1080p',
      aspectRatio = '16:9',
      duration = 8,
      negativePrompt = '',
      audioStyle = 'ambient background sounds, professional atmosphere',
      outputPath,
      referenceImage,
    } = options;

    const fullPrompt = `
Generate a professional ${resolution} video (${duration} seconds, ${aspectRatio} aspect ratio).

SCENE: ${prompt}

AUDIO: ${audioStyle}

${negativePrompt ? `AVOID: ${negativePrompt}` : ''}

TECHNICAL REQUIREMENTS:
- Realistic physics and motion
- Professional cinematography
- Smooth camera movements
- Natural lighting
- High production value
- Cinematic composition
`;

    console.log(`🎬 Generating ${resolution} video with Veo 3.1...`);
    console.log(`📝 Prompt: ${prompt.substring(0, 100)}...`);

    // Veo requires polling for completion (long-running operation)
    const parts = [{ text: fullPrompt }];

    if (referenceImage) {
      parts.push({
        inlineData: {
          data: referenceImage.toString('base64'),
          mimeType: 'image/jpeg',
        },
      });
    }

    const response = await this.model.generateContent({
      contents: [{ role: 'user', parts }],
    });

    // Note: Veo 3.1 returns operation that needs polling
    // For production, implement proper polling mechanism
    console.log('⏳ Video generation started (this may take 1-2 minutes)...');

    // Extract video data from response
    for (const part of response.response.candidates[0].content.parts) {
      if (part.videoData) {
        const buffer = Buffer.from(part.videoData, 'base64');

        if (outputPath) {
          const dir = path.dirname(outputPath);
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
          fs.writeFileSync(outputPath, buffer);
          console.log(`✅ Video saved: ${outputPath}`);
        }

        return buffer;
      }
    }

    throw new Error('No video generated in response');
  }

  /**
   * Generate hero carousel scenario videos for NRPG platform
   * Professional 8-second clips showing emergency response scenarios
   */
  async generateScenarioVideo(
    scenario: 'residential-flood' | 'commercial-fire' | 'industrial-bio'
  ): Promise<Buffer> {
    const prompts = {
      'residential-flood': `
Cinematic 8-second emergency water damage response video in Australian suburban home.

SEQUENCE (8 seconds total):
00:00-02:00 - Establishing shot: Flooded basement interior, water on floor, natural window light
02:00-04:00 - Professional technician in clean uniform enters with equipment case
04:00-06:00 - Close-up: Industrial water extractor being positioned, equipment details visible
06:00-08:00 - Wide shot: Multiple pieces of restoration equipment operational, professional setup

CINEMATOGRAPHY:
- Handheld documentary style (slight natural movement)
- Natural lighting from basement windows supplemented by work lights
- Smooth camera movements (no jerky motion)
- Professional color grading (slightly desaturated for serious tone)
- 1080p resolution, 16:9 aspect ratio
- Eye-level to slightly low angle shots

AUDIO:
- Ambient water dripping sounds
- Equipment humming and operation sounds
- Footsteps on wet floor
- Professional work environment atmosphere
- NO music (serious emergency response tone)
- Natural room acoustics

MOOD: Professional emergency response, organized, competent, hopeful, realistic

AVOID: Dramatic music, people's faces in close-up, extreme destruction, horror aesthetic, chaos
`,

      'commercial-fire': `
Cinematic 8-second fire damage restoration response video in Australian commercial office.

SEQUENCE (8 seconds total):
00:00-02:00 - Establishing shot: Smoke-damaged office interior, soot on walls, damaged ceiling
02:00-04:00 - Professional restoration team (2-3 people, back view) entering with equipment
04:00-06:00 - Close-up: Air scrubber and HEPA filtration equipment being set up
06:00-08:00 - Wide shot: Team conducting damage assessment, equipment operational

CINEMATOGRAPHY:
- Steady cam professional documentary style
- Emergency lighting + portable work lights creating dramatic but professional atmosphere
- Smooth tracking shots following team movement
- Desaturated color grade emphasizing soot and damage
- 1080p resolution, 16:9 aspect ratio
- Slightly high angle for documentation perspective

AUDIO:
- Low ambient office sounds
- Equipment motors and air filtration sounds
- Footsteps on wet carpet
- Radio communications (distant, professional)
- Professional work environment
- NO music (serious business emergency)

MOOD: Serious business continuity focus, professional response, organized recovery, competent

AVOID: Active flames, faces in close-up, extreme destruction, horror elements, dramatic music
`,

      'industrial-bio': `
Cinematic 8-second industrial biohazard cleanup preparation video in warehouse.

SEQUENCE (8 seconds total):
00:00-02:00 - Establishing wide shot: Massive warehouse interior, high ceilings, industrial lighting
02:00-04:00 - Professional hazmat team (3-4 people in full suits, back/side view) entering facility
04:00-06:00 - Close-up: Professional equipment being staged - HEPA filters, decon equipment
06:00-08:00 - Wide shot: Team conducting facility assessment, safety protocols in action

CINEMATOGRAPHY:
- Wide establishing shots emphasizing facility scale
- Steady professional industrial documentary style
- Bright industrial lighting (well-lit, clear visibility)
- Professional technical color grading
- 1080p resolution, 16:9 aspect ratio
- Eye-level industrial photography angles

AUDIO:
- Industrial facility ambient sounds (subtle machinery hum)
- Hazmat suit movement sounds (fabric, breathing apparatus)
- Equipment being deployed (wheels, metal equipment)
- Echo in large warehouse space
- Professional technical atmosphere
- NO music (serious safety-focused)

MOOD: Professional, technical, safety-focused, organized, industrial documentation, prepared

AVOID: Faces, contamination visible, gore, medical content, dark/horror aesthetic, dramatic elements
`,
    };

    const outputPath = path.join(
      process.cwd(),
      'public',
      'videos',
      'scenarios',
      `${scenario}.mp4`
    );

    return this.generateVideo({
      prompt: prompts[scenario],
      resolution: '1080p',
      aspectRatio: '16:9',
      audioStyle: 'Ambient emergency response sounds, professional work environment, realistic',
      negativePrompt:
        'music, faces in close-up, text, logos, watermarks, extreme destruction, horror, chaos',
      outputPath,
    });
  }

  /**
   * Extend an existing video to create longer sequences
   * Veo 3.1 can chain 8-second clips into 60+ second videos
   */
  async extendVideo(
    previousVideoPath: string,
    continuationPrompt: string
  ): Promise<Buffer> {
    const previousVideo = fs.readFileSync(previousVideoPath);

    console.log('🎬 Extending video with Veo 3.1...');

    const response = await this.model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                data: previousVideo.toString('base64'),
                mimeType: 'video/mp4',
              },
            },
            { text: `Continue this video seamlessly: ${continuationPrompt}` },
          ],
        },
      ],
    });

    for (const part of response.response.candidates[0].content.parts) {
      if (part.videoData) {
        return Buffer.from(part.videoData, 'base64');
      }
    }

    throw new Error('No video extension generated');
  }

  /**
   * Convert image to video (image-to-video generation)
   * Useful for animating static scenes
   */
  async imageToVideo(imagePath: string, animationPrompt: string): Promise<Buffer> {
    const image = fs.readFileSync(imagePath);

    console.log('🎬 Converting image to video with Veo 3.1...');

    const fullPrompt = `
Animate this image: ${animationPrompt}

ANIMATION REQUIREMENTS:
- Smooth, natural camera movement
- Realistic motion and physics
- Professional cinematography
- 8 seconds duration
- Maintain image composition and style
`;

    const response = await this.model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                data: image.toString('base64'),
                mimeType: 'image/jpeg',
              },
            },
            { text: fullPrompt },
          ],
        },
      ],
    });

    for (const part of response.response.candidates[0].content.parts) {
      if (part.videoData) {
        return Buffer.from(part.videoData, 'base64');
      }
    }

    throw new Error('No video generated from image');
  }

  /**
   * Test function to verify Veo 3.1 API access
   */
  async testConnection(): Promise<boolean> {
    try {
      console.log('🧪 Testing Veo 3.1 API connection...');

      const testResponse = await this.model.generateContent({
        contents: [
          {
            role: 'user',
            parts: [{ text: 'Generate a simple 8-second test video: A blue sphere rotating slowly on white background' }],
          },
        ],
      });

      console.log('✅ Veo 3.1 API connection successful!');
      console.log('📹 Video generation operation started');
      return true;
    } catch (error) {
      console.error('❌ Veo 3.1 API connection failed:', error);
      return false;
    }
  }
}

export const geminiVideoService = new GeminiVideoService();
