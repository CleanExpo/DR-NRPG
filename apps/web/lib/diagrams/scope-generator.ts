/**
 * AI-Generated Job Scope Diagram Generator
 *
 * Generates scope diagram data structures for disaster recovery job proposals.
 * Each job type has specialised equipment placement patterns based on
 * recognised industry restoration standards.
 */

export type JobType = 'water' | 'fire' | 'mould' | 'storm' | 'asbestos';
export type SeverityLevel = 'low' | 'moderate' | 'high' | 'critical';

export interface RoomInput {
  id: string;
  name: string;
  width: number;  // metres
  length: number; // metres
  damageType: JobType;
  severity: SeverityLevel;
}

export interface DiagramElement {
  id: string;
  type: 'equipment' | 'zone' | 'monitor' | 'barrier' | 'label';
  subtype: string;
  x: number; // 0-100 relative coordinates within room
  y: number;
  width?: number;
  height?: number;
  label: string;
  colour: string;
  icon?: string;
}

export interface RoomDiagram {
  room: RoomInput;
  elements: DiagramElement[];
}

export interface TimelinePhase {
  label: string;
  days: string;
  activities: string[];
  colour: string;
}

export interface ScopeDiagram {
  jobType: JobType;
  rooms: RoomDiagram[];
  timeline: TimelinePhase[];
  equipmentSummary: { item: string; quantity: number; icon: string }[];
  totalArea: number;
  estimatedDuration: string;
}

const ZONE_COLOURS = {
  contamination: '#EF4444',   // Red
  extraction: '#3B82F6',      // Blue
  equipment: '#0d9488',       // Teal
  clean: '#22C55E',           // Green
  containment: '#F97316',     // Orange
  decon: '#A855F7',           // Purple
};

let elementCounter = 0;
function nextId(): string {
  return `el-${++elementCounter}`;
}

function generateWaterElements(room: RoomInput): DiagramElement[] {
  const elements: DiagramElement[] = [];
  const { severity } = room;

  // Extraction zone (centre of room, blue shading)
  elements.push({
    id: nextId(),
    type: 'zone',
    subtype: 'extraction',
    x: 15, y: 15, width: 70, height: 70,
    label: 'Extraction Area',
    colour: ZONE_COLOURS.extraction,
  });

  // Dehumidifiers along walls
  const dehuCount = severity === 'critical' ? 4 : severity === 'high' ? 3 : 2;
  const wallPositions = [
    { x: 10, y: 50 }, { x: 90, y: 50 },
    { x: 50, y: 10 }, { x: 50, y: 90 },
  ];
  for (let i = 0; i < dehuCount; i++) {
    const pos = wallPositions[i];
    elements.push({
      id: nextId(),
      type: 'equipment',
      subtype: 'dehumidifier',
      x: pos.x, y: pos.y,
      label: 'Dehumidifier',
      colour: ZONE_COLOURS.equipment,
      icon: 'dehumidifier',
    });
  }

  // Air movers in centre
  const moverCount = severity === 'critical' ? 3 : 2;
  const centrePositions = [
    { x: 35, y: 50 }, { x: 65, y: 50 }, { x: 50, y: 35 },
  ];
  for (let i = 0; i < moverCount; i++) {
    elements.push({
      id: nextId(),
      type: 'equipment',
      subtype: 'air-mover',
      x: centrePositions[i].x, y: centrePositions[i].y,
      label: 'Air Mover',
      colour: ZONE_COLOURS.equipment,
      icon: 'air-mover',
    });
  }

  // Moisture monitoring points at corners
  const monitorPositions = [
    { x: 8, y: 8 }, { x: 92, y: 8 },
    { x: 8, y: 92 }, { x: 92, y: 92 },
  ];
  monitorPositions.forEach((pos, idx) => {
    elements.push({
      id: nextId(),
      type: 'monitor',
      subtype: 'moisture',
      x: pos.x, y: pos.y,
      label: `M${idx + 1}`,
      colour: '#FFB800',
    });
  });

  return elements;
}

