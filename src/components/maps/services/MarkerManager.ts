/**
 * @fileoverview Unified Marker Management Service
 * 
 * Enterprise-grade marker creation and management supporting both classic 
 * google.maps.Marker and modern AdvancedMarkerElement implementations.
 */

import type { 
  MarkerOptions, 
  MarkerType, 
  MapProperty, 
  MapMode
} from '../types/MapTypes';
import { MAP_THEME } from '../types/MapTypes';
import type { Property } from '@/lib/api';

/**
 * Marker instance type union
 */
type MarkerInstance = google.maps.Marker | google.maps.marker.AdvancedMarkerElement;

/**
 * Marker manager for unified marker creation and management
 */
export class MarkerManager {
  private markers: Map<string, MarkerInstance[]> = new Map();
  private infoWindow: google.maps.InfoWindow | null = null;
  
  /**
   * Determines the best marker type based on browser support and preferences
   */
  static getBestMarkerType(preferred?: MarkerType): MarkerType {
    if (preferred === 'classic') return 'classic';
    
    // Check if AdvancedMarkerElement is available
    try {
      return window.google?.maps?.marker?.AdvancedMarkerElement ? 'advanced' : 'classic';
    } catch {
      return 'classic';
    }
  }

  /**
   * Creates markers for a map based on mode and properties
   */
  createMarkers(
    map: google.maps.Map,
    mode: MapMode,
    options: {
      markerType: MarkerType;
      property?: MapProperty;
      properties?: Property[];
      selectedProperty?: Property;
      onPropertySelect?: (property: Property) => void;
    }
  ): void {
    const { markerType, property, properties, selectedProperty, onPropertySelect } = options;
    
    // Clear existing markers
    this.clearMarkers(map);
    
    if (mode === 'single' && property) {
      this.createSinglePropertyMarker(map, property, markerType);
    } else if (mode === 'multiple' && properties) {
      this.createMultiplePropertyMarkers(map, properties, selectedProperty, onPropertySelect, markerType);
    }
  }

  /**
   * Creates a marker for single property display
   */
  private createSinglePropertyMarker(
    map: google.maps.Map, 
    property: MapProperty, 
    markerType: MarkerType
  ): void {
    if (!property.latitude || !property.longitude) return;

    const position = { lat: property.latitude, lng: property.longitude };
    
    const markerOptions: MarkerOptions = {
      position,
      map,
      title: `${property.title} - ${property.address}`,
      property,
      onClick: () => this.handleSinglePropertyClick(map, property, position),
    };

    const marker = markerType === 'advanced' 
      ? this.createAdvancedMarker(markerOptions)
      : this.createClassicMarker(markerOptions);

    if (marker) {
      this.markers.set('single', [marker]);
      
      // Auto-open info window for single property
      this.showInfoWindow(map, marker, property, 'single');
    }
  }

  /**
   * Creates markers for multiple properties display
   */
  private createMultiplePropertyMarkers(
    map: google.maps.Map,
    properties: Property[],
    selectedProperty?: Property,
    onPropertySelect?: (property: Property) => void,
    markerType: MarkerType = 'classic'
  ): void {
    const markers: MarkerInstance[] = [];

    properties.forEach(property => {
      if (!property.latitude || !property.longitude) return;

      const position = { lat: property.latitude, lng: property.longitude };
      const isSelected = selectedProperty?.id === property.id;

      const markerOptions: MarkerOptions = {
        position,
        map,
        title: property.title,
        property,
        isSelected,
        onClick: () => this.handleMultiplePropertyClick(map, property, onPropertySelect),
        onMouseOver: () => this.handlePropertyHover(property, true),
        onMouseOut: () => this.handlePropertyHover(property, false),
      };

      // For multiple properties, create both main marker and price label
      const mainMarker = this.createClassicMarker(markerOptions);
      const priceMarker = this.createPriceMarker(markerOptions);

      if (mainMarker && priceMarker) {
        markers.push(mainMarker, priceMarker);
      }
    });

    this.markers.set('multiple', markers);

    // Fit bounds to show all properties
    if (properties.length > 1) {
      this.fitBounds(map, properties);
    }
  }

  /**
   * Creates an advanced marker element (modern approach)
   */
  private createAdvancedMarker(options: MarkerOptions): google.maps.marker.AdvancedMarkerElement | null {
    try {
      const markerElement = this.createAdvancedMarkerElement(options.property!, options.isSelected);
      
      const marker = new google.maps.marker.AdvancedMarkerElement({
        position: options.position,
        map: options.map,
        title: options.title,
        content: markerElement,
      });

      // Add event listeners
      if (options.onClick) {
        marker.addListener('click', options.onClick);
      }

      return marker;
    } catch (error) {
      console.warn('Failed to create AdvancedMarkerElement, falling back to classic:', error);
      return this.createClassicMarker(options);
    }
  }

