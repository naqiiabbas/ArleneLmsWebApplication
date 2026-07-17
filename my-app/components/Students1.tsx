'use client';
import Link from "next/link"
import React, { useState } from 'react';
import Image from 'next/image';
import { Poppins } from 'next/font/google';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
});

const StudentLifeContent = () => {
  const [activeTab, setActiveTab] = useState('Overview');

  const tabs = [
    'Overview',
    'The Campus Experience',
    'Fitness & Athletics',
    'Support & Guidance',
    'Student Activities',
  ];

  return (
    <div className={`${poppins.variable} font-sans bg-white py-12 px-4 md:px-8 lg:px-20`}>
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
        
        {/* Left Sidebar */}
        <div className="w-full lg:w-[300px] flex-shrink-0">
          <div className="flex flex-col gap-[6px]">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`w-full text-left py-3 px-6 rounded-sm text-[14px] font-semibold transition-colors ${
                  activeTab === tab
                    ? 'bg-[#111111] text-white'
                    : 'bg-[#F2F7F2] text-[#333333] hover:bg-gray-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="mt-8">
            <p className="text-[12px] text-gray-500 mb-4 font-medium">Quick Links</p>
            <div className="flex flex-col gap-3">
               <Link href="/contact-us">
      <button className="w-full bg-[#F4B400] text-white py-3 px-6 rounded-md font-bold text-[14px] shadow-sm hover:bg-[#e0a500] transition-colors">
        Contact Us
      </button>
    </Link>
              <button className="w-full bg-[#0D1117] text-white py-3 px-6 rounded-md font-bold text-[14px] shadow-sm hover:bg-black transition-colors">
                Transfer
              </button>
            </div>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1">
          <div className="space-y-6 text-[#444444] text-[14px] leading-[1.8]">
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore 
              magna aliqua. Ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut Lorem ipsum 
              dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore
            </p>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore 
              magna aliqua. Ut enim ad minim veniam quis nostrud exerci.
            </p>

            <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden my-8">
              <Image
                src="/images/studentimg1.png" // Replace with actual image path
                alt="City transportation tram"
                fill
                className="object-cover"
              />
            </div>

            <div className="space-y-8 mt-10">
              <section>
                <h3 className="text-[20px] font-bold text-black mb-4">Transportations</h3>
                <p className="mb-4">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore 
                  magna aliqua. Ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut Lorem ipsum 
                  dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore
                </p>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore 
                  magna aliqua. Ut enim ad minim veniam quis nostrud exerci.
                </p>
              </section>

              <section>
                <h3 className="text-[20px] font-bold text-black mb-4">Parking</h3>
                <p className="mb-4">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore 
                  magna aliqua. Ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut Lorem ipsum 
                  dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore
                </p>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore 
                  magna aliqua. Ut enim ad minim veniam quis nostrud exerci.
                </p>
              </section>

              <section>
                <h3 className="text-[20px] font-bold text-black mb-4">The Campus Experience</h3>
                <p className="mb-4">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore 
                  magna aliqua. Ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut Lorem ipsum 
                  dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore
                </p>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore 
                  magna aliqua. Ut enim ad minim veniam quis nostrud exerci.
                </p>
              </section>

              <section className="flex flex-col md:flex-row gap-8 pt-4">
                <div className="flex-1">
                  <h3 className="text-[20px] font-bold text-black mb-4">Public Programs & Events</h3>
                  <p className="mb-4">
                    Lorem ipsum dolor sit amet consec tetura magna aliqua. Ut enim ad minim ven iamquis amet consectet adipis.
                  </p>
                  <p>
                    Lorem ipsum dolor sit amet conse cteturadigna aliqua enim ad minim ven.
                  </p>
                </div>
                <div className="flex-1 relative aspect-[4/3] rounded-2xl overflow-hidden">
                  <Image
                    src="/images/studentimg2.png" // Replace with actual image path
                    alt="Students walking on campus"
                    fill
                    className="object-cover"
                  />
                </div>
              </section>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default StudentLifeContent;