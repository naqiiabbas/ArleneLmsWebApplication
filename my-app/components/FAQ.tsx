'use client';

import { useState } from 'react';
import { Poppins } from 'next/font/google';
import { Plus, Minus } from 'lucide-react';
import Link from "next/link"

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
});

const faqData = [
  {
    id: '01',
    question: 'How much does it cost for my son to sign up?',
    answer: 'There are no costs to enroll or be a part of the program.',
  },
  {
    id: '02',
    question: 'What grade levels do you serve?',
    answer: 'We serve students across various grade levels, primarily focusing on middle and high school mentorship.',
  },
  {
    id: '03',
    question: 'Is the Passport to the Future Program year round?',
    answer: 'Yes, the program operates throughout the academic year with various scheduled activities and workshops.',
  },
  {
    id: '04',
    question: 'How often do you meet?',
    answer: 'Meeting schedules vary by program track, but typically occur on a bi-weekly or monthly basis.',
  },
  {
    id: '05',
    question: 'How do I donate to this program and is it tax-deductible?',
    answer: 'Donations can be made through our secure portal. As a 501(c)(3) organization, all donations are tax-deductible.',
  },
  {
    id: '06',
    question: 'How do I or my business become a Sponsor/Partner with 100 Black Men of Orange County?',
    answer: 'You can reach out via our contact form to discuss partnership opportunities and sponsorship tiers.',
  },
];

export default function FAQSection() {
  const [openId, setOpenId] = useState<string | null>('01');
  
  const toggleAccordion = (id: string) => {
    setOpenId(openId === id ? null : id);
  };
  
  return (
    <section className={`${poppins.variable} bg-white px-4 py-[72px] font-sans md:px-8`}>
    <div className="mx-auto max-w-[1080px]">
    <h2 className="mb-[28px] text-left text-[36px] font-bold text-black">FAQs</h2>
    
    <div className="space-y-[10px]">
    {faqData.map((item) => (
      <div
      key={item.id}
      className="overflow-hidden rounded-[4px] bg-[#f7f7f7] transition-all duration-300"
      >
      <button
      onClick={() => toggleAccordion(item.id)}
      className="flex h-[42px] w-full items-center justify-between px-[18px] text-left focus:outline-none md:px-[20px]"
      >
      <div className="flex items-center gap-[12px]">
      <span
      className={`text-[14px] font-bold ${
        openId === item.id ? 'text-[#F4B400]' : 'text-[#E5E5E5]'
      }`}
      >
      {item.id}
      </span>
      <span
      className={`text-[13px] font-semibold transition-colors duration-200 ${
        openId === item.id ? 'text-[#F4B400]' : 'text-[#333333]'
      }`}
      >
      {item.question}
      </span>
      </div>
      <div
      className={`flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-full transition-colors duration-200 ${
        openId === item.id ? 'bg-[#F4B400]' : 'bg-[#F4B400]'
      }`}
      >
      {openId === item.id ? (
        <Minus className="h-[12px] w-[12px] text-black stroke-[3px]" />
      ) : (
        <Plus className="h-[12px] w-[12px] text-black stroke-[3px]" />
      )}
      </div>
      </button>
      
      <div
      className={`transition-all duration-300 ease-in-out ${
        openId === item.id ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
      }`}
      >
      <div className="px-[54px] pb-[14px] text-[12px] leading-relaxed text-[#666666]">
      {item.answer}
      </div>
      </div>
      </div>
    ))}
    </div>
    
    
    
    <div className="mt-[20px] flex justify-end">
    <Link href="/faq">
    <button className="rounded-[4px] bg-[#F4B400] px-[16px] py-[8px] text-[12px] font-bold text-black transition-colors duration-200 hover:bg-[#e0a600]">
    View more
    </button>
    </Link>
    </div>
    </div>
    </section>
  );
}
