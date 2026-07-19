"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  Calendar,
  ChevronDown,
  Download,
  Eye,
  FileText,
  Filter,
  MessageSquare,
  MoreVertical,
  Plus,
  TrendingUp,
  Undo2,
  Upload,
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { domToPng } from "modern-screenshot";
import { getAssignedStudents, getStudentDetail } from "@/lib/data/mentor";
import type {
  MentorStudent,
  MentorAttendanceRecord,
  MentorStudentNote,
  RiskLevel,
} from "@/lib/data/mentor.types";

type AttendanceRecord = MentorAttendanceRecord;
type StudentNote = MentorStudentNote;
type Student = MentorStudent;

const RiskBadge = ({ level }: { level: RiskLevel }) => {
  const styles = {
    Low: "bg-[#dff9ea] text-[#009d4c]",
    Medium: "bg-[#fff4c6] text-[#c98600]",
    High: "bg-[#ffe3e6] text-[#ff001a]",
  };

  return <span className={`inline-flex h-[29px] items-center rounded-full px-[13px] text-[16px] font-normal leading-none ${styles[level]}`}>{level}</span>;
};

const AttendanceText = ({ value }: { value: number }) => {
  const color = value < 70 ? "text-[#ff001a]" : value < 85 ? "text-[#e89100]" : "text-[#00a651]";
  return <span className={`text-[16px] font-normal leading-none ${color}`}>{value}%</span>;
};

const profileSchool = (school: string) => (school.endsWith("School") ? school : `${school} School`);

const InfoIcon = ({ src }: { src: string }) => (
  <img src={src} alt="" aria-hidden="true" className="mt-[3px] h-[18px] w-[18px] shrink-0" />
);

