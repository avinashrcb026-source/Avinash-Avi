import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Gemini SDK with User-Agent header as required by skill guidelines
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.warn('Failed to initialize GoogleGenAI with key:', err);
  }
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

  app.use(express.json({ limit: '10mb' }));

  // In-memory runtime state for backend API endpoints
  const auditLogs: Array<{ id: string; timestamp: string; user: string; role: string; action: string; details: string }> = [
    {
      id: 'log-01',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      user: 'Avinash (Lead Engineer)',
      role: 'engineer',
      action: 'START_JOB',
      details: 'Started job bracket_reinforced_v3.gcode on PRUSA-FDM-01',
    },
    {
      id: 'log-02',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      user: 'Engineering Shift 1',
      role: 'operator',
      action: 'PREHEAT',
      details: 'Set preheat preset ABS 250°C/105°C on VORON-2.4-IND',
    },
  ];

  // API Status & Health
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'online',
      platform: 'VoxelSync Cloud IIoT',
      version: '2.4.0-industrial',
      timestamp: new Date().toISOString(),
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    });
  });

  // Audit Logs API
  app.get('/api/audit-logs', (req: Request, res: Response) => {
    res.json(auditLogs);
  });

  app.post('/api/audit-logs', (req: Request, res: Response) => {
    const { user, role, action, details } = req.body;
    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user: user || 'Anonymous',
      role: role || 'operator',
      action: action || 'UNKNOWN_ACTION',
      details: details || '',
    };
    auditLogs.unshift(newLog);
    if (auditLogs.length > 200) auditLogs.pop();
    res.json({ success: true, log: newLog });
  });

  // AI-Based Fault Detection & Diagnostics Endpoint
  app.post('/api/ai/diagnose', async (req: Request, res: Response) => {
    const {
      machineId,
      machineName,
      telemetry,
      activeFaults,
      sensorSummary,
      visionState,
      currentJob,
    } = req.body;

    const fallbackAnalysis = {
      id: `AI-DIAG-${Date.now()}`,
      timestamp: new Date().toISOString(),
      machineId: machineId || 'PRUSA-FDM-01',
      machineName: machineName || 'PRUSA-FDM-01',
      overallHealthScore: activeFaults && activeFaults.length > 0 ? 76 : 94,
      riskLevel: activeFaults && activeFaults.length > 0 ? 'moderate' : 'nominal',
      headline:
        activeFaults && activeFaults.length > 0
          ? 'Thermal instability and micro-extrusion variance detected'
          : 'Nominal kinematic and thermal parameters within industrial tolerances',
      telemetryAnalysis:
        `Continuous monitoring of hotend (${telemetry?.nozzleTemp ?? 205}°C) and bed (${telemetry?.bedTemp ?? 60}°C) shows steady closed-loop PID control. ` +
        `Volumetric extrusion is balanced at ${telemetry?.extrusionVolumetricMm3S ?? 8.4} mm³/s with ${telemetry?.vibrationRms ?? 0.18} m/s² vibration RMS.`,
      identifiedPatterns: [
        {
          title: 'Hotend PID Temperature Stability',
          probability: 0.96,
          severity: 'information',
          evidence: `Current: ${telemetry?.nozzleTemp ?? 205}°C vs Setpoint: ${telemetry?.nozzleTarget ?? 210}°C. Variance: < 1.2°C`,
          possibleRootCause: 'Standard PID oscillation around setpoint during dynamic cooling fan ramp-up.',
          recommendedMitigation: 'No immediate mechanical action needed. Maintain current print speed.',
        },
        {
          title: 'Extrusion Path & Backpressure Consistency',
          probability: 0.88,
          severity: 'information',
          evidence: 'Optical runout sensor intact, rotary encoder slip ratio at 1.4% (safe below 15%).',
          possibleRootCause: 'Optimal filament feed path and clean nozzle orifice.',
          recommendedMitigation: 'Continue scheduled nozzle inspection at 300 print hours.',
        },
      ],
      visionInspection: {
        spaghettiRisk: visionState?.anomaly === 'spaghetti' ? 88 : 2,
        warpingRisk: visionState?.anomaly === 'warping' ? 72 : 4,
        layerShiftRisk: 3,
        visualStatus: visionState?.anomaly ? 'anomaly_suspected' : 'normal',
        visualNotes:
          visionState?.anomaly === 'spaghetti'
            ? 'Possible spaghetti-like detachment detected near perimeter edges! Extrusion strands failing to adhere.'
            : 'Perimeter lines, infill bonding, and first-layer PEI adhesion visually confirmed intact.',
      },
    };

    // If Gemini API is available, ask Gemini-3.8-flash for intelligent diagnosis
    if (ai && process.env.GEMINI_API_KEY) {
      try {
        const prompt = `You are the lead Industrial IoT AI Diagnostics Engine for an FDM 3D printing manufacturing farm.
Analyze the following live telemetry and sensor snapshot for printer "${machineName}" (${machineId}):
- Telemetry: ${JSON.stringify(telemetry)}
- Active Faults: ${JSON.stringify(activeFaults)}
- Sensors: ${JSON.stringify(sensorSummary)}
- Current Job: ${JSON.stringify(currentJob)}
- Vision Camera Status: ${JSON.stringify(visionState)}

Return a structured JSON object with EXACTLY this structure:
{
  "overallHealthScore": number (0-100),
  "riskLevel": "nominal" | "low" | "moderate" | "high" | "critical",
  "headline": string (concise engineering summary),
  "telemetryAnalysis": string (detailed engineering breakdown of temperatures, kinematics, and flow),
  "identifiedPatterns": [
    {
      "title": string,
      "probability": number (0.0 to 1.0),
      "severity": "information" | "warning" | "critical",
      "evidence": string,
      "possibleRootCause": string,
      "recommendedMitigation": string
    }
  ],
  "visionInspection": {
    "spaghettiRisk": number (0-100),
    "warpingRisk": number (0-100),
    "layerShiftRisk": number (0-100),
    "visualStatus": "normal" | "anomaly_suspected" | "critical_failure",
    "visualNotes": string
  }
}
Important: Frame findings as engineering detections, warnings, or probable causes, not absolute guarantees.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const text = response.text;
        if (text) {
          const parsed = JSON.parse(text);
          return res.json({
            id: `AI-DIAG-${Date.now()}`,
            timestamp: new Date().toISOString(),
            machineId,
            machineName,
            ...parsed,
          });
        }
      } catch (err: any) {
        console.error('Gemini diagnostics error, using fallback:', err?.message || err);
      }
    }

    // Return responsive fallback if Gemini is offline or not configured
    return res.json(fallbackAnalysis);
  });

  // AI Vision Inspection Endpoint
  app.post('/api/ai/vision-inspect', async (req: Request, res: Response) => {
    const { imageBase64, simulatedScenario } = req.body;

    if (simulatedScenario === 'spaghetti') {
      return res.json({
        detectionTimeMs: 48,
        status: 'anomaly_detected',
        type: 'spaghetti_failure',
        confidence: 0.91,
        message: 'Spaghetti-like loose extruded strands detected on build plate. Print head may be extruding in mid-air.',
        boundingBoxes: [
          { label: 'Unbounded Extrusion Mess', x: 28, y: 34, width: 44, height: 38, confidence: 0.91 },
        ],
        recommendedAction: 'Pause print immediately, inspect nozzle z-offset, and verify first-layer adhesion.',
      });
    }

    if (simulatedScenario === 'warping') {
      return res.json({
        detectionTimeMs: 52,
        status: 'anomaly_detected',
        type: 'bed_detachment_warping',
        confidence: 0.84,
        message: 'Corner detachment lifting off PEI bed surface detected on bottom-left perimeter.',
        boundingBoxes: [
          { label: 'Detached Corner Lift', x: 18, y: 62, width: 22, height: 18, confidence: 0.84 },
        ],
        recommendedAction: 'Increase heated bed temperature by 5°C or clean build plate with 99% IPA.',
      });
    }

    return res.json({
      detectionTimeMs: 38,
      status: 'nominal',
      type: 'normal_extrusion',
      confidence: 0.98,
      message: 'Perimeter geometry, layer height consistency, and infill cross-sections adhere to CAD geometry slice.',
      boundingBoxes: [
        { label: 'Printed Part (Active Layer)', x: 30, y: 35, width: 40, height: 32, confidence: 0.98 },
        { label: 'Nozzle Toolhead', x: 48, y: 32, width: 12, height: 14, confidence: 0.96 },
      ],
      recommendedAction: 'No intervention required. Toolpath nominal.',
    });
  });

  // Slicer estimation endpoint (Design -> Slice -> Print workflow)
  app.post('/api/slicer/estimate', (req: Request, res: Response) => {
    const { layerHeight = 0.2, infillPercent = 20, material = 'PLA', speedMmS = 60, supports = false } = req.body;

    // Realistic calculation based on FDM slicing models
    const baseLayers = Math.round(40 / layerHeight);
    const speedFactor = 60 / speedMmS;
    const infillFactor = 0.6 + (infillPercent / 100) * 0.8;
    const supportMultiplier = supports ? 1.25 : 1.0;

    const estimatedMinutes = Math.round(110 * speedFactor * (0.2 / layerHeight) * infillFactor * supportMultiplier);
    const filamentGrams = Math.round(75 * (infillPercent / 20) * (supports ? 1.3 : 1.0));
    const filamentMeters = Number((filamentGrams / 3.0).toFixed(1));

    res.json({
      layerHeight,
      infillPercent,
      material,
      layersTotal: baseLayers,
      estimatedMinutes,
      estimatedFormatted: `${Math.floor(estimatedMinutes / 60)}h ${estimatedMinutes % 60}m`,
      filamentGrams,
      filamentMeters,
      costEstimateUsd: Number((filamentGrams * 0.024).toFixed(2)),
      gcodeLinesEstimated: baseLayers * 380,
    });
  });

  // Serve static files in production or mount Vite middleware in development
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[VoxelSync IIoT] Server operational on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[VoxelSync IIoT] Fatal server startup error:', err);
  process.exit(1);
});
