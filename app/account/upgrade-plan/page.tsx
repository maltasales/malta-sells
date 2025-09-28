'use client';

import { ArrowLeft, Check, Sparkles, Zap, Crown, Gift } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import AuthGuard from '@/components/AuthGuard';
import { PLANS, getPlanById, getDefaultPlan, updateUserPlan } from '@/lib/plans';
import { supabase } from '@/lib/supabase';

const planIcons = {
  basic: Sparkles,
  pro: Zap,
  enterprise: Crown,
};

const planColors = {
  basic: { color: 'bg-green-500', hoverColor: 'hover:bg-green-600' },
  pro: { color: 'bg-[#D12C1D]', hoverColor: 'hover:bg-[#B8241A]' },
  enterprise: { color: 'bg-purple-600', hoverColor: 'hover:bg-purple-700' },
};

const plans = PLANS.map(plan => ({
  ...plan,
  icon: planIcons[plan.id as keyof typeof planIcons] || Gift,
  ...planColors[plan.id as keyof typeof planColors],
  popular: plan.id === 'pro',
}));

export default function UpgradePlanPage() {
  const { user } = useAuth();
  const router = useRouter();

  const handleSelectPlan = async (planId: string) => {
    if (!user) return;
    
    const selectedPlan = plans.find(p => p.id === planId);
    if (selectedPlan) {
      // For free plans or downgrades, update immediately
      if (planId === 'basic' || selectedPlan.price === 0) {
        const success = await updateUserPlan(user.id, planId, supabase);
        if (success) {
          // Refresh the page to show updated plan
          window.location.reload();
          return;
        } else {
          alert('Failed to update plan. Please try again.');
          return;
        }
      }
      
      // For paid plans, navigate to payment page
      const queryParams = new URLSearchParams({
        plan: planId,
        name: selectedPlan.name,
        price: selectedPlan.price.toString(),
      });
      
      // Add additional params for free trial
      if (selectedPlan.isFreeTrial && selectedPlan.originalPrice && selectedPlan.trialEndDate) {
        queryParams.set('originalPrice', selectedPlan.originalPrice.toString());
        queryParams.set('trialEndDate', selectedPlan.trialEndDate);
      }
      
      router.push(`/account/payment?${queryParams.toString()}`);
    }
  };

  return (
    <AuthGuard requiredRole="seller">
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="flex items-center p-4 max-w-6xl mx-auto">
            <Link href="/account" className="p-2 hover:bg-gray-100 rounded-full mr-2">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-lg font-semibold">Upgrade Your Plan</h1>
          </div>
        </div>

        <div className="p-4 max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Choose the Perfect Plan for Your Business
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Unlock powerful features to showcase your properties and reach more potential buyers. 
              All plans include our core features with increasing levels of exposure and support.
            </p>
          </div>

          {/* Current Plan Info */}
          {user && (
            <div className="bg-white rounded-lg p-6 mb-8 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Current Plan</h3>
                  {(() => {
                    const currentPlan = user.plan_id ? getPlanById(user.plan_id) : getDefaultPlan();
                    return (
                      <>
                        <p className="text-gray-600">You are currently on the <span className="font-medium">{currentPlan?.name} Plan</span></p>
                        <p className="text-sm text-gray-500 mt-1">{currentPlan?.maxListings} listing{currentPlan?.maxListings !== 1 ? 's' : ''} allowed</p>
                      </>
                    );
                  })()}
                </div>
                <div className="text-right">
                  {(() => {
                    const currentPlan = user.plan_id ? getPlanById(user.plan_id) : getDefaultPlan();
                    return (
                      <>
                        <p className="text-2xl font-bold text-gray-900">€{currentPlan?.price || 0}</p>
                        <p className="text-sm text-gray-500">per {currentPlan?.period || 'month'}</p>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative bg-white rounded-2xl shadow-sm border-2 transition-all duration-300 hover:shadow-lg ${
                  plan.popular 
                    ? 'border-[#D12C1D] ring-2 ring-[#D12C1D]/20' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-[#D12C1D] text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="p-8">
                  {/* Plan Header */}
                  <div className="text-center mb-8">
                    <div className={`w-16 h-16 ${plan.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                      <plan.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <div className="mb-4">
                      {plan.isFreeTrial ? (
                        <div>
                          <div className="flex items-center justify-center space-x-2">
                            <span className="text-2xl font-bold text-gray-400 line-through">€{plan.originalPrice}</span>
                            <span className="text-4xl font-bold text-green-600">€0.00</span>
                          </div>
                          <div className="mt-2">
                            <div className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                              Free until {plan.trialEndDate}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <span className="text-4xl font-bold text-gray-900">€{plan.price}</span>
                          <span className="text-gray-600">/{plan.period}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Features List */}
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <button
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={user?.plan_id === plan.id}
                    className={`w-full py-3 px-6 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      user?.plan_id === plan.id
                        ? 'bg-gray-300 text-gray-600'
                        : plan.isFreeTrial
                        ? `${plan.color} text-white ${plan.hoverColor}`
                        : plan.popular
                        ? `${plan.color} text-white ${plan.hoverColor}`
                        : plan.id === 'free'
                        ? 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    {user?.plan_id === plan.id 
                      ? 'Current Plan' 
                      : plan.id === 'free'
                      ? 'Downgrade'
                      : plan.isFreeTrial 
                      ? 'Start Free Trial' 
                      : plan.popular 
                      ? 'Get Started' 
                      : 'Choose Plan'
                    }
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* FAQ Section */}
          <div className="mt-16 bg-white rounded-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Frequently Asked Questions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Can I change my plan anytime?</h4>
                <p className="text-gray-600">Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">What payment methods do you accept?</h4>
                <p className="text-gray-600">We accept all major credit cards, PayPal, and bank transfers for annual subscriptions.</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Is there a free trial?</h4>
                <p className="text-gray-600">Yes! All paid plans come with a 14-day free trial. No credit card required to start.</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">What happens to my listings if I downgrade?</h4>
                <p className="text-gray-600">Your existing listings will remain active, but you won't be able to add new ones beyond your plan's limit.</p>
              </div>
            </div>
          </div>

          {/* Contact Support */}
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Need help choosing the right plan?{' '}
              <a href="mailto:support@maltasells.com" className="text-[#D12C1D] hover:text-[#B8241A] font-medium">
                Contact our sales team
              </a>
            </p>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}