'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDown, Menu, X } from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Prevent background scrolling when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    { label: 'HOME', href: '/' },
    { label: 'ABOUT US', href: '/about' },
    // { 
    //   label: 'ABOUT US', 
    //   href: '/about',
    //   hasDropdown: true,
    //   subLinks: [
    //     { label: 'Contact Us', href: '/contactus' }
    //   ]
    // },
    { label: 'OUR PROGRAMS', href: '/program' },
    { 
      label: 'PARTNERS', 
      href: '/partner', 
      hasDropdown: true, 
      subLinks: [
        { label: 'Become a Partner', href: '/join' },
        { label: 'Current Partners', href: '/partners' }
      ]
    },
    { label: 'GALLERY', href: '/gallery' },
    { label: 'ENROLL', href: '/enroll' },
  ];

  const toggleDropdown = (label: string) => {
    setActiveDropdown(activeDropdown === label ? null : label);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setActiveDropdown(null);
  };

  const handleMobileToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setMobileMenuOpen((open) => !open);
  };

  return (
    <header className="sticky top-0 z-[100] h-[74px] border-b border-[#2b2b2b] bg-black">
      <div className="mx-auto h-full max-w-[1440px] px-[84px] max-[1200px]:px-[28px]">
        <div className="grid h-full grid-cols-[120px_1fr_210px] items-center max-lg:flex max-lg:justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center" onClick={closeMobileMenu}>
            <div className="flex h-[58px] w-[108px] items-center justify-center">
                <img src="/images/logo.png" alt="Logo" className="h-full w-full object-contain" />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden h-full items-center justify-center gap-[22px] lg:flex">
            {navLinks.map((link) => (
              <div key={link.label} className="group relative flex h-full items-center">
                {link.hasDropdown ? (
                  <div className="flex h-full items-center gap-[4px]">
                    <Link
                      href={link.href}
                      className="flex h-full items-center text-[11px] font-bold uppercase leading-none tracking-[0.02em] text-white transition-colors hover:text-[#F4B400]"
                    >
                      {link.label}
                    </Link>
                    <button
                      onClick={() => toggleDropdown(link.label)}
                      className="flex h-full items-center"
                    >
                      <ChevronDown
                        className={`h-[10px] w-[10px] text-white transition-transform ${
                          activeDropdown === link.label ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                  </div>
                ) : (
                  <Link
                    href={link.href}
                    className={`flex h-full items-center text-[11px] font-bold uppercase leading-none tracking-[0.02em] transition-colors hover:text-[#F4B400] ${link.href === '/' ? 'text-[#F4B400]' : 'text-white'}`}
                  >
                    {link.label}
                  </Link>
                )}

                {/* Sub-menu for Desktop */}
                {link.hasDropdown && activeDropdown === link.label && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setActiveDropdown(null)} />
                    <div className="absolute left-0 mt-4 w-48 bg-[#1a1a1a] border border-gray-800 rounded shadow-xl z-20">
                      {link.subLinks?.map((sub) => (
                        <Link 
                          key={sub.label} 
                          href={sub.href}
                          className="block px-4 py-3 text-[12px] text-white hover:bg-gray-800 hover:text-[#F4B400] uppercase font-bold"
                          onClick={() => setActiveDropdown(null)}
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ))}
          </nav>

          {/* Right Side */}
          <div className="flex items-center justify-end gap-[10px]">
            <Link
              href="/donate"
              className="flex h-[38px] w-[88px] items-center justify-center rounded-[2px] bg-[#F4B400] text-[13px] font-bold text-white transition-all hover:bg-white hover:text-black"
              onClick={closeMobileMenu}
            >
              Donate
            </Link>

            {/* Auth Dropdown (Desktop Only) */}
            <div className="relative hidden lg:block">
              <div 
                className="flex h-[38px] w-[104px] cursor-pointer items-center justify-center gap-[8px] rounded-[2px] border border-[#F4B400] text-[13px] font-bold text-white transition-colors hover:text-[#F4B400]"
                onClick={() => toggleDropdown('signin')}
              >
                <span>Sign In</span>
                <ChevronDown className={`h-[12px] w-[12px] transition-transform ${activeDropdown === 'signin' ? 'rotate-180' : ''}`} />
              </div>

              {activeDropdown === 'signin' && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setActiveDropdown(null)} />
                  <div className="absolute right-0 mt-4 w-40 bg-[#1a1a1a] border border-gray-800 rounded shadow-xl z-20">
                    <Link href="/studentpanel/loginform" className="block px-4 py-3 text-sm text-white hover:bg-gray-800" onClick={() => setActiveDropdown(null)}>Login</Link>
                    <Link href="/studentpanel/loginform" className="block px-4 py-3 text-sm text-white hover:bg-gray-800" onClick={() => setActiveDropdown(null)}>Register</Link>
                  </div>
                </>
              )}
            </div>
            
            {/* Hamburger Button - Fixed for Mobile Touch */}
            <button 
              className="lg:hidden text-white p-3 -mr-2 z-[110] relative flex items-center justify-center touch-manipulation" 
              onClick={handleMobileToggle}
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Content */}
      {mobileMenuOpen && (
        <div className="fixed inset-x-0 bottom-0 top-[74px] z-[105] overflow-y-auto overscroll-none border-t border-gray-800 bg-black lg:hidden">
          <nav className="flex flex-col p-6 gap-6">
            {navLinks.map((link) => (
              <div key={link.label} className="border-b border-gray-900 pb-4">
                {link.hasDropdown ? (
                  <>
                    <button 
                      className="flex justify-between items-center w-full text-white font-bold text-[16px] uppercase py-2"
                      onClick={() => toggleDropdown(link.label)}
                    >
                      {link.label}
                      <ChevronDown className={`w-5 h-5 transition-transform ${activeDropdown === link.label ? 'rotate-180' : ''}`} />
                    </button>
                    {activeDropdown === link.label && (
                      <div className="flex flex-col pl-4 mt-4 gap-4 border-l-2 border-[#F4B400]">
                        {link.subLinks?.map(sub => (
                          <Link 
                            key={sub.label} 
                            href={sub.href} 
                            className="text-gray-300 text-[14px] font-medium py-1" 
                            onClick={closeMobileMenu}
                          >
                            {sub.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link 
                    href={link.href} 
                    className="block text-white font-bold text-[16px] uppercase py-2"
                    onClick={closeMobileMenu}
                  >
                    {link.label}
                  </Link>
                )}
              </div>
            ))}
            
            {/* Mobile Auth Links */}
            <div className="flex flex-col gap-4 mt-4 pt-4 border-t border-gray-800">
               <Link href="/studentpanel/loginform" className="text-white font-bold text-[16px] uppercase py-2" onClick={closeMobileMenu}>Login</Link>
               <Link href="/studentpanel/loginform" className="text-white font-bold text-[16px] uppercase py-2" onClick={closeMobileMenu}>Register</Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
