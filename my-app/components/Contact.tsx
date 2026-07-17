'use client';

import React from 'react';
import { MapPin, Mail } from 'lucide-react';
import { Poppins } from 'next/font/google';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
});

const ContactSection = () => {
  return (
    <section className={`${poppins.variable} bg-white px-6 py-[80px] font-sans md:px-12 lg:px-24`}>
      <div className="mx-auto grid max-w-[1120px] grid-cols-1 items-start gap-[80px] lg:grid-cols-[390px_1fr]">
        
        {/* Left Column: Contact Info */}
        <div className="flex flex-col pt-[68px]">
          <h2 className="mb-[28px] text-[26px] font-bold text-black">Contact Us</h2>
          
          <div className="space-y-[28px]">
            {/* Address Item */}
            <div className="flex items-start gap-[14px]">
              <div className="flex h-[40px] w-[40px] flex-shrink-0 items-center justify-center rounded-full bg-[#F4B400]">
                <MapPin className="h-[17px] w-[17px] text-black" />
              </div>
              <div>
                <h3 className="mb-[6px] text-[15px] font-bold text-black">Address</h3>
                <p className="text-[12px] leading-relaxed text-[#666666]">
                  100 Spectrum Center Dr, Irvine, CA 92618, USA
                </p>
              </div>
            </div>

            {/* Email Item */}
            <div className="flex items-start gap-[14px]">
              <div className="flex h-[40px] w-[40px] flex-shrink-0 items-center justify-center rounded-full bg-[#F4B400]">
                <Mail className="h-[17px] w-[17px] text-black" />
              </div>
              <div>
                <h3 className="mb-[6px] text-[15px] font-bold text-black">Email Now</h3>
                <p className="text-[12px] leading-relaxed text-[#666666]">
                  Write us an inquiry<br />
                  info@100bmoc.org
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Contact Form */}
        <div className="rounded-[6px] bg-white p-[28px] shadow-[0_4px_22px_rgba(0,0,0,0.14)] md:p-[34px]">
          <div className="mb-[22px] text-center">
            <span className="mb-[2px] block text-[10px] font-bold uppercase tracking-wider text-[#F4B400]">
              QUESTIONS?
            </span>
            <h2 className="mb-[4px] text-[24px] font-bold text-black">Reach Out</h2>
            <p className="text-[12px] text-[#666666]">Partner with us for a brighter tomorrow</p>
          </div>

          <form className="space-y-[12px]">
            <div className="space-y-[5px]">
              <label className="block text-[12px] font-bold text-black">Full Name</label>
              <input
                type="text"
                placeholder="Enter your full name"
                className="h-[40px] w-full rounded-[2px] border-none bg-[#F5F5F5] px-[14px] text-[12px] text-[#666666] outline-none placeholder:text-[#BBBBBB] focus:ring-2 focus:ring-[#F4B400]"
              />
            </div>

            <div className="space-y-[5px]">
              <label className="block text-[12px] font-bold text-black">Email</label>
              <input
                type="email"
                placeholder="Ex: sarah.garcia@email.com"
                className="h-[40px] w-full rounded-[2px] border-none bg-[#F5F5F5] px-[14px] text-[12px] text-[#666666] outline-none placeholder:text-[#BBBBBB] focus:ring-2 focus:ring-[#F4B400]"
              />
            </div>

            <div className="space-y-[5px]">
              <label className="block text-[12px] font-bold text-black">Phone</label>
              <input
                type="tel"
                placeholder="Enter your phone"
                className="h-[40px] w-full rounded-[2px] border-none bg-[#F5F5F5] px-[14px] text-[12px] text-[#666666] outline-none placeholder:text-[#BBBBBB] focus:ring-2 focus:ring-[#F4B400]"
              />
            </div>

            <div className="space-y-[5px]">
              <label className="block text-[12px] font-bold text-black">Message</label>
              <textarea
                placeholder="Write your message"
                rows={5}
                className="w-full resize-none rounded-[2px] border-none bg-[#F5F5F5] px-[14px] py-[10px] text-[12px] text-[#666666] outline-none placeholder:text-[#BBBBBB] focus:ring-2 focus:ring-[#F4B400]"
              ></textarea>
            </div>

            <div className="flex justify-center pt-[12px]">
              <button
                type="submit"
                className="h-[36px] w-[140px] rounded-[2px] border border-black text-[12px] font-semibold text-black transition-all duration-300 hover:bg-black hover:text-white"
              >
                Send
              </button>
            </div>
          </form>
        </div>

      </div>
    </section>
  );
};

export default ContactSection;
