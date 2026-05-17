"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Edit2, Trash2, HelpCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function FaqListPage() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFaqs() {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .order('sort_order', { ascending: true });
        
      if (error) {
        console.error("Kunde inte hämta FAQ:", error);
      } else {
        setFaqs(data || []);
      }
      setLoading(false);
    }
    
    fetchFaqs();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Är du säker på att du vill ta bort denna fråga?")) return;
    const { error } = await supabase.from('faqs').delete().eq('id', id);
    if (error) alert("Kunde inte ta bort frågan.");
    else setFaqs(faqs.filter((f: any) => f.id !== id));
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 font-outfit">FAQ</h1>
          <p className="text-slate-500 mt-1">Hantera vanliga frågor och svar.</p>
        </div>
        <Link href="/admin/content/faq/new" className="flex items-center gap-2 bg-[#1B263B] text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg">
          <Plus className="w-5 h-5" />
          NY FRÅGA
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider">Fråga</th>
              <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider">Kategori</th>
              <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider">Svar (början)</th>
              <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider text-right">Åtgärder</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-slate-400">Laddar FAQ...</td>
              </tr>
            ) : faqs.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-slate-400">
                  <div className="flex flex-col items-center gap-3">
                    <HelpCircle className="w-8 h-8 text-slate-200" />
                    <span>Inga frågor hittades.</span>
                  </div>
                </td>
              </tr>
            ) : (
              faqs.map((faq: any) => (
                <tr key={faq.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{faq.question}</div>
                    <div className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-widest">Ordning: {faq.sort_order}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${faq.category === 'skyddsrum' ? 'bg-teal-50 text-teal-600' : 'bg-gray-100 text-gray-600'}`}>
                      {faq.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-500 line-clamp-1 max-w-xs">{faq.answer}</div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/content/faq/edit/${faq.id}`} className="p-2 text-slate-400 hover:text-amber-600 transition-colors">
                        <Edit2 className="w-5 h-5" />
                      </Link>
                      <button onClick={() => handleDelete(faq.id)} className="p-2 text-slate-400 hover:text-red-600 transition-colors">
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
