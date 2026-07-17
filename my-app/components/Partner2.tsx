import React from 'react';
import Image from 'next/image';
import { Poppins } from 'next/font/google';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
});

const WaysToGiveSection = () => {
  const donationOptions = [
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F4B400" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 12 20 22 4 22 4 12"></polyline>
          <rect x="2" y="7" width="20" height="5"></rect>
          <line x1="12" y1="22" x2="12" y2="7"></line>
          <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path>
          <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path>
        </svg>
      ),
      title: "Make a One-Time Donation",
      description: "Every dollar helps us expand our reach and deepen our impact.",
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F4B400" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      ),
      title: "Become a Monthly Supporter",
      description: "Sustained giving allows us to plan, grow, and serve more young men year-round.",
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F4B400" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
          <line x1="9" y1="22" x2="9" y2="2"></line>
          <line x1="15" y1="22" x2="15" y2="2"></line>
          <line x1="4" y1="6" x2="20" y2="6"></line>
          <line x1="4" y1="10" x2="20" y2="10"></line>
          <line x1="4" y1="14" x2="20" y2="14"></line>
          <line x1="4" y1="18" x2="20" y2="18"></line>
        </svg>
      ),
      title: "Corporate & Foundation Partnerships",
      description: "Align your organization with a proven, community-based program delivering measurable results.",
    },
  ];

  return (
    <section className={`${poppins.variable} font-sans bg-white py-16 px-6 md:px-12 lg:px-20`}>
      <div className="max-w-7xl mx-auto">
        {/* Header Content */}
        <div className="text-center mb-12">
          <h2 className="text-[#0F172A] text-3xl md:text-4xl font-bold mb-4">
            Ways to Give
          </h2>
          <p className="text-gray-500 text-[15px] max-w-3xl mx-auto">
            Corporate partnerships amplify impact and create meaningful connections with communities.
          </p>
        </div>

        {/* Top Image Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-sm">
            <Image
              src="/images/partnerimg2.jpg"
              alt="Students in classroom"
              fill
              className="object-cover"
            />
          </div>
          <div className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-sm">
            <Image
              src="/images/partnerimg3.jpg"
              alt="Volunteer outdoors"
              fill
              className="object-cover"
            />
          </div>
          <div className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-sm">
            <Image
              src="/images/partnerimg4.png"
              alt="Community event"
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Donation Options Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {donationOptions.map((option, index) => (
            <div 
              key={index} 
              className="bg-white p-8 rounded-xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.05)] flex flex-col items-start text-left"
            >
              <div className="mb-4">
                {option.icon}
              </div>
              <h3 className="text-[#0F172A] text-[18px] font-bold mb-3 leading-tight">
                {option.title}
              </h3>
              <p className="text-gray-500 text-[14px] leading-relaxed">
                {option.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WaysToGiveSection;