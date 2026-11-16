// @ts-nocheck

'use client';

/**
 * Interactive Badge Canvas Component
 *
 * Allows users to design and customize badges with:
 * - Drag-and-drop text and shapes
 * - Color customization
 * - Export to PNG/SVG
 *
 * Usage:
 * ```tsx
 * <BadgeCanvas
 *   contractorName="John Smith"
 *   badgeType="iicrc"
 * />
 * ```
 */

import React, { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import {
  exportCanvasPNG,
  exportCanvasSVG,
  clearCanvas,
  addCanvasText,
  addCanvasRect,
  deleteSelectedObject,
  cloneSelectedObject,
} from '@/lib/canvas/fabric-hooks';
import { Button } from '@/src/design-system/components/Button/Button';
import { Download, Plus, Trash2, Copy } from 'lucide-react';

interface BadgeCanvasProps {
  contractorName: string;
  badgeType: 'iicrc' | 'verified' | 'premium';
  onExport?: (dataUrl: string) => void;
}

const BADGE_COLORS = {
  iicrc: { primary: '#002FA7', secondary: '#FFD700' },
  verified: { primary: '#0047FF', secondary: '#10b981' },
  premium: { primary: '#00BFA6', secondary: '#F59E0B' },
};

const BADGE_LABELS = {
  iicrc: 'Industry certification held',
  verified: 'Verified Contractor',
  premium: 'Premium Partner',
};

export function BadgeCanvas({
  contractorName,
  badgeType,
  onExport,
}: BadgeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize Fabric canvas with badge design
  useEffect(() => {
    if (!canvasRef.current) return;

    // Create canvas instance
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 400,
      height: 400,
      backgroundColor: '#FFFFFF',
      preserveObjectStacking: true,
    });

    fabricCanvasRef.current = canvas;

    // Add circular background
    const circle = new fabric.Circle({
      radius: 180,
      left: 200,
      top: 200,
      originX: 'center',
      originY: 'center',
      fill: BADGE_COLORS[badgeType].primary,
      selectable: false,
    });
    canvas.add(circle);

    // Add border
    const border = new fabric.Circle({
      radius: 180,
      left: 200,
      top: 200,
      originX: 'center',
      originY: 'center',
      fill: 'transparent',
      stroke: BADGE_COLORS[badgeType].secondary,
      strokeWidth: 5,
      selectable: false,
    });
    canvas.add(border);

    // Add badge label
    const label = new fabric.Text(BADGE_LABELS[badgeType], {
      left: 200,
      top: 140,
      originX: 'center',
      originY: 'center',
      fontSize: 16,
      fontWeight: 'bold',
      fill: '#FFFFFF',
      fontFamily: 'Arial',
      selectable: true,
    });
    canvas.add(label);

    // Add contractor name
    const nameText = new fabric.Text(contractorName, {
      left: 200,
      top: 200,
      originX: 'center',
      originY: 'center',
      fontSize: 18,
      fontWeight: 'bold',
      fill: '#FFFFFF',
      fontFamily: 'Arial',
      selectable: true,
      width: 300,
      textAlign: 'center',
    });
    canvas.add(nameText);

    // Add verification mark
    const mark = new fabric.Text('✓', {
      left: 320,
      top: 120,
      originX: 'center',
      originY: 'center',
      fontSize: 40,
      fill: BADGE_COLORS[badgeType].secondary,
      selectable: false,
    });
    canvas.add(mark);

    // Handle selection changes
    canvas.on('selection:created', () => {
      // Update UI based on selection
    });

    canvas.on('selection:cleared', () => {
      // Clear UI
    });

    setIsInitialized(true);

    return () => {
      canvas.dispose();
    };
  }, [contractorName, badgeType]);

  const handleAddText = () => {
    if (fabricCanvasRef.current) {
      addCanvasText(fabricCanvasRef.current, 'New Text', {
        fill: '#333333',
        fontSize: 16,
      });
    }
  };

  const handleAddShape = () => {
    if (fabricCanvasRef.current) {
      addCanvasRect(fabricCanvasRef.current, {
        fill: BADGE_COLORS[badgeType].secondary,
        width: 100,
        height: 50,
      });
    }
  };

  const handleDelete = () => {
    if (fabricCanvasRef.current) {
      deleteSelectedObject(fabricCanvasRef.current);
    }
  };

  const handleClone = () => {
    if (fabricCanvasRef.current) {
      cloneSelectedObject(fabricCanvasRef.current);
    }
  };

  const handleClear = () => {
    if (fabricCanvasRef.current) {
      clearCanvas(fabricCanvasRef.current);
    }
  };

  const handleExportPNG = () => {
    if (fabricCanvasRef.current) {
      const dataUrl = exportCanvasPNG(
        fabricCanvasRef.current,
        `badge-${contractorName.replace(/\s+/g, '-')}.png`
      );
      if (dataUrl && onExport) {
        onExport(dataUrl);
      }
    }
  };

  const handleExportSVG = () => {
    if (fabricCanvasRef.current) {
      exportCanvasSVG(
        fabricCanvasRef.current,
        `badge-${contractorName.replace(/\s+/g, '-')}.svg`
      );
    }
  };

  return (
    <div className="space-y-4">
      {/* Canvas */}
      <div className="flex justify-center bg-gray-50 rounded-lg p-4 border border-gray-200">
        <canvas
          ref={canvasRef}
          className="border-2 border-gray-300 rounded-lg shadow-sm"
        />
      </div>

      {/* Controls */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleAddText}
          icon={<Plus className="h-4 w-4" />}
        >
          Add Text
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleAddShape}
          icon={<Plus className="h-4 w-4" />}
        >
          Add Shape
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleClone}
          icon={<Copy className="h-4 w-4" />}
        >
          Clone
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleDelete}
          icon={<Trash2 className="h-4 w-4" />}
        >
          Delete
        </Button>
      </div>

      {/* Export Controls */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t">
        <Button
          type="button"
          size="sm"
          variant="primary"
          onClick={handleExportPNG}
          icon={<Download className="h-4 w-4" />}
        >
          Download PNG
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleExportSVG}
          icon={<Download className="h-4 w-4" />}
        >
          Download SVG
        </Button>
      </div>

      {/* Info */}
      <div className="text-xs text-gray-400 bg-blue-50 p-3 rounded-lg">
        <p>💡 <strong>Tip:</strong> Click objects to select them, then use controls to edit. Drag to move, resize handles to scale.</p>
      </div>
    </div>
  );
}