export default function AssignedStudentsSection() {
  const [view, setView] = useState<"list" | "profile">("list");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [activeTab, setActiveTab] = useState<"Attendance" | "Notes" | "Messages" | "Documents">("Attendance");
  const [filterGrade, setFilterGrade] = useState("All Grades");
  const [filterRisk, setFilterRisk] = useState("All Risk Levels");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number } | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState<string[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);

  const tableRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const gradeMatch = filterGrade === "All Grades" || student.grade === filterGrade;
      const riskMatch = filterRisk === "All Risk Levels" || student.riskLevel === filterRisk;
      return gradeMatch && riskMatch;
    });
  }, [students, filterGrade, filterRisk]);

  useEffect(() => {
    setIsMounted(true);
    getAssignedStudents()
      .then(setStudents)
      .catch((e) => setNotice((e as Error).message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!isUploadModalOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isUploadModalOpen]);

  useEffect(() => {
    if (!openDropdown) return;
    const close = () => {
      setOpenDropdown(null);
      setDropdownPosition(null);
    };
    window.addEventListener("resize", close);
    window.addEventListener("scroll", close, true);
    return () => {
      window.removeEventListener("resize", close);
      window.removeEventListener("scroll", close, true);
    };
  }, [openDropdown]);

  const handleExport = async () => {
    if (!tableRef.current) return;
    try {
      const dataUrl = await domToPng(tableRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
      });
      if (!dataUrl || dataUrl === "data:,") throw new Error("Blank Image Generated");
      const link = document.createElement("a");
      link.download = `students-list-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Export failed:", err);
      alert("Error: Export failed.");
    }
  };

  const openProfile = async (student: Student) => {
    setSelectedStudent(student);
    setActiveTab("Attendance");
    setView("profile");
    setOpenDropdown(null);
    setDropdownPosition(null);
    try {
      const detail = await getStudentDetail(student.id);
      setSelectedStudent((prev) => (prev && prev.id === student.id ? { ...prev, ...detail } : prev));
    } catch (e) {
      setNotice((e as Error).message);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedDocs((prev) => [...prev, file.name]);
      setIsUploadModalOpen(false);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  if (view === "profile" && selectedStudent) {
    return (
      <section className="min-h-full overflow-x-hidden bg-[#f4f4f4] px-4 pb-[27px] pt-[25px] font-poppins text-[#2d3b4f] md:px-6">
        <div className="mb-[24px] flex items-center gap-[10px]">
          <button
            onClick={() => setView("list")}
            className="flex h-[40px] w-[40px] items-center justify-center rounded-[8px] border border-[#cfcfcf] bg-white text-[#ffa313] transition hover:bg-[#fff8ef]"
            aria-label="Back to assigned students"
          >
            <Undo2 size={17} strokeWidth={1.9} />
          </button>
          <h1 className="text-[22px] font-semibold leading-tight text-[#111111]">Student Profile</h1>
        </div>

        <div className="grid grid-cols-1 gap-[24px] xl:grid-cols-[358px_minmax(0,1fr)]">
          <aside className="rounded-[8px] border border-[#d6d6d6] bg-white px-[24px] pb-[24px] pt-[25px]">
            <div className="flex flex-col items-center text-center">
              <img src={selectedStudent.avatar} className="h-[96px] w-[96px] rounded-full object-cover" alt={selectedStudent.name} />
              <h2 className="mt-[24px] text-[26px] font-semibold leading-none text-[#2d3b4f]">{selectedStudent.name}</h2>
              <p className="mt-[12px] text-[15px] font-normal leading-none text-[#657183]">{selectedStudent.grade} Grade</p>
              <div className="mt-[15px]">
                <RiskBadge level={selectedStudent.riskLevel} />
              </div>
            </div>

            <div className="my-[25px] h-px bg-[#d6d6d6]" />

            <div className="space-y-[21px]">
              <div className="flex gap-[14px]">
                <InfoIcon src="/images/mentor-assigned-location.svg" />
                <div>
                  <p className="text-[12px] font-normal leading-none text-[#657183]">School</p>
                  <p className="mt-[6px] text-[15px] font-normal leading-none text-[#2d3b4f]">{profileSchool(selectedStudent.school)}</p>
                </div>
              </div>
              <div className="flex gap-[14px]">
                <InfoIcon src="/images/mentor-assigned-mail.svg" />
                <div>
                  <p className="text-[12px] font-normal leading-none text-[#657183]">Email</p>
                  <p className="mt-[6px] text-[15px] font-normal leading-none text-[#2d3b4f]">{selectedStudent.email || "N/A"}</p>
                </div>
              </div>
              <div className="flex gap-[14px]">
                <InfoIcon src="/images/mentor-assigned-phone.svg" />
                <div>
                  <p className="text-[12px] font-normal leading-none text-[#657183]">Phone</p>
                  <p className="mt-[6px] text-[15px] font-normal leading-none text-[#2d3b4f]">{selectedStudent.phone || "N/A"}</p>
                </div>
              </div>
            </div>

            <div className="my-[27px] h-px bg-[#d6d6d6]" />

            <div className="grid grid-cols-2 text-center">
              <div>
                <p className="text-[25px] font-normal leading-none text-[#ffa313]">{selectedStudent.attendance}%</p>
                <p className="mt-[10px] text-[12px] font-normal leading-none text-[#657183]">Attendance</p>
              </div>
              <div>
                <p className="text-[25px] font-normal leading-none text-[#ffa313]">{selectedStudent.totalSessions}</p>
                <p className="mt-[10px] text-[12px] font-normal leading-none text-[#657183]">Total Sessions</p>
              </div>
            </div>

            <Link href="/mentorshippanel/message">
              <button className="mt-[27px] h-[36px] w-full rounded-[8px] bg-[#ffa313] text-[14px] font-semibold text-white transition hover:bg-[#f59a0d]">
                Send Message
              </button>
            </Link>
          </aside>

          <div className="min-h-[520px] min-w-0 rounded-[8px] border border-[#d6d6d6] bg-white">
            <div className="flex h-[56px] overflow-x-auto border-b border-[#d6d6d6]">
              {["Attendance", "Notes", "Messages", "Documents"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as typeof activeTab)}
                  className={`min-w-[118px] px-[20px] text-[14px] font-normal transition-all ${
                    activeTab === tab ? "border-b border-[#ffa313] text-[#ff9f0f]" : "border-b border-transparent text-[#657183] hover:text-[#111111]"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="px-4 pb-5 pt-5 sm:px-[24px] sm:pb-[24px] sm:pt-[28px]">
              {activeTab === "Attendance" && (
                <div>
                  <h3 className="mb-[19px] text-[22px] font-semibold leading-none text-[#2d3b4f]">Attendance History</h3>
                  {selectedStudent.attendanceHistory.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[650px] text-left">
                        <thead>
                          <tr className="bg-[#f7f7f7]">
                            <th className="px-[16px] py-[16px] text-[16px] font-semibold leading-none text-[#657183]">Date</th>
                            <th className="px-[16px] py-[16px] text-[16px] font-semibold leading-none text-[#657183]">Session</th>
                            <th className="px-[16px] py-[16px] text-[16px] font-semibold leading-none text-[#657183]">Status</th>
                            <th className="px-[16px] py-[16px] text-[16px] font-semibold leading-none text-[#657183]">Notes</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedStudent.attendanceHistory.map((row, idx) => (
                            <tr key={`${row.date}-${idx}`} className="border-b border-[#d6d6d6]">
                              <td className="px-[16px] py-[13px] text-[16px] font-normal leading-none text-[#2d3b4f]">{row.date}</td>
                              <td className="px-[16px] py-[13px] text-[16px] font-normal leading-none text-[#2d3b4f]">{row.session}</td>
                              <td className="px-[16px] py-[13px]">
                                <span className={`inline-flex h-[30px] items-center rounded-full px-[12px] text-[16px] font-normal leading-none ${row.status === "Present" ? "bg-[#dff9ea] text-[#009d4c]" : "bg-[#ffe3e6] text-[#ff001a]"}`}>
                                  {row.status}
                                </span>
                              </td>
                              <td className="px-[16px] py-[13px] text-[16px] font-normal leading-none text-[#657183]">{row.notes}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="py-10 text-center text-[15px] text-[#657183]">No records yet.</p>
                  )}
                </div>
              )}

              {activeTab === "Notes" && (
                <div>
                  <div className="mb-[17px] flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h3 className="text-[22px] font-semibold leading-none text-[#2d3b4f]">Session Notes</h3>
                    <Link href="/mentorshippanel/notesandreport">
                      <button className="h-[37px] rounded-[8px] bg-[#ffa313] px-[17px] text-[14px] font-semibold text-white transition hover:bg-[#f59a0d]">
                        Add Note
                      </button>
                    </Link>
                  </div>
                  <div className="space-y-[16px]">
                    {selectedStudent.notes.length > 0 ? (
                      selectedStudent.notes.map((note) => (
                        <div key={note.id} className="rounded-[8px] border border-[#d6d6d6] bg-white px-[16px] py-[17px]">
                          <span className="inline-flex h-[23px] items-center rounded-[8px] bg-[#dcebff] px-[9px] text-[12px] font-semibold leading-none text-[#006ce5]">
                            {note.type}
                          </span>
                          <p className="mt-[10px] text-[12px] font-normal leading-[1.2] text-[#657183]">{note.date} - {note.author}<br />Mentor</p>
                          <p className="text-[14px] font-normal leading-none text-[#2d3b4f]">{note.content}</p>
                        </div>
                      ))
                    ) : (
                      <p className="py-10 text-center text-[15px] text-[#657183]">No notes available.</p>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "Messages" && (
                <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
                  <p className="mb-[18px] text-[15px] font-normal leading-none text-[#657183]">No messages yet. Start a conversation!</p>
                  <Link href="/mentorshippanel/message">
                    <button className="h-[37px] rounded-[8px] bg-[#ffa313] px-[21px] text-[14px] font-semibold text-white transition hover:bg-[#f59a0d]">Send Message</button>
                  </Link>
                </div>
              )}

              {activeTab === "Documents" && (
                <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
                  {uploadedDocs.length === 0 ? (
                    <>
                      <p className="mb-[18px] text-[15px] font-normal leading-none text-[#657183]">No documents uploaded yet.</p>
                      <button onClick={() => setIsUploadModalOpen(true)} className="h-[37px] rounded-[8px] bg-[#ffa313] px-[17px] text-[14px] font-semibold text-white transition hover:bg-[#f59a0d]">Upload Document</button>
                    </>
                  ) : (
                    <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
                      {uploadedDocs.map((doc, index) => (
                        <div key={`${doc}-${index}`} className="flex items-center gap-3 rounded-[8px] border border-dashed border-[#d6d6d6] p-4 text-left">
                          <FileText className="text-[#ffa313]" />
                          <span className="truncate text-[14px] font-medium text-[#2d3b4f]">{doc}</span>
                        </div>
                      ))}
                      <button onClick={() => setIsUploadModalOpen(true)} className="flex items-center justify-center rounded-[8px] border border-dashed border-[#d6d6d6] p-4 hover:bg-[#f7f7f7]">
                        <Plus className="text-[#657183]" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-[24px] rounded-[8px] border border-[#d6d6d6] bg-white px-[24px] pb-[24px] pt-[28px]">
          <div className="mb-[22px] flex items-center gap-[8px]">
            <TrendingUp size={18} strokeWidth={1.8} className="text-[#ffa313]" />
            <h3 className="text-[22px] font-semibold leading-none text-[#2d3b4f]">Academic Progress</h3>
          </div>
          <div className="h-[300px] w-full">
            {selectedStudent.academicProgress.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={selectedStudent.academicProgress} margin={{ top: 0, right: 5, left: -5, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical stroke="#d6d6d6" />
                  <XAxis dataKey="month" axisLine={{ stroke: "#8f8f8f" }} tickLine={false} tick={{ fill: "#666666", fontSize: 12 }} />
                  <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} axisLine={{ stroke: "#8f8f8f" }} tickLine={false} tick={{ fill: "#666666", fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="score" stroke="#ffa313" strokeWidth={2} dot={{ r: 3, fill: "#ffffff", stroke: "#ffa313", strokeWidth: 2 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-[#657183]">No data.</div>
            )}
          </div>
        </div>

        {isUploadModalOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
            <div className="max-h-[calc(100dvh-32px)] w-full max-w-xl overflow-y-auto rounded-[16px] bg-white p-5 shadow-2xl [scrollbar-width:none] [-ms-overflow-style:none] sm:p-8 [&::-webkit-scrollbar]:hidden">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-xl font-semibold text-[#111111]">Upload</h3>
                <button onClick={() => setIsUploadModalOpen(false)} className="text-[#657183] hover:text-[#111111]">x</button>
              </div>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
              <button
                type="button"
                className="flex w-full flex-col items-center justify-center rounded-[12px] border-2 border-dashed border-[#d6d6d6] p-8 text-center transition hover:bg-[#f7f7f7] sm:p-12"
                onClick={triggerFileSelect}
              >
                <span className="mb-4 flex h-[56px] w-[56px] items-center justify-center rounded-full bg-[#fff3df]">
                  <Upload className="h-8 w-8 text-[#ffa313]" />
                </span>
                <span className="text-[18px] font-semibold text-[#111111]">Drop files here or click to browse</span>
                <span className="mt-1 text-[14px] text-[#657183]">Maximum file size: 50MB</span>
              </button>
            </div>
          </div>
        )}
      </section>
    );
  }

  return (
    <section className="min-h-full overflow-x-hidden bg-[#f4f4f4] px-4 pb-[24px] pt-[28px] font-poppins text-[#111111] md:px-6">
      <div className="mb-[26px] flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-[30px] font-bold leading-none tracking-[-0.02em] text-[#111111]">Assigned Students</h1>
          <p className="mt-[10px] text-[14px] font-normal leading-none text-[#666666]">Manage and track your mentees</p>
        </div>
        <button
          onClick={handleExport}
          className="flex h-[41px] w-full items-center justify-center gap-[8px] rounded-[10px] bg-[#ffa313] px-[18px] text-[14px] font-semibold text-white transition hover:bg-[#f59a0d] sm:w-auto"
        >
          <Download size={16} strokeWidth={2} />
          Export List
        </button>
      </div>

      {notice && (
        <div className="mb-4 rounded-[8px] border border-red-200 bg-red-50 px-4 py-3 text-[14px] font-semibold text-red-700">
          {notice}
        </div>
      )}

      <div className="mb-[24px] flex min-h-[69px] flex-col gap-3 rounded-[8px] border border-[#dddddd] bg-white px-[16px] py-[12px] sm:flex-row sm:items-center">
        <div className="flex items-center gap-[9px] text-[16px] font-normal text-[#666666]">
          <Filter size={20} strokeWidth={1.8} />
          <span>Filters:</span>
        </div>
        <div className="relative w-full sm:w-[158px]">
          <select
            value={filterGrade}
            onChange={(e) => setFilterGrade(e.target.value)}
            className="h-[44px] w-full appearance-none rounded-[8px] border border-[#dddddd] bg-white px-[16px] pr-[38px] text-[16px] font-normal text-[#666666] outline-none"
          >
            <option>All Grades</option>
            <option>8th</option>
            <option>9th</option>
            <option>10th</option>
            <option>11th</option>
            <option>12th</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-[14px] top-1/2 -translate-y-1/2 text-[#666666]" size={18} strokeWidth={1.8} />
        </div>
        <div className="relative w-full sm:w-[187px]">
          <select
            value={filterRisk}
            onChange={(e) => setFilterRisk(e.target.value)}
            className="h-[44px] w-full appearance-none rounded-[8px] border border-[#dddddd] bg-white px-[16px] pr-[38px] text-[16px] font-normal text-[#666666] outline-none"
          >
            <option>All Risk Levels</option>
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-[14px] top-1/2 -translate-y-1/2 text-[#666666]" size={18} strokeWidth={1.8} />
        </div>
      </div>

      <div ref={tableRef} id="students-table-container" className="rounded-[8px] border border-[#dddddd] bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left">
            <thead>
              <tr className="border-b border-[#dddddd] bg-[#fbfbfb]">
                <th className="px-[24px] py-[19px] text-[16px] font-semibold leading-none text-[#666666] md:px-[40px]">Student</th>
                <th className="px-[20px] py-[19px] text-[16px] font-semibold leading-none text-[#666666]">School</th>
                <th className="px-[20px] py-[19px] text-[16px] font-semibold leading-none text-[#666666]">Grade</th>
                <th className="px-[20px] py-[19px] text-[16px] font-semibold leading-none text-[#666666]">Risk Level</th>
                <th className="px-[20px] py-[19px] text-[16px] font-semibold leading-none text-[#666666]">Attendance</th>
                <th className="px-[34px] py-[19px] text-[16px] font-semibold leading-none text-[#666666]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={6} className="px-[24px] py-[40px] text-center text-[16px] text-[#666666]">Loading your students...</td></tr>
              )}
              {!loading && filteredStudents.length === 0 && (
                <tr><td colSpan={6} className="px-[24px] py-[40px] text-center text-[16px] text-[#666666]">No students assigned to you yet.</td></tr>
              )}
              {!loading && filteredStudents.map((student) => (
                <tr key={student.id} className="border-b border-[#e5e5e5] last:border-b-0">
                  <td className="px-[24px] py-[17px] md:px-[40px]">
                    <button type="button" onClick={() => openProfile(student)} className="flex items-center gap-[14px] text-left">
                      <img src={student.avatar} className="h-[40px] w-[40px] rounded-full object-cover" alt={student.name} />
                      <span className="text-[16px] font-normal leading-none text-[#111111]">{student.name}</span>
                    </button>
                  </td>
                  <td className="px-[20px] py-[17px] text-[16px] font-normal leading-none text-[#666666]">{student.school}</td>
                  <td className="px-[20px] py-[17px] text-[16px] font-normal leading-none text-[#111111]">{student.grade}</td>
                  <td className="px-[20px] py-[17px]"><RiskBadge level={student.riskLevel} /></td>
                  <td className="px-[20px] py-[17px]"><AttendanceText value={student.attendance} /></td>
                  <td className="relative px-[34px] py-[17px]">
                    <button
                      onClick={(event) => {
                        if (openDropdown === student.id) {
                          setOpenDropdown(null);
                          setDropdownPosition(null);
                          return;
                        }
                        const rect = event.currentTarget.getBoundingClientRect();
                        setDropdownPosition({
                          top: Math.min(rect.bottom + 8, window.innerHeight - 188),
                          left: Math.max(12, Math.min(rect.right - 205, window.innerWidth - 217)),
                        });
                        setOpenDropdown(student.id);
                      }}
                      className="flex h-[30px] w-[30px] items-center justify-center rounded-full text-[#444444] transition hover:bg-[#f1f1f1]"
                      aria-label={`Actions for ${student.name}`}
                    >
                      <MoreVertical size={20} strokeWidth={2} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="mt-[27px] max-w-[105px] text-[14px] font-normal leading-[1.35] text-[#666666]">
        Showing {filteredStudents.length} of {students.length} students
      </p>
      {isMounted && openDropdown && dropdownPosition && createPortal(
        <>
          <button className="fixed inset-0 z-[300] cursor-default" onClick={() => { setOpenDropdown(null); setDropdownPosition(null); }} aria-label="Close actions" />
          <div
            className="fixed z-[310] w-[205px] overflow-hidden rounded-[6px] border border-[#eeeeee] bg-white py-[5px] text-left shadow-[0_18px_32px_rgba(0,0,0,0.26)]"
            style={{ top: dropdownPosition.top, left: dropdownPosition.left }}
          >
            {(() => {
              const student = students.find((item) => item.id === openDropdown);
              if (!student) return null;
              return (
                <>
                  <button onClick={() => openProfile(student)} className="flex h-[43px] w-full items-center gap-[14px] px-[17px] text-[15px] font-medium leading-none text-[#666666] hover:bg-[#f8f8f8]">
                    <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center"><Eye size={17} strokeWidth={1.8} /></span>
                    <span className="-translate-y-px">View Profile</span>
                  </button>
                  <Link href="/mentorshippanel/message">
                    <button className="flex h-[43px] w-full items-center gap-[14px] px-[17px] text-[15px] font-medium leading-none text-[#666666] hover:bg-[#f8f8f8]">
                      <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center"><MessageSquare size={17} strokeWidth={1.8} /></span>
                      <span className="-translate-y-px">Send Message</span>
                    </button>
                  </Link>
                  <Link href="/mentorshippanel/calendarmen">
                    <button className="flex h-[43px] w-full items-center gap-[14px] px-[17px] text-[15px] font-medium leading-none text-[#666666] hover:bg-[#f8f8f8]">
                      <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center"><Calendar size={17} strokeWidth={1.8} /></span>
                      <span className="-translate-y-px whitespace-nowrap">Schedule Session</span>
                    </button>
                  </Link>
                  <div className="h-px bg-[#eeeeee]" />
                  <Link href="/mentorshippanel/notesandreport">
                    <button className="flex h-[43px] w-full items-center gap-[14px] px-[17px] text-[15px] font-medium leading-none text-[#666666] hover:bg-[#f8f8f8]">
                      <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center"><FileText size={17} strokeWidth={1.8} /></span>
                      <span className="-translate-y-px">Add Note</span>
                    </button>
                  </Link>
                </>
              );
            })()}
          </div>
        </>,
        document.body
      )}
    </section>
  );
}
