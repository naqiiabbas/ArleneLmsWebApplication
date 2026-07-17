import React from 'react';
import Image from 'next/image';
import { Poppins } from 'next/font/google';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
});

const MentorshipProgramSection = () => {
  return (
    <section className={`${poppins.variable} font-sans bg-white`}>
      {/* Hero Header */}
      <div className="relative h-[300px] w-full flex flex-col items-center justify-center text-white overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/mentor1.png" // Derived from background visual in
            alt="Mentorship & Membership"
            fill
            className="object-cover brightness-50"
            priority
          />
        </div>
        <div className="relative z-10 text-center px-4">
          <nav className="text-[14px] mb-4 flex justify-center items-center gap-1 opacity-90">
            <span>Home</span>
            <span>/</span>
            <span>Student</span>
          </nav>
          <h1 className="text-[36px] md:text-[48px] font-bold leading-tight mb-2">
            Mentorship & Membership
          </h1>
          <p className="text-[14px] md:text-[16px] max-w-2xl mx-auto opacity-90">
            Join our community of mentors and members making a lasting impact on students&apos; lives.
          </p>
        </div>
      </div>

      {/* Program Details Section */}
      <div className="max-w-7xl mx-auto py-16 px-6 md:px-12 lg:px-24">
        <div className="flex flex-col items-center mb-12">
          <div className="flex items-center gap-3 mb-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="#F9A825" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8.5 11C10.7091 11 12.5 9.20914 12.5 7C12.5 4.79086 10.7091 3 8.5 3C6.29086 3 4.5 4.79086 4.5 7C4.5 9.20914 6.29086 11 8.5 11Z" stroke="#F9A825" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M23 21V19C22.9993 18.1137 22.7044 17.2522 22.1614 16.5523C21.6184 15.8524 20.8581 15.3516 20 15.12" stroke="#F9A825" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M17 3.12C17.8626 3.35019 18.6273 3.85191 19.174 4.55323C19.7206 5.25454 20.0193 6.11893 20.02 7.008C20.0207 7.89707 19.7234 8.7628 19.178 9.46554C18.6326 10.1683 17.8691 10.672 17.007 10.904" stroke="#F9A825" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <h2 className="text-[28px] md:text-[32px] font-bold text-[#1A1A1A]">Mentorship Program</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1: Why Become a Mentor? */}
          <div className="bg-[#F8F9FA] rounded-[16px] p-8 shadow-sm">
            <h3 className="text-[20px] font-bold text-[#1A1A1A] mb-4">Why Become a Mentor?</h3>
            <p className="text-[#666666] text-[14px] leading-relaxed mb-6">
              As a mentor, you have the unique opportunity to shape the future by guiding, inspiring, and empowering the next generation. Your experience, knowledge, and support can make a profound difference in a student&apos;s life.
            </p>
            <ul className="space-y-4">
              {[
                'Make a meaningful impact on a student\'s life',
                'Develop your leadership and coaching skills',
                'Give back to your community',
                'Expand your professional network',
                'Gain fresh perspectives and insights'
              ].map((text, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="mt-1 flex-shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10" stroke="#F9A825" strokeWidth="2"/>
                      <path d="M8 12L11 15L16 9" stroke="#F9A825" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span className="text-[#1A1A1A] text-[14px] font-medium">{text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Card 2: Mentor Requirements */}
          <div className="bg-[#F8F9FA] rounded-[16px] p-8 shadow-sm">
            <h3 className="text-[20px] font-bold text-[#1A1A1A] mb-6">Mentor Requirements</h3>
            <ul className="space-y-6">
              {[
                'At least 3 years of professional experience',
                'Commitment of 2-4 hours per month',
                'Strong communication and interpersonal skills',
                'Passion for helping students succeed',
                'Complete background check',
                'Attend mentor orientation and training'
              ].map((text, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="mt-1 flex-shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="#F9A825" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span className="text-[#666666] text-[14px] leading-tight">{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MentorshipProgramSection;