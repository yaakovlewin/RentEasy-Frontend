/**
 * BookingsClient - Modern bookings API client
 * 
 * Clean, type-safe booking management with lifecycle tracking,
 * conflict detection, and intelligent caching.
 */

import { HttpClient, ApiResponse } from '../core/HttpClient';
import { Property } from './PropertiesClient';

// Type definitions
export interface Booking {
  id: string;
  propertyId: string;
  guestId: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'in_progress';
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'failed';
  createdAt: string;
  updatedAt: string;
  property?: Property;
  guest?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  specialRequests?: string;
  cancellationReason?: string;
}

export interface CreateBookingRequest {
  propertyId: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  specialRequests?: string;
}

export interface BookingFilters {
  status?: Booking['status'];
  paymentStatus?: Booking['paymentStatus'];
  propertyId?: string;
  guestId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedBookings {
  data: Booking[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface CancelBookingRequest {
  reason?: string;
  refundRequested?: boolean;
}

export interface BookingStats {
  totalBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  averageBookingValue: number;
  occupancyRate: number;
}

class BookingsClient {
  constructor(private http: HttpClient) {}

  /**
   * Create new booking with availability check
   */
  async createBooking(bookingData: CreateBookingRequest): Promise<Booking> {
    const response = await this.http.post<Booking>('/bookings', bookingData);
    return response.data;
  }

  /**
   * Get booking by ID
   */
  async getBookingById(id: string): Promise<Booking> {
    const response = await this.http.get<Booking>(`/bookings/${id}`, {
      cache: {
        ttl: 5 * 60 * 1000, // 5 minutes
        tags: ['bookings', `booking-${id}`],
      },
    });

    return response.data;
  }

  /**
   * Get current user's bookings (as guest)
   */
  async getMyBookings(filters: Omit<BookingFilters, 'guestId'> = {}): Promise<PaginatedBookings> {
    const response = await this.http.get<PaginatedBookings>('/bookings/my-bookings', {
      params: this.cleanFilters(filters),
      cache: {
        ttl: 2 * 60 * 1000, // 2 minutes
        tags: ['bookings', 'my-bookings'],
      },
    });

    return response.data;
  }

  /**
   * Get bookings for host's properties
   */
  async getHostBookings(filters: Omit<BookingFilters, 'guestId'> = {}): Promise<PaginatedBookings> {
    const response = await this.http.get<PaginatedBookings>('/bookings/host-bookings', {
      params: this.cleanFilters(filters),
      cache: {
        ttl: 2 * 60 * 1000, // 2 minutes
        tags: ['bookings', 'host-bookings'],
      },
    });

    return response.data;
  }

  /**
   * Get bookings for specific property
   */
  async getPropertyBookings(propertyId: string): Promise<Booking[]> {
    const response = await this.http.get<Booking[]>(`/bookings/property/${propertyId}`, {
      cache: {
        ttl: 5 * 60 * 1000, // 5 minutes
        tags: ['bookings', `property-${propertyId}`],
      },
    });

    return response.data;
  }

  /**
   * Cancel booking
   */
  async cancelBooking(id: string, cancelData: CancelBookingRequest = {}): Promise<Booking> {
    const response = await this.http.put<Booking>(`/bookings/${id}/cancel`, cancelData);
    return response.data;
  }

  /**
   * Confirm booking (host action)
   */
  async confirmBooking(id: string): Promise<Booking> {
    const response = await this.http.put<Booking>(`/bookings/${id}/confirm`);
    return response.data;
  }

  /**
   * Mark booking as completed
   */
  async completeBooking(id: string): Promise<Booking> {
    const response = await this.http.put<Booking>(`/bookings/${id}/complete`);
    return response.data;
  }

  /**
   * Check in to booking
   */
  async checkIn(id: string): Promise<Booking> {
    const response = await this.http.put<Booking>(`/bookings/${id}/checkin`);
    return response.data;
  }

  /**
   * Check out from booking
   */
  async checkOut(id: string): Promise<Booking> {
    const response = await this.http.put<Booking>(`/bookings/${id}/checkout`);
    return response.data;
  }

  /**
   * Update booking details (before confirmation)
   */
  async updateBooking(id: string, updates: {
    checkInDate?: string;
    checkOutDate?: string;
    numberOfGuests?: number;
    specialRequests?: string;
  }): Promise<Booking> {
    const response = await this.http.put<Booking>(`/bookings/${id}`, updates);
    return response.data;
  }

  /**
   * Get booking statistics for host
   */
  async getBookingStats(propertyId?: string): Promise<BookingStats> {
    const params = propertyId ? { propertyId } : {};
    
    const response = await this.http.get<BookingStats>('/bookings/stats', {
      params,
      cache: {
        ttl: 15 * 60 * 1000, // 15 minutes
        tags: ['bookings', 'stats', ...(propertyId ? [`property-${propertyId}`] : [])],
      },
    });

    return response.data;
  }

  /**
   * Get upcoming bookings
   */
  async getUpcomingBookings(limit: number = 5): Promise<Booking[]> {
    const response = await this.http.get<Booking[]>('/bookings/upcoming', {
      params: { limit },
      cache: {
        ttl: 2 * 60 * 1000, // 2 minutes
        tags: ['bookings', 'upcoming'],
      },
    });

    return response.data;
  }

  /**
   * Get booking history
   */
  async getBookingHistory(limit: number = 10): Promise<Booking[]> {
    const response = await this.http.get<Booking[]>('/bookings/history', {
      params: { limit },
      cache: {
        ttl: 10 * 60 * 1000, // 10 minutes
        tags: ['bookings', 'history'],
      },
    });

    return response.data;
  }

  /**
   * Search bookings with advanced filters
   */
  async searchBookings(filters: BookingFilters & {
    guestName?: string;
    propertyName?: string;
    minAmount?: number;
    maxAmount?: number;
  }): Promise<PaginatedBookings> {
    const response = await this.http.post<PaginatedBookings>('/bookings/search', filters);
    return response.data;
  }

  /**
   * Calculate booking total with fees
   */
  async calculateBookingTotal(
    propertyId: string,
    checkInDate: string,
    checkOutDate: string,
    numberOfGuests: number
  ): Promise<{
    basePrice: number;
    numberOfNights: number;
    subtotal: number;
    serviceFee: number;
    cleaningFee: number;
    taxes: number;
    total: number;
    breakdown: Array<{
      name: string;
      amount: number;
      description?: string;
    }>;
  }> {
    const response = await this.http.post('/bookings/calculate-total', {
      propertyId,
      checkInDate,
      checkOutDate,
      numberOfGuests,
    });

    return response.data;
  }

  /**
   * Request booking modification
   */
  async requestModification(id: string, modifications: {
    newCheckInDate?: string;
    newCheckOutDate?: string;
    newNumberOfGuests?: number;
    reason: string;
  }): Promise<{ modificationId: string; status: string }> {
    const response = await this.http.post(`/bookings/${id}/request-modification`, modifications);
    return response.data;
  }

  /**
   * Process refund for cancelled booking
   */
  async processRefund(id: string, refundAmount?: number): Promise<{
    refundId: string;
    amount: number;
    status: string;
    estimatedProcessingTime: string;
  }> {
    const response = await this.http.post(`/bookings/${id}/refund`, { refundAmount });
    return response.data;
  }

  // Utility methods

  /**
   * Clean booking filters
   */
  private cleanFilters(filters: Record<string, any>): Record<string, any> {
    const cleaned: Record<string, any> = {};
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        cleaned[key] = value;
      }
    });

    return cleaned;
  }