function generateFireElements(room: RoomInput): DiagramElement[] {
  const elements: DiagramElement[] = [];
  const { severity } = room;

  // Contamination zone
  elements.push({
    id: nextId(),
    type: 'zone',
    subtype: 'contamination',
    x: 10, y: 10, width: 80, height: 80,
    label: 'Smoke/Soot Contamination',
    colour: ZONE_COLOURS.contamination,
  });

  // HEPA filtration units
  const hepaCount = severity === 'critical' ? 3 : 2;
  const hepaPositions = [
    { x: 25, y: 25 }, { x: 75, y: 25 }, { x: 50, y: 75 },
  ];
  for (let i = 0; i < hepaCount; i++) {
    elements.push({
      id: nextId(),
      type: 'equipment',
      subtype: 'hepa-filter',
      x: hepaPositions[i].x, y: hepaPositions[i].y,
      label: 'HEPA Filter',
      colour: ZONE_COLOURS.equipment,
      icon: 'hepa',
    });
  }

  // Air scrubbers
  elements.push({
    id: nextId(),
    type: 'equipment',
    subtype: 'air-scrubber',
    x: 50, y: 50,
    label: 'Air Scrubber',
    colour: ZONE_COLOURS.equipment,
    icon: 'scrubber',
  });

  // Containment barriers at doorways
  const barrierPositions = [
    { x: 50, y: 2 }, { x: 2, y: 50 },
  ];
  barrierPositions.forEach((pos) => {
    elements.push({
      id: nextId(),
      type: 'barrier',
      subtype: 'containment',
      x: pos.x, y: pos.y,
      width: pos.y === 2 ? 20 : 4,
      height: pos.y === 2 ? 4 : 20,
      label: 'Containment Barrier',
      colour: ZONE_COLOURS.containment,
    });
  });

  // Smoke monitors
  [{ x: 20, y: 80 }, { x: 80, y: 80 }].forEach((pos, idx) => {
    elements.push({
      id: nextId(),
      type: 'monitor',
      subtype: 'air-quality',
      x: pos.x, y: pos.y,
      label: `AQ${idx + 1}`,
      colour: '#FFB800',
    });
  });

  return elements;
}

function generateMouldElements(room: RoomInput): DiagramElement[] {
  const elements: DiagramElement[] = [];
  const { severity } = room;

  // Containment zone with negative air pressure
  elements.push({
    id: nextId(),
    type: 'zone',
    subtype: 'containment',
    x: 5, y: 5, width: 90, height: 90,
    label: 'Containment Zone (Neg. Air)',
    colour: ZONE_COLOURS.containment,
  });

  // Inner contamination zone
  elements.push({
    id: nextId(),
    type: 'zone',
    subtype: 'contamination',
    x: 20, y: 20, width: 60, height: 60,
    label: 'Mould Contamination',
    colour: ZONE_COLOURS.contamination,
  });

  // HEPA filtration
  const hepaCount = severity === 'critical' ? 3 : severity === 'high' ? 2 : 1;
  const positions = [{ x: 50, y: 15 }, { x: 25, y: 85 }, { x: 75, y: 85 }];
  for (let i = 0; i < hepaCount; i++) {
    elements.push({
      id: nextId(),
      type: 'equipment',
      subtype: 'hepa-filter',
      x: positions[i].x, y: positions[i].y,
      label: 'HEPA Filter',
      colour: ZONE_COLOURS.equipment,
      icon: 'hepa',
    });
  }

  // Negative air machine
  elements.push({
    id: nextId(),
    type: 'equipment',
    subtype: 'negative-air',
    x: 85, y: 50,
    label: 'Neg. Air Machine',
    colour: ZONE_COLOURS.equipment,
    icon: 'negative-air',
  });

  // Personal decontamination station
  elements.push({
    id: nextId(),
    type: 'equipment',
    subtype: 'decon-station',
    x: 50, y: 95,
    label: 'Decon Station',
    colour: ZONE_COLOURS.decon,
    icon: 'decon',
  });

  // Spore monitors
  [{ x: 15, y: 15 }, { x: 85, y: 15 }, { x: 15, y: 85 }].forEach((pos, idx) => {
    elements.push({
      id: nextId(),
      type: 'monitor',
      subtype: 'spore',
      x: pos.x, y: pos.y,
      label: `SP${idx + 1}`,
      colour: '#FFB800',
    });
  });

  return elements;
}

