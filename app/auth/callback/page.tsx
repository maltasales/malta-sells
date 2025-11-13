'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the session from the URL hash
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Error getting session:', error);
          router.push('/auth/signin?error=confirmation_failed');
          return;
        }

        if (session) {
          // Get user profile to determine role
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .maybeSingle();

          const dashboardRoute = profile?.role === 'seller'
            ? '/dashboard/seller'
            : '/dashboard/buyer';

          router.push(dashboardRoute);
        } else {
          router.push('/auth/signin?message=confirmed');
        }
      } catch (error) {
        console.error('Callback error:', error);
        router.push('/auth/signin?error=callback_error');
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D12C1D] mx-auto mb-4"></div>
        <p className="text-gray-600">Confirming your account...</p>
      </div>
    </div>
  );
}
