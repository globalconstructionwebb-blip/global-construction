"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Edit2, Trash2, Eye } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function BlogListPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error("Kunde inte hämta inlägg:", error);
      } else {
        setPosts(data || []);
      }
      setLoading(false);
    }
    
    fetchPosts();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 font-outfit">Kunskapsbanken</h1>
          <p className="text-slate-500 mt-1">Hantera dina blogginlägg och artiklar.</p>
        </div>
        <Link href="/admin/content/blog/new" className="flex items-center gap-2 bg-[#1B263B] text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/10">
          <Plus className="w-5 h-5" />
          NYTT INLÄGG
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider">Titel</th>
              <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider">Kategori</th>
              <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-sm font-bold text-slate-600 uppercase tracking-wider text-right">Åtgärder</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-slate-400">Laddar inlägg...</td>
              </tr>
            ) : posts.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-slate-400">Inga inlägg hittades. Skapa ditt första!</td>
              </tr>
            ) : (
              posts.map((post: any) => (
                <tr key={post.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{post.title}</div>
                    <div className="text-xs text-slate-400 mt-0.5">/{post.slug}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium">
                      {post.categories?.[0] || "Allmänt"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {post.published ? (
                      <span className="flex items-center gap-1.5 text-emerald-600 text-sm font-bold">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        Publicerad
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-slate-400 text-sm font-bold">
                        <div className="w-2 h-2 bg-slate-300 rounded-full" />
                        Utkast
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/artikel.html?slug=${post.slug}`} target="_blank" className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                        <Eye className="w-5 h-5" />
                      </Link>
                      <Link href={`/admin/content/blog/edit/${post.id}`} className="p-2 text-slate-400 hover:text-amber-600 transition-colors">
                        <Edit2 className="w-5 h-5" />
                      </Link>
                      <button onClick={async () => {
                        if(confirm('Ta bort detta inlägg?')) {
                          await supabase.from('posts').delete().eq('id', post.id);
                          window.location.reload();
                        }
                      }} className="p-2 text-slate-400 hover:text-red-600 transition-colors">
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
