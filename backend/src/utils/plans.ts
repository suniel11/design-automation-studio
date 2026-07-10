export function getPlanPriceId(plan: string): string {
  const prices: Record<string, string> = {
    starter: process.env.STRIPE_STARTER_PRICE_ID || '',
    professional: process.env.STRIPE_PROFESSIONAL_PRICE_ID || '',
    enterprise: process.env.STRIPE_ENTERPRISE_PRICE_ID || '',
  };
  return prices[plan] || '';
}

export function getPlanLimit(plan: string): number {
  const limits: Record<string, number> = {
    free: 5,
    starter: 50,
    professional: 500,
    enterprise: 9999,
  };
  return limits[plan] || 5;
}

export function getCanvaDesignDimensions(format: string) {
  const dimensions: Record<string, { width: number; height: number }> = {
    Instagram: { width: 1080, height: 1350 },
    LinkedIn: { width: 1200, height: 627 },
    'Email Header': { width: 600, height: 200 },
    'Web Banner': { width: 1920, height: 400 },
  };
  return dimensions[format] || { width: 1080, height: 1080 };
}
