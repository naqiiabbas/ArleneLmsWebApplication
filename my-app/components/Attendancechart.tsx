"use client";
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AttendanceChart = ({ data }: { data: any[] }) => {
  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 0, right: 8, left: -10, bottom: 0 }} barGap={0} barCategoryGap="35%">
          <CartesianGrid strokeDasharray="3 3" vertical stroke="#d8d8d8" />
          <XAxis dataKey="day" axisLine={{ stroke: '#8f8f8f' }} tickLine={false} tick={{ fill: '#666666', fontSize: 12, fontWeight: 400 }} dy={10} />
          <YAxis axisLine={{ stroke: '#8f8f8f' }} tickLine={false} tick={{ fill: '#666666', fontSize: 12, fontWeight: 400 }} ticks={[0, 4, 8, 12, 16]} domain={[0, 16]} />
          <Tooltip cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
          <Bar dataKey="present" fill="#ffa313" radius={[0, 0, 0, 0]} barSize={78} />
          <Bar dataKey="absent" fill="#ef493e" radius={[0, 0, 0, 0]} barSize={78} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AttendanceChart;
