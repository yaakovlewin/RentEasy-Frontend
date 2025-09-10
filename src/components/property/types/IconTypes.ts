/**
 * @fileoverview Icon Type Definitions
 * 
 * Enterprise-grade type definitions for icon components used throughout the property system.
 * Eliminates the need for 'any' types while maintaining type safety and flexibility.
 */

import { LucideIcon } from 'lucide-react';
import { FC, SVGProps } from 'react';

/**
 * Unified type for all icon components that can be used in the application.
 * Supports both Lucide icons and custom SVG components.
 */
export type IconComponent = LucideIcon | FC<SVGProps<SVGSVGElement>>;

/**
 * Props interface for icon components
 */
export interface IconProps extends SVGProps<SVGSVGElement> {
  className?: string;
  'aria-hidden'?: boolean;
  'aria-label'?: string;
}

/**
 * Type-safe icon mapping interface
 */
export interface IconMapping {
  [key: string]: IconComponent;
}

/**
 * Icon factory configuration
 */
export interface IconFactoryConfig {
  defaultIcon: IconComponent;
  mappings: IconMapping;
  matchingRules?: Array<{
    pattern: RegExp | string;
    icon: IconComponent;
  }>;
}

/**
 * Icon factory return type
 */
export type IconFactory = (key: string) => IconComponent;

/**
 * Create a type-safe icon factory
 */
export function createIconFactory(config: IconFactoryConfig): IconFactory {
  return (key: string): IconComponent => {
    // Check direct mappings first
    if (config.mappings[key]) {
      return config.mappings[key];
    }

    // Check pattern matching rules
    if (config.matchingRules) {
      const lowerKey = key.toLowerCase();
      for (const rule of config.matchingRules) {
        if (typeof rule.pattern === 'string') {
          if (lowerKey.includes(rule.pattern)) {
            return rule.icon;
          }
        } else if (rule.pattern.test(lowerKey)) {
          return rule.icon;
        }
      }
    }

    // Return default icon
    return config.defaultIcon;
  };
}