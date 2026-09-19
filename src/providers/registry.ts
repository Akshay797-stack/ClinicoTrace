// ============================================================
// ClinicoTrace — Provider Registry
// Wires demo or production providers based on NEXT_PUBLIC_MODE
// ============================================================

import type { ProviderRegistry } from '@/providers/interfaces';
import { DemoExtractionProvider } from '@/providers/demo/DemoExtractionProvider';
import { DemoSafetyProvider } from '@/providers/demo/DemoSafetyProvider';
import { DemoAuthzProvider } from '@/providers/demo/DemoAuthzProvider';

// For demo/hackathon: always use demo providers
// In production: read NEXT_PUBLIC_MODE and swap in production providers
const isDemoMode = process.env.NEXT_PUBLIC_MODE !== 'production';

function createRegistry(): ProviderRegistry {
  if (isDemoMode) {
    return {
      extraction: new DemoExtractionProvider(),
      safety: new DemoSafetyProvider(),
      authz: new DemoAuthzProvider(),
    };
  }

  // Production providers would be imported and returned here
  // Keeping demo providers as fallback until production is configured
  console.warn('[ClinicoTrace] NEXT_PUBLIC_MODE=production but production providers are not yet configured. Falling back to demo providers.');
  return {
    extraction: new DemoExtractionProvider(),
    safety: new DemoSafetyProvider(),
    authz: new DemoAuthzProvider(),
  };
}

export const providerRegistry: ProviderRegistry = createRegistry();
export const IS_DEMO_MODE = isDemoMode;
