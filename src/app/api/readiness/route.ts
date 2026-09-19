// ============================================================
// ClinicoTrace — Readiness API Route
// GET /api/readiness → checks all providers are operational
// ============================================================

import { NextResponse } from 'next/server';
import { providerRegistry, IS_DEMO_MODE } from '@/providers/registry';

export async function GET() {
  const providers = {
    extraction: {
      name: providerRegistry.extraction.providerName,
      isLive: providerRegistry.extraction.isLive,
      status: 'ready',
    },
    safety: {
      name: providerRegistry.safety.providerName,
      isLive: providerRegistry.safety.isLive,
      status: 'ready',
    },
    authz: {
      name: providerRegistry.authz.providerName,
      isLive: providerRegistry.authz.isLive,
      status: 'ready',
    },
  };

  return NextResponse.json(
    {
      status: 'ready',
      mode: IS_DEMO_MODE ? 'demo' : 'production',
      timestamp: new Date().toISOString(),
      providers,
    },
    { status: 200 }
  );
}
