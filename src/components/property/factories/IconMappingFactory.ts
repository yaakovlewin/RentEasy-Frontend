/**
 * @fileoverview Icon Mapping Factory
 * 
 * Enterprise-grade icon mapping factory that eliminates code duplication across
 * components by providing a centralized, configurable icon mapping system.
 * 
 * Follows the Factory pattern used by Google and Netflix for consistent icon management.
 */

import {
  Wifi,
  Car,
  Wind,
  Tv,
  UtensilsCrossed,
  Waves,
  Dumbbell,
  WashingMachine,
  Thermometer,
  Shield,
  Baby,
  PawPrint,
  Cigarette,
  CigaretteOff,
  Trees,
  MapPin,
  Clock,
  Check,
  X,
  AlertTriangle,
  Users,
  Coffee,
  Snowflake,
  Flame,
  Shower,
  Bath,
  Music,
  Book,
  Monitor,
  Home,
  Key,
  Lock,
  Unlock,
  Calendar,
  Package,
  Heart,
  Star,
  Sun,
  Moon,
  Cloud,
  Zap,
  LucideIcon
} from 'lucide-react';

import { IconComponent, IconFactoryConfig, createIconFactory } from '../types/IconTypes';

/**
 * Amenity icon mapping configuration
 */
const AMENITY_ICON_CONFIG: IconFactoryConfig = {
  defaultIcon: Wifi,
  mappings: {
    // Direct mappings for common amenities
    'wifi': Wifi,
    'internet': Wifi,
    'parking': Car,
    'garage': Car,
    'air conditioning': Wind,
    'ac': Wind,
    'tv': Tv,
    'television': Tv,
    'kitchen': UtensilsCrossed,
    'cooking': UtensilsCrossed,
    'pool': Waves,
    'swimming pool': Waves,
    'gym': Dumbbell,
    'fitness': Dumbbell,
    'washer': WashingMachine,
    'laundry': WashingMachine,
    'heating': Thermometer,
    'security': Shield,
    'safe': Shield,
    'baby friendly': Baby,
    'child friendly': Baby,
    'pet friendly': PawPrint,
    'smoking allowed': Cigarette,
    'non-smoking': CigaretteOff,
    'garden': Trees,
    'outdoor space': Trees,
    'balcony': Trees,
    'terrace': Trees,
    'nearby attractions': MapPin,
    '24/7 access': Clock,
    'coffee maker': Coffee,
    'refrigerator': Snowflake,
    'fireplace': Flame,
    'shower': Shower,
    'bathtub': Bath,
    'music system': Music,
    'library': Book,
    'work desk': Monitor,
    'private entrance': Home,
    'keyless entry': Key,
    'secure building': Lock,
    'accessible': Unlock,
    'events allowed': Calendar,
    'luggage storage': Package,
  },
  matchingRules: [
    // Pattern matching for complex amenity names
    { pattern: /wifi|internet|wi-fi/i, icon: Wifi },
    { pattern: /parking|garage|carport/i, icon: Car },
    { pattern: /air\s*conditioning|ac|cooling/i, icon: Wind },
    { pattern: /tv|television|cable|netflix/i, icon: Tv },
    { pattern: /kitchen|cooking|stove|oven/i, icon: UtensilsCrossed },
    { pattern: /pool|swimming/i, icon: Waves },
    { pattern: /gym|fitness|exercise/i, icon: Dumbbell },
    { pattern: /wash|laundry|dryer/i, icon: WashingMachine },
    { pattern: /heat|warm|thermostat/i, icon: Thermometer },
    { pattern: /security|safe|alarm/i, icon: Shield },
    { pattern: /baby|child|crib|high\s*chair/i, icon: Baby },
    { pattern: /pet|dog|cat|animal/i, icon: PawPrint },
    { pattern: /smok/i, icon: Cigarette },
    { pattern: /non-smoking|no\s*smoking/i, icon: CigaretteOff },
    { pattern: /garden|outdoor|patio|yard/i, icon: Trees },
    { pattern: /location|nearby|close/i, icon: MapPin },
    { pattern: /24|hours|always/i, icon: Clock },
    { pattern: /coffee|espresso|nespresso/i, icon: Coffee },
    { pattern: /fridge|refrigerator|freezer/i, icon: Snowflake },
    { pattern: /fire|fireplace|wood/i, icon: Flame },
    { pattern: /shower|bathroom/i, icon: Shower },
    { pattern: /bath|tub|jacuzzi/i, icon: Bath },
    { pattern: /music|speaker|sound/i, icon: Music },
    { pattern: /book|read|library/i, icon: Book },
    { pattern: /desk|work|office|computer/i, icon: Monitor },
    { pattern: /entrance|door|access/i, icon: Home },
    { pattern: /key|lock|secure/i, icon: Key },
  ]
};

