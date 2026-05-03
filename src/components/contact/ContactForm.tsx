/**
 * ContactForm Component - Built with Either-Based Validation
 *
 * Demonstrates:
 * - Email and phone validation
 * - Optional field validation
 * - Text length validation
 * - Clean error display
 * - Success state management
 */

'use client';

import { useState } from 'react';
import { Mail, Phone, User, MessageSquare, Send, CheckCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import FormError from '@/components/forms/FormError';
import { useForm } from '@/hooks/useForm';
import {
  required,
  validateEmail,
  validatePhone,
  minLength,
  maxLength,
  composeValidators,
  optional,
} from '@/lib/utils/functional/validation';

interface ContactFormValues {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

interface ContactFormProps {
  onSubmit?: (values: ContactFormValues) => Promise<void>;
}

export function ContactForm({ onSubmit }: ContactFormProps) {
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<ContactFormValues>({
    initialValues: {
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
    },
    validators: {
      name: composeValidators(
        required('Name'),
        minLength(2, 'Name'),
        maxLength(100, 'Name')
      ),
      email: composeValidators(required('Email'), validateEmail),
      phone: optional(validatePhone),
      subject: composeValidators(
        required('Subject'),
        minLength(5, 'Subject'),
        maxLength(200, 'Subject')
      ),
      message: composeValidators(
        required('Message'),
        minLength(10, 'Message'),
        maxLength(2000, 'Message')
      ),
    },
    onSubmit: async values => {
      if (onSubmit) {
        await onSubmit(values);
      } else {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        form.resetForm();
      }, 3000);
    },
    validateOnBlur: true,
    resetOnSubmit: false,
  });

  if (isSuccess) {
    return (
      <Card className='shadow-lg'>
        <CardContent className='p-12 text-center'>
          <CheckCircle className='h-16 w-16 text-green-500 mx-auto mb-4' />
          <h3 className='text-2xl font-bold text-gray-900 mb-2'>Message Sent!</h3>
          <p className='text-gray-600'>
            Thank you for contacting us. We&apos;ll get back to you as soon as possible.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='shadow-lg'>
      <CardHeader>
        <CardTitle className='text-2xl flex items-center gap-2'>
          <MessageSquare className='h-6 w-6' />
          Contact Us
        </CardTitle>
        <p className='text-sm text-gray-600'>
          Have a question? We&apos;re here to help.
        </p>
      </CardHeader>

      <CardContent>
        <form onSubmit={form.handleSubmit} className='space-y-6'>
          <div>
            <label htmlFor='name' className='block text-sm font-medium text-gray-700 mb-2'>
              <User className='inline h-4 w-4 mr-1' />
              Full Name *
            </label>
            <Input
              id='name'
              {...form.register('name')}
              placeholder='John Doe'
              aria-invalid={form.hasError('name')}
              aria-describedby={form.hasError('name') ? 'name-error' : undefined}
            />
            {form.hasError('name') && (
              <FormError
                id='name-error'
                message={form.getFieldError('name') || ''}
                variant='inline'
              />
            )}
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label htmlFor='email' className='block text-sm font-medium text-gray-700 mb-2'>
                <Mail className='inline h-4 w-4 mr-1' />
                Email Address *
              </label>
              <Input
                id='email'
                type='email'
                {...form.register('email')}
                placeholder='john@example.com'
                aria-invalid={form.hasError('email')}
                aria-describedby={form.hasError('email') ? 'email-error' : undefined}
              />
              {form.hasError('email') && (
                <FormError
                  id='email-error'
                  message={form.getFieldError('email') || ''}
                  variant='inline'
                />
              )}
            </div>

            <div>
              <label htmlFor='phone' className='block text-sm font-medium text-gray-700 mb-2'>
                <Phone className='inline h-4 w-4 mr-1' />
                Phone Number (optional)
              </label>
              <Input
                id='phone'
                type='tel'
                {...form.register('phone')}
                placeholder='+1 (555) 123-4567'
                aria-invalid={form.hasError('phone')}
                aria-describedby={form.hasError('phone') ? 'phone-error' : undefined}
              />
              {form.hasError('phone') && (
                <FormError
                  id='phone-error'
                  message={form.getFieldError('phone') || ''}
                  variant='inline'
                />
              )}
            </div>
          </div>

          <div>
            <label htmlFor='subject' className='block text-sm font-medium text-gray-700 mb-2'>
              Subject *
            </label>
            <Input
              id='subject'
              {...form.register('subject')}
              placeholder='How can we help you?'
              aria-invalid={form.hasError('subject')}
              aria-describedby={form.hasError('subject') ? 'subject-error' : undefined}
            />
            {form.hasError('subject') && (
              <FormError
                id='subject-error'
                message={form.getFieldError('subject') || ''}
                variant='inline'
              />
            )}
          </div>

          <div>
            <label htmlFor='message' className='block text-sm font-medium text-gray-700 mb-2'>
              Message *
            </label>
            <textarea
              id='message'
              {...form.register('message')}
              className='w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent resize-none'
              rows={6}
              placeholder='Tell us more about your inquiry...'
              aria-invalid={form.hasError('message')}
              aria-describedby={form.hasError('message') ? 'message-error' : undefined}
            />
            {form.hasError('message') && (
              <FormError
                id='message-error'
                message={form.errors.message || []}
                variant='inline'
              />
            )}
            <div className='text-xs text-gray-500 mt-1 text-right'>
              {form.values.message.length} / 2000 characters
            </div>
          </div>

          <div className='flex items-start'>
            <input
              id='consent'
              name='consent'
              type='checkbox'
              className='h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded mt-0.5'
              required
            />
            <label htmlFor='consent' className='ml-2 block text-sm text-gray-700'>
              I agree to be contacted regarding my inquiry and accept the{' '}
              <a href='/privacy' className='text-primary hover:text-primary/80'>
                Privacy Policy
              </a>
            </label>
          </div>

          <Button
            type='submit'
            className='w-full'
            size='lg'
            disabled={form.isSubmitting || !form.isValid}
          >
            {form.isSubmitting ? (
              <>
                <LoadingSpinner size='sm' className='mr-2' />
                Sending...
              </>
            ) : (
              <>
                <Send className='h-5 w-5 mr-2' />
                Send Message
              </>
            )}
          </Button>

          <p className='text-xs text-gray-500 text-center'>
            * Required fields
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
