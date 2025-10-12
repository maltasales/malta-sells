'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, CreditCard, Lock, Shield } from 'lucide-react';
import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/hooks/useAuth';

const paymentSchema = z.object({
  cardNumber: z.string().min(16, 'Card number must be 16 digits').max(19, 'Invalid card number'),
  expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/([0-9]{2})$/, 'Invalid expiry date (MM/YY)'),
  cvc: z.string().min(3, 'CVC must be 3 digits').max(4, 'CVC must be 3-4 digits'),
  cardholderName: z.string().min(2, 'Cardholder name is required'),
  billingEmail: z.string().email('Invalid email address'),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

export default function PaymentPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(false);

  // Get plan details from URL parameters
  const planId = searchParams.get('plan');
  const planName = searchParams.get('name');
  const planPrice = searchParams.get('price');
  const originalPrice = searchParams.get('originalPrice');
  const trialEndDate = searchParams.get('trialEndDate');
  
  const isFreeTrial = planPrice === '0' && originalPrice && trialEndDate;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      billingEmail: user?.email || '',
    },
  });

  // Redirect if no plan is selected
  if (!planId || !planName || !planPrice) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No plan selected</h2>
          <p className="text-gray-600 mb-4">Please select a plan first</p>
          <Link
            href="/account/upgrade-plan"
            className="px-4 py-2 bg-[#D12C1D] text-white rounded-lg hover:bg-[#B8241A] transition-colors"
          >
            Choose Plan
          </Link>
        </div>
      </div>
    );
  }

  const formatCardNumber = (value: string) => {
    // Remove all non-digit characters
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    // Add spaces every 4 digits
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const onSubmit = async (data: PaymentFormData) => {
    setIsProcessing(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // TODO: Integrate with actual payment processor (Stripe/Revolut)
      console.log('Payment would be processed with data:', {
        plan: { id: planId, name: planName, price: planPrice },
        payment: data,
        user: user?.id,
      });
      
      // Simulate successful payment
      alert(`Payment successful! You've subscribed to the ${planName} plan for €${planPrice}/month.`);
      router.push('/dashboard/seller');
      
    } catch (error: any) {
      setError('root', {
        message: 'Payment processing failed. Please try again.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AuthGuard requiredRole="seller">
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="flex items-center p-4 max-w-4xl mx-auto">
            <Link href="/account/upgrade-plan" className="p-2 hover:bg-gray-100 rounded-full mr-2">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-lg font-semibold">Complete Payment</h1>
          </div>
        </div>

        <div className="p-4 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Order Summary */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 h-fit">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-gray-900">{planName} Plan</h3>
                    <p className="text-sm text-gray-600">Monthly subscription</p>
                  </div>
                  <div className="text-right">
                    {isFreeTrial ? (
                      <div>
                        <div className="flex items-center justify-end space-x-2">
                          <span className="text-sm text-gray-400 line-through">€{originalPrice}</span>
                          <span className="font-semibold text-green-600">€{planPrice}</span>
                        </div>
                        <p className="text-sm text-gray-600">per month</p>
                        <p className="text-xs text-gray-500 mt-1">€{originalPrice}/month starting {trialEndDate}</p>
                      </div>
                    ) : (
                      <div>
                        <p className="font-semibold text-gray-900">€{planPrice}</p>
                        <p className="text-sm text-gray-600">per month</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900">Total</span>
                    {isFreeTrial ? (
                      <div className="text-right">
                        <span className="text-xl font-bold text-green-600">€{planPrice}/month</span>
                        <p className="text-xs text-gray-500">Free until {trialEndDate}</p>
                      </div>
                    ) : (
                      <span className="text-xl font-bold text-gray-900">€{planPrice}/month</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Security Notice */}
              <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Secure Payment</span>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  Your payment information is encrypted and secure
                </p>
              </div>
            </div>

            {/* Payment Form */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center space-x-2 mb-6">
                <CreditCard className="w-6 h-6 text-[#D12C1D]" />
                <h2 className="text-xl font-semibold text-gray-900">Payment Details</h2>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Billing Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Billing Email
                  </label>
                  <input
                    {...register('billingEmail')}
                    type="email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D12C1D] focus:border-transparent"
                    placeholder="your@email.com"
                  />
                  {errors.billingEmail && (
                    <p className="mt-1 text-sm text-red-600">{errors.billingEmail.message}</p>
                  )}
                </div>

                {/* Card Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Card Number
                  </label>
                  <input
                    {...register('cardNumber')}
                    type="text"
                    maxLength={19}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D12C1D] focus:border-transparent"
                    placeholder="1234 5678 9012 3456"
                    onChange={(e) => {
                      e.target.value = formatCardNumber(e.target.value);
                    }}
                  />
                  {errors.cardNumber && (
                    <p className="mt-1 text-sm text-red-600">{errors.cardNumber.message}</p>
                  )}
                </div>

                {/* Expiry Date and CVC */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expiry Date
                    </label>
                    <input
                      {...register('expiryDate')}
                      type="text"
                      maxLength={5}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D12C1D] focus:border-transparent"
                      placeholder="MM/YY"
                      onChange={(e) => {
                        e.target.value = formatExpiryDate(e.target.value);
                      }}
                    />
                    {errors.expiryDate && (
                      <p className="mt-1 text-sm text-red-600">{errors.expiryDate.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CVC
                    </label>
                    <input
                      {...register('cvc')}
                      type="text"
                      maxLength={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D12C1D] focus:border-transparent"
                      placeholder="123"
                    />
                    {errors.cvc && (
                      <p className="mt-1 text-sm text-red-600">{errors.cvc.message}</p>
                    )}
                  </div>
                </div>

                {/* Cardholder Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cardholder Name
                  </label>
                  <input
                    {...register('cardholderName')}
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D12C1D] focus:border-transparent"
                    placeholder="John Doe"
                  />
                  {errors.cardholderName && (
                    <p className="mt-1 text-sm text-red-600">{errors.cardholderName.message}</p>
                  )}
                </div>

                {/* Error Message */}
                {errors.root && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{errors.root.message}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-4 bg-[#D12C1D] text-white rounded-lg hover:bg-[#B8241A] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Processing Payment...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      <span>Pay €{planPrice}/month</span>
                    </>
                  )}
                </button>
              </form>

              {/* Payment Methods */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600 text-center mb-4">We accept</p>
                <div className="flex justify-center items-center space-x-6 mb-6">
                  {/* Visa Logo */}
                  <div className="h-8 w-12 bg-white rounded border border-gray-200 p-1 flex items-center justify-center">
                    <svg viewBox="0 0 48 32" className="h-6 w-10">
                      <rect width="48" height="32" fill="#1434CB"/>
                      <text x="24" y="20" textAnchor="middle" fill="white" fontSize="12" fontFamily="Arial, sans-serif" fontWeight="bold">VISA</text>
                    </svg>
                  </div>
                  
                  {/* Mastercard Logo */}
                  <div className="h-8 w-12 bg-white rounded border border-gray-200 p-1 flex items-center justify-center">
                    <svg viewBox="0 0 48 32" className="h-6 w-10">
                      <circle cx="18" cy="16" r="10" fill="#EB001B"/>
                      <circle cx="30" cy="16" r="10" fill="#F79E1B"/>
                      <path d="M24 8c2.2 1.8 3.6 4.5 3.6 7.5s-1.4 5.7-3.6 7.5c-2.2-1.8-3.6-4.5-3.6-7.5S21.8 9.8 24 8z" fill="#FF5F00"/>
                    </svg>
                  </div>
                  
                  {/* American Express Logo */}
                  <div className="h-8 w-12 bg-white rounded border border-gray-200 p-1 flex items-center justify-center">
                    <svg viewBox="0 0 48 32" className="h-6 w-10">
                      <rect width="48" height="32" fill="#006FCF"/>
                      <text x="24" y="12" textAnchor="middle" fill="white" fontSize="6" fontFamily="Arial, sans-serif" fontWeight="bold">AMERICAN</text>
                      <text x="24" y="22" textAnchor="middle" fill="white" fontSize="6" fontFamily="Arial, sans-serif" fontWeight="bold">EXPRESS</text>
                    </svg>
                  </div>
                </div>
                
                {/* Trust Badges */}
                <div className="flex justify-center items-center space-x-4">
                  <div className="flex items-center space-x-2 px-3 py-2 bg-green-50 rounded-lg border border-green-200">
                    <Shield className="w-4 h-4 text-green-600" />
                    <span className="text-xs font-medium text-green-800">SSL Secured</span>
                  </div>
                  <div className="flex items-center space-x-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-200">
                    <Lock className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-medium text-blue-800">256-bit Encryption</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}