  /**
   * Creates a classic marker (fallback approach)
   */
  private createClassicMarker(options: MarkerOptions): google.maps.Marker | null {
    try {
      const marker = new google.maps.Marker({
        position: options.position,
        map: options.map,
        title: options.title,
        icon: this.createClassicMarkerIcon(options.isSelected),
        zIndex: options.isSelected ? 1000 : 100,
      });

      // Add event listeners
      if (options.onClick) {
        marker.addListener('click', options.onClick);
      }
      if (options.onMouseOver) {
        marker.addListener('mouseover', options.onMouseOver);
      }
      if (options.onMouseOut) {
        marker.addListener('mouseout', options.onMouseOut);
      }

      return marker;
    } catch (error) {
      console.error('Failed to create classic marker:', error);
      return null;
    }
  }

  /**
   * Creates a price label marker for multiple property mode
   */
  private createPriceMarker(options: MarkerOptions): google.maps.Marker | null {
    const property = options.property as Property;
    if (!property.pricePerNight) return null;

    try {
      const priceMarker = new google.maps.Marker({
        position: options.position,
        map: options.map,
        icon: this.createPriceLabelIcon(property.pricePerNight, options.isSelected),
        zIndex: options.isSelected ? 1001 : 101,
      });

      // Add same event listeners as main marker
      if (options.onClick) {
        priceMarker.addListener('click', options.onClick);
      }
      if (options.onMouseOver) {
        priceMarker.addListener('mouseover', options.onMouseOver);
      }
      if (options.onMouseOut) {
        priceMarker.addListener('mouseout', options.onMouseOut);
      }

      return priceMarker;
    } catch (error) {
      console.error('Failed to create price marker:', error);
      return null;
    }
  }

  /**
   * Creates DOM element for advanced marker
   */
  private createAdvancedMarkerElement(property: MapProperty | Property, isSelected?: boolean): HTMLElement {
    const markerElement = document.createElement('div');
    markerElement.innerHTML = `
      <div style="
        position: relative;
        cursor: pointer;
        transform: translate(-50%, calc(-100% - 8px));
      ">
        <div style="
          width: 44px;
          height: 44px;
          background: linear-gradient(135deg, ${MAP_THEME.PRIMARY} 0%, #e31c5f 100%);
          border-radius: 50%;
          border: 3px solid ${MAP_THEME.WHITE};
          box-shadow: 0 4px 16px rgba(255, 56, 92, 0.3), 0 2px 8px rgba(0,0,0,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        ">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style="color: white;">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" fill="currentColor"/>
          </svg>
        </div>
        <div style="
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 8px solid ${MAP_THEME.PRIMARY};
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
        "></div>
        <div style="
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translate(-50%, 2px);
          width: 12px;
          height: 4px;
          background: rgba(0,0,0,0.1);
          border-radius: 50%;
          filter: blur(2px);
        "></div>
      </div>
    `;
    
    return markerElement;
  }

  /**
   * Creates icon for classic marker
   */
  private createClassicMarkerIcon(isSelected?: boolean): google.maps.Icon {
    return {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: isSelected ? MAP_THEME.PRIMARY : MAP_THEME.WHITE,
      fillOpacity: 1,
      strokeColor: MAP_THEME.PRIMARY,
      strokeWeight: 2,
      scale: isSelected ? 16 : 12,
    };
  }

  /**
   * Creates price label icon for classic marker
   */
  private createPriceLabelIcon(price: number, isSelected?: boolean): google.maps.Icon {
    const fillColor = isSelected ? MAP_THEME.PRIMARY : MAP_THEME.WHITE;
    const textColor = isSelected ? MAP_THEME.WHITE : MAP_THEME.PRIMARY;
    
    return {
      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
        <svg width="60" height="30" xmlns="http://www.w3.org/2000/svg">
          <rect width="60" height="30" rx="15" fill="${fillColor}" 
                stroke="${MAP_THEME.PRIMARY}" stroke-width="2"/>
          <text x="30" y="20" text-anchor="middle" 
                fill="${textColor}" 
                font-family="Arial, sans-serif" font-size="12" font-weight="bold">
            $${price}
          </text>
        </svg>
      `)}`,
      scaledSize: new google.maps.Size(60, 30),
      anchor: new google.maps.Point(30, 35),
    };
  }

