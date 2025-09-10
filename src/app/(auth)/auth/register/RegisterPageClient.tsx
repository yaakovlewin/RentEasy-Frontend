'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Eye, EyeOff, Home, Lock, Mail, MapPin, Phone, User } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

import { useAuth } from '@/contexts/AuthContext';

export default function RegisterPageClient() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'guest' as 'guest' | 'owner',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { register, isAuthenticated, isLoading } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phone,
        password: formData.password,
        role: formData.role,
      };

      await register(userData);

      // Redirect to dashboard after successful registration
      router.push('/dashboard');
    } catch (error: any) {
      try {
        if (typeof window !== 'undefined' && typeof console !== 'undefined' && console.error) {
          console.error('Registration error:', error);
        }
      } catch (e) {
        // Silently fail if console is not available
      }
      setError(error.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-lg w-full space-y-8'>
        {/* Logo and Header */}
        <div className='text-center'>
          <Link href='/' className='inline-flex items-center space-x-2 mb-8'>
            <Home className='w-8 h-8 text-primary' />
            <span className='text-2xl font-bold text-gray-900'>RentEasy</span>
          </Link>

          <h2 className='text-3xl font-bold text-gray-900'>Create your account</h2>
          <p className='mt-2 text-gray-600'>Join thousands of happy travelers and hosts</p>
        </div>

        {/* Registration Form */}
        <Card className='shadow-xl border-0'>
          <CardHeader className='pb-6'>
            <CardTitle className='text-center text-xl'>Sign Up</CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className='space-y-6'>
              {error && (
                <div className='bg-red-50 border border-red-200 rounded-md p-3'>
                  <p className='text-red-700 text-sm'>{error}</p>
                </div>
              )}

              {/* Role Selection */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-3'>I want to:</label>
                <div className='grid grid-cols-2 gap-4'>
                  <div
                    className={`relative cursor-pointer rounded-lg border p-4 ${
                      formData.role === 'guest'
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onClick={() => setFormData({ ...formData, role: 'guest' })}
                  >
                    <input
                      type='radio'
                      name='role'
                      value='guest'
                      checked={formData.role === 'guest'}
                      onChange={handleInputChange}
                      className='sr-only'
                    />
                    <MapPin className='w-6 h-6 text-primary mb-2' />
                    <div className='text-sm font-medium'>Book stays</div>
                    <div className='text-xs text-gray-500'>Find and book amazing places</div>
                  </div>

                  <div
                    className={`relative cursor-pointer rounded-lg border p-4 ${
                      formData.role === 'owner'
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onClick={() => setFormData({ ...formData, role: 'owner' })}
                  >
                    <input
                      type='radio'
                      name='role'
                      value='owner'
                      checked={formData.role === 'owner'}
                      onChange={handleInputChange}
                      className='sr-only'
                    />
                    <Home className='w-6 h-6 text-primary mb-2' />
                    <div className='text-sm font-medium'>Host properties</div>
                    <div className='text-xs text-gray-500'>Earn money from your space</div>
                  </div>
                </div>
              </div>

              {/* Name Fields */}
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label
                    htmlFor='firstName'
                    className='block text-sm font-medium text-gray-700 mb-2'
                  >
                    First name
                  </label>
                  <div className='relative'>
                    <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                      <User className='h-5 w-5 text-gray-400' />
                    </div>
                    <Input
                      id='firstName'
                      name='firstName'
                      type='text'
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className='pl-10'
                      placeholder='First name'
                      required
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor='lastName'
                    className='block text-sm font-medium text-gray-700 mb-2'
                  >
                    Last name
                  </label>
                  <Input
                    id='lastName'
                    name='lastName'
                    type='text'
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder='Last name'
                    required
                  />
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor='email' className='block text-sm font-medium text-gray-700 mb-2'>
                  Email address
                </label>
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <Mail className='h-5 w-5 text-gray-400' />
                  </div>
                  <Input
                    id='email'
                    name='email'
                    type='email'
                    value={formData.email}
                    onChange={handleInputChange}
                    className='pl-10'
                    placeholder='Enter your email'
                    required
                  />
                </div>
              </div>

              {/* Phone Field */}
              <div>
                <label htmlFor='phone' className='block text-sm font-medium text-gray-700 mb-2'>
                  Phone number
                </label>
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <Phone className='h-5 w-5 text-gray-400' />
                  </div>
                  <Input
                    id='phone'
                    name='phone'
                    type='tel'
                    value={formData.phone}
                    onChange={handleInputChange}
                    className='pl-10'
                    placeholder='+1 (555) 123-4567'
                    required
                  />
                </div>
              </div>

              {/* Password Fields */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label
                    htmlFor='password'
                    className='block text-sm font-medium text-gray-700 mb-2'
                  >
                    Password
                  </label>
                  <div className='relative'>
                    <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                      <Lock className='h-5 w-5 text-gray-400' />
                    </div>
                    <Input
                      id='password'
                      name='password'
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleInputChange}
                      className='pl-10 pr-10'
                      placeholder='Create password'
                      required
                    />
                    <button
                      type='button'
                      className='absolute inset-y-0 right-0 pr-3 flex items-center'
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className='h-5 w-5 text-gray-400 hover:text-gray-600' />
                      ) : (
                        <Eye className='h-5 w-5 text-gray-400 hover:text-gray-600' />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor='confirmPassword'
                    className='block text-sm font-medium text-gray-700 mb-2'
                  >
                    Confirm password
                  </label>
                  <div className='relative'>
                    <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                      <Lock className='h-5 w-5 text-gray-400' />
                    </div>
                    <Input
                      id='confirmPassword'
                      name='confirmPassword'
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className='pl-10 pr-10'
                      placeholder='Confirm password'
                      required
                    />
                    <button
                      type='button'
                      className='absolute inset-y-0 right-0 pr-3 flex items-center'
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className='h-5 w-5 text-gray-400 hover:text-gray-600' />
                      ) : (
                        <Eye className='h-5 w-5 text-gray-400 hover:text-gray-600' />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Password Requirements */}
              <div className='text-xs text-gray-500 space-y-1'>
                <p>Password must contain:</p>
                <ul className='list-disc list-inside space-y-1 ml-2'>
                  <li>At least 8 characters</li>
                  <li>One uppercase letter</li>
                  <li>One lowercase letter</li>
                  <li>One number</li>
                  <li>One special character</li>
                </ul>
              </div>

              {/* Terms and Privacy */}
              <div className='flex items-start'>
                <input
                  id='terms'
                  name='terms'
                  type='checkbox'
                  className='h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded mt-0.5'
                  required
                />
                <label htmlFor='terms' className='ml-2 block text-sm text-gray-700'>
                  I agree to the{' '}
                  <Link href='/terms' className='text-primary hover:text-primary/80'>
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href='/privacy' className='text-primary hover:text-primary/80'>
                    Privacy Policy
                  </Link>
                </label>
              </div>

              {/* Submit Button */}
              <Button type='submit' className='w-full py-6 text-base' disabled={isLoading}>
                {isLoading && <LoadingSpinner size='sm' className='mr-2' />}
                {isLoading ? 'Creating account...' : 'Create account'}
              </Button>
            </form>

            {/* Social Login */}
            <div className='mt-6'>
              <div className='relative'>
                <div className='absolute inset-0 flex items-center'>
                  <div className='w-full border-t border-gray-300' />
                </div>
                <div className='relative flex justify-center text-sm'>
                  <span className='px-2 bg-white text-gray-500'>Or sign up with</span>
                </div>
              </div>

              <div className='mt-6 grid grid-cols-2 gap-3'>
                <Button variant='outline' className='w-full'>
                  <svg className='w-5 h-5 mr-2' viewBox='0 0 24 24'>
                    <path
                      fill='currentColor'
                      d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
                    />
                    <path
                      fill='currentColor'
                      d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
                    />
                    <path
                      fill='currentColor'
                      d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
                    />
                    <path
                      fill='currentColor'
                      d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
                    />
                  </svg>
                  Google
                </Button>
                <Button variant='outline' className='w-full'>
                  <svg className='w-5 h-5 mr-2' fill='currentColor' viewBox='0 0 24 24'>
                    <path d='M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' />
                  </svg>
                  Facebook
                </Button>
              </div>
            </div>

            {/* Sign In Link */}
            <div className='mt-6 text-center'>
              <p className='text-sm text-gray-600'>
                Already have an account?{' '}
                <Link href='/auth/login' className='text-primary hover:text-primary/80 font-medium'>
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}