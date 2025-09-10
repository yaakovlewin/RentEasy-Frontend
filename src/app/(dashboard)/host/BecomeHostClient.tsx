'use client';

import { useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import {
  ArrowRight,
  Calendar,
  CheckCircle,
  DollarSign,
  HeadphonesIcon,
  Home,
  MapPin,
  Shield,
  Star,
  TrendingUp,
  Users,
} from 'lucide-react';

import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { useAuth } from '@/contexts/AuthContext';

const benefits = [
  {
    icon: DollarSign,
    title: 'Earn Extra Income',
    description: 'Make money from your spare room or entire property with competitive pricing',
  },
  {
    icon: Users,
    title: 'Meet New People',
    description: 'Connect with travelers from around the world and share local experiences',
  },
  {
    icon: Shield,
    title: 'Host Protection',
    description: 'Comprehensive insurance coverage and 24/7 support for peace of mind',
  },
  {
    icon: TrendingUp,
    title: 'Flexible Schedule',
    description: 'You control when and how often you want to host guests',
  },
];

const steps = [
  {
    number: '1',
    title: 'Create Your Listing',
    description: 'Add photos, describe your space, and set your availability',
  },
  {
    number: '2',
    title: 'Set Your Price',
    description: "We'll help you price competitively based on your location and amenities",
  },
  {
    number: '3',
    title: 'Start Hosting',
    description: 'Welcome guests and start earning money from your property',
  },
];

const testimonials = [
  {
    name: 'Sarah Mitchell',
    location: 'San Francisco, CA',
    rating: 5,
    review:
      "Hosting on RentEasy has been incredible. I've met amazing people and earned enough to cover my mortgage!",
    earnings: '$2,400/month',
    avatar:
      'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=60&h=60&fit=crop&crop=face',
  },
  {
    name: 'Michael Chen',
    location: 'Austin, TX',
    rating: 5,
    review:
      'The platform makes hosting so easy. Great support team and the insurance gives me peace of mind.',
    earnings: '$1,800/month',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face',
  },
  {
    name: 'Emma Rodriguez',
    location: 'Miami, FL',
    rating: 5,
    review:
      'I love the flexibility! I can host when I travel and earn money while my place would be empty.',
    earnings: '$3,200/month',
    avatar:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&crop=face',
  },
];

export default function BecomeHostClient() {
  const [isCalculating, setIsCalculating] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  const handleGetStarted = () => {
    if (!isAuthenticated) {
      router.push('/auth/register?redirect=/host/properties/new&role=owner');
    } else {
      router.push('/host/properties/new');
    }
  };

  const calculateEarnings = () => {
    setIsCalculating(true);
    // Simulate calculation
    setTimeout(() => {
      setIsCalculating(false);
      // Scroll to calculator section or show modal
    }, 2000);
  };

  return (
    <div className='min-h-screen bg-white'>
      <Header />

      {/* Hero Section */}
      <section className='pt-24 pb-16 bg-gradient-to-br from-blue-50 via-white to-purple-50'>
        <div className='container mx-auto px-4'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
            <div>
              <h1 className='text-4xl lg:text-6xl font-bold text-gray-900 mb-6'>
                Become a Host and
                <span className='text-primary block'>Start Earning Today</span>
              </h1>
              <p className='text-xl text-gray-600 mb-8'>
                Share your space with travelers and earn money with RentEasy's trusted platform.
                Join thousands of hosts already earning extra income.
              </p>

              <div className='flex flex-col sm:flex-row gap-4 mb-8'>
                <Button onClick={handleGetStarted} size='lg' className='text-lg px-8 py-4'>
                  Get Started
                  <ArrowRight className='w-5 h-5 ml-2' />
                </Button>

                <Button
                  variant='outline'
                  onClick={calculateEarnings}
                  size='lg'
                  className='text-lg px-8 py-4'
                  disabled={isCalculating}
                >
                  {isCalculating ? (
                    <>
                      <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2'></div>
                      Calculating...
                    </>
                  ) : (
                    <>
                      <DollarSign className='w-5 h-5 mr-2' />
                      Estimate Earnings
                    </>
                  )}
                </Button>
              </div>

              <div className='flex items-center text-sm text-gray-600'>
                <CheckCircle className='w-4 h-4 text-green-500 mr-2' />
                <span>Free to list • No upfront costs • Cancel anytime</span>
              </div>
            </div>

            <div className='relative'>
              <div className='grid grid-cols-2 gap-4'>
                <div className='relative h-[400px]'>
                  <Image
                    src='https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=300&h=400&fit=crop'
                    alt='Modern apartment interior'
                    fill
                    className='rounded-2xl shadow-lg object-cover'
                    sizes='(max-width: 768px) 50vw, 300px'
                  />
                </div>
                <div className='relative h-[300px] mt-8'>
                  <Image
                    src='https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=300&h=300&fit=crop'
                    alt='Cozy bedroom'
                    fill
                    className='rounded-2xl shadow-lg object-cover'
                    sizes='(max-width: 768px) 50vw, 300px'
                  />
                </div>
              </div>

              {/* Floating earning card */}
              <Card className='absolute -bottom-4 -left-4 bg-white shadow-xl border-0 w-48'>
                <CardContent className='p-4'>
                  <div className='flex items-center space-x-2 mb-2'>
                    <div className='w-8 h-8 bg-green-100 rounded-full flex items-center justify-center'>
                      <TrendingUp className='w-4 h-4 text-green-600' />
                    </div>
                    <span className='text-sm font-medium'>Potential Earnings</span>
                  </div>
                  <div className='text-2xl font-bold text-gray-900'>$2,400</div>
                  <div className='text-xs text-gray-600'>per month</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className='py-16 bg-white'>
        <div className='container mx-auto px-4'>
          <div className='text-center mb-12'>
            <h2 className='text-3xl font-bold text-gray-900 mb-4'>Why Choose RentEasy?</h2>
            <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
              Join a community of successful hosts and enjoy the benefits of our trusted platform
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
            {benefits.map((benefit, index) => (
              <Card
                key={index}
                className='text-center border-0 shadow-sm hover:shadow-lg transition-shadow'
              >
                <CardContent className='p-6'>
                  <div className='w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4'>
                    <benefit.icon className='w-8 h-8 text-primary' />
                  </div>
                  <h3 className='text-lg font-semibold mb-2'>{benefit.title}</h3>
                  <p className='text-gray-600 text-sm'>{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className='py-16 bg-gray-50'>
        <div className='container mx-auto px-4'>
          <div className='text-center mb-12'>
            <h2 className='text-3xl font-bold text-gray-900 mb-4'>How It Works</h2>
            <p className='text-xl text-gray-600'>Get started in just 3 simple steps</p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            {steps.map((step, index) => (
              <div key={index} className='text-center'>
                <div className='w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold'>
                  {step.number}
                </div>
                <h3 className='text-xl font-semibold mb-2'>{step.title}</h3>
                <p className='text-gray-600'>{step.description}</p>

                {index < steps.length - 1 && (
                  <ArrowRight className='w-6 h-6 text-gray-400 mx-auto mt-6 hidden md:block' />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className='py-16 bg-white'>
        <div className='container mx-auto px-4'>
          <div className='text-center mb-12'>
            <h2 className='text-3xl font-bold text-gray-900 mb-4'>What Our Hosts Say</h2>
            <p className='text-xl text-gray-600'>Real stories from successful RentEasy hosts</p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            {testimonials.map((testimonial, index) => (
              <Card key={index} className='border-0 shadow-sm'>
                <CardContent className='p-6'>
                  <div className='flex items-center space-x-1 mb-4'>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className='w-4 h-4 fill-yellow-400 text-yellow-400' />
                    ))}
                  </div>

                  <p className='text-gray-700 mb-4'>"{testimonial.review}"</p>

                  <div className='flex items-center justify-between'>
                    <div className='flex items-center space-x-3'>
                      <div className='w-10 h-10 relative'>
                        <Image
                          src={testimonial.avatar}
                          alt={testimonial.name}
                          fill
                          className='rounded-full object-cover'
                          sizes='40px'
                        />
                      </div>
                      <div>
                        <div className='font-medium text-sm'>{testimonial.name}</div>
                        <div className='text-gray-600 text-xs flex items-center'>
                          <MapPin className='w-3 h-3 mr-1' />
                          {testimonial.location}
                        </div>
                      </div>
                    </div>

                    <div className='text-right'>
                      <div className='font-bold text-green-600'>{testimonial.earnings}</div>
                      <div className='text-xs text-gray-600'>average</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className='py-16 bg-primary'>
        <div className='container mx-auto px-4 text-center'>
          <h2 className='text-3xl font-bold text-white mb-4'>Ready to Start Hosting?</h2>
          <p className='text-xl text-blue-100 mb-8 max-w-2xl mx-auto'>
            Join thousands of hosts earning money with their space. Create your listing today and
            start welcoming guests.
          </p>

          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <Button
              onClick={handleGetStarted}
              variant='secondary'
              size='lg'
              className='text-lg px-8 py-4 bg-white text-primary hover:bg-gray-100'
            >
              Start Hosting Now
              <ArrowRight className='w-5 h-5 ml-2' />
            </Button>

            {isAuthenticated && user?.role === 'owner' && (
              <Link href='/host/dashboard'>
                <Button
                  variant='outline'
                  size='lg'
                  className='text-lg px-8 py-4 border-white text-white hover:bg-white/10'
                >
                  Go to Host Dashboard
                </Button>
              </Link>
            )}
          </div>

          <div className='flex items-center justify-center mt-6 text-blue-100 text-sm'>
            <HeadphonesIcon className='w-4 h-4 mr-2' />
            <span>Need help? Our support team is available 24/7</span>
          </div>
        </div>
      </section>
    </div>
  );
}