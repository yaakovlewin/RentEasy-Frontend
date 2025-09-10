'use client';

import { useEffect, useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import {
  ArrowRight,
  Award,
  ChevronRight,
  Clock,
  Heart,
  MapPin,
  Play,
  Shield,
  Sparkles,
  Star,
} from 'lucide-react';

import { type SearchData } from '@/components/search';
import { SearchBarPortal } from '@/components/search/SearchBarPortal';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { useSearch } from '@/contexts/SearchContext';

export default function HomePageClient() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const { setOnSearch } = useSearch();

  useEffect(() => {
    const handleSearch = (searchData: SearchData) => {
      console.log('Search data:', searchData);

      // Build search query parameters
      const params = new URLSearchParams();
      if (searchData.location) params.set('location', searchData.location);
      if (searchData.checkIn) params.set('checkIn', searchData.checkIn.toISOString());
      if (searchData.checkOut) params.set('checkOut', searchData.checkOut.toISOString());
      if (searchData.guests.adults) params.set('adults', searchData.guests.adults.toString());
      if (searchData.guests.children) params.set('children', searchData.guests.children.toString());
      if (searchData.guests.infants) params.set('infants', searchData.guests.infants.toString());

      // Navigate to search page with parameters
      router.push(`/search?${params.toString()}`);
    };

    setOnSearch(handleSearch);
  }, [router, setOnSearch]);

  // Hero carousel images
  const heroSlides = [
    {
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920&h=1080&fit=crop',
      title: 'Luxury Villas',
      subtitle: 'Experience ultimate comfort',
    },
    {
      image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1920&h=1080&fit=crop',
      title: 'Ocean Views',
      subtitle: 'Wake up to paradise',
    },
    {
      image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1920&h=1080&fit=crop',
      title: 'Mountain Retreats',
      subtitle: 'Find your peaceful escape',
    },
  ];

  // Auto-slide carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  // Premium property categories
  const categories = [
    {
      title: 'Luxury Villas',
      subtitle: '5-star amenities',
      icon: '🏖️',
      image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&h=300&fit=crop',
      count: '450+ properties',
    },
    {
      title: 'City Penthouses',
      subtitle: 'Urban sophistication',
      icon: '🏙️',
      image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop',
      count: '280+ properties',
    },
    {
      title: 'Mountain Cabins',
      subtitle: "Nature's tranquility",
      icon: '🏔️',
      image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop',
      count: '320+ properties',
    },
    {
      title: 'Beach Houses',
      subtitle: 'Oceanfront escapes',
      icon: '🌊',
      image: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=400&h=300&fit=crop',
      count: '380+ properties',
    },
  ];

  // Featured luxury properties
  const featuredProperties = [
    {
      id: 1,
      title: 'Malibu Dream Villa',
      location: 'Malibu, California',
      price: 850,
      originalPrice: 950,
      rating: 4.9,
      reviews: 128,
      image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=500&h=400&fit=crop',
      amenities: ['Ocean View', 'Private Pool', 'Chef Kitchen', 'Wine Cellar'],
      badge: 'Superhost',
      isFeatured: true,
      discount: 11,
    },
    {
      id: 2,
      title: 'Alpine Luxury Chalet',
      location: 'Aspen, Colorado',
      price: 680,
      rating: 5.0,
      reviews: 89,
      image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=500&h=400&fit=crop',
      amenities: ['Ski Access', 'Hot Tub', 'Fireplace', 'Mountain View'],
      badge: 'Rare Find',
      isFeatured: true,
    },
    {
      id: 3,
      title: 'Manhattan Penthouse Suite',
      location: 'New York, New York',
      price: 720,
      rating: 4.8,
      reviews: 156,
      image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500&h=400&fit=crop',
      amenities: ['City Views', 'Rooftop Terrace', 'Concierge', 'Gym Access'],
      badge: 'Luxury',
      isFeatured: true,
    },
    {
      id: 4,
      title: 'Tuscan Countryside Villa',
      location: 'Tuscany, Italy',
      price: 590,
      rating: 4.9,
      reviews: 94,
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&h=400&fit=crop',
      amenities: ['Vineyard Views', 'Pool', 'Chef Kitchen', 'Wine Tasting'],
      badge: 'Unique',
      isFeatured: true,
    },
  ];

  // Premium destinations with curated experiences
  const destinations = [
    {
      name: 'Santorini',
      country: 'Greece',
      properties: 1200,
      image: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=400&h=300&fit=crop',
      specialty: 'Luxury Suites',
    },
    {
      name: 'Bali',
      country: 'Indonesia',
      properties: 800,
      image: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=400&h=300&fit=crop',
      specialty: 'Private Villas',
    },
    {
      name: 'Swiss Alps',
      country: 'Switzerland',
      properties: 450,
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
      specialty: 'Mountain Chalets',
    },
    {
      name: 'Maldives',
      country: 'Indian Ocean',
      properties: 320,
      image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop',
      specialty: 'Overwater Bungalows',
    },
  ];

  return (
    <div className='w-full'>
      {/* Revolutionary Hero Section with Dynamic Carousel */}
      <section className='relative min-h-screen flex items-center justify-center'>
        {/* Dynamic Background Carousel */}
        <div className='absolute inset-0 overflow-hidden'>
          {heroSlides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-2000 ease-in-out ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div
                className='absolute inset-0 bg-cover bg-center bg-no-repeat scale-110 animate-ken-burns'
                style={{
                  backgroundImage: `url('${slide.image}')`,
                }}
              />
              <div className='absolute inset-0 bg-gradient-to-br from-black/40 via-black/30 to-black/50' />
            </div>
          ))}

          {/* Animated gradient overlay */}
          <div className='absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-pink-500/20 animate-pulse-slow' />
        </div>

        {/* Header is handled by layout */}

        {/* Hero Content with Floating Animation */}
        <div className='relative z-10 text-center text-white px-4 max-w-6xl'>
          <div className='animate-float'>
            {/* Premium badge */}
            <div className='inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-md rounded-full text-sm font-medium mb-8 border border-white/20'>
              <Sparkles className='w-4 h-4 mr-2 text-yellow-300' />
              <span>Curated Luxury Experiences Since 2024</span>
            </div>

            <h1 className='text-5xl sm:text-7xl lg:text-9xl font-bold mb-8 leading-none'>
              <span className='block text-white/90'>Discover</span>
              <span className='block text-gradient bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 bg-clip-text text-transparent animate-gradient-x'>
                Extraordinary
              </span>
              <span className='block text-white/90'>Stays</span>
            </h1>

            <p className='text-xl sm:text-2xl lg:text-3xl mb-12 opacity-90 max-w-4xl mx-auto leading-relaxed font-light'>
              Access exclusive properties and bespoke experiences curated by our luxury travel
              specialists.
              <span className='text-yellow-300 font-medium'>
                {' '}
                Every stay is a story waiting to unfold.
              </span>
            </p>
          </div>

          {/* Revolutionary Search Interface - Portal Slot */}
          <div
            id='search-hero-slot'
            className='animate-slide-up mb-12 relative'
            style={{
              animationDelay: '0.5s',
              minHeight: '64px', // Reserve space to prevent collapse when search bar portals out
            }}
          >
            {/* SearchBar will be portaled here */}
          </div>

          {/* Premium Trust Indicators */}
          <div className='flex flex-col sm:flex-row items-center justify-center gap-8 text-sm font-medium opacity-90'>
            <div className='flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-md rounded-full'>
              <Shield className='w-5 h-5 text-green-300' />
              <span>Verified Properties</span>
            </div>
            <div className='flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-md rounded-full'>
              <Award className='w-5 h-5 text-blue-300' />
              <span>5-Star Service</span>
            </div>
            <div className='flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-md rounded-full'>
              <Clock className='w-5 h-5 text-purple-300' />
              <span>24/7 Concierge</span>
            </div>
          </div>
        </div>

        {/* Carousel Navigation Dots */}
        <div className='absolute bottom-20 left-1/2 transform -translate-x-1/2 flex space-x-3'>
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/75'
              }`}
            />
          ))}
        </div>

        {/* Enhanced Scroll Indicator */}
        <div className='absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white animate-bounce'>
          <div className='flex flex-col items-center space-y-2'>
            <div className='w-6 h-10 border-2 border-white/40 rounded-full flex justify-center'>
              <div className='w-1.5 h-4 bg-white/80 rounded-full mt-2 animate-pulse'></div>
            </div>
            <span className='text-xs font-medium opacity-70'>Scroll to explore</span>
          </div>
        </div>
      </section>

      {/* SearchBar Portal with View Transitions */}
      <SearchBarPortal heroVariant='hero' headerVariant='header' />

      {/* Premium Property Categories */}
      <section className='py-32 px-4 bg-gradient-to-br from-slate-50 via-white to-blue-50'>
        <div className='container-fluid'>
          <div className='text-center mb-20'>
            <div className='inline-flex items-center px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-6'>
              <Star className='w-4 h-4 mr-2 fill-current' />
              Handpicked Categories
            </div>
            <h2 className='text-5xl lg:text-6xl font-bold mb-8 text-balance leading-tight'>
              Choose Your Perfect
              <span className='text-gradient bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent'>
                {' '}
                Experience
              </span>
            </h2>
            <p className='text-gray-600 text-xl lg:text-2xl max-w-3xl mx-auto leading-relaxed'>
              From luxury villas to urban penthouses, each category offers unique experiences
              tailored to your desires
            </p>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8'>
            {categories.map((category, index) => (
              <article
                key={category.title}
                className='group cursor-pointer animate-slide-up'
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className='relative overflow-hidden rounded-3xl bg-white shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 hover:scale-[1.02] backdrop-blur-sm'>
                  <figure className='aspect-[4/3] overflow-hidden relative'>
                    <Image
                      src={category.image}
                      alt={`${category.title} - ${category.subtitle}`}
                      fill
                      className='object-cover transition-transform duration-700 group-hover:scale-110'
                      sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw'
                    />
                    <div className='absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent' />
                  </figure>

                  {/* Category badge */}
                  <div className='absolute top-4 left-4 text-3xl' aria-hidden="true">{category.icon}</div>

                  {/* Content */}
                  <div className='absolute bottom-0 left-0 right-0 p-6 text-white'>
                    <h3 className='text-xl font-bold mb-2 group-hover:text-yellow-300 transition-colors'>
                      {category.title}
                    </h3>
                    <p className='text-sm opacity-90 mb-2'>{category.subtitle}</p>
                    <p className='text-xs opacity-75'>{category.count}</p>
                  </div>

                  {/* Hover arrow */}
                  <div className='absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100' aria-hidden="true">
                    <ArrowRight className='w-5 h-5 text-white' />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Premium Featured Properties */}
      <section className='py-32 px-4 bg-white relative overflow-hidden'>
        {/* Background decorations */}
        <div className='absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-primary/5 to-pink-500/5 rounded-full blur-3xl'></div>
        <div className='absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full blur-3xl'></div>

        <div className='container-fluid relative'>
          <div className='text-center mb-20'>
            <div className='inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary/10 to-pink-500/10 text-primary rounded-full text-sm font-semibold mb-6'>
              <Award className='w-4 h-4 mr-2' />
              Editor's Choice
            </div>
            <h2 className='text-5xl lg:text-6xl font-bold mb-8 text-balance leading-tight'>
              Exceptional Properties
              <span className='text-gradient bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent'>
                {' '}
                Await You
              </span>
            </h2>
            <p className='text-gray-600 text-xl lg:text-2xl max-w-3xl mx-auto leading-relaxed'>
              Individually selected for their unique character and unmatched luxury standards
            </p>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8'>
            {featuredProperties.map((property, index) => (
              <article key={property.id}>
                <Link href={`/property/${property.id}`}>
                  <Card
                    className='group cursor-pointer border-0 overflow-hidden bg-white shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 hover:scale-[1.02] animate-slide-up rounded-2xl backdrop-blur-sm'
                    style={{
                      animationDelay: `${index * 150}ms`,
                    }}
                  >
                    <header className='relative overflow-hidden'>
                      <figure className='aspect-[4/3] relative'>
                        <Image
                          src={property.image}
                          alt={`${property.title} in ${property.location}`}
                          fill
                          className='object-cover transition-transform duration-700 group-hover:scale-110'
                          sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw'
                        />
                      </figure>

                      {/* Enhanced badges */}
                      <div className='absolute top-4 left-4 flex flex-col gap-2'>
                        <div
                          className={`px-3 py-1.5 text-xs font-bold rounded-full shadow-lg ${
                            property.badge === 'Superhost'
                              ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white'
                              : property.badge === 'Rare Find'
                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                                : property.badge === 'Luxury'
                                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
                                  : 'bg-gradient-to-r from-green-400 to-emerald-500 text-white'
                          }`}
                        >
                          {property.badge}
                        </div>
                        {property.discount && (
                          <div className='px-3 py-1.5 bg-red-500 text-white text-xs font-bold rounded-full shadow-lg'>
                            {property.discount}% OFF
                          </div>
                        )}
                      </div>

                      {/* Enhanced favorite button */}
                      <button 
                        className='absolute top-4 right-4 p-3 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white hover:scale-110 transition-all duration-300 shadow-lg'
                        aria-label={`Add ${property.title} to favorites`}
                      >
                        <Heart className='w-5 h-5 text-gray-600 hover:text-red-500 transition-colors' />
                      </button>

                      {/* Premium overlay */}
                      <div className='absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300' />

                      {/* Quick view button */}
                      <div className='absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300'>
                        <Button size='sm' variant='glass' className='font-semibold'>
                          <Play className='w-4 h-4 mr-2' aria-hidden="true" />
                          Quick View
                        </Button>
                      </div>
                    </header>

                    <CardContent className='p-6'>
                      <div className='flex items-start justify-between mb-4'>
                        <h3 className='font-bold text-lg leading-tight flex-1 pr-3 group-hover:text-primary transition-colors'>
                          {property.title}
                        </h3>
                        <div className='flex items-center space-x-1 bg-gradient-to-r from-yellow-50 to-orange-50 px-3 py-1.5 rounded-full border border-yellow-200'>
                          <Star className='w-4 h-4 fill-yellow-400 text-yellow-400' aria-hidden="true" />
                          <span className='text-sm font-bold text-gray-900'>{property.rating}</span>
                        </div>
                      </div>

                      <address className='text-gray-600 text-sm mb-4 flex items-center not-italic'>
                        <MapPin className='w-4 h-4 mr-2 text-primary' aria-hidden="true" />
                        {property.location}
                      </address>

                      <ul className='grid grid-cols-2 gap-2 mb-6'>
                        {property.amenities.slice(0, 4).map(amenity => (
                          <li key={amenity}>
                            <span className='text-xs px-2 py-1 bg-gray-50 text-gray-700 rounded-lg font-medium text-center block'>
                              {amenity}
                            </span>
                          </li>
                        ))}
                      </ul>

                      <footer className='flex items-center justify-between pt-4 border-t border-gray-100'>
                        <div className='flex items-center space-x-2'>
                          <div className='flex items-baseline'>
                            <span className='text-2xl font-bold text-gray-900'>
                              ${property.price}
                            </span>
                            <span className='text-gray-600 text-sm'>/night</span>
                          </div>
                          {property.originalPrice && (
                            <span className='text-sm text-gray-400 line-through'>
                              ${property.originalPrice}
                            </span>
                          )}
                        </div>
                        <div className='flex items-center text-sm text-gray-500'>
                          <span className='font-medium'>{property.reviews} reviews</span>
                        </div>
                      </footer>
                    </CardContent>
                  </Card>
                </Link>
              </article>
            ))}
          </div>

          <div className='text-center mt-20'>
            <Link href='/search'>
              <Button
                size='xl'
                variant='gradient'
                className='px-16 py-4 text-lg font-bold shadow-2xl hover:shadow-3xl'
              >
                Explore All Luxury Properties
                <ArrowRight className='w-6 h-6 ml-3' />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Premium Destinations */}
      <section className='py-32 px-4 bg-gradient-to-br from-gray-50 via-white to-slate-50'>
        <div className='container mx-auto'>
          <div className='text-center mb-20'>
            <div className='inline-flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-sm font-semibold mb-6'>
              <MapPin className='w-4 h-4 mr-2' />
              Curated Destinations
            </div>
            <h2 className='text-5xl lg:text-6xl font-bold mb-8 text-balance leading-tight'>
              World-Class
              <span className='text-gradient bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
                {' '}
                Destinations
              </span>
            </h2>
            <p className='text-gray-600 text-xl lg:text-2xl max-w-3xl mx-auto leading-relaxed'>
              Immerse yourself in the world's most desirable locations, each offering unique luxury
              experiences
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
            {destinations.map((destination, index) => (
              <article
                key={destination.name}
                className='group cursor-pointer animate-slide-up'
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className='relative overflow-hidden rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2'>
                  <figure className='aspect-[3/4] relative'>
                    <Image
                      src={destination.image}
                      alt={`${destination.name}, ${destination.country} - ${destination.specialty}`}
                      fill
                      className='object-cover transition-transform duration-700 group-hover:scale-110'
                      sizes='(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw'
                    />
                  </figure>

                  <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent' />

                  {/* Content */}
                  <div className='absolute bottom-0 left-0 right-0 p-6 text-white'>
                    <header className='mb-2'>
                      <h3 className='text-2xl font-bold mb-1 group-hover:text-yellow-300 transition-colors'>
                        {destination.name}
                      </h3>
                      <p className='text-sm opacity-90'>{destination.country}</p>
                    </header>

                    <footer className='flex items-center justify-between'>
                      <div>
                        <p className='text-xs opacity-75 mb-1'>{destination.specialty}</p>
                        <p className='text-sm font-semibold'>
                          {destination.properties.toLocaleString()} properties
                        </p>
                      </div>
                      <div className='w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100' aria-hidden="true">
                        <ChevronRight className='w-5 h-5 text-white' />
                      </div>
                    </footer>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Premium Experience Section */}
      <section className='py-32 px-4 bg-gradient-to-br from-slate-900 via-gray-900 to-black text-white relative overflow-hidden'>
        {/* Animated background elements */}
        <div className='absolute inset-0'>
          <div className='absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse-slow'></div>
          <div
            className='absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse-slow'
            style={{ animationDelay: '2s' }}
          ></div>
        </div>

        <div className='container mx-auto relative'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-20 items-center'>
            <div className='animate-slide-up'>
              <div className='inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-md rounded-full text-sm font-medium mb-8 border border-white/20'>
                <Sparkles className='w-4 h-4 mr-2 text-yellow-300' />
                <span>Trusted by Over 2 Million Travelers</span>
              </div>

              <h2 className='text-5xl lg:text-6xl font-bold mb-8 leading-tight'>
                Redefining Luxury
                <span className='text-gradient bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent block'>
                  Travel Experiences
                </span>
              </h2>

              <p className='text-gray-300 text-xl lg:text-2xl mb-12 leading-relaxed'>
                We don't just offer accommodations – we craft extraordinary journeys. Every property
                in our collection is personally vetted for exceptional quality, unique character,
                and unforgettable experiences.
              </p>

              <div className='grid grid-cols-2 gap-8 mb-12'>
                {[
                  {
                    value: '2M+',
                    label: 'Happy Travelers',
                    icon: '🌟',
                  },
                  {
                    value: '15K+',
                    label: 'Luxury Properties',
                    icon: '🏖️',
                  },
                  {
                    value: '95%',
                    label: '5-Star Reviews',
                    icon: '⭐',
                  },
                  {
                    value: '24/7',
                    label: 'Concierge Service',
                    icon: '🎯',
                  },
                ].map((stat, index) => (
                  <div
                    key={stat.label}
                    className='text-center group'
                    style={{
                      animationDelay: `${index * 200}ms`,
                    }}
                  >
                    <div className='text-4xl mb-3'>{stat.icon}</div>
                    <div className='text-4xl lg:text-5xl font-bold mb-2 text-white group-hover:text-yellow-300 transition-colors'>
                      {stat.value}
                    </div>
                    <div className='text-gray-400 font-medium'>{stat.label}</div>
                  </div>
                ))}
              </div>

              <div className='flex flex-col sm:flex-row gap-4'>
                <Link href='/search'>
                  <Button size='xl' variant='gradient' className='px-8 py-4 text-lg font-bold'>
                    Begin Your Journey
                    <ArrowRight className='w-6 h-6 ml-3' />
                  </Button>
                </Link>
                <Button
                  size='xl'
                  variant='outline'
                  className='px-8 py-4 text-lg font-bold border-white/30 text-white hover:bg-white hover:text-gray-900'
                >
                  Watch Our Story
                  <Play className='w-5 h-5 ml-3' />
                </Button>
              </div>
            </div>

            <div className='relative animate-slide-up lg:animate-slide-up-right'>
              <div className='relative'>
                {/* Decorative elements */}
                <div className='absolute -top-12 -left-12 w-40 h-40 bg-primary/20 rounded-full blur-3xl animate-float'></div>
                <div
                  className='absolute -bottom-12 -right-12 w-48 h-48 bg-pink-400/20 rounded-full blur-3xl animate-float'
                  style={{ animationDelay: '1s' }}
                ></div>

                {/* Main showcase image */}
                <div className='relative rounded-3xl overflow-hidden shadow-2xl'>
                  <div className='relative w-full aspect-[7/5]'>
                    <Image
                      src='https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=700&h=500&fit=crop'
                      alt='Luxury experience showcase'
                      fill
                      className='object-cover hover:scale-105 transition-transform duration-700'
                      sizes='(max-width: 1024px) 100vw, 50vw'
                    />
                  </div>
                  <div className='absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent' />
                </div>

                {/* Floating testimonial card */}
                <aside className='absolute -bottom-8 -left-8 bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-2xl animate-float max-w-sm'>
                  <figure>
                    <header className='flex items-center mb-4'>
                      <div className='relative w-12 h-12 rounded-full mr-4 overflow-hidden'>
                        <Image
                          src='https://images.unsplash.com/photo-1494790108755-2616b612b786?w=80&h=80&fit=crop'
                          alt='Sarah Chen, verified guest'
                          fill
                          className='object-cover'
                          sizes='48px'
                        />
                      </div>
                      <div>
                        <div className='font-bold text-gray-900'>Sarah Chen</div>
                        <div className='text-sm text-gray-600'>Verified Guest</div>
                      </div>
                    </header>
                    <div className='flex mb-3' role="img" aria-label="5 out of 5 stars">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className='w-4 h-4 fill-yellow-400 text-yellow-400' aria-hidden="true" />
                      ))}
                    </div>
                    <blockquote className='text-gray-800 text-sm italic'>
                      "Absolutely extraordinary! Every detail was perfect, from the stunning property
                      to the personalized service."
                    </blockquote>
                  </figure>
                </aside>

                {/* Floating amenity badges */}
                <div
                  className='absolute -top-6 -right-6 bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-xl animate-float'
                  style={{ animationDelay: '0.5s' }}
                >
                  <div className='text-center'>
                    <div className='w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2'>
                      <Shield className='w-5 h-5 text-green-600' />
                    </div>
                    <div className='text-xs font-bold text-gray-900'>100% Verified</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}