"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Edit2, Trash2, Eye, FolderKanban } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function ProjectListPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProjects() {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('publish_date', { ascending: false });
        
      if (error) {
        console.error("Kunde inte hämta projekt:", error);
      } else {
        setProjects(data || []);
      }
      setLoading(false);
    }
    
    fetchProjects();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Är du säker på att du vill ta bort detta projekt?")) return;
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) alert("Kunde inte ta bort projektet.");
    else setProjects(projects.filter((p: any) => p.id !== id));
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 font-outfit">Projekt</h1>
          <p className="text-slate-500 mt-1">Hantera dina utförda projekt och referenscase.</p>
        </div>
        <Link href="/admin/content/projects/new" className="flex items-center gap-2 bg-[#1B263B] text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg">
          <Plus className="w-5 h-5" />
          NYTT PROJEKT
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider">Projekt / Kund</th>
              <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider">Kategori</th>
              <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider text-right">Åtgärder</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-slate-400">Laddar projekt...</td>
              </tr>
            ) : projects.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-slate-400">
                  <div className="flex flex-col items-center gap-3">
                    <FolderKanban className="w-8 h-8 text-slate-200" />
                    <span>Inga projekt hittades. Skapa ditt första!</span>
                  </div>
                </td>
              </tr>
            ) : (
              projects.map((project: any) => (
                <tr key={project.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{project.title}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{project.client || "Ingen kund angiven"}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs font-bold uppercase tracking-wider">
                      {project.category || "Allmänt"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {project.published ? (
                      <span className="text-emerald-600 text-sm font-bold flex items-center gap-1.5">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full" /> Publicerad
                      </span>
                    ) : (
                      <span className="text-slate-400 text-sm font-bold flex items-center gap-1.5">
                        <div className="w-2 h-2 bg-slate-300 rounded-full" /> Utkast
                      </span>
                    )}
                  </td>
                    <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/projekt-detalj.html?slug=${project.slug}`} target="_blank" className="p-2 text-slate-400 hover:text-blue-600 transition-colors" title="Visa på hemsidan">
                        <Eye className="w-5 h-5" />
                      </Link>
                      <Link href={`/admin/content/projects/edit/${project.id}`} className="p-2 text-slate-400 hover:text-amber-600 transition-colors" title="Redigera">
                        <Edit2 className="w-5 h-5" />
                      </Link>
                      <button onClick={() => handleDelete(project.id)} className="p-2 text-slate-400 hover:text-red-600 transition-colors" title="Ta bort">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
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
