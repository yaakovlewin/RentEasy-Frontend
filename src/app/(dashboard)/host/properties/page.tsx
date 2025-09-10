/**
 * @fileoverview Enterprise Host Properties Page with SEO Optimization
 * 
 * SERVER COMPONENT with Dynamic Metadata Generation
 * 
 * SEO-optimized host properties management page with comprehensive metadata.
 */

import type { Metadata } from 'next';
import HostPropertiesClient from './HostPropertiesClient';
import { generateDashboardMetadata } from '@/lib/metadata';

/**
 * Generate dynamic metadata for host properties page
 * Critical for SEO optimization and user experience
 */
export async function generateMetadata(): Promise<Metadata> {
  try {
    const metadata = await generateDashboardMetadata('host');
    return {
      ...metadata,
      title: 'Manage Properties - Host Dashboard | RentEasy',
      description: 'Manage your vacation rental properties, update listings, and track performance on your RentEasy host properties page.',
    };
  } catch (error) {
    console.error('Error generating host properties metadata:', error);
    
    return {
      title: 'Manage Properties - Host Dashboard | RentEasy',
      description: 'Manage your vacation rental properties, update listings, and track performance on your RentEasy host properties page.',
      robots: {
        index: false,
        follow: false,
      },
    };
  }
}

/**
 * HostPropertiesPage - Enterprise Server Component with SEO Optimization
 */
export default async function HostPropertiesPage() {
  return <HostPropertiesClient />;
}

import { useEffect, useState } from 'react';

import Link from 'next/link';

import {
  Filter,
  Grid3X3,
  List,
  Plus,
  Search,
} from 'lucide-react';

import { propertiesAPI, Property } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

import { RoleProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { ErrorDisplay } from '@/components/ui/ErrorDisplay';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { PropertyCard } from '@/components/ui/property-card';

import { useAsyncOperation } from '@/hooks/useAsyncOperation';

type ViewMode = 'grid' | 'list';
type FilterStatus = 'all' | 'active' | 'inactive' | 'pending';

export default function PropertiesManagement() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);

  const { loading: isLoading, error, execute: executeLoad } = useAsyncOperation<Property[]>();

  const { loading: isDeleting, execute: executeDelete } = useAsyncOperation();

  // Load user properties
  useEffect(() => {
    const loadProperties = async () => {
      const result = await executeLoad(async () => {
        const response = await propertiesAPI.getUserProperties();
        return response;
      });

      if (result) {
        setProperties(result);
        setFilteredProperties(result);
      }
    };

    loadProperties();
  }, [executeLoad]);

  // Filter properties based on search and status
  useEffect(() => {
    let filtered = properties;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        property =>
          property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          property.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(property => {
        switch (statusFilter) {
          case 'active':
            return property.isActive;
          case 'inactive':
            return !property.isActive;
          case 'pending':
            return false; // Would be based on property approval status
          default:
            return true;
        }
      });
    }

    setFilteredProperties(filtered);
  }, [properties, searchTerm, statusFilter]);

  const handleSelectProperty = (propertyId: string) => {
    setSelectedProperties(prev =>
      prev.includes(propertyId) ? prev.filter(id => id !== propertyId) : [...prev, propertyId]
    );
  };

  const handleSelectAll = () => {
    if (selectedProperties.length === filteredProperties.length) {
      setSelectedProperties([]);
    } else {
      setSelectedProperties(filteredProperties.map(p => p.id));
    }
  };

  const handleDeleteProperty = async (propertyId: string) => {
    if (!confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      return;
    }

    const result = await executeDelete(async () => {
      await propertiesAPI.delete(propertyId);
    });

    if (result !== null) {
      setProperties(prev => prev.filter(p => p.id !== propertyId));
      setSelectedProperties(prev => prev.filter(id => id !== propertyId));
    }
  };

  const ManagementPropertyCard = ({ property }: { property: Property }) => {
    // Transform property data to match PropertyCard interface
    const transformedProperty = {
      ...property,
      id: property.id.toString(),
      price: property.pricePerNight,
      priceUnit: 'night' as const,
      guests: property.maxGuests,
      images: property.images || [],
      status: property.isActive ? 'available' : 'unavailable',
    };

    return (
      <PropertyCard
        property={transformedProperty}
        variant="management"
        size="md"
        features={{
          selection: true,
          management: true,
          badges: true,
          details: true,
          favorites: false,
          quickActions: false,
        }}
        selection={{
          selected: selectedProperties.includes(property.id),
        }}
        loading={{
          deleteLoading: isDeleting,
        }}
        actions={{
          onSelect: (_, selected) => handleSelectProperty(property.id),
          onView: () => window.open(`/property/${property.id}`, '_blank'),
          onEdit: () => window.location.href = `/host/properties/${property.id}/edit`,
          onDelete: () => handleDeleteProperty(property.id),
        }}
        className="hover:shadow-lg transition-all duration-200"
      />
    );
  };

  const ManagementPropertyListItem = ({ property }: { property: Property }) => {
    // Transform property data to match PropertyCard interface
    const transformedProperty = {
      ...property,
      id: property.id.toString(),
      price: property.pricePerNight,
      priceUnit: 'night' as const,
      guests: property.maxGuests,
      images: property.images || [],
      status: property.isActive ? 'available' : 'unavailable',
    };

    return (
      <div className="mb-4">
        <PropertyCard
          property={transformedProperty}
          variant="list"
          size="lg"
          features={{
            selection: true,
            management: true,
            badges: true,
            details: true,
            favorites: false,
            quickActions: false,
          }}
          selection={{
            selected: selectedProperties.includes(property.id),
          }}
          loading={{
            deleteLoading: isDeleting,
          }}
          actions={{
            onSelect: (_, selected) => handleSelectProperty(property.id),
            onView: () => window.open(`/property/${property.id}`, '_blank'),
            onEdit: () => window.location.href = `/host/properties/${property.id}/edit`,
            onDelete: () => handleDeleteProperty(property.id),
          }}
        />
      </div>
    );
  };

  return (
    <RoleProtectedRoute allowedRoles={['owner', 'admin']}>
      <div className='min-h-screen bg-gray-50'>
        <div className='bg-white border-b'>
          <div className='container mx-auto px-4 py-6'>
            <div className='flex items-center justify-between'>
              <div>
                <h1 className='text-3xl font-bold text-gray-900'>Your Properties</h1>
                <p className='text-gray-600 mt-1'>Manage and monitor your rental listings</p>
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
          {/* Filters and Controls */}
          <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 space-y-4 lg:space-y-0'>
            <div className='flex items-center space-x-4'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
                <Input
                  placeholder='Search properties...'
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className='pl-10 w-64'
                />
              </div>

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as FilterStatus)}
                className='px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent'
              >
                <option value='all'>All Properties</option>
                <option value='active'>Active</option>
                <option value='inactive'>Inactive</option>
                <option value='pending'>Pending Approval</option>
              </select>
            </div>

            <div className='flex items-center space-x-2'>
              {selectedProperties.length > 0 && (
                <span className='text-sm text-gray-600'>{selectedProperties.length} selected</span>
              )}

              <Button
                variant='outline'
                size='sm'
                onClick={() => setViewMode('grid')}
                className={viewMode === 'grid' ? 'bg-gray-100' : ''}
              >
                <Grid3X3 className='w-4 h-4' />
              </Button>

              <Button
                variant='outline'
                size='sm'
                onClick={() => setViewMode('list')}
                className={viewMode === 'list' ? 'bg-gray-100' : ''}
              >
                <List className='w-4 h-4' />
              </Button>
            </div>
          </div>

          {/* Properties Display */}
          {isLoading && (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {[...Array(6)].map((_, i) => (
                <div key={i} className='space-y-4'>
                  <div className='w-full h-48 bg-gray-200 rounded-lg animate-pulse' />
                  <div className='space-y-2'>
                    <div className='h-4 bg-gray-200 rounded animate-pulse' />
                    <div className='h-3 bg-gray-200 rounded animate-pulse w-2/3' />
                  </div>
                </div>
              ))}
            </div>
          )}

          {error && <ErrorDisplay error={new Error(error)} />}

          {!isLoading && filteredProperties.length === 0 && !error && (
            <div className='text-center py-12'>
              <div className='max-w-md mx-auto'>
                <div className='bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center'>
                  <Plus className='w-12 h-12 text-gray-400' />
                </div>
                <h3 className='text-xl font-medium text-gray-900 mb-2'>
                  {searchTerm || statusFilter !== 'all'
                    ? 'No properties match your filters'
                    : 'No properties yet'}
                </h3>
                <p className='text-gray-600 mb-6'>
                  {searchTerm || statusFilter !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Start earning by listing your first property on RentEasy'}
                </p>
                <Link href='/host/properties/new'>
                  <Button>
                    <Plus className='w-4 h-4 mr-2' />
                    Add Your First Property
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {!isLoading && filteredProperties.length > 0 && (
            <>
              {/* Bulk Actions */}
              {selectedProperties.length > 0 && (
                <div className='mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg'>
                  <div className='flex items-center justify-between'>
                    <span className='text-blue-800'>
                      {selectedProperties.length} properties selected
                    </span>
                    <div className='flex items-center space-x-2'>
                      <Button variant='outline' size='sm'>
                        Bulk Edit
                      </Button>
                      <Button variant='outline' size='sm'>
                        Export
                      </Button>
                      <Button variant='outline' size='sm' onClick={() => setSelectedProperties([])}>
                        Clear Selection
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {viewMode === 'grid' ? (
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                  {filteredProperties.map(property => (
                    <ManagementPropertyCard key={property.id} property={property} />
                  ))}
                </div>
              ) : (
                <div>
                  {filteredProperties.map(property => (
                    <ManagementPropertyListItem key={property.id} property={property} />
                  ))}
                </div>
              )}

              {/* Results Summary */}
              <div className='mt-8 text-center text-gray-600'>
                <p>
                  Showing {filteredProperties.length} of {properties.length} properties
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </RoleProtectedRoute>
  );
}