function generateStormElements(room: RoomInput): DiagramElement[] {
  const elements: DiagramElement[] = [];
  const { severity } = room;

  // Extraction zone
  elements.push({
    id: nextId(),
    type: 'zone',
    subtype: 'extraction',
    x: 10, y: 10, width: 80, height: 80,
    label: 'Water Ingress Area',
    colour: ZONE_COLOURS.extraction,
  });

  // Dehumidifiers
  const dehuCount = severity === 'critical' ? 3 : 2;
  [{ x: 15, y: 50 }, { x: 85, y: 50 }, { x: 50, y: 15 }].slice(0, dehuCount).forEach((pos) => {
    elements.push({
      id: nextId(),
      type: 'equipment',
      subtype: 'dehumidifier',
      x: pos.x, y: pos.y,
      label: 'Dehumidifier',
      colour: ZONE_COLOURS.equipment,
      icon: 'dehumidifier',
    });
  });

  // Air movers
  [{ x: 40, y: 40 }, { x: 60, y: 60 }].forEach((pos) => {
    elements.push({
      id: nextId(),
      type: 'equipment',
      subtype: 'air-mover',
      x: pos.x, y: pos.y,
      label: 'Air Mover',
      colour: ZONE_COLOURS.equipment,
      icon: 'air-mover',
    });
  });

  // Structural monitors
  [{ x: 50, y: 5 }, { x: 5, y: 50 }, { x: 95, y: 50 }].forEach((pos, idx) => {
    elements.push({
      id: nextId(),
      type: 'monitor',
      subtype: 'structural',
      x: pos.x, y: pos.y,
      label: `ST${idx + 1}`,
      colour: '#FFB800',
    });
  });

  return elements;
}

function generateAsbestosElements(room: RoomInput): DiagramElement[] {
  const elements: DiagramElement[] = [];

  // Full containment zone
  elements.push({
    id: nextId(),
    type: 'zone',
    subtype: 'containment',
    x: 3, y: 3, width: 94, height: 94,
    label: 'Full Containment (Sealed)',
    colour: ZONE_COLOURS.contamination,
  });

  // Clean zone outside
  elements.push({
    id: nextId(),
    type: 'zone',
    subtype: 'clean',
    x: 0, y: 0, width: 100, height: 3,
    label: 'Clean Zone',
    colour: ZONE_COLOURS.clean,
  });

  // HEPA filtration (mandatory for asbestos)
  [{ x: 30, y: 30 }, { x: 70, y: 30 }, { x: 50, y: 70 }].forEach((pos) => {
    elements.push({
      id: nextId(),
      type: 'equipment',
      subtype: 'hepa-filter',
      x: pos.x, y: pos.y,
      label: 'HEPA Filter',
      colour: ZONE_COLOURS.equipment,
      icon: 'hepa',
    });
  });

  // Negative air pressure
  elements.push({
    id: nextId(),
    type: 'equipment',
    subtype: 'negative-air',
    x: 90, y: 50,
    label: 'Neg. Air Machine',
    colour: ZONE_COLOURS.equipment,
    icon: 'negative-air',
  });

  // Three-stage decon
  elements.push({
    id: nextId(),
    type: 'equipment',
    subtype: 'decon-station',
    x: 50, y: 96,
    label: '3-Stage Decon Unit',
    colour: ZONE_COLOURS.decon,
    icon: 'decon',
  });

  // Containment barriers (all doorways sealed)
  [{ x: 50, y: 1 }, { x: 1, y: 50 }, { x: 99, y: 50 }].forEach((pos) => {
    elements.push({
      id: nextId(),
      type: 'barrier',
      subtype: 'sealed',
      x: pos.x, y: pos.y,
      width: pos.y === 1 ? 16 : 3,
      height: pos.y === 1 ? 3 : 16,
      label: 'Sealed Entry',
      colour: ZONE_COLOURS.contamination,
    });
  });

  // Air monitors
  [{ x: 10, y: 10 }, { x: 90, y: 10 }, { x: 10, y: 90 }, { x: 90, y: 90 }].forEach((pos, idx) => {
    elements.push({
      id: nextId(),
      type: 'monitor',
      subtype: 'fibre',
      x: pos.x, y: pos.y,
      label: `F${idx + 1}`,
      colour: '#FFB800',
    });
  });

  return elements;
}

