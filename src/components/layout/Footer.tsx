import Link from 'next/link';

import { Facebook, Globe, Home, Instagram, Twitter, Youtube } from 'lucide-react';

export function Footer() {
  return (
    <footer className='relative bg-gray-100 border-t border-gray-200 mt-auto z-10'>
      <div className='container mx-auto px-4 py-12'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
          {/* Support */}
          <div>
            <h3 className='font-semibold text-gray-900 mb-4'>Support</h3>
            <ul className='space-y-3'>
              <li>
                <Link href='/help' className='text-gray-600 hover:text-gray-900 transition-colors'>
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  href='/safety'
                  className='text-gray-600 hover:text-gray-900 transition-colors'
                >
                  Safety information
                </Link>
              </li>
              <li>
                <Link
                  href='/cancellation'
                  className='text-gray-600 hover:text-gray-900 transition-colors'
                >
                  Cancellation options
                </Link>
              </li>
              <li>
                <Link
                  href='/report'
                  className='text-gray-600 hover:text-gray-900 transition-colors'
                >
                  Report a neighborhood concern
                </Link>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className='font-semibold text-gray-900 mb-4'>Community</h3>
            <ul className='space-y-3'>
              <li>
                <Link
                  href='/disaster-relief'
                  className='text-gray-600 hover:text-gray-900 transition-colors'
                >
                  Disaster relief
                </Link>
              </li>
              <li>
                <Link
                  href='/support-afghan'
                  className='text-gray-600 hover:text-gray-900 transition-colors'
                >
                  Support Afghan refugees
                </Link>
              </li>
              <li>
                <Link
                  href='/community'
                  className='text-gray-600 hover:text-gray-900 transition-colors'
                >
                  Combating discrimination
                </Link>
              </li>
            </ul>
          </div>

          {/* Hosting */}
          <div>
            <h3 className='font-semibold text-gray-900 mb-4'>Hosting</h3>
            <ul className='space-y-3'>
              <li>
                <Link href='/host' className='text-gray-600 hover:text-gray-900 transition-colors'>
                  Try hosting
                </Link>
              </li>
              <li>
                <Link
                  href='/responsible-hosting'
                  className='text-gray-600 hover:text-gray-900 transition-colors'
                >
                  Responsible hosting
                </Link>
              </li>
              <li>
                <Link
                  href='/host-resources'
                  className='text-gray-600 hover:text-gray-900 transition-colors'
                >
                  Host resources
                </Link>
              </li>
              <li>
                <Link
                  href='/community-center'
                  className='text-gray-600 hover:text-gray-900 transition-colors'
                >
                  Community Center
                </Link>
              </li>
            </ul>
          </div>

          {/* RentEasy */}
          <div>
            <h3 className='font-semibold text-gray-900 mb-4'>RentEasy</h3>
            <ul className='space-y-3'>
              <li>
                <Link href='/about' className='text-gray-600 hover:text-gray-900 transition-colors'>
                  About
                </Link>
              </li>
              <li>
                <Link
                  href='/newsroom'
                  className='text-gray-600 hover:text-gray-900 transition-colors'
                >
                  Newsroom
                </Link>
              </li>
              <li>
                <Link
                  href='/careers'
                  className='text-gray-600 hover:text-gray-900 transition-colors'
                >
                  Careers
                </Link>
              </li>
              <li>
                <Link
                  href='/investors'
                  className='text-gray-600 hover:text-gray-900 transition-colors'
                >
                  Investors
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <hr className='my-8 border-gray-200' />

        {/* Bottom Section */}
        <div className='flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0'>
          {/* Left: Copyright and Links */}
          <div className='flex flex-col lg:flex-row items-center space-y-4 lg:space-y-0 lg:space-x-6'>
            <div className='flex items-center space-x-2'>
              <Home className='w-5 h-5 text-primary' />
              <span className='text-sm text-gray-600'>© 2024 RentEasy, Inc.</span>
            </div>

            <div className='flex flex-wrap justify-center lg:justify-start space-x-4'>
              <Link
                href='/privacy'
                className='text-sm text-gray-600 hover:text-gray-900 transition-colors'
              >
                Privacy
              </Link>
              <span className='text-gray-300'>·</span>
              <Link
                href='/terms'
                className='text-sm text-gray-600 hover:text-gray-900 transition-colors'
              >
                Terms
              </Link>
              <span className='text-gray-300'>·</span>
              <Link
                href='/sitemap'
                className='text-sm text-gray-600 hover:text-gray-900 transition-colors'
              >
                Sitemap
              </Link>
              <span className='text-gray-300'>·</span>
              <Link
                href='/company-details'
                className='text-sm text-gray-600 hover:text-gray-900 transition-colors'
              >
                Company details
              </Link>
            </div>
          </div>

          {/* Right: Language and Social */}
          <div className='flex items-center space-x-4'>
            {/* Language Selector */}
            <div className='flex items-center space-x-2'>
              <Globe className='w-4 h-4 text-gray-600' />
              <span className='text-sm text-gray-600'>English (US)</span>
              <span className='text-sm text-gray-600'>$ USD</span>
            </div>

            {/* Social Media */}
            <div className='flex items-center space-x-3'>
              <Link
                href='https://facebook.com'
                target='_blank'
                rel='noopener noreferrer'
                className='text-gray-600 hover:text-gray-900 transition-colors'
              >
                <Facebook className='w-5 h-5' />
              </Link>
              <Link
                href='https://twitter.com'
                target='_blank'
                rel='noopener noreferrer'
                className='text-gray-600 hover:text-gray-900 transition-colors'
              >
                <Twitter className='w-5 h-5' />
              </Link>
              <Link
                href='https://instagram.com'
                target='_blank'
                rel='noopener noreferrer'
                className='text-gray-600 hover:text-gray-900 transition-colors'
              >
                <Instagram className='w-5 h-5' />
              </Link>
              <Link
                href='https://youtube.com'
                target='_blank'
                rel='noopener noreferrer'
                className='text-gray-600 hover:text-gray-900 transition-colors'
              >
                <Youtube className='w-5 h-5' />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
