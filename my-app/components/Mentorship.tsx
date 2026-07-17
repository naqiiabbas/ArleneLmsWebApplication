import React from 'react';
import { Poppins } from 'next/font/google';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
});

const MentorshipMembershipSection = () => {
  return (
    <section className={`${poppins.variable} font-sans bg-white py-16 px-6 md:px-12 lg:px-20 max-w-7xl mx-auto`}>
      
      {/* How Mentorship Works Section */}
      <div className="mb-24">
        <h2 className="text-center text-[32px] md:text-[36px] font-bold text-[#1A1A1A] mb-12">
          How Mentorship Works
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="border border-[#E5E7EB] rounded-[20px] p-8 text-center flex flex-col items-center">
            <div className="w-14 h-14 bg-[#F9A825] rounded-full flex items-center justify-center text-[24px] font-bold text-[#1A1A1A] mb-6">
              1
            </div>
            <h3 className="text-[20px] font-bold text-[#1A1A1A] mb-4">Apply</h3>
            <p className="text-[#666666] text-[14px] leading-relaxed">
              Submit your application and tell us about your background, interests, and why you want to be a mentor.
            </p>
          </div>

          {/* Step 2 */}
          <div className="border border-[#E5E7EB] rounded-[20px] p-8 text-center flex flex-col items-center">
            <div className="w-14 h-14 bg-[#F9A825] rounded-full flex items-center justify-center text-[24px] font-bold text-[#1A1A1A] mb-6">
              2
            </div>
            <h3 className="text-[20px] font-bold text-[#1A1A1A] mb-4">Review</h3>
            <p className="text-[#666666] text-[14px] leading-relaxed">
              Our team reviews your application, conducts an interview, and completes background verification.
            </p>
          </div>

          {/* Step 3 */}
          <div className="border border-[#E5E7EB] rounded-[20px] p-8 text-center flex flex-col items-center">
            <div className="w-14 h-14 bg-[#F9A825] rounded-full flex items-center justify-center text-[24px] font-bold text-[#1A1A1A] mb-6">
              3
            </div>
            <h3 className="text-[20px] font-bold text-[#1A1A1A] mb-4">Join</h3>
            <p className="text-[#666666] text-[14px] leading-relaxed">
              Complete orientation, get matched with a mentee, and begin making a difference in their educational journey.
            </p>
          </div>
        </div>
      </div>

      {/* Membership Program Section */}
      <div>
        <div className="flex items-center justify-center gap-3 mb-12">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.501 5.501 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="#F9A825" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h2 className="text-[32px] md:text-[36px] font-bold text-[#1A1A1A]">Membership Program</h2>
        </div>

        <div className="flex flex-col lg:flex-row items-start gap-12">
          {/* Left Content */}
          <div className="w-full lg:w-1/2">
            <h3 className="text-[22px] font-bold text-[#1A1A1A] mb-4">Why Become a Member?</h3>
            <p className="text-[#666666] text-[16px] leading-relaxed">
              Membership in CommunityEd connects you with a passionate community of educators, professionals, and advocates committed to educational equity and student success.
            </p>
          </div>

          {/* Right Benefits Card */}
          <div className="w-full lg:w-1/2">
            <div className="bg-[#F9A825] rounded-[20px] p-8 md:p-10">
              <h4 className="text-[18px] font-bold text-[#1A1A1A] mb-6">Member Benefits Include:</h4>
              <ul className="space-y-4">
                {[
                  "Access to exclusive networking events",
                  "Professional development workshops",
                  "Members-only newsletter and resources",
                  "Volunteer opportunities",
                  "Recognition at annual gala",
                  "Vote on organizational initiatives"
                ].map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3 text-[#1A1A1A] text-[15px] font-medium leading-tight">
                    <span className="mt-1.5 w-1.5 h-1.5 bg-[#1A1A1A] rounded-full flex-shrink-0" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
};

export default MentorshipMembershipSection;