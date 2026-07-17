"use client";

import React, { useMemo } from 'react';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import { Poppins } from 'next/font/google';
import { X } from 'lucide-react';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
});

// Wahi data jo aapne MentorNotesPanel mein diya hai
const MENTOR_NOTES_DATA = [
  {
    id: 1,
    title: "Career Development Plan - Q1 Goals",
    mentor: "Dr. Emily Chen",
    role: "Career Mentor",
    date: "3/5/2025",
    description: "Hi there, I've reviewed your progress from last semester and I'm impressed with your growth! Here are some key areas I'd like you to focus on this quarter:\n\n**Technical Skills:**\n- Complete the advanced JavaScript course on frontend frameworks\n- Build at least 2 portfolio projects showcasing React skills\n- Practice algorithm problems (aim for 3-4 per week)\n\n**Soft Skills:**\n- Work on presentation skills - prepare for the upcoming project showcase\n- Network with at least 5 professionals in your field of interest",
    attachments: 2,
    category: "Career Development",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80",
  },
  {
    id: 2,
    title: "Research Paper Feedback",
    mentor: "Prof. Michael Rodriguez",
    role: "Academic Mentor",
    date: "3/4/2025",
    description: "Hello, I've finished reviewing your draft research paper on \"AI in Healthcare\". Overall, it's a strong piece of work! Here are my notes: **Strengths...",
    attachments: 1,
    category: "Academic",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e",
  },
  {
    id: 3,
    title: "Upcoming Workshop - Leadership Skills",
    mentor: "Sarah Martinez",
    role: "Leadership Coach",
    date: "3/3/2025",
    description: "Dear Student, I'm organizing a leadership workshop next week and I think you'd benefit greatly from attending. **Workshop Details:** - Date: March ...",
    attachments: 1,
    category: "Professional Development",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2",
  },
  {
    id: 4,
    title: "Internship Opportunity - Tech Startup",
    mentor: "James Thompson",
    role: "Industry Mentor",
    date: "3/2/2025",
    description: "Hi, Great news! I came across an internship opportunity that perfectly matches your interests and skills. **Company:** InnovateTech Solutions **Posi...",
    attachments: 2,
    category: "Career Development",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
  },
  {
    id: 5,
    title: "Monthly Progress Review - February",
    mentor: "Dr. Emily Chen",
    role: "Career Mentor",
    date: "3/1/2025",
    description: "Hello, Here's a summary of your progress for February: **Achievements:** ✅ Completed 3 online courses ✅ Attended all mentorship sessions ✅ Submitted...",
    attachments: 0,
    category: "Progress Review",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80",
  },
  {
    id: 6,
    title: "Study Resources for Upcoming Exam",
    mentor: "Prof. Michael Rodriguez",
    role: "Academic Mentor",
    date: "2/28/2025",
    description: "Hi there, I've compiled some study resources that will help you prepare for your upcoming Data Structures exam: **Recommended Materials:** - Chapter...",
    attachments: 2,
    category: "Academic",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e",
  }
];

const ViewNote = () => {
  const router = useRouter();
  const params = useParams();
  
  // URL se ID uthaye ga (e.g., /viewnotes/1)
  const noteId = Number(params?.id);

  // Dynamic content matching the ID
  const note = useMemo(() => {
    return MENTOR_NOTES_DATA.find((n) => n.id === noteId) || MENTOR_NOTES_DATA[0];
  }, [noteId]);

  return (
    <section className={`${poppins.variable} font-sans bg-[#F8FAFC] min-h-screen flex items-center justify-center p-6`}>
      {/* View Note Modal Card */}
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        
        {/* Header Section */}
        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative w-14 h-14 shrink-0">
              <Image 
                src={note.avatar} 
                alt={note.mentor} 
                fill 
                className="rounded-full object-cover border-2 border-slate-50" 
              />
            </div>
            <div>
              <h1 className="text-[22px] font-bold text-[#1E293B] leading-tight">
                {note.title}
              </h1>
              <div className="flex items-center gap-2 text-[13px] text-slate-400 font-medium mt-1">
                <span>{note.mentor}</span>
                <span>•</span>
                <span>{note.role}</span>
                <span>•</span>
                <span>{note.date}</span>
              </div>
            </div>
          </div>
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content Section */}
        <div className="p-8">
          <div className="mb-6">
            <span className="bg-[#E0F2FE] text-[#0284C7] text-[11px] font-bold px-3 py-1 rounded-md uppercase tracking-wider">
              {note.category}
            </span>
          </div>

          <div className="text-[16px] text-slate-600 leading-relaxed whitespace-pre-wrap">
            {note.description}
          </div>
        </div>

        {/* Bottom Button */}
        <div className="p-6 border-t border-slate-50">
          <button 
            onClick={() => router.back()}
            className="w-full bg-[#F9A618] hover:bg-[#E89516] text-white py-4 rounded-xl font-bold text-[15px] transition-all active:scale-[0.99] shadow-lg shadow-orange-100"
          >
            Close
          </button>
        </div>

      </div>
    </section>
  );
};

export default ViewNote;