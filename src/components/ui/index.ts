// UI Components - Comprehensive Export Structure

// Core shadcn/ui Components
export { Button, buttonVariants, type ButtonProps } from './button';
export { 
  Card, 
  CardHeader, 
  CardFooter, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from './card';
export { Input, inputVariants, type InputProps } from './input';
export { Textarea, textareaVariants, type TextareaProps } from './textarea';
export { Checkbox } from './checkbox';
export { Badge } from './badge';
export { Slider } from './slider';
export { Tabs } from './tabs';

// New Essential shadcn/ui Components
export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from './dialog';

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
} from './select';

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
} from './dropdown-menu';

export {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
  useFormField,
} from './form';

export { Label } from './label';
export { Switch } from './switch';
export { Separator } from './separator';
export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from './tooltip';
export { Avatar, AvatarImage, AvatarFallback } from './avatar';

// Custom UI Components
export { LoadingSpinner, LoadingSkeleton, LoadingOverlay } from './LoadingSpinner';
export { EmptyState } from './empty-state';
export { ErrorDisplay } from './ErrorDisplay';
export { Alert } from './feedback';
export { Notification } from './notification';
export { Toast } from './toast';
export { PropertyCard } from './property-card';
export { MobileMenu } from './mobile-menu';
export { FocusTrap } from './focus-trap';
export { ValidationMessage } from './form-validation';
export { OptimizedImage } from './optimized-image';
export { ProgressiveDisclosure } from './progressive-disclosure';

// Type exports for advanced usage
export type * from './types';

// Utility exports
export { cn } from '@/lib/utils';