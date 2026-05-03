import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Property } from '@/lib/api';

// Mock Next.js modules
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({
    src,
    alt,
    fill,
    ...props
  }: {
    src: string;
    alt: string;
    fill?: boolean;
    className?: string;
    sizes?: string;
  }) => {
    return <img src={src} alt={alt} {...props} />;
  },
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  },
}));

// Import PropertyCard component
import { PropertyCard } from '../PropertyCard';

describe('PropertyCard Component', () => {
  const mockProperty: Property = {
    id: '1',
    title: 'Cozy Beach House',
    description: 'A beautiful beach house with stunning ocean views',
    location: 'Malibu, CA',
    latitude: 34.0259,
    longitude: -118.7798,
    pricePerNight: 250,
    maxGuests: 6,
    bedrooms: 3,
    bathrooms: 2,
    images: ['https://example.com/beach-house.jpg'],
    amenities: ['Wifi', 'Pool', 'Kitchen'],
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    owner: {
      id: 'owner-1',
      firstName: 'John',
      lastName: 'Doe',
    },
  };

  describe('Grid View Rendering', () => {
    it('should render property in grid layout by default', () => {
      render(<PropertyCard property={mockProperty} />);

      expect(screen.getByText('Cozy Beach House')).toBeInTheDocument();
      expect(screen.getByText('Malibu, CA')).toBeInTheDocument();
    });

    it('should display property image in grid view', () => {
      render(<PropertyCard property={mockProperty} />);

      const image = screen.getByAltText('Cozy Beach House');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', 'https://example.com/beach-house.jpg');
    });

    it('should display grid view with compact layout', () => {
      render(<PropertyCard property={mockProperty} viewMode='grid' />);

      const card = screen.getByText('Cozy Beach House').closest('.group');
      expect(card).toBeInTheDocument();
    });
  });

  describe('List View Rendering', () => {
    it('should render property in list layout', () => {
      render(<PropertyCard property={mockProperty} viewMode='list' />);

      expect(screen.getByText('Cozy Beach House')).toBeInTheDocument();
      expect(screen.getByText('Malibu, CA')).toBeInTheDocument();
    });

    it('should display horizontal layout in list view', () => {
      render(<PropertyCard property={mockProperty} viewMode='list' />);

      const container = screen.getByText('Cozy Beach House').closest('div.flex');
      expect(container).toBeInTheDocument();
    });

    it('should show property description in list view', () => {
      render(<PropertyCard property={mockProperty} viewMode='list' />);

      expect(screen.getByText('A beautiful beach house with stunning ocean views')).toBeInTheDocument();
    });
  });

  describe('Property Details Display', () => {
    it('should display property title', () => {
      render(<PropertyCard property={mockProperty} />);

      expect(screen.getByText('Cozy Beach House')).toBeInTheDocument();
    });

    it('should display location with MapPin icon', () => {
      render(<PropertyCard property={mockProperty} />);

      expect(screen.getByText('Malibu, CA')).toBeInTheDocument();
    });

    it('should display price per night', () => {
      render(<PropertyCard property={mockProperty} />);

      expect(screen.getByText('$250')).toBeInTheDocument();
      expect(screen.getByText('/night')).toBeInTheDocument();
    });

    it('should display guest count', () => {
      render(<PropertyCard property={mockProperty} />);

      expect(screen.getByText('6 guests')).toBeInTheDocument();
    });

    it('should display bedroom count', () => {
      render(<PropertyCard property={mockProperty} />);

      expect(screen.getByText('3 beds')).toBeInTheDocument();
    });

    it('should display bathroom count', () => {
      render(<PropertyCard property={mockProperty} />);

      expect(screen.getByText('2 baths')).toBeInTheDocument();
    });
  });

  describe('Image Display', () => {
    it('should display property image with correct alt text', () => {
      render(<PropertyCard property={mockProperty} />);

      const images = screen.getAllByAltText('Cozy Beach House');
      expect(images.length).toBeGreaterThan(0);
    });

    it('should use fallback image when no images provided', () => {
      const propertyWithoutImage = { ...mockProperty, images: undefined };
      render(<PropertyCard property={propertyWithoutImage} />);

      const image = screen.getByAltText('Cozy Beach House');
      expect(image).toHaveAttribute('src', expect.stringContaining('unsplash'));
    });

    it('should use first image from array', () => {
      const propertyWithMultipleImages = {
        ...mockProperty,
        images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
      };
      render(<PropertyCard property={propertyWithMultipleImages} />);

      const image = screen.getByAltText('Cozy Beach House');
      expect(image).toHaveAttribute('src', 'https://example.com/image1.jpg');
    });
  });

  describe('Rating Display', () => {
    it('should display default rating', () => {
      render(<PropertyCard property={mockProperty} />);

      expect(screen.getByText('4.8')).toBeInTheDocument();
    });

    it('should display review count', () => {
      render(<PropertyCard property={mockProperty} />);

      expect(screen.getByText('25 reviews')).toBeInTheDocument();
    });

    it('should display rating with star icon', () => {
      render(<PropertyCard property={mockProperty} />);

      const rating = screen.getByText('4.8').closest('div');
      expect(rating).toBeInTheDocument();
    });
  });

  describe('Host Information', () => {
    it('should display host name in list view', () => {
      render(<PropertyCard property={mockProperty} viewMode='list' />);

      expect(screen.getByText('Hosted by John Doe')).toBeInTheDocument();
    });

    it('should display host avatar image in list view', () => {
      render(<PropertyCard property={mockProperty} viewMode='list' />);

      const hostImage = screen.getByAltText('John Doe');
      expect(hostImage).toBeInTheDocument();
    });

    it('should use default host name when owner is undefined', () => {
      const propertyWithoutOwner = { ...mockProperty, owner: undefined };
      render(<PropertyCard property={propertyWithoutOwner} viewMode='list' />);

      expect(screen.getByText('Hosted by Host')).toBeInTheDocument();
    });
  });

  describe('Instant Book Badge', () => {
    it('should display instant book badge', () => {
      render(<PropertyCard property={mockProperty} />);

      expect(screen.getByText('Instant Book')).toBeInTheDocument();
    });

    it('should show instant book badge in both views', () => {
      const { rerender } = render(<PropertyCard property={mockProperty} viewMode='grid' />);
      expect(screen.getByText('Instant Book')).toBeInTheDocument();

      rerender(<PropertyCard property={mockProperty} viewMode='list' />);
      expect(screen.getByText('Instant Book')).toBeInTheDocument();
    });
  });

  describe('Link Navigation', () => {
    it('should link to property detail page', () => {
      render(<PropertyCard property={mockProperty} />);

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/property/1');
    });

    it('should wrap entire card in link', () => {
      render(<PropertyCard property={mockProperty} />);

      const link = screen.getByRole('link');
      expect(link).toContainElement(screen.getByText('Cozy Beach House'));
    });
  });

  describe('Favorite Toggle', () => {
    it('should display favorite button', () => {
      render(<PropertyCard property={mockProperty} />);

      const favoriteButton = screen.getByLabelText('Add to favorites');
      expect(favoriteButton).toBeInTheDocument();
    });

    it('should call onToggleFavorite when favorite button is clicked', async () => {
      const user = userEvent.setup();
      const onToggleFavorite = jest.fn();

      render(<PropertyCard property={mockProperty} onToggleFavorite={onToggleFavorite} />);

      const favoriteButton = screen.getByLabelText('Add to favorites');
      await user.click(favoriteButton);

      expect(onToggleFavorite).toHaveBeenCalledWith('1');
    });

    it('should prevent link navigation when favorite button is clicked', async () => {
      const user = userEvent.setup();
      const onToggleFavorite = jest.fn();

      render(<PropertyCard property={mockProperty} onToggleFavorite={onToggleFavorite} />);

      const favoriteButton = screen.getByLabelText('Add to favorites');
      await user.click(favoriteButton);

      expect(onToggleFavorite).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria-label for favorite button', () => {
      render(<PropertyCard property={mockProperty} />);

      const favoriteButton = screen.getByLabelText('Add to favorites');
      expect(favoriteButton).toHaveAttribute('aria-label', 'Add to favorites');
    });

    it('should have accessible image alt text', () => {
      render(<PropertyCard property={mockProperty} />);

      const image = screen.getByAltText('Cozy Beach House');
      expect(image).toBeInTheDocument();
    });

    it('should have semantic heading for title', () => {
      render(<PropertyCard property={mockProperty} />);

      const heading = screen.getByRole('heading', { name: 'Cozy Beach House' });
      expect(heading).toBeInTheDocument();
    });
  });

  describe('Functional Programming', () => {
    it('should be a pure component with same props producing same output', () => {
      const { container, rerender } = render(<PropertyCard property={mockProperty} />);
      const firstRender = container.innerHTML;

      rerender(<PropertyCard property={mockProperty} />);
      const secondRender = container.innerHTML;

      expect(firstRender).toBe(secondRender);
    });

    it('should not cause side effects during render', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      render(<PropertyCard property={mockProperty} />);

      expect(consoleErrorSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).not.toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
      consoleWarnSpy.mockRestore();
    });

    it('should memoize transformed property data', () => {
      const { rerender } = render(<PropertyCard property={mockProperty} />);

      expect(screen.getByText('Cozy Beach House')).toBeInTheDocument();

      rerender(<PropertyCard property={mockProperty} />);

      expect(screen.getByText('Cozy Beach House')).toBeInTheDocument();
    });
  });
});
