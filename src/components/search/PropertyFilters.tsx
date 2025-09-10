'use client';

import {
  Bath,
  Bed,
  Building,
  Car,
  Coffee,
  Home,
  TreePine,
  Users,
  Waves,
  Wifi,
  X,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';

interface FilterState {
  priceRange: [number, number];
  propertyTypes: string[];
  amenities: string[];
  rooms: {
    bedrooms: number;
    bathrooms: number;
  };
  instantBook: boolean;
  rating: number;
}

interface PropertyFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
}

const propertyTypes = [
  { id: 'entire-place', label: 'Entire place', icon: Home },
  { id: 'private-room', label: 'Private room', icon: Bed },
  { id: 'shared-room', label: 'Shared room', icon: Users },
];

const amenityOptions = [
  { id: 'wifi', label: 'Wifi', icon: Wifi },
  { id: 'parking', label: 'Free parking', icon: Car },
  { id: 'kitchen', label: 'Kitchen', icon: Coffee },
  // { id: "pool", label: "Pool", icon: Pool },
  { id: 'hot-tub', label: 'Hot tub', icon: Bath },
  { id: 'ac', label: 'Air conditioning', icon: Building },
  { id: 'fireplace', label: 'Fireplace', icon: TreePine },
  { id: 'beachfront', label: 'Beachfront', icon: Waves },
];

export function PropertyFilters({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  onApplyFilters,
  onClearFilters,
}: PropertyFiltersProps) {
  if (!isOpen) return null;

  const updateFilters = (updates: Partial<FilterState>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const togglePropertyType = (typeId: string) => {
    const newTypes = filters.propertyTypes.includes(typeId)
      ? filters.propertyTypes.filter(t => t !== typeId)
      : [...filters.propertyTypes, typeId];
    updateFilters({ propertyTypes: newTypes });
  };

  const toggleAmenity = (amenityId: string) => {
    const newAmenities = filters.amenities.includes(amenityId)
      ? filters.amenities.filter(a => a !== amenityId)
      : [...filters.amenities, amenityId];
    updateFilters({ amenities: newAmenities });
  };

  return (
    <div className='fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4'>
      <Card className='w-full max-w-4xl max-h-[90vh] overflow-y-auto'>
        <CardHeader className='flex flex-row items-center justify-between border-b sticky top-0 bg-white z-10'>
          <CardTitle className='text-xl font-semibold'>Filters</CardTitle>
          <Button variant='ghost' size='sm' onClick={onClose}>
            <X className='w-5 h-5' />
          </Button>
        </CardHeader>

        <CardContent className='p-6 space-y-8'>
          {/* Price Range */}
          <div>
            <h3 className='text-lg font-semibold mb-4'>Price per night</h3>
            <div className='px-4'>
              <Slider
                value={filters.priceRange}
                onValueChange={value =>
                  updateFilters({
                    priceRange: value as [number, number],
                  })
                }
                max={1000}
                min={0}
                step={25}
                className='mb-4'
              />
              <div className='flex items-center justify-between text-sm text-gray-600'>
                <span>${filters.priceRange[0]}</span>
                <span>${filters.priceRange[1]}+</span>
              </div>
            </div>
          </div>

          {/* Property Type */}
          <div>
            <h3 className='text-lg font-semibold mb-4'>Property type</h3>
            <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
              {propertyTypes.map(type => {
                const Icon = type.icon;
                const isSelected = filters.propertyTypes.includes(type.id);
                return (
                  <button
                    key={type.id}
                    onClick={() => togglePropertyType(type.id)}
                    className={`p-4 border rounded-lg text-left transition-colors hover:border-primary ${
                      isSelected ? 'border-primary bg-primary/5' : 'border-gray-200'
                    }`}
                  >
                    <Icon
                      className={`w-6 h-6 mb-2 ${isSelected ? 'text-primary' : 'text-gray-600'}`}
                    />
                    <div className={`font-medium ${isSelected ? 'text-primary' : 'text-gray-900'}`}>
                      {type.label}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Rooms and Beds */}
          <div>
            <h3 className='text-lg font-semibold mb-4'>Rooms and beds</h3>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
              <div>
                <label className='block text-sm font-medium mb-2'>Bedrooms</label>
                <div className='flex items-center space-x-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() =>
                      updateFilters({
                        rooms: {
                          ...filters.rooms,
                          bedrooms: Math.max(0, filters.rooms.bedrooms - 1),
                        },
                      })
                    }
                    disabled={filters.rooms.bedrooms === 0}
                  >
                    -
                  </Button>
                  <span className='w-12 text-center font-medium'>
                    {filters.rooms.bedrooms || 'Any'}
                  </span>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() =>
                      updateFilters({
                        rooms: {
                          ...filters.rooms,
                          bedrooms: filters.rooms.bedrooms + 1,
                        },
                      })
                    }
                  >
                    +
                  </Button>
                </div>
              </div>
              <div>
                <label className='block text-sm font-medium mb-2'>Bathrooms</label>
                <div className='flex items-center space-x-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() =>
                      updateFilters({
                        rooms: {
                          ...filters.rooms,
                          bathrooms: Math.max(0, filters.rooms.bathrooms - 1),
                        },
                      })
                    }
                    disabled={filters.rooms.bathrooms === 0}
                  >
                    -
                  </Button>
                  <span className='w-12 text-center font-medium'>
                    {filters.rooms.bathrooms || 'Any'}
                  </span>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() =>
                      updateFilters({
                        rooms: {
                          ...filters.rooms,
                          bathrooms: filters.rooms.bathrooms + 1,
                        },
                      })
                    }
                  >
                    +
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div>
            <h3 className='text-lg font-semibold mb-4'>Amenities</h3>
            <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
              {amenityOptions.map(amenity => {
                const Icon = amenity.icon;
                const isSelected = filters.amenities.includes(amenity.id);
                return (
                  <button
                    key={amenity.id}
                    onClick={() => toggleAmenity(amenity.id)}
                    className={`p-4 border rounded-lg text-left transition-colors hover:border-primary ${
                      isSelected ? 'border-primary bg-primary/5' : 'border-gray-200'
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 mb-2 ${isSelected ? 'text-primary' : 'text-gray-600'}`}
                    />
                    <div
                      className={`text-sm font-medium ${
                        isSelected ? 'text-primary' : 'text-gray-900'
                      }`}
                    >
                      {amenity.label}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Guest Rating */}
          <div>
            <h3 className='text-lg font-semibold mb-4'>Guest rating</h3>
            <div className='px-4'>
              <Slider
                value={[filters.rating]}
                onValueChange={value => updateFilters({ rating: value[0] })}
                max={5}
                min={0}
                step={0.1}
                className='mb-4'
              />
              <div className='flex items-center justify-between text-sm text-gray-600'>
                <span>Any rating</span>
                <span>{filters.rating.toFixed(1)}+ stars</span>
              </div>
            </div>
          </div>

          {/* Instant Book */}
          <div className='flex items-center space-x-3'>
            <Checkbox
              id='instant-book'
              checked={filters.instantBook}
              onCheckedChange={checked => updateFilters({ instantBook: !!checked })}
            />
            <label htmlFor='instant-book' className='text-sm font-medium cursor-pointer'>
              Instant Book - Book without waiting for host approval
            </label>
          </div>
        </CardContent>

        {/* Footer */}
        <div className='border-t p-6 flex items-center justify-between sticky bottom-0 bg-white'>
          <Button variant='ghost' onClick={onClearFilters}>
            Clear all
          </Button>
          <div className='flex items-center space-x-4'>
            <Button variant='outline' onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={onApplyFilters}>Show results</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
