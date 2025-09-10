'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Home, Lock, Mail } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated, isLoading } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const redirect = searchParams.get('redirect');
      router.push(redirect || '/dashboard');
    }
  }, [isAuthenticated, router, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, password);

      // Redirect after successful login
      const redirect = searchParams.get('redirect');
      router.push(redirect || '/dashboard');
    } catch (error: unknown) {
      try {
        if (typeof window !== 'undefined' && typeof console !== 'undefined' && console.error) {
          console.error('Login error:', error);
        }
      } catch {
        // Silently fail if console is not available
      }

      // Display user-friendly error message
      const errorMessage = error instanceof Error ? error.message : 'Invalid email or password';
      setError(errorMessage);
    }
  };

  const handleGoogleLogin = () => {
    // TODO: Implement Google OAuth
    console.log('Google login not yet implemented');
  };

  const handleGuestLogin = () => {
    setEmail('guest@example.com');
    setPassword('password123');
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <LoadingSpinner size='lg' />
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <LoadingSpinner size='lg' />
      </div>
    );
  }

  return (
    <div className='min-h-screen flex'>
      {/* Left side - Login Form */}
      <div className='flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8'>
        <div className='max-w-md w-full space-y-8'>
          {/* Logo and Title */}
          <div className='text-center'>
            <Link href='/' className='inline-flex items-center space-x-2 mb-6'>
              <Home className='h-8 w-8 text-blue-600' />
              <span className='text-2xl font-bold text-gray-900'>RentEasy</span>
            </Link>
            <h2 className='text-3xl font-extrabold text-gray-900'>Welcome back</h2>
            <p className='mt-2 text-gray-600'>
              Don&apos;t have an account?{' '}
              <Link href='/auth/register' className='text-blue-600 hover:text-blue-500 font-medium'>
                Sign up
              </Link>
            </p>
          </div>

          {/* Login Form */}
          <Card className='border-0 shadow-xl'>
            <CardContent className='p-8'>
              {error && (
                <div className='mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm'>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className='space-y-6'>
                {/* Email Input */}
                <div className='space-y-2'>
                  <label htmlFor='email' className='text-sm font-medium text-gray-700'>
                    Email address
                  </label>
                  <Input
                    id='email'
                    type='email'
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className='w-full'
                    placeholder='Enter your email'
                    required
                  />
                </div>

                {/* Password Input */}
                <div className='space-y-2'>
                  <div className='flex items-center justify-between'>
                    <label htmlFor='password' className='text-sm font-medium text-gray-700'>
                      Password
                    </label>
                    <Link
                      href='/auth/forgot-password'
                      className='text-sm text-blue-600 hover:text-blue-500'
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className='relative'>
                    <Input
                      id='password'
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className='w-full pr-10'
                      placeholder='Enter your password'
                      required
                    />
                    <button
                      type='button'
                      onClick={() => setShowPassword(!showPassword)}
                      className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700'
                    >
                      {showPassword ? <EyeOff className='h-5 w-5' /> : <Eye className='h-5 w-5' />}
                    </button>
                  </div>
                </div>

                {/* Remember Me Checkbox */}
                <div className='flex items-center'>
                  <input
                    id='remember-me'
                    name='remember-me'
                    type='checkbox'
                    className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
                  />
                  <label htmlFor='remember-me' className='ml-2 block text-sm text-gray-700'>
                    Remember me
                  </label>
                </div>

                {/* Submit Button */}
                <Button type='submit' className='w-full' size='lg' disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <LoadingSpinner size='sm' className='mr-2' />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <Lock className='h-5 w-5 mr-2' />
                      Sign in
                    </>
                  )}
                </Button>

                {/* Divider */}
                <div className='relative'>
                  <div className='absolute inset-0 flex items-center'>
                    <div className='w-full border-t border-gray-300' />
                  </div>
                  <div className='relative flex justify-center text-sm'>
                    <span className='px-2 bg-white text-gray-500'>Or continue with</span>
                  </div>
                </div>

                {/* Social Login Buttons */}
                <div className='grid grid-cols-2 gap-3'>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={handleGoogleLogin}
                    className='w-full'
                  >
                    <svg className='h-5 w-5 mr-2' viewBox='0 0 24 24'>
                      <path
                        fill='#4285F4'
                        d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
                      />
                      <path
                        fill='#34A853'
                        d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
                      />
                      <path
                        fill='#FBBC05'
                        d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
                      />
                      <path
                        fill='#EA4335'
                        d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
                      />
                    </svg>
                    Google
                  </Button>

                  <Button
                    type='button'
                    variant='outline'
                    onClick={handleGuestLogin}
                    className='w-full'
                  >
                    <Mail className='h-5 w-5 mr-2' />
                    Guest
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right side - Image/Illustration */}
      <div className='hidden lg:block lg:w-1/2'>
        <div className='relative h-full'>
          <div className='absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-700' />
          <div className='absolute inset-0 bg-black opacity-20' />
          <div className='relative h-full flex items-center justify-center p-12'>
            <div className='max-w-md text-white'>
              <h3 className='text-4xl font-bold mb-6'>Find Your Perfect Stay</h3>
              <p className='text-lg mb-8'>
                Discover amazing properties and experiences around the world with RentEasy.
              </p>
              <div className='space-y-4'>
                <div className='flex items-center'>
                  <div className='w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mr-4'>
                    <span className='text-2xl'>🏠</span>
                  </div>
                  <div>
                    <h4 className='font-semibold'>Verified Properties</h4>
                    <p className='text-sm text-gray-200'>All properties are verified for quality</p>
                  </div>
                </div>
                <div className='flex items-center'>
                  <div className='w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mr-4'>
                    <span className='text-2xl'>💳</span>
                  </div>
                  <div>
                    <h4 className='font-semibold'>Secure Payments</h4>
                    <p className='text-sm text-gray-200'>Your payments are always protected</p>
                  </div>
                </div>
                <div className='flex items-center'>
                  <div className='w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mr-4'>
                    <span className='text-2xl'>🌟</span>
                  </div>
                  <div>
                    <h4 className='font-semibold'>Best Prices</h4>
                    <p className='text-sm text-gray-200'>Guaranteed best prices on all bookings</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}