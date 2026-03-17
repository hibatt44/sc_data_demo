'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ProficiencyData {
  subject: string;
  proficiency: number;
}

interface Props {
  elaProficiency?: number;
  mathProficiency?: number;
  title?: string;
}

export function ProficiencyChart({ elaProficiency, mathProficiency, title = 'Academic Proficiency' }: Props) {
  const data: ProficiencyData[] = [
    ...(elaProficiency != null ? [{ subject: 'ELA', proficiency: Math.round(elaProficiency) }] : []),
    ...(mathProficiency != null ? [{ subject: 'Math', proficiency: Math.round(mathProficiency) }] : []),
  ];

  if (data.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-5">
        <h3 className="text-sm font-semibold text-sc-text mb-4">{title}</h3>
        <p className="text-sc-muted text-sm">No proficiency data available.</p>
      </div>
    );
  }

  const summary = data.map(d => `${d.subject}: ${d.proficiency}%`).join(', ');

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5">
      <h3 className="text-sm font-semibold text-sc-text mb-4 uppercase tracking-wide">{title}</h3>
      <div
        aria-label={`Bar chart showing academic proficiency. ${summary}`}
        role="img"
      >
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="subject" tick={{ fontSize: 13, fill: '#6B7280' }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#6B7280' }} tickFormatter={v => `${v}%`} />
            <Tooltip formatter={(val) => [`${val}%`, 'Proficiency']} />
            <Bar dataKey="proficiency" name="Proficiency %" radius={[4, 4, 0, 0]}
              fill="#003366"
            />
          </BarChart>
        </ResponsiveContainer>
        <caption className="sr-only">{title}: {summary}</caption>
      </div>
    </div>
  );
}
