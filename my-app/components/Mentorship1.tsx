import React from 'react';
import { Poppins } from 'next/font/google';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
});

const CallToActionSection = () => {
  return (
    <section className={`${poppins.variable} font-sans bg-[#F9A825] py-20 px-6 md:px-12`}>
      <div className="max-w-4xl mx-auto text-center">
        {/* Heading and Subheading */}
        <h2 className="text-[#1A1A1A] text-[32px] md:text-[40px] font-bold mb-4">
          Ready to Get Started?
        </h2>
        <p className="text-[#1A1A1A] text-[16px] md:text-[18px] mb-12 opacity-90">
          Join our community today and start making a difference in students&apos; lives.
        </p>

        {/* Cards Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Mentor Card */}
          <div className="bg-white rounded-[16px] p-8 md:p-10 shadow-lg text-left flex flex-col items-start">
            <div className="mb-6 text-[#F9A825]">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </div>
            <h3 className="text-[#1A1A1A] text-[24px] font-bold mb-3">Apply as Mentor</h3>
            <p className="text-[#666666] text-[14px] leading-relaxed mb-8">
              Share your expertise and guide students toward success.
            </p>
            <button className="w-full bg-[#F9A825] hover:bg-[#e0961f] text-[#1A1A1A] font-bold py-4 rounded-[10px] transition-colors">
              Mentor Application
            </button>
          </div>

          {/* Member Card */}
          <div className="bg-white rounded-[16px] p-8 md:p-10 shadow-lg text-left flex flex-col items-start">
            <div className="mb-6 text-[#F9A825]">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
            </div>
            <h3 className="text-[#1A1A1A] text-[24px] font-bold mb-3">Become a Member</h3>
            <p className="text-[#666666] text-[14px] leading-relaxed mb-8">
              Join our community and support educational excellence.
            </p>
            <button className="w-full bg-[#F9A825] hover:bg-[#e0961f] text-[#1A1A1A] font-bold py-4 rounded-[10px] transition-colors">
              Membership Sign Up
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToActionSection;