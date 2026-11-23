"use strict";
/**
 * Gemini Image Generation Service
 * Uses Nano Banana Pro (Gemini 3 Pro Preview) for high-quality image generation
 * Released: November 2025
 * Capabilities: 2K/4K images, advanced control, text rendering, object blending
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.geminiImageService = exports.GeminiImageService = void 0;
var generative_ai_1 = require("@google/generative-ai");
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY);
var GeminiImageService = /** @class */ (function () {
    function GeminiImageService() {
        // Nano Banana Pro = Gemini 3 Pro Preview with native image generation
        // Supports 2K/4K generation, advanced camera control, text rendering
        this.model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash-exp', // Updated model with image generation
            generationConfig: {
                responseModalities: ['Text', 'Image'],
                temperature: 0.4,
            },
        });
    }
    GeminiImageService.prototype.generateImage = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var prompt, _a, resolution, _b, aspectRatio, _c, style, _d, negativePrompt, outputPath, fullPrompt, response, _i, _e, part, buffer, dir;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        prompt = options.prompt, _a = options.resolution, resolution = _a === void 0 ? '2K' : _a, _b = options.aspectRatio, aspectRatio = _b === void 0 ? '16:9' : _b, _c = options.style, style = _c === void 0 ? 'Professional photographic documentation' : _c, _d = options.negativePrompt, negativePrompt = _d === void 0 ? '' : _d, outputPath = options.outputPath;
                        fullPrompt = "\nGenerate a professional ".concat(resolution, " photograph with ").concat(aspectRatio, " aspect ratio.\n\nSTYLE: ").concat(style, "\n\nSCENE: ").concat(prompt, "\n\n").concat(negativePrompt ? "AVOID: ".concat(negativePrompt) : '', "\n\nTECHNICAL REQUIREMENTS:\n- High detail and clarity\n- Professional color grading\n- Proper lighting and composition\n- Sharp focus on main subject\n- Realistic textures and materials\n- Natural physics and perspective\n");
                        console.log("\uD83C\uDFA8 Generating ".concat(resolution, " image with Nano Banana Pro..."));
                        console.log("\uD83D\uDCDD Prompt: ".concat(prompt.substring(0, 100), "..."));
                        return [4 /*yield*/, this.model.generateContent(fullPrompt)];
                    case 1:
                        response = _f.sent();
                        // Extract image data from response
                        for (_i = 0, _e = response.response.candidates[0].content.parts; _i < _e.length; _i++) {
                            part = _e[_i];
                            if (part.inlineData) {
                                buffer = Buffer.from(part.inlineData.data, 'base64');
                                // Save to file if output path provided
                                if (outputPath) {
                                    dir = path_1.default.dirname(outputPath);
                                    if (!fs_1.default.existsSync(dir)) {
                                        fs_1.default.mkdirSync(dir, { recursive: true });
                                    }
                                    fs_1.default.writeFileSync(outputPath, buffer);
                                    console.log("\u2705 Image saved: ".concat(outputPath));
                                }
                                return [2 /*return*/, buffer];
                            }
                        }
                        throw new Error('No image generated in response');
                }
            });
        });
    };
    /**
     * Generate hero carousel scenario images for NRPG platform
     * High-quality 4K images for main homepage carousel
     */
    GeminiImageService.prototype.generateScenarioImage = function (scenario) {
        return __awaiter(this, void 0, void 0, function () {
            var prompts, outputPath;
            return __generator(this, function (_a) {
                prompts = {
                    'residential-flood': "\nProfessional insurance documentation photograph of a flooded Australian suburban home basement.\n\nSCENE DETAILS:\n- Modern Australian home basement, partially flooded\n- 2-3 inches of clean water covering hardwood floor\n- Wet carpet visible in background, some furniture with water damage\n- Natural daylight streaming from small basement windows\n- Water droplets and reflections visible on surfaces\n- Clean but damaged aesthetic (not catastrophic destruction)\n- White walls with water line marks\n- Wooden stairs partially wet\n\nCAMERA SETTINGS:\n- Shot with professional wide angle 24mm lens\n- f/2.8 aperture for shallow depth of field with background blur\n- Focus on water and damaged flooring in foreground\n- Natural color grading with slightly cool tones\n- Professional photojournalism/insurance documentation style\n- Eye-level perspective\n\nLIGHTING:\n- Soft natural window light from basement windows (main light source)\n- Some ambient room lighting\n- Subtle shadows for depth and realism\n- Realistic water reflections catching light\n- Professional documentation quality\n\nCOMPOSITION:\n- Foreground: Water-covered floor (sharp focus)\n- Midground: Damaged furniture/carpet\n- Background: Basement stairs and windows (slight blur)\n\nMOOD: Serious but hopeful, professional emergency response documentation, realistic disaster scene\n\nAVOID: People, extreme destruction, dark/horror aesthetic, fake-looking CGI, dramatic flames, chaos, debris piles\n",
                    'commercial-fire': "\nProfessional insurance documentation photograph of fire and smoke damage in Australian commercial office building.\n\nSCENE DETAILS:\n- Modern open-plan office interior with cubicles\n- Smoke-damaged white walls and drop ceiling (visible black soot marks and stains)\n- Water damage on commercial carpet from sprinkler system activation\n- Damaged office furniture (desks, ergonomic chairs, computers)\n- Overhead LED panel lighting partially working\n- Some ceiling tiles damaged or missing\n- Professional clean lines visible despite damage\n- Glass partitions with smoke residue\n\nCAMERA SETTINGS:\n- Shot with professional 35mm lens\n- f/4 aperture for good depth of field (most scene in focus)\n- Focus on smoke-damaged walls and ceiling area\n- Desaturated color grading for serious, documentary tone\n- Wide establishing shot showing extent of damage\n- Slight high angle for documentation perspective\n\nLIGHTING:\n- Overhead commercial LED lighting (60% working, 40% damaged/off)\n- Natural daylight from large office windows\n- Dramatic but professional lighting\n- Clear visibility of all damaged areas\n- Even exposure throughout frame\n\nCOMPOSITION:\n- Foreground: Wet carpet and damaged office furniture\n- Midground: Smoke-damaged walls and ceiling (hero element)\n- Background: Office windows and structural elements\n\nMOOD: Serious business emergency, business continuity focus, professional documentation, recoverable damage\n\nAVOID: Active flames, people, extreme destruction, collapsed structures, horror aesthetic, unrealistic damage, debris everywhere\n",
                    'industrial-bio': "\nProfessional photograph of large Australian industrial warehouse facility prepared for biohazard cleanup operation.\n\nSCENE DETAILS:\n- Massive warehouse interior with 30-foot high ceilings\n- Industrial polished concrete floors (clean, professional)\n- Metal industrial shelving and equipment visible\n- Professional hazmat containment barriers staged (yellow/orange tape)\n- HEPA filtration equipment on wheels, ready for deployment\n- Industrial overhead lighting grid (bright, even)\n- Clean professional technical aesthetic\n- Safety equipment staged professionally\n- Australian industrial safety standards visible\n\nCAMERA SETTINGS:\n- Shot with professional 24mm ultra-wide angle lens\n- f/5.6 for maximum depth of field and clarity throughout\n- Focus on industrial space showing scale and equipment\n- Color graded for technical clarity and professionalism\n- Wide establishing shot emphasizing facility size\n- Eye-level industrial photography perspective\n\nLIGHTING:\n- Bright industrial overhead LED/fluorescent lighting\n- Even, professional illumination throughout space\n- No dark corners - technical documentation requires visibility\n- Professional industrial photography lighting\n- Clear visibility of all safety equipment\n\nCOMPOSITION:\n- Foreground: Containment barriers and HEPA equipment (staged)\n- Midground: Warehouse floor and industrial space\n- Background: High ceilings with industrial lighting grid\n- Emphasize scale, safety, professionalism\n\nMOOD: Professional, technical, safety-focused, industrial documentation, organized preparedness\n\nAVOID: People in frame, gore, medical/hospital content, dark/horror aesthetic, chaos, disorganization, contamination visible\n",
                };
                outputPath = path_1.default.join(process.cwd(), 'public', 'images', 'scenarios', "".concat(scenario, ".jpg"));
                return [2 /*return*/, this.generateImage({
                        prompt: prompts[scenario],
                        resolution: '4K',
                        aspectRatio: '16:9',
                        style: 'Professional photographic documentation, photorealistic',
                        negativePrompt: 'people, faces, text, watermarks, logos, cartoon, illustration, drawing, 3D render, fake, CGI, unrealistic',
                        outputPath: outputPath,
                    })];
            });
        });
    };
    /**
     * Generate service card images for NRPG platform
     * Professional equipment/scene photography for service categories
     */
    GeminiImageService.prototype.generateServiceCardImage = function (service) {
        return __awaiter(this, void 0, void 0, function () {
            var prompts, outputPath;
            return __generator(this, function (_a) {
                prompts = {
                    water: "\nProfessional product photography of industrial water damage restoration equipment in operation.\n\nEQUIPMENT (HERO SUBJECTS):\n- Large truck-mounted water extractor (blue/silver industrial equipment)\n- Commercial-grade dehumidifier units (professional gray/white)\n- High-velocity air movers (orange safety color)\n- All equipment clean, professional-grade, operational\n- qualified professional equipment\n\nSETTING:\n- Clean Australian residential interior (modern home)\n- Natural hardwood or tile flooring\n- Good natural window lighting\n- Professional work environment\n- Equipment arranged professionally\n\nCAMERA SETTINGS:\n- Shot with 50mm lens for natural perspective\n- f/2.8 aperture for subject isolation\n- Focus on main water extractor (hero)\n- Background slightly blurred\n- Professional commercial photography color grading\n\nLIGHTING:\n- Natural window light as main source\n- Soft, even illumination\n- Professional commercial product lighting\n- Equipment details clearly visible\n\nCOMPOSITION:\n- Equipment as hero subjects (foreground, sharp focus)\n- Clean residential background (midground, slight blur)\n- Professional workspace aesthetic\n\nMOOD: Clean, professional, trustworthy, industrial quality equipment, technical competence\n\nAVOID: People, dirty/messy environment, damaged equipment, text, logos, cartoon style, dark aesthetic\n",
                    fire: "\nProfessional photograph of fire and smoke damage restoration equipment and setup.\n\nEQUIPMENT:\n- Industrial air scrubbers with visible HEPA filters (large gray units)\n- Professional cleaning equipment and supplies\n- Thermal imaging camera on tripod\n- Safety equipment (hard hats, respirators) displayed professionally\n- Negative air machine with ducting\n\nSETTING:\n- Professional job site (smoke-damaged commercial interior)\n- Containment barriers visible (clean setup)\n- Well-lit professional workspace\n- Equipment in operational state\n- Organized, professional presentation\n\nCAMERA SETTINGS:\n- Shot with 35mm lens\n- f/4 aperture for equipment detail\n- Focus on air scrubbers and HEPA equipment\n- Professional technical documentation style\n- Color graded for clarity and professionalism\n\nLIGHTING:\n- Professional work lighting (bright, even)\n- Equipment details clearly visible\n- No harsh shadows\n- Technical photography illumination\n\nCOMPOSITION:\n- Air scrubbers as hero equipment (foreground)\n- Professional job site setup (midground)\n- Clean organized workspace visible (background)\n\nMOOD: Professional, safety-focused, technical expertise, organized response, industrial capability\n\nAVOID: Active fire, people, extreme damage, dark/dramatic aesthetic, chaos, text, logos\n",
                    mould: "\nProfessional photograph of mold remediation containment setup and equipment.\n\nEQUIPMENT & SETUP:\n- Clear 6-mil plastic containment barriers (professional installation)\n- Industrial HEPA air filtration units (white/gray professional equipment)\n- Negative air machines with ducting\n- Professional protective equipment displayed (white Tyvek suits, respirators)\n- Decontamination chamber visible\n- Moisture meters and testing equipment\n\nSETTING:\n- Professional mold remediation job site\n- Containment area properly sealed\n- Clean, organized workspace\n- Safety protocols clearly visible\n- Professional technical environment\n\nCAMERA SETTINGS:\n- Shot with 28mm lens for workspace documentation\n- f/5.6 for maximum clarity throughout scene\n- Focus on containment barriers and HEPA equipment\n- Professional safety documentation photography\n- Clear, technical color grading\n\nLIGHTING:\n- Bright professional work lighting\n- Even illumination throughout containment area\n- Safety-focused visibility\n- Technical documentation lighting\n- All equipment and safety measures clearly visible\n\nCOMPOSITION:\n- Containment barriers (foreground, clear detail)\n- HEPA filtration equipment (midground, hero)\n- Professional workspace (background, organized)\n\nMOOD: Safety-first, professional, technical competence, organized, health-focused, meticulous\n\nAVOID: Visible mold, people, contamination, dark aesthetic, chaos, medical/hospital content, text, logos\n",
                    bio: "\nProfessional product photography of biohazard cleanup personal protective equipment and decontamination tools.\n\nEQUIPMENT DISPLAY:\n- Full Level A hazmat protective suits (yellow or white, clean and professional)\n- Full-face respirators with P100 filters\n- Chemical-resistant gloves and boots\n- Professional decontamination equipment\n- ATP testing devices\n- Biohazard waste containers (proper labeling)\n- Decon shower equipment\n\nSETTING:\n- Clean white or light gray background (studio style)\n- OR professional clean room/staging area\n- Professional equipment display\n- Well-organized presentation\n- Technical facility aesthetic\n\nCAMERA SETTINGS:\n- Shot with 50mm lens for product detail\n- f/8 for maximum sharpness and detail\n- Focus on hazmat suits and respiratory protection\n- Professional product photography style\n- Clean, technical color grading\n\nLIGHTING:\n- Professional studio lighting (soft, even)\n- No harsh shadows\n- Equipment details clearly visible\n- Safety equipment features highlighted\n- Technical product photography illumination\n\nCOMPOSITION:\n- Hazmat suits as hero subjects (center, sharp focus)\n- Professional equipment arranged around suits\n- Clean, organized technical presentation\n- Safety-focused product display\n\nMOOD: Safety-focused, professional, technical expertise, clean, trustworthy, health protection, meticulous care\n\nAVOID: People wearing equipment, gore, contamination, medical/hospital setting, dark aesthetic, chaos, biohazard symbols, text, logos\n",
                };
                outputPath = path_1.default.join(process.cwd(), 'public', 'images', 'services', "".concat(service, "-card.jpg"));
                return [2 /*return*/, this.generateImage({
                        prompt: prompts[service],
                        resolution: '2K',
                        aspectRatio: '4:3',
                        style: 'Professional product/equipment photography, photorealistic',
                        negativePrompt: 'people, faces, gore, blood, extreme damage, dark horror aesthetic, cartoon, illustration, text, watermarks, logos',
                        outputPath: outputPath,
                    })];
            });
        });
    };
    /**
     * Generate sector card images for NRPG platform
     * Professional photography representing each client sector
     */
    GeminiImageService.prototype.generateSectorImage = function (sector) {
        return __awaiter(this, void 0, void 0, function () {
            var prompts, outputPath;
            return __generator(this, function (_a) {
                prompts = {
                    residential: "\nProfessional architectural photograph of modern Australian suburban home exterior.\n\nSCENE:\n- Beautiful modern Australian family home\n- Well-maintained front facade and landscaping\n- Clear blue sky, natural daylight\n- Lush green lawn and garden\n- Professional real estate photography aesthetic\n- Welcoming, aspirational home\n\nSTYLE: Professional real estate photography, natural colors, inviting\n",
                    commercial: "\nProfessional architectural photograph of modern Australian commercial office building.\n\nSCENE:\n- Sleek modern office building exterior\n- Glass and steel contemporary architecture\n- Business district setting\n- Clear professional atmosphere\n- Blue sky background\n- Professional corporate photography\n\nSTYLE: Commercial architectural photography, professional, modern, business-focused\n",
                    industrial: "\nProfessional photograph of Australian industrial manufacturing facility exterior.\n\nSCENE:\n- Large industrial warehouse/factory building\n- Modern industrial architecture\n- Clean professional facility\n- Industrial scale and capability visible\n- Clear professional environment\n- Well-maintained facility\n\nSTYLE: Industrial photography, professional, capability-focused, technical\n",
                    insurance: "\nProfessional business photograph representing insurance industry partnership.\n\nSCENE:\n- Modern professional office handshake or partnership imagery\n- Clean corporate environment\n- Professional business aesthetic\n- Trust and reliability visual\n- Australian business setting\n\nSTYLE: Corporate photography, professional, trust-focused, partnership aesthetic\n",
                };
                outputPath = path_1.default.join(process.cwd(), 'public', 'images', 'sectors', "".concat(sector, ".jpg"));
                return [2 /*return*/, this.generateImage({
                        prompt: prompts[sector],
                        resolution: '2K',
                        aspectRatio: '16:9',
                        style: 'Professional architectural/corporate photography',
                        negativePrompt: 'people faces, text, logos, watermarks, damage, disaster',
                        outputPath: outputPath,
                    })];
            });
        });
    };
    /**
     * Test function to verify Gemini API is working
     */
    GeminiImageService.prototype.testConnection = function () {
        return __awaiter(this, void 0, void 0, function () {
            var testResponse, _i, _a, part, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        console.log('🧪 Testing Gemini API connection...');
                        return [4 /*yield*/, this.model.generateContent('Generate a simple test image: A blue circle on white background')];
                    case 1:
                        testResponse = _b.sent();
                        for (_i = 0, _a = testResponse.response.candidates[0].content.parts; _i < _a.length; _i++) {
                            part = _a[_i];
                            if (part.inlineData) {
                                console.log('✅ Gemini API connection successful!');
                                console.log("\uD83D\uDCCA Image data received: ".concat(part.inlineData.data.length, " bytes"));
                                return [2 /*return*/, true];
                            }
                        }
                        console.log('⚠️ No image data in response');
                        return [2 /*return*/, false];
                    case 2:
                        error_1 = _b.sent();
                        console.error('❌ Gemini API connection failed:', error_1);
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return GeminiImageService;
}());
exports.GeminiImageService = GeminiImageService;
exports.geminiImageService = new GeminiImageService();
