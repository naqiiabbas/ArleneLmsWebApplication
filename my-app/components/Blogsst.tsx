"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Poppins } from "next/font/google";
import {
  Bold,
  ChevronDown,
  Clock3,
  Code,
  Edit3,
  Eye,
  Image as ImageIcon,
  Italic,
  Link,
  List,
  ListOrdered,
  Plus,
  Quote,
  Save,
  Search,
  Send,
  Tags,
  Trash2,
} from "lucide-react";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string[];
  image: string | null;
  status: "published" | "draft";
  date: string;
  author: string;
}

type ViewMode = "write" | "all" | "preview";

const CATEGORIES = ["Mentorship", "Skills Development", "Career", "Technology", "Education"];
const DEFAULT_FEATURED_IMAGE = "/images/blogimg1.png";

const INITIAL_DATA: BlogPost[] = [
  {
    id: "1",
    title: "Tips for Effective Mentorship Session",
    excerpt: "Discover key strategies for making your mentorship sessions more effective and impactful.",
    content: "Discover key strategies for making your mentorship sessions more effective and impactful.",
    category: "Mentorship",
    tags: ["tips", "mentorship", "growth"],
    image: null,
    status: "published",
    date: "3/1/2025",
    author: "Sarah Johnson",
  },
  {
    id: "2",
    title: "Building Strong Communication Skills",
    excerpt: "Learn practical exercises to enhance your communication abilities.",
    content:
      "Communication is the cornerstone of successful relationships, both personal and professional. Here are some practical exercises to improve your communication skills...\n\nThe four-session YBS Technology Summit will provide students the opportunity to learn about various aspects of technology, ranging from systems analysis to database design.\nSessions will be structured to provide insight into defined technical areas, while also providing a platform for students to ask questions and interact with their peers on hands-on projects.\n\nThe goal of the four-week summit is to give students a glimpse into the field of Technology while providing tools that will improve their everyday approach to how they learn.",
    category: "Skills Development",
    tags: ["communication", "skills", "development"],
    image: DEFAULT_FEATURED_IMAGE,
    status: "published",
    date: "2/28/2025",
    author: "Sarah Johnson",
  },
  {
    id: "3",
    title: "Career Planning for Students",
    excerpt: "A comprehensive guide to planning your future career path.",
    content: "A comprehensive guide to planning your future career path.",
    category: "Career",
    tags: ["career", "planning", "students"],
    image: null,
    status: "draft",
    date: "3/3/2025",
    author: "Sarah Johnson",
  },
];

const emptyForm = {
  title: "",
  content: "",
  excerpt: "",
  category: "",
  tags: [] as string[],
  image: null as string | null,
};

function AssetIcon({
  src,
  className = "h-[18px] w-[18px]",
}: {
  src: string;
  className?: string;
}) {
  return (
    <span
      className={className}
      aria-hidden="true"
      style={{
        backgroundColor: "currentColor",
        WebkitMaskImage: `url(${src})`,
        maskImage: `url(${src})`,
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
        WebkitMaskSize: "contain",
        maskSize: "contain",
      }}
    />
  );
}

