// ============================================================
// ClinicoTrace — Health & Readiness API Routes
// GET /api/health   → liveness check
// GET /api/readiness → readiness check (providers online)
// ============================================================

import { NextResponse } from 'next/server';
import { providerRegistry, IS_DEMO_MODE } from '@/providers/registry';

export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      mode: IS_DEMO_MODE ? 'demo' : 'production',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version ?? '0.1.0',
    },
    { status: 200 }
  );
}