/**
 * Rule icon mapping configuration
 */
const RULE_ICON_CONFIG: IconFactoryConfig = {
  defaultIcon: Check,
  mappings: {
    // Direct mappings for common rules
    'no smoking': X,
    'smoking prohibited': X,
    'check-in time': Clock,
    'check-out time': Clock,
    'maximum guests': Users,
    'quiet hours': AlertTriangle,
    'no parties': AlertTriangle,
    'no pets': X,
    'pets allowed': PawPrint,
    'children allowed': Baby,
    'no children': X,
    'events allowed': Calendar,
    'no events': X,
  },
  matchingRules: [
    // Pattern matching for complex rule descriptions
    { pattern: /no\s*smoking|smoking\s*prohibited/i, icon: X },
    { pattern: /check-?in|arrival/i, icon: Clock },
    { pattern: /check-?out|departure/i, icon: Clock },
    { pattern: /guest|visitor|maximum|occupancy/i, icon: Users },
    { pattern: /quiet|noise|party/i, icon: AlertTriangle },
    { pattern: /pet|animal/i, icon: PawPrint },
    { pattern: /child|baby|infant/i, icon: Baby },
    { pattern: /no\s+|not\s*allowed|prohibited|forbidden/i, icon: X },
    { pattern: /security|safe/i, icon: Shield },
    { pattern: /key|lock|access/i, icon: Key },
    { pattern: /clean|tidy|damage/i, icon: Home },
    { pattern: /event|gathering|celebration/i, icon: Calendar },
  ]
};

/**
 * Property feature icon mapping configuration
 */
const FEATURE_ICON_CONFIG: IconFactoryConfig = {
  defaultIcon: Star,
  mappings: {
    'instant book': Zap,
    'superhost': Star,
    'verified': Shield,
    'featured': Heart,
    'new listing': Sun,
    'popular': Flame,
    'rare find': Moon,
    'guest favorite': Heart,
    'eco-friendly': Trees,
    'luxury': Star,
    'budget': Package,
  },
  matchingRules: [
    { pattern: /instant|quick|fast/i, icon: Zap },
    { pattern: /super|premium|elite/i, icon: Star },
    { pattern: /verif|confirm|trust/i, icon: Shield },
    { pattern: /feature|special|highlight/i, icon: Heart },
    { pattern: /new|recent|fresh/i, icon: Sun },
    { pattern: /popular|trending|hot/i, icon: Flame },
    { pattern: /rare|unique|exclusive/i, icon: Moon },
    { pattern: /favorite|loved|recommended/i, icon: Heart },
    { pattern: /eco|green|sustainable/i, icon: Trees },
    { pattern: /luxury|premium|deluxe/i, icon: Star },
    { pattern: /budget|cheap|affordable/i, icon: Package },
  ]
};

/**
 * Weather/Climate icon mapping configuration
 */
const WEATHER_ICON_CONFIG: IconFactoryConfig = {
  defaultIcon: Cloud,
  mappings: {
    'sunny': Sun,
    'cloudy': Cloud,
    'rainy': Cloud,
    'snowy': Snowflake,
    'hot': Flame,
    'cold': Snowflake,
  },
  matchingRules: [
    { pattern: /sun|bright|clear/i, icon: Sun },
    { pattern: /cloud|overcast|grey/i, icon: Cloud },
    { pattern: /rain|wet|shower/i, icon: Cloud },
    { pattern: /snow|ice|frost/i, icon: Snowflake },
    { pattern: /hot|warm|heat/i, icon: Flame },
    { pattern: /cold|cool|chill/i, icon: Snowflake },
  ]
};

/**
 * Icon Mapping Factory - Main factory class
 */
export class IconMappingFactory {
  private static amenityIconFactory = createIconFactory(AMENITY_ICON_CONFIG);
  private static ruleIconFactory = createIconFactory(RULE_ICON_CONFIG);
  private static featureIconFactory = createIconFactory(FEATURE_ICON_CONFIG);
  private static weatherIconFactory = createIconFactory(WEATHER_ICON_CONFIG);

