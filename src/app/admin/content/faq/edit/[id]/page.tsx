"use client";

import { useState, useEffect, use , useRef} from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, HelpCircle, ChevronDown , Bold, Italic, AlignLeft, AlignCenter, AlignJustify, Link as LinkIcon, List, ListOrdered } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useLeaveConfirmation } from "@/hooks/useLeaveConfirmation";


// --- Premium Rich Text Editor ---
function RichTextEditor({ value, onChange, placeholder, editorClassName }: { value: string, onChange: (val: string) => void, placeholder: string, editorClassName?: string }) {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, []);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const executeCommand = (command: string, arg?: string) => {
    document.execCommand(command, false, arg);
    editorRef.current?.focus();
    handleInput();
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden focus-within:border-gray-500 focus-within:ring-1 focus-within:ring-gray-500 transition-all bg-white relative shadow-sm">
      <div className="flex flex-wrap items-center gap-1 p-1.5 bg-gray-50/80 border-b border-gray-200">
        <button type="button" onClick={() => executeCommand('bold')} className="p-1.5 text-gray-600 hover:bg-white hover:shadow-sm rounded transition-all" title="Fetstilt"><Bold className="w-3.5 h-3.5" /></button>
        <button type="button" onClick={() => executeCommand('italic')} className="p-1.5 text-gray-600 hover:bg-white hover:shadow-sm rounded transition-all" title="Kursiv"><Italic className="w-3.5 h-3.5" /></button>
        <div className="w-px h-4 bg-gray-300 mx-1" />
        <button type="button" onClick={() => executeCommand('insertUnorderedList')} className="p-1.5 text-gray-600 hover:bg-white hover:shadow-sm rounded transition-all" title="Punktlista"><List className="w-3.5 h-3.5" /></button>
        <button type="button" onClick={() => executeCommand('insertOrderedList')} className="p-1.5 text-gray-600 hover:bg-white hover:shadow-sm rounded transition-all" title="Numrerad lista"><ListOrdered className="w-3.5 h-3.5" /></button>
        <div className="w-px h-4 bg-gray-300 mx-1" />
        <button type="button" onClick={() => executeCommand('justifyLeft')} className="p-1.5 text-gray-600 hover:bg-white hover:shadow-sm rounded transition-all" title="Vänsterjustera"><AlignLeft className="w-3.5 h-3.5" /></button>
        <button type="button" onClick={() => executeCommand('justifyCenter')} className="p-1.5 text-gray-600 hover:bg-white hover:shadow-sm rounded transition-all" title="Centrera"><AlignCenter className="w-3.5 h-3.5" /></button>
        <button type="button" onClick={() => executeCommand('justifyFull')} className="p-1.5 text-gray-600 hover:bg-white hover:shadow-sm rounded transition-all" title="Marginaljustera"><AlignJustify className="w-3.5 h-3.5" /></button>
        <div className="w-px h-4 bg-gray-300 mx-1" />
        <button type="button" onClick={() => {
          const url = prompt('Länk URL (inklusive https://):');
          if (url) executeCommand('createLink', url);
        }} className="p-1.5 text-gray-600 hover:bg-white hover:shadow-sm rounded transition-all" title="Infoga länk"><LinkIcon className="w-3.5 h-3.5" /></button>
      </div>
      <div 
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onBlur={handleInput}
        className={`p-4 outline-none font-outfit editor-content ${editorClassName || 'min-h-[120px] text-gray-700 leading-relaxed'}`}
        data-placeholder={placeholder}
      />
    </div>
  );
}


export default function EditFaqPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  useLeaveConfirmation(isDirty && !saving);
  
  // FAQ Metadata
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [category, setCategory] = useState("konstruktion");
  const [sortOrder, setSortOrder] = useState(0);

  useEffect(() => {
    async function loadFaq() {
      const { data, error } = await supabase
        .from('FAQ')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error || !data) {
        alert("Kunde inte ladda frågan.");
        router.push("/admin/content/faq");
        return;
      }

      setQuestion(data.question || "");
      setAnswer(data.answer || "");
      setCategory(data.category || "konstruktion");
      setSortOrder(data.sort_order || 0);
      setLoading(false);
    }
    
    loadFaq();
  }, [id, router]);

  const handleSubmit = async () => {
    if (!question || !answer) return alert("Fyll i både fråga och svar!");
    setSaving(true);

    try {
      const { error } = await supabase.from('FAQ').update({
        updatedAt: new Date().toISOString(),
        question,
        answer,
        category,
        sort_order: sortOrder
      }).eq('id', id);

      if (error) throw error;
      router.push("/admin/content/faq");
      router.refresh();
    } catch (error: any) {
      console.error(error);
      alert("Ett fel uppstod: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-20 text-center font-bold text-slate-400">Laddar fråga...</div>;

  return (
    <div className="max-w-[1200px] mx-auto pb-32">
      <div className="flex justify-between items-center bg-white/80 backdrop-blur-md px-8 py-5 border-b border-gray-200 sticky top-0 z-50">
        <div className="flex items-center gap-5">
          <Link href="/admin/content/faq" className="p-2 text-gray-400 hover:text-gray-900 bg-gray-50 rounded-md border border-gray-200 shadow-sm">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Redigera FAQ</h1>
          </div>
        </div>
        <button onClick={handleSubmit} disabled={saving} className="flex items-center gap-2 bg-[#1B263B] text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-blue-900 transition-colors shadow-sm disabled:opacity-50">
          {saving ? "Sparar..." : <><Save className="w-4 h-4" /> Spara Ändringar</>}
        </button>
      </div>

      <div className="flex flex-col lg:row gap-12 p-8 lg:p-16" onChange={() => setIsDirty(true)} onInput={() => setIsDirty(true)}>
        <div className="flex-1 space-y-8 max-w-2xl">
          <div className="space-y-6 bg-gray-50/50 p-8 rounded-2xl border border-gray-100">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest border-b pb-2">Information</h3>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Fråga</label>
              <input type="text" value={question} onChange={(e) => setQuestion(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gray-800 outline-none text-base bg-white font-medium transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Svar</label>
              <RichTextEditor value={answer} onChange={setAnswer} placeholder="Skriv det informativa svaret här..." editorClassName="text-base text-gray-600 leading-relaxed min-h-[120px]" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Kategori</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gray-800 outline-none text-sm bg-white font-medium appearance-none cursor-pointer">
                  <option value="konstruktion">Konstruktion</option>
                  <option value="skyddsrum">Skyddsrum</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Sorteringsordning</label>
                <input type="number" value={sortOrder} onChange={(e) => setSortOrder(parseInt(e.target.value))} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gray-800 outline-none text-sm bg-white font-medium" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-6">
          <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-6 px-2">Förhandsvisning</h3>
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
             <div className="p-6 flex justify-between items-center bg-white cursor-default">
               <h4 className="text-lg font-bold text-[#1B263B] leading-tight pr-8">{question}</h4>
               <ChevronDown className="w-5 h-5 text-gray-300 transform rotate-180" />
             </div>
             <div className="px-6 pb-6 pt-2 border-t border-gray-50">
                <div className="text-gray-600 leading-relaxed text-[15px] editor-content" dangerouslySetInnerHTML={{ __html: answer || 'Här dyker det informativa svaret upp exakt som det kommer se ut när en besökare klickar på frågan på hemsidan.' }} />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
