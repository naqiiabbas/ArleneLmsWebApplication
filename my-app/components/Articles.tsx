import React from 'react';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { Poppins } from 'next/font/google';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
});

const articles = [
  {
    image: '/images/article1.png',
    category: 'Recycling',
    categoryColor: 'bg-[#F3E8FF] text-[#A855F7]',
    title: 'Innovative Recycling Solutions',
    description: 'Explore cutting-edge recycling technologies that are shaping a greener future and providing new opportunities for businesses.',
    date: 'Mar 3, 2024',
    readTime: '10 min read',
  },
  {
    image: '/images/article2.jpg',
    category: 'Biodegradability',
    categoryColor: 'bg-[#CCFBF1] text-[#0D9488]',
    title: 'Biodegradable Materials in Product Design',
    description: 'Learn about the benefits of using biodegradable materials in product design and how they contribute to sustainability.',
    date: 'Apr 12, 2024',
    readTime: '9 min read',
  },
  {
    image: '/images/article3.jpg',
    category: 'Circular Economy',
    categoryColor: 'bg-[#FEF3C7] text-[#D97706]',
    title: 'The Rise of Circular Economy Practices',
    description: 'Understand how circular economy practices are transforming industries and promoting sustainable development.',
    date: 'May 20, 2024',
    readTime: '12 min read',
  },
];

const BlogSection = () => {
  return (
    <section className={`${poppins.variable} bg-[#F9FAFB] px-4 py-[72px] font-sans md:px-8 lg:px-16`}>
      <div className="mx-auto max-w-[1260px]">
        <h2 className="mb-[30px] text-[28px] font-bold text-[#111827] md:text-[34px]">
          Explore More Articles
        </h2>

        <div className="mb-[28px] grid grid-cols-1 gap-[24px] md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article, index) => (
            <div 
              key={index} 
              className="overflow-hidden rounded-[6px] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.08)] transition-transform hover:translate-y-[-4px]"
            >
              <div className="relative h-[190px] w-full">
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  className="object-cover"
                />
                <span className={`absolute right-[12px] top-[12px] rounded-full px-[10px] py-[4px] text-[11px] font-semibold ${article.categoryColor}`}>
                  {article.category}
                </span>
              </div>
              
              <div className="p-[16px]">
                <h3 className="mb-[8px] text-[16px] font-bold leading-tight text-[#111827]">
                  {article.title}
                </h3>
                <p className="mb-[16px] line-clamp-3 text-[12px] leading-relaxed text-[#4B5563]">
                  {article.description}
                </p>
                
                <div className="flex items-center justify-between border-t border-[#F3F4F6] pt-[12px]">
                  <div className="flex items-center text-[11px] text-[#6B7280]">
                    <span>{article.date}</span>
                    <span className="mx-2 font-bold text-[#D1D5DB]">|</span>
                    <span>{article.readTime}</span>
                  </div>
                  <button className="text-[#111827] hover:text-[#F4B400] transition-colors">
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <button className="rounded-[4px] bg-[#F4B400] px-[18px] py-[8px] text-[12px] font-bold text-black transition-colors hover:bg-[#E2A600]">
            View All Posts
          </button>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
