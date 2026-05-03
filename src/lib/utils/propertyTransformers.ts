/**
 * Property Transformation Utilities
 *
 * Pure functions for transforming property data using functional programming principles.
 * All functions are:
 * - Pure (no side effects)
 * - Immutable (don't modify inputs)
 * - Referentially transparent (same input = same output)
 * - Composable (can be combined with other functions)
 */

import { type Property } from '@/lib/api';

/**
 * Display property interface with computed/enriched fields
 */
export interface DisplayProperty extends Property {
  price: number;
  guests: number;
  beds: number;
  baths: number;
  rating: number;
  reviews: number;
  image: string;
  hostName: string;
  hostImage: string;
  isFavorite: boolean;
  isInstantBook: boolean;
}

/**
 * Default values for display properties
 */
const DEFAULT_VALUES = {
  IMAGE: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=500&h=300&fit=crop',
  HOST_IMAGE: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop',
  HOST_NAME: 'Host',
  RATING: 4.8,
  REVIEWS: 25,
  IS_FAVORITE: false,
  IS_INSTANT_BOOK: true,
} as const;

/**
 * Pure function: Transform a Property to DisplayProperty
 *
 * @param property - Source property object
 * @returns New DisplayProperty object with computed fields
 *
 * @example
 * const property = { id: '1', pricePerNight: 100, ... };
 * const displayProp = mapPropertyToDisplay(property);
 * console.log(displayProp.price); // 100
 */
export const mapPropertyToDisplay = (property: Property): DisplayProperty => ({
  ...property,
  price: property.pricePerNight,
  guests: property.maxGuests,
  beds: property.bedrooms,
  baths: property.bathrooms,
  image: property.images?.[0] || DEFAULT_VALUES.IMAGE,
  hostName: property.owner
    ? `${property.owner.firstName} ${property.owner.lastName}`
    : DEFAULT_VALUES.HOST_NAME,
  hostImage: DEFAULT_VALUES.HOST_IMAGE,
  rating: DEFAULT_VALUES.RATING,
  reviews: DEFAULT_VALUES.REVIEWS,
  isFavorite: DEFAULT_VALUES.IS_FAVORITE,
  isInstantBook: DEFAULT_VALUES.IS_INSTANT_BOOK,
});

/**
 * Pure function: Transform array of properties to display properties
 *
 * @param properties - Array of source properties
 * @returns New array of DisplayProperty objects
 *
 * @example
 * const properties = [{ id: '1', ... }, { id: '2', ... }];
 * const displayProps = mapPropertiesToDisplay(properties);
 */
export const mapPropertiesToDisplay = (properties: Property[]): DisplayProperty[] =>
  properties.map(mapPropertyToDisplay);

/**
 * Higher-order function: Create a property filter predicate
 *
 * @param filterFn - Filter function
 * @returns Curried filter function for functional composition
 *
 * @example
 * const byPriceRange = createPropertyFilter(prop => prop.price >= 100 && prop.price <= 500);
 * const filtered = properties.filter(byPriceRange);
 */
export const createPropertyFilter =
  <T extends Property>(filterFn: (property: T) => boolean) =>
  (property: T): boolean =>
    filterFn(property);

/**
 * Pure function: Extract price from property
 *
 * @param property - Source property
 * @returns Price per night
 */
export const extractPrice = (property: Property): number => property.pricePerNight;

/**
 * Pure function: Extract guests from property
 *
 * @param property - Source property
 * @returns Maximum number of guests
 */
export const extractGuests = (property: Property): number => property.maxGuests;

/**
 * Pure function: Extract image from property with fallback
 *
 * @param property - Source property
 * @returns Image URL
 */
export const extractImage = (property: Property): string =>
  property.images?.[0] || DEFAULT_VALUES.IMAGE;

/**
 * Utility: Function composition helper
 *
 * Composes functions from left to right (pipe style)
 *
 * @param fns - Functions to compose
 * @returns Composed function
 *
 * @example
 * const addPrice = (prop) => ({ ...prop, price: prop.pricePerNight });
 * const addGuests = (prop) => ({ ...prop, guests: prop.maxGuests });
 * const transform = pipe(addPrice, addGuests);
 * const result = transform(property);
 */
export const pipe =
  <T,>(...fns: Array<(arg: T) => T>) =>
  (value: T): T =>
    fns.reduce((acc, fn) => fn(acc), value);

/**
 * Utility: Function composition helper
 *
 * Composes functions from right to left (compose style)
 *
 * @param fns - Functions to compose
 * @returns Composed function
 *
 * @example
 * const addPrice = (prop) => ({ ...prop, price: prop.pricePerNight });
 * const addGuests = (prop) => ({ ...prop, guests: prop.maxGuests });
 * const transform = compose(addGuests, addPrice);
 * const result = transform(property);
 */
export const compose =
  <T,>(...fns: Array<(arg: T) => T>) =>
  (value: T): T =>
    fns.reduceRight((acc, fn) => fn(acc), value);
