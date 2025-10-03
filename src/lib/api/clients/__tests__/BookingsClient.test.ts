import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { BookingsClient, Booking, CreateBookingRequest } from '../BookingsClient';
import { HttpClient } from '../../core/HttpClient';

jest.mock('../../core/HttpClient');

describe('BookingsClient', () => {
  let bookingsClient: BookingsClient;
  let mockHttp: jest.Mocked<HttpClient>;

  const mockBooking: Booking = {
    id: '1',
    propertyId: 'p1',
    guestId: 'g1',
    checkInDate: '2024-06-01',
    checkOutDate: '2024-06-05',
    numberOfGuests: 4,
    totalPrice: 800,
    status: 'confirmed',
    paymentStatus: 'paid',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  };

  beforeEach(() => {
    mockHttp = new HttpClient('http://localhost:5000/api') as jest.Mocked<HttpClient>;
    bookingsClient = new BookingsClient(mockHttp);
    jest.clearAllMocks();
  });

  describe('createBooking', () => {
    it('should create new booking', async () => {
      const bookingData: CreateBookingRequest = {
        propertyId: 'p1',
        checkInDate: '2024-06-01',
        checkOutDate: '2024-06-05',
        numberOfGuests: 4,
        specialRequests: 'Late check-in',
      };

      const mockResponse = { data: mockBooking };
      mockHttp.post = jest.fn().mockResolvedValue(mockResponse);

      const result = await bookingsClient.createBooking(bookingData);

      expect(mockHttp.post).toHaveBeenCalledWith('/bookings', bookingData);
      expect(result).toEqual(mockBooking);
    });
  });

  describe('getBookingById', () => {
    it('should get booking by ID with caching', async () => {
      const mockResponse = { data: mockBooking };
      mockHttp.get = jest.fn().mockResolvedValue(mockResponse);

      const result = await bookingsClient.getBookingById('1');

      expect(mockHttp.get).toHaveBeenCalledWith('/bookings/1', {
        cache: {
          ttl: 5 * 60 * 1000,
          tags: ['bookings', 'booking-1'],
        },
      });

      expect(result).toEqual(mockBooking);
    });
  });

  describe('getMyBookings', () => {
    it('should get current user bookings with caching', async () => {
      const mockResponse = {
        data: {
          data: [mockBooking],
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

      const result = await bookingsClient.getMyBookings();

      expect(mockHttp.get).toHaveBeenCalledWith('/bookings/my-bookings', {
        params: {},
        cache: {
          ttl: 2 * 60 * 1000,
          tags: ['bookings', 'my-bookings'],
        },
      });

      expect(result).toEqual(mockResponse.data);
    });

    it('should apply filters when getting bookings', async () => {
      const mockResponse = {
        data: {
          data: [mockBooking],
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

      await bookingsClient.getMyBookings({ status: 'confirmed', page: 1 });

      expect(mockHttp.get).toHaveBeenCalledWith('/bookings/my-bookings', {
        params: { status: 'confirmed', page: 1 },
        cache: expect.any(Object),
      });
    });
  });

  describe('getHostBookings', () => {
    it('should get host bookings with filters', async () => {
      const mockResponse = {
        data: {
          data: [mockBooking],
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

      const result = await bookingsClient.getHostBookings({ propertyId: 'p1' });

      expect(mockHttp.get).toHaveBeenCalledWith('/bookings/host-bookings', {
        params: { propertyId: 'p1' },
        cache: {
          ttl: 2 * 60 * 1000,
          tags: ['bookings', 'host-bookings'],
        },
      });

      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getPropertyBookings', () => {
    it('should get bookings for specific property', async () => {
      const mockResponse = { data: [mockBooking] };
      mockHttp.get = jest.fn().mockResolvedValue(mockResponse);

      const result = await bookingsClient.getPropertyBookings('p1');

      expect(mockHttp.get).toHaveBeenCalledWith('/bookings/property/p1', {
        cache: {
          ttl: 5 * 60 * 1000,
          tags: ['bookings', 'property-p1'],
        },
      });

      expect(result).toEqual([mockBooking]);
    });
  });

  describe('booking lifecycle methods', () => {
    it('should cancel booking', async () => {
      const cancelledBooking = { ...mockBooking, status: 'cancelled' as const };
      const mockResponse = { data: cancelledBooking };
      mockHttp.put = jest.fn().mockResolvedValue(mockResponse);

      const result = await bookingsClient.cancelBooking('1', {
        reason: 'Change of plans',
        refundRequested: true,
      });

      expect(mockHttp.put).toHaveBeenCalledWith('/bookings/1/cancel', {
        reason: 'Change of plans',
        refundRequested: true,
      });

      expect(result.status).toBe('cancelled');
    });

    it('should confirm booking', async () => {
      const mockResponse = { data: mockBooking };
      mockHttp.put = jest.fn().mockResolvedValue(mockResponse);

      const result = await bookingsClient.confirmBooking('1');

      expect(mockHttp.put).toHaveBeenCalledWith('/bookings/1/confirm');
      expect(result).toEqual(mockBooking);
    });

    it('should complete booking', async () => {
      const completedBooking = { ...mockBooking, status: 'completed' as const };
      const mockResponse = { data: completedBooking };
      mockHttp.put = jest.fn().mockResolvedValue(mockResponse);

      const result = await bookingsClient.completeBooking('1');

      expect(mockHttp.put).toHaveBeenCalledWith('/bookings/1/complete');
      expect(result.status).toBe('completed');
    });

    it('should check in to booking', async () => {
      const mockResponse = { data: mockBooking };
      mockHttp.put = jest.fn().mockResolvedValue(mockResponse);

      const result = await bookingsClient.checkIn('1');

      expect(mockHttp.put).toHaveBeenCalledWith('/bookings/1/checkin');
      expect(result).toEqual(mockBooking);
    });

    it('should check out from booking', async () => {
      const mockResponse = { data: mockBooking };
      mockHttp.put = jest.fn().mockResolvedValue(mockResponse);

      const result = await bookingsClient.checkOut('1');

      expect(mockHttp.put).toHaveBeenCalledWith('/bookings/1/checkout');
      expect(result).toEqual(mockBooking);
    });
  });

  describe('updateBooking', () => {
    it('should update booking details', async () => {
      const updates = {
        numberOfGuests: 5,
        specialRequests: 'Early check-in',
      };

      const updatedBooking = { ...mockBooking, ...updates };
      const mockResponse = { data: updatedBooking };
      mockHttp.put = jest.fn().mockResolvedValue(mockResponse);

      const result = await bookingsClient.updateBooking('1', updates);

      expect(mockHttp.put).toHaveBeenCalledWith('/bookings/1', updates);
      expect(result.numberOfGuests).toBe(5);
    });
  });

  describe('getBookingStats', () => {
    it('should get booking statistics without property filter', async () => {
      const mockStats = {
        totalBookings: 50,
        confirmedBookings: 40,
        cancelledBookings: 5,
        totalRevenue: 10000,
        averageBookingValue: 200,
        occupancyRate: 0.75,
      };

      const mockResponse = { data: mockStats };
      mockHttp.get = jest.fn().mockResolvedValue(mockResponse);

      const result = await bookingsClient.getBookingStats();

      expect(mockHttp.get).toHaveBeenCalledWith('/bookings/stats', {
        params: {},
        cache: {
          ttl: 15 * 60 * 1000,
          tags: ['bookings', 'stats'],
        },
      });

      expect(result).toEqual(mockStats);
    });

    it('should get booking statistics for specific property', async () => {
      const mockStats = {
        totalBookings: 10,
        confirmedBookings: 8,
        cancelledBookings: 1,
        totalRevenue: 2000,
        averageBookingValue: 200,
        occupancyRate: 0.8,
      };

      const mockResponse = { data: mockStats };
      mockHttp.get = jest.fn().mockResolvedValue(mockResponse);

      const result = await bookingsClient.getBookingStats('p1');

      expect(mockHttp.get).toHaveBeenCalledWith('/bookings/stats', {
        params: { propertyId: 'p1' },
        cache: {
          ttl: 15 * 60 * 1000,
          tags: ['bookings', 'stats', 'property-p1'],
        },
      });

      expect(result).toEqual(mockStats);
    });
  });

  describe('getUpcomingBookings', () => {
    it('should get upcoming bookings with default limit', async () => {
      const mockResponse = { data: [mockBooking] };
      mockHttp.get = jest.fn().mockResolvedValue(mockResponse);

      const result = await bookingsClient.getUpcomingBookings();

      expect(mockHttp.get).toHaveBeenCalledWith('/bookings/upcoming', {
        params: { limit: 5 },
        cache: {
          ttl: 2 * 60 * 1000,
          tags: ['bookings', 'upcoming'],
        },
      });

      expect(result).toEqual([mockBooking]);
    });

    it('should get upcoming bookings with custom limit', async () => {
      const mockResponse = { data: [mockBooking] };
      mockHttp.get = jest.fn().mockResolvedValue(mockResponse);

      await bookingsClient.getUpcomingBookings(10);

      expect(mockHttp.get).toHaveBeenCalledWith('/bookings/upcoming', {
        params: { limit: 10 },
        cache: expect.any(Object),
      });
    });
  });

  describe('getBookingHistory', () => {
    it('should get booking history', async () => {
      const mockResponse = { data: [mockBooking] };
      mockHttp.get = jest.fn().mockResolvedValue(mockResponse);

      const result = await bookingsClient.getBookingHistory();

      expect(mockHttp.get).toHaveBeenCalledWith('/bookings/history', {
        params: { limit: 10 },
        cache: {
          ttl: 10 * 60 * 1000,
          tags: ['bookings', 'history'],
        },
      });

      expect(result).toEqual([mockBooking]);
    });
  });

  describe('searchBookings', () => {
    it('should search bookings with advanced filters', async () => {
      const filters = {
        status: 'confirmed' as const,
        guestName: 'John',
        minAmount: 500,
        maxAmount: 1000,
      };

      const mockResponse = {
        data: {
          data: [mockBooking],
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

      mockHttp.post = jest.fn().mockResolvedValue(mockResponse);

      const result = await bookingsClient.searchBookings(filters);

      expect(mockHttp.post).toHaveBeenCalledWith('/bookings/search', filters);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('calculateBookingTotal', () => {
    it('should calculate booking total with breakdown', async () => {
      const mockResponse = {
        data: {
          basePrice: 200,
          numberOfNights: 4,
          subtotal: 800,
          serviceFee: 80,
          cleaningFee: 50,
          taxes: 100,
          total: 1030,
          breakdown: [
            { name: 'Base price', amount: 800 },
            { name: 'Service fee', amount: 80 },
            { name: 'Cleaning fee', amount: 50 },
            { name: 'Taxes', amount: 100 },
          ],
        },
      };

      mockHttp.post = jest.fn().mockResolvedValue(mockResponse);

      const result = await bookingsClient.calculateBookingTotal(
        'p1',
        '2024-06-01',
        '2024-06-05',
        4
      );

      expect(mockHttp.post).toHaveBeenCalledWith('/bookings/calculate-total', {
        propertyId: 'p1',
        checkInDate: '2024-06-01',
        checkOutDate: '2024-06-05',
        numberOfGuests: 4,
      });

      expect(result.total).toBe(1030);
      expect(result.breakdown).toHaveLength(4);
    });
  });

  describe('requestModification', () => {
    it('should request booking modification', async () => {
      const mockResponse = {
        data: {
          modificationId: 'm1',
          status: 'pending',
        },
      };

      mockHttp.post = jest.fn().mockResolvedValue(mockResponse);

      const result = await bookingsClient.requestModification('1', {
        newCheckInDate: '2024-06-02',
        newNumberOfGuests: 5,
        reason: 'Plans changed',
      });

      expect(mockHttp.post).toHaveBeenCalledWith('/bookings/1/request-modification', {
        newCheckInDate: '2024-06-02',
        newNumberOfGuests: 5,
        reason: 'Plans changed',
      });

      expect(result.modificationId).toBe('m1');
    });
  });

  describe('processRefund', () => {
    it('should process refund for cancelled booking', async () => {
      const mockResponse = {
        data: {
          refundId: 'r1',
          amount: 800,
          status: 'processing',
          estimatedProcessingTime: '3-5 business days',
        },
      };

      mockHttp.post = jest.fn().mockResolvedValue(mockResponse);

      const result = await bookingsClient.processRefund('1', 800);

      expect(mockHttp.post).toHaveBeenCalledWith('/bookings/1/refund', {
        refundAmount: 800,
      });

      expect(result.amount).toBe(800);
      expect(result.status).toBe('processing');
    });
  });

  describe('utility methods', () => {
    it('should calculate number of nights', () => {
      const nights = bookingsClient.calculateNights('2024-06-01', '2024-06-05');
      expect(nights).toBe(4);
    });

    it('should check if booking can be cancelled', () => {
      const futureBooking = {
        ...mockBooking,
        checkInDate: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
        status: 'confirmed' as const,
      };

      expect(bookingsClient.canCancelBooking(futureBooking)).toBe(true);

      const completedBooking = { ...mockBooking, status: 'completed' as const };
      expect(bookingsClient.canCancelBooking(completedBooking)).toBe(false);
    });

    it('should check if booking can be modified', () => {
      const futureBooking = {
        ...mockBooking,
        checkInDate: new Date(Date.now() + 72 * 3600 * 1000).toISOString(),
        status: 'confirmed' as const,
      };

      expect(bookingsClient.canModifyBooking(futureBooking)).toBe(true);

      const cancelledBooking = { ...mockBooking, status: 'cancelled' as const };
      expect(bookingsClient.canModifyBooking(cancelledBooking)).toBe(false);
    });

    it('should get status color', () => {
      expect(bookingsClient.getStatusColor('confirmed')).toBe('#10b981');
      expect(bookingsClient.getStatusColor('pending')).toBe('#f59e0b');
      expect(bookingsClient.getStatusColor('cancelled')).toBe('#ef4444');
      expect(bookingsClient.getStatusColor('completed')).toBe('#6b7280');
      expect(bookingsClient.getStatusColor('in_progress')).toBe('#3b82f6');
    });

    it('should format date range', () => {
      const formatted = bookingsClient.formatDateRange('2024-06-01', '2024-06-05');
      expect(formatted).toContain('Jun');
      expect(formatted).toContain('1');
      expect(formatted).toContain('5');
    });

    it('should check if booking is active', () => {
      const activeBooking = {
        ...mockBooking,
        checkInDate: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
        checkOutDate: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
        status: 'in_progress' as const,
      };

      expect(bookingsClient.isActiveBooking(activeBooking)).toBe(true);

      const futureBooking = {
        ...mockBooking,
        checkInDate: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
        checkOutDate: new Date(Date.now() + 96 * 3600 * 1000).toISOString(),
      };

      expect(bookingsClient.isActiveBooking(futureBooking)).toBe(false);
    });
  });
});
