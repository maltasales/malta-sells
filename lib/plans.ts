// Plan definitions and utilities

export interface Plan {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  period: string;
  maxListings: number;
  icon?: any;
  color?: string;
  hoverColor?: string;
  popular?: boolean;
  isFreeTrial?: boolean;
  trialEndDate?: string;
  features: string[];
}

export const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    period: 'forever',
    maxListings: 1,
    features: [
      'List up to 1 property',
      'Basic listing features',
      'Email support',
    ],
  },
  {
    id: 'basic',
    name: 'Basic',
    price: 0,
    originalPrice: 29.99,
    period: 'month',
    maxListings: 5,
    isFreeTrial: true,
    trialEndDate: 'Jan 1, 2026',
    features: [
      'List up to 5 properties',
      'AI video generation (for listings)',
      'One featured listing for 7 days',
      'Verification badge',
      'Basic support',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 49,
    period: 'month',
    maxListings: 10,
    popular: true,
    features: [
      'List up to 10 properties',
      'AI video generation (for listings)',
      '3 Featured listings (7 days each)',
      'Verification badge',
      'Priority support',
      'Advanced features',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 79,
    period: 'month',
    maxListings: 20,
    features: [
      'List up to 20 properties',
      'AI video generation (for listings)',
      '5 Featured listings (7 days each)',
      'Verification badge',
      'Premium support',
      'Premium features',
    ],
  },
];

export function getPlanById(planId: string): Plan {
  const plan = PLANS.find(plan => plan.id === planId);
  if (!plan) {
    console.warn(`Plan not found: ${planId}, returning default Free plan`);
    return PLANS[0]; // Return Free plan as fallback
  }
  return plan;
}

export function getDefaultPlan(): Plan {
  return PLANS[0]; // Always return Free plan
}

export function canAddListing(currentListingCount: number, planId: string): boolean {
  const plan = getPlanById(planId);
  return currentListingCount < plan.maxListings;
}

export function getListingLimitMessage(planId: string): string {
  const plan = getPlanById(planId);
  return `You can list up to ${plan.maxListings} propert${plan.maxListings === 1 ? 'y' : 'ies'} on the ${plan.name} plan.`;
}

export async function updateUserPlan(userId: string, newPlanId: string, supabase: any): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ 
        plan_id: newPlanId,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      console.error('Error updating user plan:', error);
      return false;
    }

    // Update localStorage if available
    if (typeof window !== 'undefined') {
      const currentUser = localStorage.getItem('currentUser');
      if (currentUser) {
        const user = JSON.parse(currentUser);
        user.plan_id = newPlanId;
        localStorage.setItem('currentUser', JSON.stringify(user));
      }
    }

    return true;
  } catch (error) {
    console.error('Error updating user plan:', error);
    return false;
  }
}