'use client';

import { useEffect, useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import {
  Edit,
  Eye,
  Grid,
  Home,
  List,
  MapPin,
  MoreVertical,
  Plus,
  Search,
  Star,
  Trash2,
  TrendingUp,
} from 'lucide-react';

import { Property, propertiesAPI } from '@/lib/api';
import { formatCurrency, cn } from '@/lib/utils';

import { RoleProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorDisplay } from '@/components/ui/ErrorDisplay';
import { LoadingCard } from '@/components/ui/LoadingSpinner';
import { Input } from '@/components/ui/input';

import { useAsyncOperation } from '@/hooks/useAsyncOperation';

type ViewMode = 'grid' | 'list';

export default function HostPropertiesClient() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [selectedProperties, setSelectedProperties] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const {
    loading: isLoadingProperties,
    error: propertiesError,
    execute: executePropertiesLoad,
  } = useAsyncOperation<Property[]>();

  const {
    loading: isDeletingProperty,
    error: deleteError,
    execute: executePropertyDelete,
  } = useAsyncOperation<{ message: string }>();

  useEffect(() => {
    loadProperties();
  }, []);

  useEffect(() => {
    applySearch();
  }, [properties, searchQuery]);

  const loadProperties = async () => {
    const result = await executePropertiesLoad(async () => {
      return await propertiesAPI.getUserProperties();
    });

    if (result) {
      setProperties(result);
    }
  };

  const applySearch = () => {
    if (!searchQuery) {
      setFilteredProperties(properties);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = properties.filter(
      property =>
        property.title.toLowerCase().includes(query) ||
        property.location.toLowerCase().includes(query) ||
        property.description?.toLowerCase().includes(query)
    );

    setFilteredProperties(filtered);
  };

  const handleDeleteProperty = async (propertyId: string) => {
    if (!confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      return;
    }

    const result = await executePropertyDelete(async () => {
      return await propertiesAPI.delete(propertyId);
    });

    if (result) {
      await loadProperties();
      setSelectedProperties(prev => {
        const next = new Set(prev);
        next.delete(propertyId);
        return next;
      });
    }
  };

  const handleToggleSelect = (propertyId: string) => {
    setSelectedProperties(prev => {
      const next = new Set(prev);
      if (next.has(propertyId)) {
        next.delete(propertyId);
      } else {
        next.add(propertyId);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedProperties.size === filteredProperties.length) {
      setSelectedProperties(new Set());
    } else {
      setSelectedProperties(new Set(filteredProperties.map(p => p.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProperties.size === 0) return;

    if (
      !confirm(
        `Are you sure you want to delete ${selectedProperties.size} propert${selectedProperties.size === 1 ? 'y' : 'ies'}? This action cannot be undone.`
      )
    ) {
      return;
    }

    for (const propertyId of selectedProperties) {
      await executePropertyDelete(async () => {
        return await propertiesAPI.delete(propertyId);
      });
    }

    await loadProperties();
    setSelectedProperties(new Set());
  };

  const PropertyGridCard = ({ property }: { property: Property }) => (
    <Card className='overflow-hidden hover:shadow-lg transition-shadow'>
      <div className='relative h-48 bg-gray-200'>
        <Image
          src={
            property.images?.[0] ||
            'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&h=300&fit=crop'
          }
          alt={property.title}
          fill
          className='object-cover'
          sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
        />
        <div className='absolute top-3 right-3 flex items-center space-x-2'>
          <input
            type='checkbox'
            checked={selectedProperties.has(property.id)}
            onChange={() => handleToggleSelect(property.id)}
            className='w-5 h-5 rounded border-gray-300 cursor-pointer'
          />
          {!property.isActive && (
            <span className='bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium'>
              Inactive
            </span>
          )}
        </div>
      </div>

      <CardContent className='p-4'>
        <div className='mb-3'>
          <h3 className='text-lg font-semibold text-gray-900 mb-1 line-clamp-1'>{property.title}</h3>
          <div className='flex items-center space-x-2 text-sm text-gray-600'>
            <MapPin className='w-3 h-3' />
            <span className='line-clamp-1'>{property.location}</span>
          </div>
        </div>

        <div className='flex items-center justify-between mb-4 text-sm text-gray-600'>
          <span>{property.bedrooms} bed</span>
          <span>{property.bathrooms} bath</span>
          <span>{property.maxGuests} guests</span>
        </div>

        <div className='flex items-center justify-between pt-3 border-t border-gray-200'>
          <div>
            <p className='text-xs text-gray-500'>Price per night</p>
            <p className='text-lg font-bold text-gray-900'>{formatCurrency(property.pricePerNight)}</p>
          </div>

          <div className='flex items-center space-x-1'>
            <Link href={`/property/${property.id}`}>
              <Button variant='outline' size='sm'>
                <Eye className='w-4 h-4' />
              </Button>
            </Link>
            <Link href={`/host/properties/${property.id}/edit`}>
              <Button variant='outline' size='sm'>
                <Edit className='w-4 h-4' />
              </Button>
            </Link>
            <Button
              variant='outline'
              size='sm'
              onClick={() => handleDeleteProperty(property.id)}
              disabled={isDeletingProperty}
            >
              <Trash2 className='w-4 h-4' />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const PropertyListItem = ({ property }: { property: Property }) => (
    <div className='border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow'>
      <div className='flex items-start space-x-4'>
        <div className='flex items-center'>
          <input
            type='checkbox'
            checked={selectedProperties.has(property.id)}
            onChange={() => handleToggleSelect(property.id)}
            className='w-5 h-5 rounded border-gray-300 cursor-pointer mr-4'
          />
          <div className='w-32 h-32 relative flex-shrink-0'>
            <Image
              src={
                property.images?.[0] ||
                'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=300&h=300&fit=crop'
              }
              alt={property.title}
              fill
              className='rounded-lg object-cover'
              sizes='128px'
            />
          </div>
        </div>

        <div className='flex-1 min-w-0'>
          <div className='flex items-start justify-between mb-2'>
            <div>
              <h3 className='text-xl font-semibold text-gray-900 mb-1'>{property.title}</h3>
              <div className='flex items-center space-x-4 text-sm text-gray-600'>
                <span className='flex items-center'>
                  <MapPin className='w-3 h-3 mr-1' />
                  {property.location}
                </span>
                <span>{property.bedrooms} bed</span>
                <span>{property.bathrooms} bath</span>
                <span>{property.maxGuests} guests</span>
              </div>
            </div>
            {!property.isActive && (
              <span className='bg-red-500 text-white text-xs px-3 py-1 rounded-full font-medium'>
                Inactive
              </span>
            )}
          </div>

          <p className='text-sm text-gray-600 mb-4 line-clamp-2'>{property.description}</p>

          <div className='flex items-center justify-between pt-4 border-t border-gray-200'>
            <div>
              <p className='text-sm text-gray-600'>Price per night</p>
              <p className='text-2xl font-bold text-gray-900'>{formatCurrency(property.pricePerNight)}</p>
            </div>

            <div className='flex items-center space-x-2'>
              <Link href={`/property/${property.id}`}>
                <Button variant='outline' size='sm'>
                  <Eye className='w-4 h-4 mr-1' />
                  View
                </Button>
              </Link>
              <Link href={`/host/properties/${property.id}/edit`}>
                <Button variant='outline' size='sm'>
                  <Edit className='w-4 h-4 mr-1' />
                  Edit
                </Button>
              </Link>
              <Button
                variant='outline'
                size='sm'
                onClick={() => handleDeleteProperty(property.id)}
                disabled={isDeletingProperty}
              >
                <Trash2 className='w-4 h-4 mr-1' />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <RoleProtectedRoute allowedRoles={['owner', 'admin']}>
      <div className='min-h-screen bg-gray-50'>
        <div className='bg-white border-b'>
          <div className='container mx-auto px-4 py-6'>
            <div className='flex items-center justify-between'>
              <div>
                <h1 className='text-3xl font-bold text-gray-900'>My Properties</h1>
                <p className='text-gray-600 mt-1'>Manage your vacation rental properties</p>
              </div>
              <Link href='/host/properties/new'>
                <Button>
                  <Plus className='w-4 h-4 mr-2' />
                  Add Property
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className='container mx-auto px-4 py-8'>
          <Card className='mb-6'>
            <CardContent className='p-6'>
              <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0'>
                <div className='relative flex-1 max-w-md'>
                  <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
                  <Input
                    type='text'
                    placeholder='Search properties...'
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className='pl-10'
                  />
                </div>

                <div className='flex items-center space-x-3'>
                  {selectedProperties.size > 0 && (
                    <>
                      <span className='text-sm text-gray-600'>
                        {selectedProperties.size} selected
                      </span>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={handleBulkDelete}
                        disabled={isDeletingProperty}
                      >
                        <Trash2 className='w-4 h-4 mr-1' />
                        Delete Selected
                      </Button>
                      <div className='h-4 w-px bg-gray-300' />
                    </>
                  )}

                  <Button
                    variant='outline'
                    size='sm'
                    onClick={handleSelectAll}
                    disabled={filteredProperties.length === 0}
                  >
                    {selectedProperties.size === filteredProperties.length ? 'Deselect All' : 'Select All'}
                  </Button>

                  <div className='flex items-center border border-gray-300 rounded-md'>
                    <button
                      onClick={() => setViewMode('grid')}
                      className={cn(
                        'p-2 rounded-l-md transition-colors',
                        viewMode === 'grid' ? 'bg-primary text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                      )}
                    >
                      <Grid className='w-4 h-4' />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={cn(
                        'p-2 rounded-r-md transition-colors',
                        viewMode === 'list' ? 'bg-primary text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                      )}
                    >
                      <List className='w-4 h-4' />
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {deleteError && (
            <div className='mb-6'>
              <ErrorDisplay error={new Error(deleteError)} variant='banner' />
            </div>
          )}

          {isLoadingProperties && (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
              {[...Array(6)].map((_, i) => (
                <LoadingCard key={i} variant='property' />
              ))}
            </div>
          )}

          {propertiesError && (
            <ErrorDisplay error={new Error(propertiesError)} onRetry={loadProperties} />
          )}

          {!isLoadingProperties && filteredProperties.length === 0 && properties.length === 0 && (
            <Card>
              <CardContent className='p-12'>
                <div className='text-center'>
                  <Home className='w-16 h-16 text-gray-400 mx-auto mb-4' />
                  <h3 className='text-xl font-semibold text-gray-900 mb-2'>No properties yet</h3>
                  <p className='text-gray-600 mb-6'>
                    Start hosting by adding your first property
                  </p>
                  <Link href='/host/properties/new'>
                    <Button size='lg'>
                      <Plus className='w-5 h-5 mr-2' />
                      Add Your First Property
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {!isLoadingProperties && filteredProperties.length === 0 && properties.length > 0 && (
            <Card>
              <CardContent className='p-12'>
                <div className='text-center'>
                  <Search className='w-16 h-16 text-gray-400 mx-auto mb-4' />
                  <h3 className='text-xl font-semibold text-gray-900 mb-2'>No properties found</h3>
                  <p className='text-gray-600 mb-6'>
                    Try adjusting your search query
                  </p>
                  <Button variant='outline' onClick={() => setSearchQuery('')}>
                    Clear Search
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {!isLoadingProperties && filteredProperties.length > 0 && (
            <>
              {viewMode === 'grid' ? (
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                  {filteredProperties.map(property => (
                    <PropertyGridCard key={property.id} property={property} />
                  ))}
                </div>
              ) : (
                <div className='space-y-4'>
                  {filteredProperties.map(property => (
                    <PropertyListItem key={property.id} property={property} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </RoleProtectedRoute>
  );
}
