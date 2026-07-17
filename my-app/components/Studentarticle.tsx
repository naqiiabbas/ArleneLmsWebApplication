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
    <section className={`${poppins.variable} font-sans bg-[#F9FAFB] py-16 px-4 md:px-8 lg:px-16`}>
      <div className="max-w-7xl mx-auto">
        <h2 className="text-[32px] md:text-[40px] font-bold text-[#111827] mb-10">
          Explore More Articles
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
          {articles.map((article, index) => (
            <div 
              key={index} 
              className="bg-white rounded-[16px] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.05)] transition-transform hover:translate-y-[-4px]"
            >
              <div className="relative h-[220px] w-full">
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  className="object-cover"
                />
                <span className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[12px] font-semibold ${article.categoryColor}`}>
                  {article.category}
                </span>
              </div>
              
              <div className="p-6">
                <h3 className="text-[20px] font-bold text-[#111827] mb-3 leading-tight">
                  {article.title}
                </h3>
                <p className="text-[#4B5563] text-[14px] leading-relaxed mb-6 line-clamp-3">
                  {article.description}
                </p>
                
                <div className="pt-4 border-t border-[#F3F4F6] flex items-center justify-between">
                  <div className="flex items-center text-[13px] text-[#6B7280]">
                    <span>{article.date}</span>
                    <span className="mx-2 font-bold text-[#D1D5DB]">|</span>
                    <span>{article.readTime}</span>
                  </div>
                  <button className="text-[#111827] hover:text-[#F4B400] transition-colors">
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <button className="bg-[#F4B400] hover:bg-[#E2A600] text-black font-bold py-3 px-8 rounded-[8px] transition-colors text-[15px]">
            View All Posts
          </button>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;