const TIMELINE_BY_TYPE: Record<JobType, TimelinePhase[]> = {
  water: [
    { label: 'Day 1', days: '1', activities: ['Emergency extraction', 'Equipment setup', 'Initial moisture readings'], colour: '#EF4444' },
    { label: 'Day 2-3', days: '2-3', activities: ['Drying operations', 'Moisture monitoring', 'Progress documentation'], colour: '#F97316' },
    { label: 'Day 4-5', days: '4-5', activities: ['Final readings', 'Equipment removal', 'Clearance report'], colour: '#22C55E' },
  ],
  fire: [
    { label: 'Day 1-2', days: '1-2', activities: ['Containment setup', 'HEPA filtration', 'Soot assessment'], colour: '#EF4444' },
    { label: 'Day 3-5', days: '3-5', activities: ['Smoke damage cleaning', 'Air scrubbing', 'Odour treatment'], colour: '#F97316' },
    { label: 'Day 6-7', days: '6-7', activities: ['Final cleaning', 'Air quality testing', 'Clearance certificate'], colour: '#22C55E' },
  ],
  mould: [
    { label: 'Day 1', days: '1', activities: ['Containment erection', 'Neg. air setup', 'Spore sampling'], colour: '#EF4444' },
    { label: 'Day 2-4', days: '2-4', activities: ['Mould remediation', 'HEPA cleaning', 'Antimicrobial treatment'], colour: '#F97316' },
    { label: 'Day 5-7', days: '5-7', activities: ['Clearance sampling', 'Containment removal', 'Final report'], colour: '#22C55E' },
  ],
  storm: [
    { label: 'Day 1', days: '1', activities: ['Make safe', 'Tarping', 'Water extraction'], colour: '#EF4444' },
    { label: 'Day 2-3', days: '2-3', activities: ['Drying operations', 'Debris removal', 'Structural assessment'], colour: '#F97316' },
    { label: 'Day 4-5', days: '4-5', activities: ['Final drying', 'Damage documentation', 'Insurance report'], colour: '#22C55E' },
  ],
  asbestos: [
    { label: 'Day 1-2', days: '1-2', activities: ['Full containment', 'Air monitoring setup', 'Notification lodgement'], colour: '#EF4444' },
    { label: 'Day 3-7', days: '3-7', activities: ['Asbestos removal', 'Wet methods', 'Continuous air monitoring'], colour: '#F97316' },
    { label: 'Day 8-10', days: '8-10', activities: ['Clearance inspection', 'Air sampling', 'Disposal certificates'], colour: '#22C55E' },
  ],
};

const DURATION_BY_TYPE: Record<JobType, string> = {
  water: '3-5 days',
  fire: '5-7 days',
  mould: '5-7 days',
  storm: '3-5 days',
  asbestos: '8-10 days',
};

const ELEMENT_GENERATORS: Record<JobType, (room: RoomInput) => DiagramElement[]> = {
  water: generateWaterElements,
  fire: generateFireElements,
  mould: generateMouldElements,
  storm: generateStormElements,
  asbestos: generateAsbestosElements,
};

export function generateScopeDiagram(
  jobType: JobType,
  rooms: RoomInput[],
): ScopeDiagram {
  elementCounter = 0;
  const generator = ELEMENT_GENERATORS[jobType];

  const roomDiagrams: RoomDiagram[] = rooms.map((room) => ({
    room,
    elements: generator(room),
  }));

  // Build equipment summary
  const equipmentMap = new Map<string, { item: string; quantity: number; icon: string }>();
  for (const rd of roomDiagrams) {
    for (const el of rd.elements) {
      if (el.type === 'equipment') {
        const existing = equipmentMap.get(el.subtype);
        if (existing) {
          existing.quantity++;
        } else {
          equipmentMap.set(el.subtype, {
            item: el.label,
            quantity: 1,
            icon: el.icon || '',
          });
        }
      }
    }
  }

  const totalArea = rooms.reduce((sum, r) => sum + r.width * r.length, 0);

  return {
    jobType,
    rooms: roomDiagrams,
    timeline: TIMELINE_BY_TYPE[jobType],
    equipmentSummary: Array.from(equipmentMap.values()),
    totalArea,
    estimatedDuration: DURATION_BY_TYPE[jobType],
  };
}
