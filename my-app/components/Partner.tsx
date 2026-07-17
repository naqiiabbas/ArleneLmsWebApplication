import React from 'react';
import Image from 'next/image';
import { Poppins } from 'next/font/google';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
});

const SupportImpactSection = () => {
  const impactPoints = [
    "Provide consistent, in-person mentoring twice each month",
    "Deliver academic enrichment and leadership development",
    "Teach financial literacy, career readiness, and life skills",
    "Offer college preparation, scholarships, and exposure to new opportunities",
    "Create a safe, structured environment where young men are seen, supported, and challenged to grow"
  ];

  return (
    <section className={`${poppins.variable} font-sans bg-white`}>
      {/* Dashboard / Video Hero Section */}
      <div className="relative w-full h-[300px] md:h-[450px] lg:h-[500px]">
        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent z-10" />
        
        {/* Background Dashboard Image */}
        <Image
          src="/images/mentor1.png" // Use your dashboard/video hero image path
          alt="Dashboard Hero"
          fill
          priority
          className="object-cover object-center"
        />

        {/* Centered Overlay Text */}
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-white px-6">
          <h1 className="text-3xl md:text-5xl font-bold">Video Pending</h1>
          {/* Breadcrumb Navigation */}
          <div className="absolute top-10 left-6 md:left-20">
            
          </div>
        </div>
      </div>

      {/* Why Your Support Matters Section */}
      <div className="py-16 px-6 md:px-12 lg:px-20 max-w-7xl mx-auto">
        {/* Header Content */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h2 className="text-black text-3xl md:text-4xl font-bold mb-6">
            Why Your Support Matters
          </h2>
          <div className="space-y-4 text-black text-[15px] leading-relaxed">
            <p>
              Most of the students we serve come from low-income families. Many are from single-parent homes. As Black students, they are small minorities at the schools they attend. This combination of circumstances often presents difficult challenges for these students. The 100BMOC believes that every one of these young men deserves guidance, opportunity, and a clear path to success.
            </p>
            <p className="font-medium">
              Your donation helps us provide that path
            </p>
          </div>
        </div>

        {/* Impact Content with Side Image */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h3 className="text-black text-2xl md:text-3xl font-bold mb-2">
              With your support, we are able to:
            </h3>
            <p className="text-gray-600 text-sm">
              Your investment creates lasting change in communities and individual lives.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            {/* List Column */}
            <div className="w-full lg:w-1/2 order-2 lg:order-1">
              <ul className="space-y-6">
                {impactPoints.map((point, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-black mt-1.5">•</span>
                    <span className="text-black text-[14px] leading-snug">
                      {point}
                    </span>
                  </li>
                ))}
              </ul>
              
              <div className="mt-10 pt-6 border-t border-gray-100">
                <p className="text-gray-500 text-[13px] italic leading-relaxed">
                  <span className="font-semibold text-gray-700 not-italic">The Impact of Your Giving:</span> When you invest in 100BMOC, you are not just supporting a program — you are changing lives
                </p>
              </div>
            </div>

            {/* Side Image Column */}
            <div className="w-full lg:w-1/2 order-1 lg:order-2">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <Image 
                  src="/images/partnerimg1.jpg" 
                  alt="Mentor speaking with students"
                  width={800}
                  height={500}
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SupportImpactSection;