  /**
   * Handles click on single property marker
   */
  private handleSinglePropertyClick(
    map: google.maps.Map, 
    property: MapProperty, 
    position: google.maps.LatLngLiteral
  ): void {
    this.showInfoWindow(map, null, property, 'single', position);
  }

  /**
   * Handles click on multiple property marker
   */
  private handleMultiplePropertyClick(
    map: google.maps.Map,
    property: Property,
    onPropertySelect?: (property: Property) => void
  ): void {
    onPropertySelect?.(property);
    this.showInfoWindow(map, null, property, 'multiple');
  }

  /**
   * Handles property hover for visual feedback
   */
  private handlePropertyHover(property: MapProperty | Property, isHovering: boolean): void {
    // This could be expanded to update marker styles on hover
    // For now, we'll keep the existing hover logic from the original components
  }

  /**
   * Shows info window with property information
   */
  private showInfoWindow(
    map: google.maps.Map,
    marker: MarkerInstance | null,
    property: MapProperty | Property,
    mode: MapMode,
    position?: google.maps.LatLngLiteral
  ): void {
    if (!this.infoWindow) {
      this.infoWindow = new google.maps.InfoWindow();
    }

    const content = this.createInfoWindowContent(property, mode);
    this.infoWindow.setContent(content);

    if (marker) {
      this.infoWindow.open(map, marker as google.maps.Marker);
    } else if (position) {
      this.infoWindow.setPosition(position);
      this.infoWindow.open(map);
    }
  }

  /**
   * Creates info window content based on property and mode
   */
  private createInfoWindowContent(property: MapProperty | Property, mode: MapMode): string {
    const isProperty = (p: any): p is Property => 'id' in p;
    const prop = property as Property;

    if (mode === 'single') {
      return `
        <div style="padding: 8px; max-width: 200px;">
          <h3 style="margin: 0 0 4px 0; font-weight: 600; color: #222;">${property.title}</h3>
          <p style="margin: 0; color: #666; font-size: 14px;">${property.address}</p>
          <small style="color: #999; font-size: 12px;">
            Approximate location for privacy
          </small>
        </div>
      `;
    }

    // Multiple property mode
    const imageUrl = isProperty(prop) && prop.images?.[0] || '/placeholder-property.jpg';
    return `
      <div style="max-width: 250px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <img 
          src="${imageUrl}" 
          alt="${property.title}"
          style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;"
          onerror="this.src='/placeholder-property.jpg'"
        />
        <h3 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600; color: #222; line-height: 1.2;">
          ${property.title}
        </h3>
        <p style="margin: 0 0 4px 0; color: #666; font-size: 12px;">
          ${isProperty(prop) ? prop.location : property.address}
        </p>
        <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 8px;">
          <div style="display: flex; align-items: center;">
            <span style="color: #ff385c; font-weight: 600; font-size: 14px;">
              $${property.pricePerNight || 'N/A'}
            </span>
            <span style="color: #666; font-size: 12px; margin-left: 2px;">/night</span>
          </div>
          <div style="display: flex; align-items: center;">
            <span style="color: #f59e0b; font-size: 12px; margin-right: 2px;">★</span>
            <span style="color: #666; font-size: 12px;">
              ${isProperty(prop) && prop.rating || 'New'}
            </span>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Fits map bounds to show all properties
   */
  private fitBounds(map: google.maps.Map, properties: Property[]): void {
    const bounds = new google.maps.LatLngBounds();
    properties.forEach(property => {
      if (property.latitude && property.longitude) {
        bounds.extend({ lat: property.latitude, lng: property.longitude });
      }
    });
    map.fitBounds(bounds);
  }

  /**
   * Clears all markers from the map
   */
  clearMarkers(map: google.maps.Map): void {
    this.markers.forEach(markerArray => {
      markerArray.forEach(marker => {
        if ('setMap' in marker) {
          marker.setMap(null);
        } else {
          (marker as google.maps.marker.AdvancedMarkerElement).map = null;
        }
      });
    });
    this.markers.clear();
  }

  /**
   * Updates marker selection state
   */
  updateSelection(selectedProperty?: Property): void {
    // This method would update the visual state of markers based on selection
    // Implementation would depend on tracking marker instances and their associated properties
  }

  /**
   * Cleanup method
   */
  destroy(): void {
    this.markers.forEach(markerArray => {
      markerArray.forEach(marker => {
        if ('setMap' in marker) {
          marker.setMap(null);
        } else {
          (marker as google.maps.marker.AdvancedMarkerElement).map = null;
        }
      });
    });
    this.markers.clear();
    
    if (this.infoWindow) {
      this.infoWindow.close();
      this.infoWindow = null;
    }
  }
}