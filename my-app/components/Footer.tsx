'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Poppins } from 'next/font/google';
import { ArrowRight, Calendar, Mail, Phone } from 'lucide-react';
import { FaFacebookF, FaLinkedinIn, FaTwitter, FaYoutube } from 'react-icons/fa';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
});

const quickLinks = [
  { name: 'About Us', href: '/about' },
  { name: 'Our Services', href: '/program' },
  { name: 'Our Blogs', href: '/blogs' },
  { name: "FAQ'S", href: '/faq' },
  { name: 'Contact Us', href: '/contact-us' },
];

const recentPosts = [
  {
    date: 'May 12, 2025',
    title: 'There are many variations of passages of',
    image: '/images/post1.jpg',
    href: '/gallery',
  },
  {
    date: 'May 12, 2025',
    title: 'There are many variations of passages of',
    image: '/images/post2.jpg',
    href: '/gallery',
  },
];

const Footer = () => {
  return (
    <footer className={`${poppins.variable} bg-black font-sans text-white`}>
      <div className="mx-auto max-w-[1260px] px-6 pb-[44px] pt-[50px]">
        <div className="grid grid-cols-1 gap-[46px] md:grid-cols-2 lg:grid-cols-[1.25fr_0.8fr_1fr_1.2fr]">
          <div className="space-y-[18px]">
            <Link href="/" className="inline-block">
              <div className="relative h-[70px] w-[92px]">
                <Image src="/images/logo.png" alt="100 Black Men of Orange County" fill className="object-contain" />
              </div>
            </Link>
            <p className="max-w-[260px] text-[12px] leading-relaxed text-[#A1A1A1]">
              Phasellus ultricies aliquam volutpat ullamcorper laoreet neque, a lacinia curabitur lacinia mollis
            </p>
            <div className="flex gap-[10px]">
              {[FaFacebookF, FaTwitter, FaLinkedinIn, FaYoutube].map((Icon, idx) => (
                <Link
                  key={idx}
                  href="#"
                  className="flex h-[28px] w-[28px] items-center justify-center rounded bg-[#1A1A1A] transition-colors hover:bg-[#F4B400] hover:text-black"
                >
                  <Icon size={12} />
                </Link>
              ))}
            </div>
            <div className="flex gap-[12px] pt-[4px]">
              <div className="relative flex h-[34px] w-[72px] items-center justify-center rounded bg-white/10">
                <span className="text-[9px] text-gray-400">Authorize.Net</span>
              </div>
              <div className="relative flex h-[34px] w-[72px] items-center justify-center rounded bg-white/10">
                <span className="text-[9px] text-gray-400">PayPal</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-[22px] text-[15px] font-bold">Quick Links</h3>
            <ul className="space-y-[12px]">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="group flex items-center text-[12px] text-[#A1A1A1] hover:text-[#F4B400]">
                    <span className="mr-2 font-bold text-[#F4B400]">&raquo;</span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-[22px] text-[15px] font-bold">Recent Posts</h3>
            <div className="space-y-[16px]">
              {recentPosts.map((post, idx) => (
                <div key={idx} className="flex gap-[12px]">
                  <Link href={post.href} className="group relative h-[48px] w-[58px] flex-shrink-0 overflow-hidden rounded bg-gray-800">
                    <Image src={post.image} alt={post.title} fill className="object-cover transition-transform group-hover:scale-110" />
                  </Link>
                  <div className="space-y-[4px]">
                    <div className="flex items-center gap-1 text-[10px] text-[#A1A1A1]">
                      <Calendar size={10} className="text-[#F4B400]" />
                      {post.date}
                    </div>
                    <Link href={post.href} className="line-clamp-2 text-[12px] font-medium leading-tight hover:text-[#F4B400]">
                      {post.title}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-[22px] text-[15px] font-bold">Contact Us</h3>
            <div className="space-y-[16px]">
              <div className="flex items-center gap-[10px] text-[12px] text-[#A1A1A1]">
                <Mail size={14} className="text-white" />
                info@100bmoc.org
              </div>
              <div className="flex items-center gap-[10px] text-[12px] text-[#A1A1A1]">
                <Phone size={14} className="text-white" />
                (714) 543-1000
              </div>

              <div className="space-y-[12px] pt-[10px]">
                <form className="flex overflow-hidden rounded" onSubmit={(event) => event.preventDefault()}>
                  <input
                    type="email"
                    placeholder="Your Email Address"
                    className="h-[38px] w-full bg-white px-[12px] text-[12px] text-black outline-none"
                    required
                  />
                  <button type="submit" className="flex items-center justify-center bg-[#F4B400] px-[12px] text-black transition-colors hover:bg-white">
                    <ArrowRight size={16} />
                  </button>
                </form>
                <label className="flex cursor-pointer items-start gap-[8px]">
                  <input type="checkbox" className="mt-[3px] accent-[#F4B400]" required />
                  <span className="text-[11px] text-[#A1A1A1]">
                    I agree with the <Link href="/about" className="underline hover:text-white">Privacy Policy</Link>
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#F4B400] px-6 py-[14px] text-black">
        <div className="mx-auto flex max-w-[1260px] flex-col items-center justify-between text-[12px] font-medium md:flex-row">
          <p>© 2025 100bmoc. All rights reserved</p>
          <div className="mt-4 flex gap-[34px] md:mt-0">
            <Link href="/about" className="hover:underline">Terms & Conditions</Link>
            <Link href="/about" className="hover:underline">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
