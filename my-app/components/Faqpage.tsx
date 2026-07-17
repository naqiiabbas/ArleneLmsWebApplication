'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Poppins } from 'next/font/google';
import { ChevronRight, ChevronDown, Plus, Minus } from 'lucide-react';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
});

const FAQSection = () => {
  // Use state to manage which accordion item is open. 
  // Initialized to '01' as per the "isOpen: true" requirement for the first item.
  const [openId, setOpenId] = useState<string | null>('01');

  const categories = [
    { name: 'General Inquiries', active: true },
    { name: 'As a Partner', active: false },
    { name: 'As a Volunteer', active: false },
    { name: 'About Courses', active: false },
  ];

  const faqs = [
    {
      id: '01',
      question: 'How much does it cost for my son to sign up?',
      answer: 'There are no fees to enroll or be a part of the program.',
    },
    { id: '02', question: 'What grade levels do you serve?', answer: 'We serve male youth primarily in grades 6 through 12.' },
    { id: '03', question: 'Is the Passport to the Future Program year round?', answer: 'Yes, the program operates throughout the academic year and summer.' },
    { id: '04', question: 'How often do you meet?', answer: 'Meetings typically occur on a scheduled monthly or bi-weekly basis.' },
    { id: '05', question: 'How do I donate to this program and is it tax-deductible?', answer: 'You can donate via our website; we are a certified 501(c)3 non-profit.' },
    { id: '06', question: 'How do I or my business become a Sponsor/Partner with 100 Black Men of Orange County?', answer: 'Please contact us through our partner inquiry form for more details.' },
  ];

  const toggleAccordion = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div className={`${poppins.variable} font-sans`}>
      {/* Hero Header Section */}
      <section className="relative h-[300px] w-full flex flex-col items-center justify-center text-white overflow-hidden">
        {/* Fixed Image Rendering: Parent is relative, Image uses fill and object-cover */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/faq.png"
            alt="FAQ Background"
            fill
            className="object-cover brightness-[1]"
            priority
          />
        </div>
        <div className="relative z-10 text-center">
          <nav className="text-[14px] mb-2 flex justify-center items-center gap-1 opacity-90">
            <span>Home</span>
            <span>/</span>
            <span>FAQs</span>
          </nav>
          <h1 className="text-[42px] font-bold tracking-tight">Frequently Asked Questions</h1>
        </div>
      </section>

      {/* Main FAQ Content */}
      <section className="bg-[#FAF8F4] py-20 px-6 md:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar Categories */}
          <div className="w-full lg:w-[350px]">
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <h2 className="text-[24px] font-bold text-[#1A1A1A] mb-8">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {categories.map((cat, index) => (
                  <div 
                    key={index}
                    className={`flex items-center justify-between p-4 rounded-lg cursor-pointer transition-colors ${
                      cat.active ? 'bg-[#FDF6E9] text-[#E67E22]' : 'bg-transparent text-[#1A1A1A]'
                    }`}
                  >
                    <span className="font-semibold text-[16px]">{cat.name}</span>
                    {cat.active ? (
                      <ChevronRight className="w-5 h-5 text-[#E67E22]" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-[#1A1A1A]" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Accordion List */}
          <div className="flex-1">
            <div className="bg-white rounded-xl p-4 md:p-8 shadow-sm">
              <div className="space-y-4">
                {faqs.map((faq) => {
                  const isOpen = openId === faq.id;
                  return (
                    <div 
                      key={faq.id} 
                      className={`rounded-xl border transition-all duration-300 ${
                        isOpen ? 'bg-[#FDF6E9] border-transparent' : 'bg-[#F9F9F9] border-transparent'
                      }`}
                    >
                      {/* Fixed Functionality: Clickable container triggers toggle */}
                      <button 
                        onClick={() => toggleAccordion(faq.id)}
                        className="w-full flex items-start gap-4 p-6 text-left outline-none"
                      >
                        <span className={`text-[20px] font-bold transition-colors ${isOpen ? 'text-[#E67E22]' : 'text-[#CCCCCC]'}`}>
                          {faq.id}
                        </span>
                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <h3 className={`text-[16px] font-semibold leading-tight transition-colors ${isOpen ? 'text-[#E67E22]' : 'text-[#1A1A1A]'}`}>
                              {faq.question}
                            </h3>
                            {/* Fixed Toggle Icon: Switches between Plus/Minus based on state */}
                            <div className="ml-4 transition-transform duration-300">
                              {isOpen ? (
                                <Minus className="w-5 h-5 text-[#1A1A1A] flex-shrink-0" />
                              ) : (
                                <Plus className="w-5 h-5 text-[#1A1A1A] flex-shrink-0" />
                              )}
                            </div>
                          </div>
                          {/* Fixed Expand/Collapse behavior */}
                          {isOpen && faq.answer && (
                            <div className="mt-4 text-[#4A4A4A] text-[15px] leading-relaxed animate-in fade-in slide-in-from-top-2 duration-300">
                              {faq.answer}
                            </div>
                          )}
                        </div>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
};

export default FAQSection;