export default function BlogManagementSection() {
  const [view, setView] = useState<ViewMode>("write");
  const [posts, setPosts] = useState<BlogPost[]>(INITIAL_DATA);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [formData, setFormData] = useState<Omit<BlogPost, "id" | "date" | "author" | "status">>(emptyForm);
  const [tagInput, setTagInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const contentEditorRef = useRef<HTMLDivElement>(null);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesSearch =
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "All Categories" || post.category === selectedCategory;
      const matchesStatus = selectedStatus === "All Status" || post.status === selectedStatus.toLowerCase();
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [posts, searchQuery, selectedCategory, selectedStatus]);

  const stripHtml = (value: string) => value.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
  const plainContent = stripHtml(formData.content);
  const wordCount = plainContent ? plainContent.split(/\s+/).length : 0;

  useEffect(() => {
    if (view === "write" && contentEditorRef.current && contentEditorRef.current.innerHTML !== formData.content) {
      contentEditorRef.current.innerHTML = formData.content;
    }
  }, [view, editingId, formData.content]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: URL.createObjectURL(file) }));
    }
  };

  const addTag = () => {
    const nextTag = tagInput.trim();
    if (nextTag && !formData.tags.includes(nextTag)) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, nextTag] }));
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({ ...prev, tags: prev.tags.filter((tag) => tag !== tagToRemove) }));
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
  };

  const handleSave = (status: "published" | "draft") => {
    if (!formData.title) return alert("Please enter a title");

    if (editingId) {
      setPosts((prev) =>
        prev.map((post) =>
          post.id === editingId
            ? {
                ...post,
                ...formData,
                status,
                date: new Date().toLocaleDateString(),
              }
            : post
        )
      );
      setEditingId(null);
    } else {
      setPosts((prev) => [
        {
          ...formData,
          id: Math.random().toString(36).substr(2, 9),
          status,
          author: "Sarah Johnson",
          date: new Date().toLocaleDateString(),
        },
        ...prev,
      ]);
    }
    resetForm();
    setView("all");
  };

  const deletePost = (id: string) => {
    if (confirm("Are you sure you want to delete this post?")) {
      setPosts((prev) => prev.filter((post) => post.id !== id));
    }
  };

  const editPost = (post: BlogPost) => {
    setFormData({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt,
      category: post.category,
      tags: post.tags,
      image: post.image,
    });
    setEditingId(post.id);
    setView("preview");
  };

  const applyToolbarFormat = (format: string) => {
    const editor = contentEditorRef.current;
    if (!editor) return;

    editor.focus();
    const selection = window.getSelection();
    const hasSelection = !!selection && selection.rangeCount > 0 && !selection.isCollapsed;

    if (!hasSelection && ["link", "quote", "code"].includes(format)) {
      document.execCommand("insertText", false, "Your text");
      const range = document.createRange();
      const textNode = editor.lastChild;
      if (textNode) {
        range.selectNodeContents(textNode);
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    }

    if (format === "bold") document.execCommand("bold");
    if (format === "italic") document.execCommand("italic");
    if (format === "h1") document.execCommand("formatBlock", false, "h1");
    if (format === "h2") document.execCommand("formatBlock", false, "h2");
    if (format === "list") document.execCommand("insertUnorderedList");
    if (format === "ordered") document.execCommand("insertOrderedList");
    if (format === "link") document.execCommand("createLink", false, "https://example.com");
    if (format === "quote") document.execCommand("formatBlock", false, "blockquote");
    if (format === "code") document.execCommand("formatBlock", false, "pre");

    setFormData((prev) => ({ ...prev, content: editor.innerHTML }));
  };

  const handleEditorInput = () => {
    setFormData((prev) => ({ ...prev, content: contentEditorRef.current?.innerHTML || "" }));
  };

  const renderFormattedContent = (content: string) => {
    const lines = content.split("\n");

    return lines.map((line, index) => {
      const renderInline = (value: string) => {
        const parts = value.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g);
        return parts.map((part, partIndex) => {
          if (/^\*\*[^*]+\*\*$/.test(part)) return <strong key={partIndex}>{part.slice(2, -2)}</strong>;
          if (/^\*[^*]+\*$/.test(part)) return <em key={partIndex}>{part.slice(1, -1)}</em>;
          if (/^`[^`]+`$/.test(part)) return <code key={partIndex} className="rounded bg-[#f1f1f1] px-[5px] py-[2px] text-[15px]">{part.slice(1, -1)}</code>;
          const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
          if (linkMatch) return <a key={partIndex} href={linkMatch[2]} className="text-[#0078d4] underline">{linkMatch[1]}</a>;
          return part;
        });
      };

      if (line.startsWith("# ")) return <h1 key={index} className="mb-[14px] text-[30px] font-semibold leading-[1.2] text-[#111111]">{renderInline(line.slice(2))}</h1>;
      if (line.startsWith("## ")) return <h2 key={index} className="mb-[12px] text-[24px] font-semibold leading-[1.25] text-[#111111]">{renderInline(line.slice(3))}</h2>;
      if (line.startsWith("> ")) return <blockquote key={index} className="mb-[12px] border-l-4 border-[#ffa313] pl-[14px] italic text-[#666666]">{renderInline(line.slice(2))}</blockquote>;
      if (/^- /.test(line)) return <p key={index} className="mb-[8px] pl-[16px] before:mr-[8px] before:content-['•']">{renderInline(line.slice(2))}</p>;
      if (/^\d+\. /.test(line)) return <p key={index} className="mb-[8px] pl-[16px]">{renderInline(line)}</p>;
      if (!line.trim()) return <div key={index} className="h-[14px]" />;
      return <p key={index} className="mb-[14px]">{renderInline(line)}</p>;
    });
  };

  const toolbar = [
    { icon: Bold, label: "Bold", format: "bold" },
    { icon: Italic, label: "Italic", format: "italic" },
    { text: "H1", label: "Heading 1", format: "h1" },
    { text: "H2", label: "Heading 2", format: "h2" },
    { icon: List, label: "List", format: "list" },
    { icon: ListOrdered, label: "Ordered list", format: "ordered" },
    { icon: Link, label: "Link", active: true, format: "link" },
    { icon: Quote, label: "Quote", format: "quote" },
    { icon: Code, label: "Code", format: "code" },
  ];

  const Header = () => (
    <div className="mb-[26px] flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <div className="flex items-center gap-[12px]">
          <div className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-[12px] bg-[#ffa313] text-white">
            <AssetIcon src="/images/blog-pen-tool.svg" className="h-[24px] w-[24px]" />
          </div>
          <h1 className="text-[18px] font-normal leading-none text-[#111111]">Blog</h1>
        </div>
        <p className="mt-[14px] text-[17px] font-normal leading-none text-[#666666]">
          Write and publish blog posts for your mentorship community
        </p>
      </div>

      <div className="flex h-[51px] w-full rounded-[10px] border border-[#dddddd] bg-white p-[4px] shadow-[0_1px_0_rgba(0,0,0,0.02)] lg:w-[334px]">
        <button
          type="button"
          onClick={() => {
            setView("write");
            resetForm();
          }}
          className={`flex flex-1 items-center justify-center gap-[8px] rounded-[8px] text-[16px] font-normal transition ${
            view !== "all" ? "bg-[#ffa313] text-white" : "text-[#666666]"
          }`}
        >
          <AssetIcon src="/images/blog-pen-tool.svg" className="h-[17px] w-[17px]" />
          Write Post
        </button>
        <button
          type="button"
          onClick={() => setView("all")}
          className={`flex flex-1 items-center justify-center gap-[8px] rounded-[8px] text-[16px] font-normal transition ${
            view === "all" ? "bg-[#ffa313] text-white" : "text-[#666666]"
          }`}
        >
          <AssetIcon src="/images/blog-globe.svg" className="h-[17px] w-[17px]" />
          All Posts ({posts.length})
        </button>
      </div>
    </div>
  );

  const SidebarControls = () => (
    <aside className="space-y-[24px]">
      <div className="rounded-[12px] border border-[#dddddd] bg-white px-[23px] py-[25px]">
        <h3 className="mb-[12px] text-[16px] font-normal leading-none text-[#111111]">Publish</h3>
        <div className="space-y-[11px]">
          <button
            type="button"
            onClick={() => handleSave("published")}
            className="flex h-[56px] w-full items-center justify-center gap-[9px] rounded-[9px] bg-[#ffa313] text-[16px] font-normal text-white"
          >
            <Send size={18} strokeWidth={2} />
            Publish Now
          </button>
          <button
            type="button"
            onClick={() => handleSave("draft")}
            className="flex h-[56px] w-full items-center justify-center gap-[9px] rounded-[9px] border border-[#dddddd] bg-white text-[16px] font-normal text-[#666666]"
          >
            <Save size={17} strokeWidth={2} />
            Save as Draft
          </button>
        </div>
      </div>

      <div className="rounded-[12px] border border-[#dddddd] bg-white px-[23px] py-[27px]">
        <h3 className="mb-[23px] text-[17px] font-normal leading-none text-[#111111]">Featured Image</h3>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="relative flex h-[110px] w-full items-center justify-center overflow-hidden rounded-[9px] border border-[#dddddd] bg-white"
        >
          {formData.image ? (
            <>
              <img src={formData.image} alt="Featured" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setFormData((prev) => ({ ...prev, image: null }));
                }}
                className="absolute right-[8px] top-[8px] flex h-[36px] w-[36px] items-center justify-center rounded-[9px] bg-[#ff6467] text-white"
                aria-label="Remove featured image"
              >
                <Trash2 size={18} strokeWidth={2} />
              </button>
            </>
          ) : (
            <div className="text-center text-[#666666]">
              <ImageIcon className="mx-auto mb-[14px]" size={28} strokeWidth={1.8} />
              <span className="text-[14px] font-normal">Click to upload</span>
            </div>
          )}
        </button>
        <input type="file" ref={fileInputRef} hidden onChange={handleImageUpload} accept="image/*" />
      </div>

      <div className="rounded-[12px] border border-[#dddddd] bg-white px-[23px] py-[27px]">
        <h3 className="mb-[24px] text-[17px] font-normal leading-none text-[#111111]">Category</h3>
        <div className="relative">
          <select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className="h-[40px] w-full appearance-none rounded-[9px] border border-[#dddddd] bg-white px-[16px] pr-[38px] text-[14px] font-normal text-[#666666] outline-none"
          >
            <option value="">Select a category</option>
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-[14px] top-1/2 -translate-y-1/2 text-[#666666]" size={18} />
        </div>
      </div>

      <div className="rounded-[12px] border border-[#dddddd] bg-white px-[23px] py-[27px]">
        <h3 className="mb-[24px] flex items-center gap-[9px] text-[17px] font-normal leading-none text-[#111111]">
          <Tags size={17} strokeWidth={1.8} />
          Tags
        </h3>
        <div className="flex gap-[8px]">
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTag()}
            placeholder="Add tag..."
            className="h-[40px] min-w-0 flex-1 rounded-[9px] border border-[#dddddd] px-[12px] text-[14px] font-normal outline-none placeholder:text-[#999999]"
          />
          <button type="button" onClick={addTag} className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-[9px] bg-[#ffa313] text-white">
            <Plus size={22} strokeWidth={2} />
          </button>
        </div>
        {formData.tags.length > 0 && (
          <div className="mt-[16px] flex flex-wrap gap-[8px]">
            {formData.tags.map((tag) => (
              <span key={tag} className="inline-flex h-[20px] items-center gap-[8px] rounded-[7px] bg-[#fff4df] px-[10px] text-[12px] font-normal text-[#ff9f0f]">
                {tag}
                <button type="button" onClick={() => removeTag(tag)} className="text-[#ff9f0f]">
                  x
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </aside>
  );

  return (
    <section className={`${poppins.variable} min-h-full w-full overflow-x-hidden bg-[#f4f4f4] px-4 pb-6 pt-6 font-sans md:px-6 md:pt-7`}>
      <Header />

      {view === "all" ? (
        <div>
          <div className="mb-[24px] rounded-[12px] border border-[#dddddd] bg-white px-[23px] py-[24px]">
            <div className="grid grid-cols-1 gap-[16px] lg:grid-cols-3">
              <div className="relative">
                <Search className="absolute left-[16px] top-1/2 -translate-y-1/2 text-[#999999]" size={18} strokeWidth={1.8} />
                <input
                  type="text"
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-[52px] w-full rounded-[9px] border border-[#dddddd] bg-white pl-[43px] pr-4 text-[15px] font-normal outline-none placeholder:text-[#999999]"
                />
              </div>
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="h-[52px] w-full appearance-none rounded-[9px] border border-[#dddddd] bg-white px-[16px] pr-[40px] text-[14px] font-normal text-[#666666] outline-none"
                >
                  <option>All Categories</option>
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-[16px] top-1/2 -translate-y-1/2 text-[#666666]" size={18} />
              </div>
              <div className="relative">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="h-[52px] w-full appearance-none rounded-[9px] border border-[#dddddd] bg-white px-[16px] pr-[40px] text-[14px] font-normal text-[#666666] outline-none"
                >
                  <option>All Status</option>
                  <option>Published</option>
                  <option>Draft</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-[16px] top-1/2 -translate-y-1/2 text-[#666666]" size={18} />
              </div>
            </div>
          </div>

          <div className="space-y-[16px]">
            {filteredPosts.map((post) => (
              <article key={post.id} className="relative min-h-[183px] rounded-[12px] border border-[#dddddd] bg-white px-[23px] py-[25px]">
                <div className="pr-[84px]">
                  <div className="flex flex-wrap items-center gap-[6px]">
                    <h2 className="text-[21px] font-normal leading-none text-[#111111]">{post.title}</h2>
                    <span className={`rounded-[7px] px-[7px] py-[4px] text-[12px] font-normal leading-none ${post.status === "published" ? "bg-[#10c79a] text-white" : "bg-[#ffc247] text-[#111111]"}`}>
                      {post.status}
                    </span>
                  </div>
                  <div className="mt-[16px] flex flex-wrap items-center gap-[12px] text-[14px] font-normal leading-none text-[#999999]">
                    <span className="flex items-center gap-[4px]"><Clock3 size={15} strokeWidth={1.8} />{post.date}</span>
                    <span className="rounded-[7px] bg-[#e0f2fe] px-[8px] py-[5px] text-[12px] text-[#0078d4]">{post.category}</span>
                  </div>
                  <p className="mt-[28px] text-[16px] font-normal leading-none text-[#666666]">{post.excerpt}</p>
                  <div className="mt-[18px] flex flex-wrap gap-[8px]">
                    {post.tags.map((tag) => (
                      <span key={tag} className="rounded-[6px] bg-[#f1f1f1] px-[6px] py-[4px] text-[12px] font-normal leading-none text-[#666666]">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="absolute right-[25px] top-[35px] flex gap-[20px]">
                  <button type="button" onClick={() => editPost(post)} className="flex h-[32px] w-[32px] items-center justify-center" aria-label={`Edit ${post.title}`}>
                    <img src="/images/blog-edit-button.svg" alt="" className="h-[32px] w-[32px]" />
                  </button>
                  <button type="button" onClick={() => deletePost(post.id)} className="text-[#ff6467]" aria-label={`Delete ${post.title}`}>
                    <Trash2 size={17} strokeWidth={2} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-[25px] xl:grid-cols-[1fr_377px]">
          <main className="min-w-0">
            <div className="mb-[24px] flex justify-end">
              <button
                type="button"
                onClick={() => setView(view === "preview" ? "write" : "preview")}
                className="flex h-[44px] items-center justify-center gap-[8px] rounded-[9px] border border-[#dddddd] bg-white px-[17px] text-[16px] font-normal text-[#666666]"
              >
                {view === "preview" ? <Edit3 size={18} strokeWidth={1.8} /> : <Eye size={18} strokeWidth={1.8} />}
                {view === "preview" ? "Edit Mode" : "Preview Mode"}
              </button>
            </div>

            {view === "preview" ? (
              <article className="overflow-hidden rounded-[12px] border border-[#dddddd] bg-white px-[16px] pb-[18px] pt-[15px]">
                {formData.image && <img src={formData.image} alt="Featured" className="h-[382px] w-full rounded-[7px] object-cover" />}
                <h2 className="mt-[20px] text-[36px] font-normal leading-[1.1] text-[#111111]">{formData.title || "Enter your blog title..."}</h2>
                <div className="mt-[18px] flex flex-wrap items-center gap-[14px] text-[14px] font-normal text-[#999999]">
                  <span>By Sarah Johnson</span>
                  <span>&bull;</span>
                  <span>3/4/2026</span>
                  <span className="ml-auto rounded-[7px] bg-[#e0f2fe] px-[10px] py-[5px] text-[12px] text-[#0078d4]">{formData.category || "Skills Development"}</span>
                </div>
                <div className="mt-[22px] text-[17px] font-normal leading-[1.48] text-[#111111]">
                  {formData.content ? (
                    formData.content.includes("<") ? (
                      <div
                        className="[&_a]:text-[#0078d4] [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-[#ffa313] [&_blockquote]:pl-[14px] [&_blockquote]:italic [&_h1]:mb-[14px] [&_h1]:text-[30px] [&_h1]:font-semibold [&_h2]:mb-[12px] [&_h2]:text-[24px] [&_h2]:font-semibold [&_li]:ml-[22px] [&_ol]:list-decimal [&_pre]:rounded [&_pre]:bg-[#f1f1f1] [&_pre]:p-[12px] [&_ul]:list-disc"
                        dangerouslySetInnerHTML={{ __html: formData.content }}
                      />
                    ) : (
                      renderFormattedContent(formData.content)
                    )
                  ) : "Write your blog content here..."}
                </div>
                {formData.tags.length > 0 && (
                  <div className="mt-[28px] flex flex-wrap gap-[8px]">
                    {formData.tags.map((tag) => (
                      <span key={tag} className="rounded-[6px] bg-[#f1f1f1] px-[6px] py-[4px] text-[12px] font-normal leading-none text-[#666666]">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </article>
            ) : (
              <div className="space-y-[24px]">
                <input
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter your blog title..."
                  className="h-[83px] w-full rounded-[12px] border border-[#dddddd] bg-white px-[23px] text-[32px] font-normal text-[#111111] outline-none placeholder:text-[#999999]"
                />

                <div className="overflow-hidden rounded-[12px] border border-[#dddddd] bg-white">
                  <div className="flex h-[55px] items-center gap-[2px] border-b border-[#dddddd] px-[22px] text-[#666666]">
                    {toolbar.map((tool, index) => {
                      const Icon = tool.icon;
                      return (
                        <button
                          key={tool.label}
                          type="button"
                          onClick={() => applyToolbarFormat(tool.format)}
                          className={`flex h-[30px] min-w-[32px] items-center justify-center rounded-[7px] text-[14px] transition hover:bg-[#f1f1f1] ${tool.active ? "text-[#0078d4]" : ""}`}
                          aria-label={tool.label}
                        >
                          {Icon ? <Icon size={16} strokeWidth={1.8} /> : tool.text}
                          {(index === 1 || index === 3) && <span className="ml-[14px] h-[22px] w-px bg-[#eeeeee]" />}
                        </button>
                      );
                    })}
                    <span className="ml-auto rounded-full bg-[#f1f1f1] px-[14px] py-[6px] text-[12px] font-normal text-[#999999]">Rich text supported</span>
                  </div>
                  <div className="relative">
                    {!plainContent && (
                      <p className="pointer-events-none absolute left-[23px] top-[20px] text-[17px] font-normal leading-[1.45] text-[#999999]">
                        Write your blog content here... Use this space to share your thoughts, insights, and experiences with the mentorship community.
                      </p>
                    )}
                    <div
                      ref={contentEditorRef}
                      contentEditable
                      suppressContentEditableWarning
                      onInput={handleEditorInput}
                      className="min-h-[532px] w-full px-[23px] py-[20px] text-[17px] font-normal leading-[1.45] text-[#111111] outline-none [&_a]:text-[#0078d4] [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-[#ffa313] [&_blockquote]:pl-[14px] [&_blockquote]:italic [&_h1]:mb-[14px] [&_h1]:text-[30px] [&_h1]:font-semibold [&_h2]:mb-[12px] [&_h2]:text-[24px] [&_h2]:font-semibold [&_li]:ml-[22px] [&_ol]:list-decimal [&_pre]:rounded [&_pre]:bg-[#f1f1f1] [&_pre]:p-[12px] [&_ul]:list-disc"
                    />
                  </div>
                  <div className="flex h-[51px] items-center justify-center border-t border-[#dddddd] text-[14px] font-normal text-[#999999]">
                    {plainContent.length} characters | {wordCount} words
                  </div>
                </div>

                <div className="rounded-[12px] border border-[#dddddd] bg-white px-[23px] py-[26px]">
                  <label className="text-[14px] font-normal text-[#666666]">Excerpt (Optional)</label>
                  <textarea
                    name="excerpt"
                    value={formData.excerpt}
                    onChange={handleInputChange}
                    placeholder="Write a short excerpt or summary for your post..."
                    className="mt-[15px] h-[58px] w-full resize-none text-[16px] font-normal text-[#111111] outline-none placeholder:text-[#999999]"
                  />
                </div>
              </div>
            )}
          </main>

          <SidebarControls />
        </div>
      )}
    </section>
  );
}
