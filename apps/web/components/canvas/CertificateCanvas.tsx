// @ts-nocheck

'use client';

/**
 * Interactive Certificate Canvas Component
 *
 * Allows customization of IICRC certificates with:
 * - Editable text fields (name, number, dates)
 * - Embedded QR codes
 * - Custom colors and branding
 * - Export to PDF
 *
 * Usage:
 * ```tsx
 * <CertificateCanvas
 *   contractorId="CONT-001"
 *   contractorName="John Smith"
 *   certificationLevel="Professional"
 * />
 * ```
 */

import React, { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import { exportCanvasPNG, addCanvasText } from '@/lib/canvas/fabric-hooks';
import { Button } from '@/src/design-system/components/Button/Button';
import { Download, Edit2, Save } from 'lucide-react';

interface CertificateCanvasProps {
  contractorId: string;
  contractorName: string;
  certificationLevel: 'Associate' | 'Professional' | 'Master';
  issueDate?: Date;
  expiryDate?: Date;
  certificationNumber?: string;
  licenseNumber?: string;
}

const CERT_COLORS = {
  border: '#002FA7',
  accent: '#FFD700',
  text: '#333333',
  lightText: '#666666',
};

export function CertificateCanvas({
  contractorId,
  contractorName,
  certificationLevel,
  issueDate = new Date(),
  expiryDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
  certificationNumber = `CERT-${contractorId}`,
  licenseNumber = `LIC-${contractorId}`,
}: CertificateCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Format dates
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-AU', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  // Initialize certificate design
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: '#FFFFFF',
      preserveObjectStacking: true,
    });

    fabricCanvasRef.current = canvas;

    // Outer border
    const outerBorder = new fabric.Rect({
      left: 20,
      top: 20,
      width: 760,
      height: 560,
      fill: 'transparent',
      stroke: CERT_COLORS.border,
      strokeWidth: 4,
      selectable: false,
    });
    canvas.add(outerBorder);

    // Inner decorative border
    const innerBorder = new fabric.Rect({
      left: 35,
      top: 35,
      width: 730,
      height: 530,
      fill: 'transparent',
      stroke: CERT_COLORS.lightText,
      strokeWidth: 1,
      selectable: false,
    });
    canvas.add(innerBorder);

    // Header
    const header = new fabric.Text('NATIONAL RESTORATION PROFESSIONALS GROUP', {
      left: 50,
      top: 60,
      fontSize: 18,
      fontWeight: 'bold',
      fill: CERT_COLORS.border,
      fontFamily: 'Arial',
      selectable: false,
    });
    canvas.add(header);

    const subheader = new fabric.Text('IICRC Contractor Certification', {
      left: 50,
      top: 90,
      fontSize: 14,
      fill: CERT_COLORS.text,
      fontFamily: 'Arial',
      selectable: false,
    });
    canvas.add(subheader);

    // Title
    const title = new fabric.Text('Certificate of Professional Achievement', {
      left: 50,
      top: 150,
      fontSize: 28,
      fontWeight: 'bold',
      fill: CERT_COLORS.border,
      fontFamily: 'Arial',
      selectable: false,
    });
    canvas.add(title);

    // Contractor name (editable)
    const nameText = new fabric.Text(contractorName, {
      left: 50,
      top: 230,
      fontSize: 24,
      fontWeight: 'bold',
      fill: CERT_COLORS.text,
      fontFamily: 'Arial',
      selectable: editMode,
      editable: editMode,
    });
    canvas.add(nameText);

    // Certification text
    const certText = new fabric.Text(
      `is hereby recognized as an IICRC ${certificationLevel} Restoration Contractor\nand is authorized to perform certified restoration services in accordance\nwith industry standards and regulations.`,
      {
        left: 50,
        top: 300,
        fontSize: 12,
        fill: CERT_COLORS.text,
        fontFamily: 'Arial',
        selectable: false,
        lineHeight: 1.5,
      }
    );
    canvas.add(certText);

    // Details section - Left column
    const detailsLabel = new fabric.Text('Certification Details:', {
      left: 50,
      top: 390,
      fontSize: 11,
      fontWeight: 'bold',
      fill: CERT_COLORS.text,
      fontFamily: 'Arial',
      selectable: false,
    });
    canvas.add(detailsLabel);

    const details = [
      { label: 'Certification Level:', value: certificationLevel, top: 420 },
      {
        label: 'Certification Number:',
        value: certificationNumber,
        top: 445,
      },
      { label: 'License Number:', value: licenseNumber, top: 470 },
    ];

    details.forEach(detail => {
      const label = new fabric.Text(detail.label, {
        left: 70,
        top: detail.top,
        fontSize: 10,
        fontWeight: 'bold',
        fill: CERT_COLORS.text,
        fontFamily: 'Arial',
        selectable: false,
      });
      canvas.add(label);

      const value = new fabric.Text(detail.value, {
        left: 220,
        top: detail.top,
        fontSize: 10,
        fill: CERT_COLORS.text,
        fontFamily: 'Arial',
        selectable: editMode,
        editable: editMode,
      });
      canvas.add(value);
    });

    // Right column - Dates
    const dateDetails = [
      { label: 'Issue Date:', value: formatDate(issueDate), top: 420 },
      { label: 'Expiry Date:', value: formatDate(expiryDate), top: 445 },
    ];

    dateDetails.forEach(detail => {
      const label = new fabric.Text(detail.label, {
        left: 450,
        top: detail.top,
        fontSize: 10,
        fontWeight: 'bold',
        fill: CERT_COLORS.text,
        fontFamily: 'Arial',
        selectable: false,
      });
      canvas.add(label);

      const value = new fabric.Text(detail.value, {
        left: 550,
        top: detail.top,
        fontSize: 10,
        fill: CERT_COLORS.text,
        fontFamily: 'Arial',
        selectable: editMode,
        editable: editMode,
      });
      canvas.add(value);
    });

    // QR Code placeholder (would be embedded in real scenario)
    const qrPlaceholder = new fabric.Rect({
      left: 650,
      top: 380,
      width: 100,
      height: 100,
      fill: '#f0f0f0',
      stroke: '#999999',
      strokeWidth: 1,
      selectable: false,
    });
    canvas.add(qrPlaceholder);

    const qrLabel = new fabric.Text('QR Code', {
      left: 700,
      top: 490,
      fontSize: 8,
      fill: CERT_COLORS.lightText,
      fontFamily: 'Arial',
      selectable: false,
      textAlign: 'center',
    });
    canvas.add(qrLabel);

    // Footer
    const footer = new fabric.Text(
      'This certificate confirms compliance with industry standards and regulations. Valid only for the specified period.',
      {
        left: 50,
        top: 540,
        fontSize: 8,
        fill: CERT_COLORS.lightText,
        fontFamily: 'Arial',
        selectable: false,
      }
    );
    canvas.add(footer);

    // Gold accent at bottom
    const goldLine = new fabric.Rect({
      left: 50,
      top: 530,
      width: 700,
      height: 2,
      fill: CERT_COLORS.accent,
      selectable: false,
    });
    canvas.add(goldLine);

    setIsInitialized(true);

    return () => {
      canvas.dispose();
    };
  }, [
    contractorName,
    certificationLevel,
    certificateNumber,
    licenseNumber,
    issueDate,
    expiryDate,
  ]);

  const handleToggleEditMode = () => {
    setEditMode(!editMode);
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.getObjects().forEach(obj => {
        if (obj.get('editable')) {
          obj.set({ selectable: !editMode });
        }
      });
      fabricCanvasRef.current.renderAll();
    }
  };

  const handleExport = () => {
    if (fabricCanvasRef.current) {
      exportCanvasPNG(
        fabricCanvasRef.current,
        `certificate-${contractorName.replace(/\s+/g, '-')}.png`
      );
    }
  };

  return (
    <div className="space-y-4">
      {/* Canvas */}
      <div className="flex justify-center bg-gray-50 rounded-lg p-4 border border-gray-200 overflow-x-auto">
        <canvas
          ref={canvasRef}
          className="border-2 border-gray-300 rounded-lg shadow-sm"
        />
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          variant={editMode ? 'primary' : 'outline'}
          onClick={handleToggleEditMode}
          icon={editMode ? <Save className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
        >
          {editMode ? 'Save Changes' : 'Edit Certificate'}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="primary"
          onClick={handleExport}
          icon={<Download className="h-4 w-4" />}
        >
          Export Certificate
        </Button>
      </div>

      {/* Info */}
      <div className="text-xs text-gray-400 bg-blue-50 p-3 rounded-lg">
        <p>
          💡 <strong>Tip:</strong> Click "Edit Certificate" to customize text fields.
          Once satisfied with changes, click "Save Changes" then "Export Certificate".
        </p>
      </div>
    </div>
  );
}
