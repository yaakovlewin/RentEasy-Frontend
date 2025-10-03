import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { PropertiesClient, Property, SearchParams } from '../PropertiesClient';
import { HttpClient } from '../../core/HttpClient';

jest.mock('../../core/HttpClient');

describe('PropertiesClient', () => {
  let propertiesClient: PropertiesClient;
  let mockHttp: jest.Mocked<HttpClient>;

  const mockProperty: Property = {
    id: '1',
    title: 'Beach House',
    description: 'Beautiful beach house',
    location: 'Miami, FL',
    latitude: 25.7617,
    longitude: -80.1918,
    pricePerNight: 200,
    maxGuests: 6,
    bedrooms: 3,
    bathrooms: 2,
    images: ['image1.jpg', 'image2.jpg'],
    amenities: ['WiFi', 'Pool'],
    isActive: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  };

  beforeEach(() => {
    mockHttp = new HttpClient('http://localhost:5000/api') as jest.Mocked<HttpClient>;
    propertiesClient = new PropertiesClient(mockHttp);
    jest.clearAllMocks();
  });

  describe('searchProperties', () => {
    it('should search properties with filters', async () => {
      const searchParams: SearchParams = {
        location: 'Miami',
        minPrice: 100,
        maxPrice: 300,
        guests: 4,
      };

      const mockResponse = {
        data: {
          data: [mockProperty],
          pagination: {
            page: 1,
            limit: 10,
            total: 1,
            totalPages: 1,
            hasNext: false,
            hasPrev: false,
          },
        },
      };

      mockHttp.get = jest.fn().mockResolvedValue(mockResponse);

      const result = await propertiesClient.searchProperties(searchParams);

      expect(mockHttp.get).toHaveBeenCalledWith('/properties/search', {
        params: searchParams,
        cache: {
          ttl: 5 * 60 * 1000,
          tags: ['properties', 'search'],
        },
      });

      expect(result).toEqual(mockResponse.data);
    });

    it('should clean empty search parameters', async () => {
      const searchParams: SearchParams = {
        location: '',
        minPrice: 0,
        guests: undefined,
      };

      const mockResponse = {
        data: {
          data: [],
          pagination: {
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false,
          },
        },
      };

      mockHttp.get = jest.fn().mockResolvedValue(mockResponse);

      await propertiesClient.searchProperties(searchParams);

      expect(mockHttp.get).toHaveBeenCalledWith('/properties/search', {
        params: {},
        cache: expect.any(Object),
      });
    });
  });

  describe('getPropertyById', () => {
    it('should get property by ID with caching', async () => {
      const mockResponse = { data: mockProperty };
      mockHttp.get = jest.fn().mockResolvedValue(mockResponse);

      const result = await propertiesClient.getPropertyById('1');

      expect(mockHttp.get).toHaveBeenCalledWith('/properties/1', {
        cache: {
          ttl: 15 * 60 * 1000,
          tags: ['properties', 'property-1'],
        },
      });

      expect(result).toEqual(mockProperty);
    });
  });

  describe('createProperty', () => {
    it('should create new property', async () => {
      const newProperty = {
        title: 'New Beach House',
        description: 'Amazing beach house',
        location: 'Miami, FL',
        pricePerNight: 250,
        maxGuests: 8,
        bedrooms: 4,
        bathrooms: 3,
      };

      const mockResponse = { data: { ...mockProperty, ...newProperty } };
      mockHttp.post = jest.fn().mockResolvedValue(mockResponse);

      const result = await propertiesClient.createProperty(newProperty);

      expect(mockHttp.post).toHaveBeenCalledWith('/properties', newProperty);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('updateProperty', () => {
    it('should update existing property', async () => {
      const updates = {
        pricePerNight: 220,
        isActive: false,
      };

      const mockResponse = { data: { ...mockProperty, ...updates } };
      mockHttp.put = jest.fn().mockResolvedValue(mockResponse);

      const result = await propertiesClient.updateProperty('1', updates);

      expect(mockHttp.put).toHaveBeenCalledWith('/properties/1', updates);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('deleteProperty', () => {
    it('should delete property', async () => {
      const mockResponse = { data: { message: 'Property deleted successfully' } };
      mockHttp.delete = jest.fn().mockResolvedValue(mockResponse);

      const result = await propertiesClient.deleteProperty('1');

      expect(mockHttp.delete).toHaveBeenCalledWith('/properties/1');
      expect(result.message).toBe('Property deleted successfully');
    });
  });

  describe('getMyProperties', () => {
    it('should get current user properties with caching', async () => {
      const mockResponse = { data: [mockProperty] };
      mockHttp.get = jest.fn().mockResolvedValue(mockResponse);

      const result = await propertiesClient.getMyProperties();

      expect(mockHttp.get).toHaveBeenCalledWith('/properties/user/properties', {
        cache: {
          ttl: 2 * 60 * 1000,
          tags: ['properties', 'my-properties'],
        },
      });

      expect(result).toEqual([mockProperty]);
    });
  });

  describe('checkAvailability', () => {
    it('should check property availability', async () => {
      const mockResponse = {
        data: {
          available: true,
          conflictingBookings: [],
        },
      };

      mockHttp.get = jest.fn().mockResolvedValue(mockResponse);

      const result = await propertiesClient.checkAvailability('1', '2024-06-01', '2024-06-05');

      expect(mockHttp.get).toHaveBeenCalledWith('/properties/1/availability', {
        params: {
          checkIn: '2024-06-01',
          checkOut: '2024-06-05',
        },
        cache: {
          ttl: 1 * 60 * 1000,
          tags: ['property-1', 'availability'],
        },
      });

      expect(result.available).toBe(true);
    });

    it('should return conflicting bookings when not available', async () => {
      const mockResponse = {
        data: {
          available: false,
          conflictingBookings: [
            { id: 'b1', checkIn: '2024-06-02', checkOut: '2024-06-04' },
          ],
        },
      };

      mockHttp.get = jest.fn().mockResolvedValue(mockResponse);

      const result = await propertiesClient.checkAvailability('1', '2024-06-01', '2024-06-05');

      expect(result.available).toBe(false);
      expect(result.conflictingBookings).toHaveLength(1);
    });
  });

  describe('getFeaturedProperties', () => {
    it('should get featured properties with default limit', async () => {
      const mockResponse = { data: [mockProperty] };
      mockHttp.get = jest.fn().mockResolvedValue(mockResponse);

      const result = await propertiesClient.getFeaturedProperties();

      expect(mockHttp.get).toHaveBeenCalledWith('/properties/featured', {
        params: { limit: 6 },
        cache: {
          ttl: 30 * 60 * 1000,
          tags: ['properties', 'featured'],
        },
      });

      expect(result).toEqual([mockProperty]);
    });

    it('should get featured properties with custom limit', async () => {
      const mockResponse = { data: [mockProperty] };
      mockHttp.get = jest.fn().mockResolvedValue(mockResponse);

      await propertiesClient.getFeaturedProperties(10);

      expect(mockHttp.get).toHaveBeenCalledWith('/properties/featured', {
        params: { limit: 10 },
        cache: expect.any(Object),
      });
    });
  });

  describe('getSimilarProperties', () => {
    it('should get similar properties', async () => {
      const mockResponse = { data: [mockProperty] };
      mockHttp.get = jest.fn().mockResolvedValue(mockResponse);

      const result = await propertiesClient.getSimilarProperties('1');

      expect(mockHttp.get).toHaveBeenCalledWith('/properties/1/similar', {
        params: { limit: 4 },
        cache: {
          ttl: 15 * 60 * 1000,
          tags: ['properties', 'similar-1'],
        },
      });

      expect(result).toEqual([mockProperty]);
    });
  });

  describe('uploadImages', () => {
    it('should upload property images', async () => {
      const mockFiles = [
        new File(['image1'], 'image1.jpg', { type: 'image/jpeg' }),
        new File(['image2'], 'image2.jpg', { type: 'image/jpeg' }),
      ];

      const mockResponse = {
        data: { imageUrls: ['url1.jpg', 'url2.jpg'] },
      };

      mockHttp.post = jest.fn().mockResolvedValue(mockResponse);

      const result = await propertiesClient.uploadImages('1', mockFiles);

      expect(mockHttp.post).toHaveBeenCalledWith(
        '/properties/1/images',
        expect.any(FormData),
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      expect(result.imageUrls).toEqual(['url1.jpg', 'url2.jpg']);
    });
  });

  describe('deleteImage', () => {
    it('should delete property image', async () => {
      const mockResponse = { data: { message: 'Image deleted' } };
      mockHttp.delete = jest.fn().mockResolvedValue(mockResponse);

      const result = await propertiesClient.deleteImage('1', 'image.jpg');

      expect(mockHttp.delete).toHaveBeenCalledWith('/properties/1/images', {
        data: { imageUrl: 'image.jpg' },
      });

      expect(result.message).toBe('Image deleted');
    });
  });

  describe('getPropertiesByLocation', () => {
    it('should get properties near location with default radius', async () => {
      const mockResponse = { data: [mockProperty] };
      mockHttp.get = jest.fn().mockResolvedValue(mockResponse);

      const result = await propertiesClient.getPropertiesByLocation(25.7617, -80.1918);

      expect(mockHttp.get).toHaveBeenCalledWith('/properties/nearby', {
        params: {
          latitude: 25.7617,
          longitude: -80.1918,
          radius: 10,
          limit: 20,
        },
        cache: {
          ttl: 10 * 60 * 1000,
          tags: ['properties', 'location'],
        },
      });

      expect(result).toEqual([mockProperty]);
    });

    it('should get properties near location with custom radius', async () => {
      const mockResponse = { data: [mockProperty] };
      mockHttp.get = jest.fn().mockResolvedValue(mockResponse);

      await propertiesClient.getPropertiesByLocation(25.7617, -80.1918, 25, 50);

      expect(mockHttp.get).toHaveBeenCalledWith('/properties/nearby', {
        params: {
          latitude: 25.7617,
          longitude: -80.1918,
          radius: 25,
          limit: 50,
        },
        cache: expect.any(Object),
      });
    });
  });

  describe('getPropertyStats', () => {
    it('should get property statistics', async () => {
      const mockStats = {
        totalBookings: 50,
        totalRevenue: 10000,
        averageRating: 4.5,
        occupancyRate: 0.75,
      };

      const mockResponse = { data: mockStats };
      mockHttp.get = jest.fn().mockResolvedValue(mockResponse);

      const result = await propertiesClient.getPropertyStats('1');

      expect(mockHttp.get).toHaveBeenCalledWith('/properties/1/stats', {
        cache: {
          ttl: 60 * 60 * 1000,
          tags: ['property-1', 'stats'],
        },
      });

      expect(result).toEqual(mockStats);
    });
  });

  describe('advancedSearch', () => {
    it('should perform advanced search with filters', async () => {
      const filters = {
        query: 'beach',
        location: 'Miami',
        priceRange: [100, 300] as [number, number],
        dateRange: ['2024-06-01', '2024-06-05'] as [string, string],
        guests: 4,
        amenities: ['WiFi', 'Pool'],
        rating: 4,
        sortBy: 'price' as const,
        sortOrder: 'asc' as const,
        page: 1,
        limit: 20,
      };

      const mockResponse = {
        data: {
          data: [mockProperty],
          pagination: {
            page: 1,
            limit: 20,
            total: 1,
            totalPages: 1,
            hasNext: false,
            hasPrev: false,
          },
        },
      };

      mockHttp.post = jest.fn().mockResolvedValue(mockResponse);

      const result = await propertiesClient.advancedSearch(filters);

      expect(mockHttp.post).toHaveBeenCalledWith('/properties/advanced-search', filters, {
        cache: {
          ttl: 3 * 60 * 1000,
          tags: ['properties', 'advanced-search'],
        },
      });

      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('utility methods', () => {
    it('should format price correctly', () => {
      const formatted = propertiesClient.formatPrice(200);
      expect(formatted).toContain('200');
      expect(formatted).toContain('$');
    });

    it('should calculate average rating', () => {
      const reviews = [{ rating: 5 }, { rating: 4 }, { rating: 4.5 }];
      const average = propertiesClient.calculateAverageRating(reviews);
      expect(average).toBe(4.5);
    });

    it('should return 0 for empty reviews', () => {
      const average = propertiesClient.calculateAverageRating([]);
      expect(average).toBe(0);
    });

    it('should check property availability correctly', () => {
      const checkIn = new Date('2024-06-01');
      const checkOut = new Date('2024-06-05');
      const existingBookings = [
        { checkIn: '2024-06-10', checkOut: '2024-06-15' },
      ];

      const isAvailable = propertiesClient.isPropertyAvailable(
        mockProperty,
        checkIn,
        checkOut,
        existingBookings
      );

      expect(isAvailable).toBe(true);
    });

    it('should detect booking conflicts', () => {
      const checkIn = new Date('2024-06-01');
      const checkOut = new Date('2024-06-05');
      const existingBookings = [
        { checkIn: '2024-06-03', checkOut: '2024-06-07' },
      ];

      const isAvailable = propertiesClient.isPropertyAvailable(
        mockProperty,
        checkIn,
        checkOut,
        existingBookings
      );

      expect(isAvailable).toBe(false);
    });
  });
});
