'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { propertiesAPI } from '@/lib/api';
import { useAsyncOperation } from '@/hooks/useAsyncOperation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  CheckCircle2,
  Circle,
  ChevronRight,
  ChevronLeft,
  Home,
  DollarSign,
  FileText,
  Rocket
} from 'lucide-react';

interface PropertyOnboardingProps {
  userId: string;
}

type OnboardingStep = 'welcome' | 'add-property' | 'set-pricing' | 'review-guidelines';

interface Step {
  id: OnboardingStep;
  title: string;
  description: string;
  icon: React.ElementType;
  action?: {
    label: string;
    href: string;
  };
}

export function PropertyOnboarding({ userId }: PropertyOnboardingProps) {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [hasProperties, setHasProperties] = useState(false);
  const { execute, loading } = useAsyncOperation<any>();

  useEffect(() => {
    const checkProperties = async () => {
      const result = await execute(() => propertiesAPI.getUserProperties());
      if (result && Array.isArray(result)) {
        setHasProperties(result.length > 0);
      }
    };
    checkProperties();
  }, [execute, userId]);

  if (loading) {
    return null;
  }

  if (hasProperties) {
    return null;
  }

  const steps: Step[] = [
    {
      id: 'welcome',
      title: 'Welcome to RentEasy',
      description: 'Start earning by listing your property on our platform. We\'ll guide you through the process step by step.',
      icon: Home,
    },
    {
      id: 'add-property',
      title: 'Add Your First Property',
      description: 'Provide details about your property including location, amenities, and photos to attract guests.',
      icon: Home,
      action: {
        label: 'Add Property',
        href: '/properties/new',
      },
    },
    {
      id: 'set-pricing',
      title: 'Set Your Pricing',
      description: 'Configure competitive pricing for your property. You can adjust rates based on seasons and demand.',
      icon: DollarSign,
      action: {
        label: 'Learn About Pricing',
        href: '/help/pricing',
      },
    },
    {
      id: 'review-guidelines',
      title: 'Review Guidelines',
      description: 'Familiarize yourself with our hosting guidelines and policies to ensure a smooth experience.',
      icon: FileText,
      action: {
        label: 'View Guidelines',
        href: '/help/guidelines',
      },
    },
  ];

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);
  const currentStepData = steps[currentStepIndex];
  const Icon = currentStepData.icon;

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStep(steps[currentStepIndex + 1].id);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1].id);
    }
  };

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between mb-4">
          <CardTitle className="text-xl">Getting Started</CardTitle>
          <div className="text-sm text-muted-foreground">
            Step {currentStepIndex + 1} of {steps.length}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <div
                className={`flex-1 h-2 rounded-full transition-colors ${
                  index <= currentStepIndex ? 'bg-primary' : 'bg-muted'
                }`}
              />
            </div>
          ))}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-primary/10">
            <Icon className="h-8 w-8 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">{currentStepData.title}</h3>
            <p className="text-muted-foreground">{currentStepData.description}</p>
          </div>
        </div>

        <div className="space-y-3 pt-4">
          <h4 className="text-sm font-medium text-muted-foreground">All Steps</h4>
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            const isCompleted = index < currentStepIndex;
            const isCurrent = index === currentStepIndex;

            return (
              <div
                key={step.id}
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  isCurrent ? 'bg-primary/5 border border-primary/20' : ''
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                ) : (
                  <Circle className={`h-5 w-5 flex-shrink-0 ${
                    isCurrent ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                )}
                <div className="flex-1">
                  <p className={`text-sm font-medium ${
                    isCurrent ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {step.title}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between border-t pt-6">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStepIndex === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        <div className="flex items-center gap-2">
          {currentStepData.action ? (
            <Button asChild>
              <Link href={currentStepData.action.href}>
                {currentStepData.action.label}
                <Rocket className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          ) : currentStepIndex < steps.length - 1 ? (
            <Button onClick={handleNext}>
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button asChild>
              <Link href="/properties/new">
                Get Started
                <Rocket className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
