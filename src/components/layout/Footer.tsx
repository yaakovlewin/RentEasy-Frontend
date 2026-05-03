import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { Facebook, Globe, Home, Instagram, Twitter, Youtube } from 'lucide-react';

type NavLink = {
  readonly href: string;
  readonly label: string;
};

type NavSection = {
  readonly title: string;
  readonly links: readonly NavLink[];
};

type SocialLink = {
  readonly href: string;
  readonly icon: LucideIcon;
  readonly label: string;
};

const FOOTER_SECTIONS: readonly NavSection[] = [
  {
    title: 'Support',
    links: [
      { href: '/help', label: 'Help Center' },
      { href: '/safety', label: 'Safety information' },
      { href: '/cancellation', label: 'Cancellation options' },
      { href: '/report', label: 'Report a neighborhood concern' },
    ],
  },
  {
    title: 'Community',
    links: [
      { href: '/disaster-relief', label: 'Disaster relief' },
      { href: '/support-afghan', label: 'Support Afghan refugees' },
      { href: '/community', label: 'Combating discrimination' },
    ],
  },
  {
    title: 'Hosting',
    links: [
      { href: '/host', label: 'Try hosting' },
      { href: '/responsible-hosting', label: 'Responsible hosting' },
      { href: '/host-resources', label: 'Host resources' },
      { href: '/community-center', label: 'Community Center' },
    ],
  },
  {
    title: 'RentEasy',
    links: [
      { href: '/about', label: 'About' },
      { href: '/newsroom', label: 'Newsroom' },
      { href: '/careers', label: 'Careers' },
      { href: '/investors', label: 'Investors' },
    ],
  },
] as const;

const LEGAL_LINKS: readonly NavLink[] = [
  { href: '/privacy', label: 'Privacy' },
  { href: '/terms', label: 'Terms' },
  { href: '/sitemap', label: 'Sitemap' },
  { href: '/company-details', label: 'Company details' },
] as const;

const SOCIAL_LINKS: readonly SocialLink[] = [
  { href: 'https://facebook.com', icon: Facebook, label: 'Facebook' },
  { href: 'https://twitter.com', icon: Twitter, label: 'Twitter' },
  { href: 'https://instagram.com', icon: Instagram, label: 'Instagram' },
  { href: 'https://youtube.com', icon: Youtube, label: 'YouTube' },
] as const;

const LINK_STYLES = 'text-gray-600 hover:text-gray-900 transition-colors' as const;

const FooterLink = ({ href, label, className = LINK_STYLES }: NavLink & { className?: string }) => (
  <Link href={href} className={className}>
    {label}
  </Link>
);

const FooterSection = ({ title, links }: NavSection) => (
  <div>
    <h3 className='font-semibold text-gray-900 mb-4'>{title}</h3>
    <ul className='space-y-3'>
      {links.map(({ href, label }) => (
        <li key={href}>
          <FooterLink href={href} label={label} />
        </li>
      ))}
    </ul>
  </div>
);

const SocialIcon = ({ href, icon: Icon, label }: SocialLink) => (
  <Link
    href={href}
    target='_blank'
    rel='noopener noreferrer'
    className={LINK_STYLES}
    aria-label={label}
  >
    <Icon className='w-5 h-5' />
  </Link>
);

const LegalLinks = ({ links }: { readonly links: readonly NavLink[] }) => (
  <div className='flex flex-wrap justify-center lg:justify-start space-x-4'>
    {links.flatMap((link, index) => [
      index > 0 && <span key={`separator-${link.href}`} className='text-gray-300'>·</span>,
      <FooterLink key={link.href} href={link.href} label={link.label} className='text-sm text-gray-600 hover:text-gray-900 transition-colors' />,
    ]).filter(Boolean)}
  </div>
);

const Copyright = () => (
  <div className='flex items-center space-x-2'>
    <Home className='w-5 h-5 text-primary' />
    <span className='text-sm text-gray-600'>© 2024 RentEasy, Inc.</span>
  </div>
);

const LanguageSelector = () => (
  <div className='flex items-center space-x-2'>
    <Globe className='w-4 h-4 text-gray-600' />
    <span className='text-sm text-gray-600'>English (US)</span>
    <span className='text-sm text-gray-600'>$ USD</span>
  </div>
);

const SocialLinks = ({ links }: { readonly links: readonly SocialLink[] }) => (
  <div className='flex items-center space-x-3'>
    {links.map((link) => (
      <SocialIcon key={link.href} {...link} />
    ))}
  </div>
);

export function Footer() {
  return (
    <footer className='relative bg-gray-100 border-t border-gray-200 mt-auto z-10'>
      <div className='container mx-auto px-4 py-12'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
          {FOOTER_SECTIONS.map((section) => (
            <FooterSection key={section.title} {...section} />
          ))}
        </div>

        <hr className='my-8 border-gray-200' />

        <div className='flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0'>
          <div className='flex flex-col lg:flex-row items-center space-y-4 lg:space-y-0 lg:space-x-6'>
            <Copyright />
            <LegalLinks links={LEGAL_LINKS} />
          </div>

          <div className='flex items-center space-x-4'>
            <LanguageSelector />
            <SocialLinks links={SOCIAL_LINKS} />
          </div>
        </div>
      </div>
    </footer>
  );
}