  /**
   * Calculate number of nights
   */
  calculateNights(checkIn: string, checkOut: string): number {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  }

  /**
   * Check if booking can be cancelled
   */
  canCancelBooking(booking: Booking): boolean {
    if (booking.status === 'cancelled' || booking.status === 'completed') {
      return false;
    }

    // Check if it's within cancellation window (e.g., 24 hours before check-in)
    const checkInDate = new Date(booking.checkInDate);
    const now = new Date();
    const hoursUntilCheckIn = (checkInDate.getTime() - now.getTime()) / (1000 * 3600);

    return hoursUntilCheckIn > 24;
  }

  /**
   * Check if booking can be modified
   */
  canModifyBooking(booking: Booking): boolean {
    if (booking.status !== 'confirmed' && booking.status !== 'pending') {
      return false;
    }

    // Check if it's within modification window
    const checkInDate = new Date(booking.checkInDate);
    const now = new Date();
    const hoursUntilCheckIn = (checkInDate.getTime() - now.getTime()) / (1000 * 3600);

    return hoursUntilCheckIn > 48; // 48 hours before check-in
  }

  /**
   * Get booking status color for UI
   */
  getStatusColor(status: Booking['status']): string {
    const colors = {
      pending: '#f59e0b', // yellow
      confirmed: '#10b981', // green
      cancelled: '#ef4444', // red
      completed: '#6b7280', // gray
      in_progress: '#3b82f6', // blue
    };

    return colors[status] || '#6b7280';
  }

  /**
   * Format booking dates for display
   */
  formatDateRange(checkIn: string, checkOut: string): string {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    
    const formatter = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: checkInDate.getFullYear() !== checkOutDate.getFullYear() ? 'numeric' : undefined,
    });

    return `${formatter.format(checkInDate)} - ${formatter.format(checkOutDate)}`;
  }

  /**
   * Check if booking is active (guest is currently staying)
   */
  isActiveBooking(booking: Booking): boolean {
    if (booking.status !== 'confirmed' && booking.status !== 'in_progress') {
      return false;
    }

    const now = new Date();
    const checkInDate = new Date(booking.checkInDate);
    const checkOutDate = new Date(booking.checkOutDate);

    return now >= checkInDate && now < checkOutDate;
  }
}

export { BookingsClient };
export type {
  Booking,
  CreateBookingRequest,
  BookingFilters,
  PaginatedBookings,
  CancelBookingRequest,
  BookingStats,
};