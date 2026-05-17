"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Edit2, Trash2, Briefcase, MapPin } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function JobListPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchJobs() {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error("Kunde inte hämta jobb:", error);
      } else {
        setJobs(data || []);
      }
      setLoading(false);
    }
    
    fetchJobs();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Är du säker på att du vill ta bort denna tjänst?")) return;
    const { error } = await supabase.from('jobs').delete().eq('id', id);
    if (error) alert("Kunde inte ta bort jobbet.");
    else setJobs(jobs.filter((j: any) => j.id !== id));
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 font-outfit">Lediga Tjänster</h1>
          <p className="text-slate-500 mt-1">Hantera platsannonser och rekrytering.</p>
        </div>
        <Link href="/admin/content/jobs/new" className="flex items-center gap-2 bg-[#1B263B] text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg">
          <Plus className="w-5 h-5" />
          NY TJÄNST
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider">Roll / Titel</th>
              <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider">Ort & Typ</th>
              <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider text-right">Åtgärder</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-slate-400">Laddar tjänster...</td>
              </tr>
            ) : jobs.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-slate-400">
                  <div className="flex flex-col items-center gap-3">
                    <Briefcase className="w-8 h-8 text-slate-200" />
                    <span>Inga lediga tjänster upplagda än.</span>
                  </div>
                </td>
              </tr>
            ) : (
              jobs.map((job: any) => (
                <tr key={job.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{job.title}</div>
                    <div className="text-xs text-blue-500 font-medium">{job.excerpt || "Ingen beskrivning"}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-sm text-slate-600 font-medium">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {job.location}
                    </div>
                    <div className="text-xs text-slate-400 mt-1 uppercase font-bold tracking-tighter">{job.job_type}</div>
                  </td>
                  <td className="px-6 py-4">
                    {job.published ? (
                      <span className="text-emerald-600 text-sm font-bold flex items-center gap-1.5">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full" /> Aktiv
                      </span>
                    ) : (
                      <span className="text-slate-400 text-sm font-bold flex items-center gap-1.5">
                        <div className="w-2 h-2 bg-slate-300 rounded-full" /> Inaktiv
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                      <Link href={`/admin/content/jobs/edit/${job.id}`} className="p-2 text-slate-400 hover:text-amber-600 transition-colors">
                        <Edit2 className="w-5 h-5" />
                      </Link>
                      <button onClick={() => handleDelete(job.id)} className="p-2 text-slate-400 hover:text-red-600 transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
