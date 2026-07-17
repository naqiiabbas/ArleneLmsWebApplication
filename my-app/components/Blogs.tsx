import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Poppins } from 'next/font/google';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
});

const BlogSection = () => {
  const blogs = [
    {
      id: 1,
      image: '/images/blogimg1.png',
      title: 'Black Voices on Suicide and Survival',
      category: 'Chapter events, Featured News, Health & Wellness, Health and Wellness',
      date: 'Feb 15, 2025',
      readTime: '7 min read',
    },
    {
      id: 2,
      image: '/images/blogimg2.jpg',
      title: 'Mental Health in Communities',
      category: 'Community Support, Workshops, Mental Health Advocacy',
      date: 'Mar 10, 2025',
      readTime: '5 min read',
    },
    {
      id: 3,
      image: '/images/blogimg3.png',
      title: 'Navigating Grief During the Holidays',
      category: 'Personal Stories, Coping Strategies, Support Groups',
      date: 'Dec 1, 2024',
      readTime: '8 min read',
    },
    {
      id: 4,
      image: '/images/blogimg4.png',
      title: 'Understanding Anxiety in Youth',
      category: 'Educational Resources, Parental Guidance, Teen Programs',
      date: 'Jan 22, 2025',
      readTime: '6 min read',
    },
    {
      id: 5,
      image: '/images/blogimg5.jpg',
      title: 'Solar Scrape Grants 2025',
      category: 'Learn about grants available for Solar Scrape initiatives...',
      date: 'Apr 5, 2025',
      readTime: '9 min read',
    },
    {
      id: 6,
      image: '/images/blogimg6.jpg',
      title: 'Maximize Your Application Potential',
      category: 'Discover strategies to enhance your application and stand out in the selection process.',
      date: 'Jan 9, 2025',
      readTime: '8 min read',
    },
    {
      id: 7,
      image: '/images/blogimg7.jpg',
      title: 'Crafting The Perfect Resume',
      category: 'Learn the essential elements of a strong resume that captures attention and showcases your skills.',
      date: 'Jan 16, 2025',
      readTime: '10 min read',
    },
    {
      id: 8,
      image: '/images/blogimg8.jpg',
      title: 'Follow-Up Etiquette After Applications',
      category: 'Understand the importance of follow-ups and learn how to do it effectively without being intrusive.',
      date: 'Jan 30, 2025',
      readTime: '7 min read',
    },
  ];

  return (
    <div className={`${poppins.variable} font-sans`}>
      
      {/* Hero */}
      <section className="relative w-full h-[300px] md:h-[400px] lg:h-[480px] overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/blogdash.jpg"
            alt="Blogs Header Background"
            fill
            priority
            className="object-cover object-center brightness-[0.4]"
          />
        </div>

        <div className="relative z-10 h-full max-w-7xl mx-auto px-6 md:px-12 lg:px-24 flex flex-col justify-center">
          <div className="absolute top-10 left-6 md:left-12 lg:left-24">
            <span className="text-white/80 text-sm md:text-base font-medium">
              Home/Blogs
            </span>
          </div>
          <div className="text-center">
            <h1 className="text-white text-4xl md:text-6xl font-bold">
              Blogs
            </h1>
          </div>
        </div>
      </section>

      {/* Blogs */}
      <section className="bg-white py-12 px-6 md:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-[#1a1a1a] text-xl font-bold mb-8">
            Recent Blogs
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {blogs.map((blog) => (
              
              <Link href="/blogsinner" key={blog.id}>
                <div className="flex flex-col h-full bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden transition-transform duration-300 hover:translate-y-[-4px] hover:shadow-md cursor-pointer">
                  
                  <div className="relative h-48 w-full">
                    <Image
                      src={blog.image}
                      alt={blog.title}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="p-5 flex flex-col flex-grow">
                    <h3 className="text-[#1a1a1a] text-[15px] font-bold mb-3 line-clamp-2">
                      {blog.title}
                    </h3>

                    <p className="text-gray-500 text-[12px] mb-6 line-clamp-3">
                      {blog.category}
                    </p>

                    <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between text-[11px] text-gray-400 font-medium">
                      <div className="flex gap-3">
                        <span>{blog.date}</span>
                        <span>|</span>
                        <span>{blog.readTime}</span>
                      </div>

                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                      </svg>
                    </div>

                  </div>
                </div>
              </Link>

            ))}
          </div>

        </div>
      </section>

    </div>
  );
};

export default BlogSection;