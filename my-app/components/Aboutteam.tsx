import React from 'react';
import Image from 'next/image';
import { Poppins } from 'next/font/google';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
});

const teamMembers = [
  {
    name: 'Leonard John Davies',
    role: 'Cofounder, CEO',
    image: '/images/Abteam1.png', // Placeholder - paths would match project structure
  },
  {
    name: 'Francis Weber',
    role: 'Head of Authority',
    image: '/images/Abteam2.jpg',
  },
  {
    name: 'Kyla Obrien',
    role: 'Head of Authority',
    image: '/images/Abteam3.jpg',
  },
  {
    name: 'Adrian Dixon',
    role: 'Support Executive',
    image: '/images/Abteam4.jpg',
  }
];

const TeamSection = () => {
  return (
    <section className={`${poppins.variable} font-sans py-20 bg-white overflow-hidden`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center mb-16">
          <h2 className="text-[40px] font-bold text-[#1A202C] mb-4">Meet our team</h2>
          <p className="text-[#4A5568] text-[16px] max-w-2xl mx-auto leading-relaxed">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius 
            enim in eros elementum tristique.
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative flex items-center justify-center">
          {/* Navigation Arrows */}
          <button className="absolute left-0 z-10 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full px-12">
            {teamMembers.map((member, index) => (
              <div key={index} className="flex flex-col group">
                <div className="relative aspect-[4/5] w-full mb-6 rounded-[24px] overflow-hidden">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="space-y-1">
                  <h3 className="text-[20px] font-bold text-[#1A202C]">
                    {member.name}
                  </h3>
                  <p className="text-[#718096] text-[14px]">
                    {member.role}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <button className="absolute right-0 z-10 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center items-center gap-3 mt-12">
          <span className="w-3 h-3 rounded-full bg-[#F6AD55]" />
          <span className="w-2 h-2 rounded-full border border-[#F6AD55]" />
          <span className="w-2 h-2 rounded-full border border-[#F6AD55]" />
          <span className="w-2 h-2 rounded-full border border-[#F6AD55]" />
          <span className="w-2 h-2 rounded-full border border-[#F6AD55]" />
        </div>
      </div>
    </section>
  );
};

export default TeamSection;