  /**
   * Get icon for amenity
   */
  static getAmenityIcon(amenity: string): IconComponent {
    return this.amenityIconFactory(amenity.toLowerCase());
  }

  /**
   * Get icon for rule
   */
  static getRuleIcon(rule: string): IconComponent {
    return this.ruleIconFactory(rule.toLowerCase());
  }

  /**
   * Get icon for feature
   */
  static getFeatureIcon(feature: string): IconComponent {
    return this.featureIconFactory(feature.toLowerCase());
  }

  /**
   * Get icon for weather
   */
  static getWeatherIcon(weather: string): IconComponent {
    return this.weatherIconFactory(weather.toLowerCase());
  }

  /**
   * Get color class for rule type
   */
  static getRuleColorClass(rule: string): string {
    const lowerRule = rule.toLowerCase();
    
    if (lowerRule.includes('no ') || 
        lowerRule.includes('not allowed') || 
        lowerRule.includes('prohibited')) {
      return 'text-red-600';
    }
    
    if (lowerRule.includes('allowed') || 
        lowerRule.includes('welcome') || 
        lowerRule.includes('permitted')) {
      return 'text-green-600';
    }
    
    if (lowerRule.includes('check-in') || 
        lowerRule.includes('check-out') || 
        lowerRule.includes('time')) {
      return 'text-blue-600';
    }
    
    if (lowerRule.includes('quiet') || 
        lowerRule.includes('noise') || 
        lowerRule.includes('consideration')) {
      return 'text-yellow-600';
    }
    
    return 'text-gray-600';
  }

  /**
   * Get color class for amenity category
   */
  static getAmenityColorClass(amenity: string): string {
    const lowerAmenity = amenity.toLowerCase();
    
    if (lowerAmenity.includes('wifi') || 
        lowerAmenity.includes('internet') || 
        lowerAmenity.includes('work')) {
      return 'text-blue-600';
    }
    
    if (lowerAmenity.includes('kitchen') || 
        lowerAmenity.includes('cooking') || 
        lowerAmenity.includes('dining')) {
      return 'text-orange-600';
    }
    
    if (lowerAmenity.includes('pool') || 
        lowerAmenity.includes('gym') || 
        lowerAmenity.includes('fitness')) {
      return 'text-cyan-600';
    }
    
    if (lowerAmenity.includes('pet') || 
        lowerAmenity.includes('child') || 
        lowerAmenity.includes('family')) {
      return 'text-purple-600';
    }
    
    if (lowerAmenity.includes('security') || 
        lowerAmenity.includes('safe')) {
      return 'text-green-600';
    }
    
    return 'text-gray-600';
  }

  /**
   * Create a custom icon factory with specific configuration
   */
  static createCustomFactory(config: IconFactoryConfig) {
    return createIconFactory(config);
  }

  /**
   * Batch process multiple items
   */
  static batchGetIcons<T extends { type: 'amenity' | 'rule' | 'feature' | 'weather', value: string }>(
    items: T[]
  ): Array<{ item: T; icon: IconComponent }> {
    return items.map(item => ({
      item,
      icon: this.getIconByType(item.type, item.value)
    }));
  }

  /**
   * Get icon by type
   */
  private static getIconByType(type: 'amenity' | 'rule' | 'feature' | 'weather', value: string): IconComponent {
    switch (type) {
      case 'amenity':
        return this.getAmenityIcon(value);
      case 'rule':
        return this.getRuleIcon(value);
      case 'feature':
        return this.getFeatureIcon(value);
      case 'weather':
        return this.getWeatherIcon(value);
      default:
        return Wifi; // Default fallback
    }
  }
}

// Export convenience functions for direct use
export const getAmenityIcon = IconMappingFactory.getAmenityIcon.bind(IconMappingFactory);
export const getRuleIcon = IconMappingFactory.getRuleIcon.bind(IconMappingFactory);
export const getFeatureIcon = IconMappingFactory.getFeatureIcon.bind(IconMappingFactory);
export const getWeatherIcon = IconMappingFactory.getWeatherIcon.bind(IconMappingFactory);
export const getRuleColorClass = IconMappingFactory.getRuleColorClass.bind(IconMappingFactory);
export const getAmenityColorClass = IconMappingFactory.getAmenityColorClass.bind(IconMappingFactory);