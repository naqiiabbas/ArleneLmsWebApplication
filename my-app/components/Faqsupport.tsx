import React from 'react';
import Image from 'next/image';
import { Poppins } from 'next/font/google';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
});

const HelpCenterSection = () => {
  const contactMethods = [
    {
      title: 'Call Support',
      description: 'Monday - Friday',
      details: '09 AM To 05 PM',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      ),
    },
    {
      title: 'Email Us',
      description: 'We Are Well Known Within The Industry',
      details: 'For Our Technical Capabilities',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      ),
    },
    {
      title: 'Address',
      description: '4517 Washington Ave. Manchester',
      details: 'Kentucky 39495',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      ),
    },
  ];

  const partners = [
    { name: 'CalPrivate Bank', src: '/images/faqimg1.png' },
    { name: 'African American Alliance Fund', src: '/images/faqimg2.png' },
    { name: 'Southern California Edison', src: '/images/faqimg3.png' },
    { name: 'Horizon Veterinary Specialists', src: '/images/faqimg4.png' },
  ];

  return (
    <section className={`${poppins.variable} font-sans bg-[#FDF9F3] py-20 px-6`}>
      <div className="max-w-7xl mx-auto">
        {/* Large Header Image */}
        <div className="relative w-full aspect-[21/9] mb-20 overflow-hidden rounded-[20px] border-[8px] border-[#F2E8D5]">
          <Image
            src="/images/faqsup.png"
            alt="Help Center Header"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Header Text */}
        <div className="mb-12">
          <h2 className="text-[36px] font-bold text-[#1A1A1A] mb-4">Still Need Help</h2>
          <p className="text-[#666666] text-[16px] max-w-2xl leading-relaxed">
            We Enjoy Adapting Our Strategies To Offer Every Client The Best Solutions That Are At The Forefront Of The Industry.
          </p>
        </div>

        {/* Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
          {contactMethods.map((method, index) => (
            <div key={index} className="bg-[#FAF6EF] rounded-[12px] p-10 flex flex-col items-center text-center shadow-sm">
              <div className="w-14 h-14 bg-[#F5A623] rounded-full flex items-center justify-center mb-6">
                {method.icon}
              </div>
              <h3 className="text-[20px] font-bold text-[#1A1A1A] mb-4">{method.title}</h3>
              <p className="text-[#666666] text-[14px] mb-1">{method.description}</p>
              <p className="text-[#666666] text-[14px] font-medium">{method.details}</p>
            </div>
          ))}
        </div>

        {/* Partner Logos */}
        <div className="flex flex-wrap justify-between items-center gap-12">
          {partners.map((partner, index) => (
            <div key={index} className="relative w-48 h-16 grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
              <Image
                src={partner.src}
                alt={partner.name}
                fill
                className="object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HelpCenterSection;