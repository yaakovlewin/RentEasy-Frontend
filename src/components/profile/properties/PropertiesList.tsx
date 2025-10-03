'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { propertiesAPI, type Property } from '@/lib/api';
import { useAsyncOperation } from '@/hooks/useAsyncOperation';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import {
  Home,
  MapPin,
  Eye,
  Edit,
  Trash2,
  Loader2,
  AlertCircle,
  PlusCircle,
  BedDouble,
  Users
} from 'lucide-react';

interface PropertiesListProps {
  userId: string;
  userRole: string;
}

const getStatusBadgeVariant = (isActive: boolean): 'default' | 'secondary' => {
  return isActive ? 'default' : 'secondary';
};

export function PropertiesList({ userId, userRole }: PropertiesListProps) {
  const [properties, setProperties] = useState<Property[]>([]);
  const { loading, error, execute } = useAsyncOperation<Property[]>();

  useEffect(() => {
    const loadProperties = async () => {
      const result = await execute(() => propertiesAPI.getUserProperties());
      if (result) {
        setProperties(result);
      }
    };
    loadProperties();
  }, [execute, userId]);

  const handleDeleteProperty = async (propertyId: string) => {
    const confirmDelete = confirm('Are you sure you want to delete this property?');
    if (!confirmDelete) return;

    const result = await execute(() => propertiesAPI.delete(propertyId));
    if (result) {
      setProperties(prevProperties =>
        prevProperties.filter(property => property.id !== propertyId)
      );
    }
  };

  if (loading && properties.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your properties...</p>
        </div>
      </div>
    );
  }

  if (error && properties.length === 0) {
    return (
      <Card className="border-destructive">
        <CardContent className="flex items-center gap-3 py-6">
          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
          <div>
            <p className="font-medium text-destructive">Failed to load properties</p>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (properties.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="rounded-full bg-muted p-3 mb-4">
            <Home className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No Properties Yet</h3>
          <p className="text-sm text-muted-foreground text-center mb-6 max-w-md">
            You haven't added any properties yet. Start by adding your first property to begin earning.
          </p>
          <Button asChild>
            <Link href="/properties/new">
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Your First Property
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {properties.map((property) => {
        const propertyImage = property.images?.[0] || '/placeholder-property.jpg';

        return (
          <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="md:flex">
              <div className="md:w-1/3 relative h-48 md:h-auto">
                <img
                  src={propertyImage}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
                <Badge
                  variant={getStatusBadgeVariant(property.isActive)}
                  className="absolute top-3 right-3"
                >
                  {property.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>

              <div className="md:w-2/3 flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-1">{property.title}</h3>
                      <div className="flex items-center text-sm text-muted-foreground gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{property.location}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 pb-3">
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {property.description}
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <BedDouble className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {property.bedrooms} {property.bedrooms === 1 ? 'bedroom' : 'bedrooms'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>
                        Up to {property.maxGuests} {property.maxGuests === 1 ? 'guest' : 'guests'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold">
                      {formatCurrency(property.pricePerNight)}
                    </div>
                    <span className="text-sm text-muted-foreground">per night</span>
                  </div>
                </CardContent>

                <CardFooter className="flex flex-wrap gap-2 pt-3 border-t">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/properties/${property.id}`}>
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/properties/${property.id}/edit`}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Link>
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteProperty(property.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </CardFooter>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
