"use client";

import { useState, useRef, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, GripVertical, Plus, Type, Heading1, Heading2, Heading3, Image as ImageIcon, Trash2, Calendar, User, Upload, AlignLeft, AlignCenter, AlignJustify, Link as LinkIcon, Bold, Italic, Info, MapPin, Briefcase } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useLeaveConfirmation } from "@/hooks/useLeaveConfirmation";

type BlockType = 'h1' | 'h2' | 'h3' | 'p' | 'image';

interface Block {
  id: string;
  type: BlockType;
  content: string;
  alt?: string;
}

// --- Premium Image Uploader ---
function ImageUploader({ value, onChange, placeholder }: { value: string, onChange: (val: string) => void, placeholder?: string }) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `jobs/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('images').getPublicUrl(filePath);
      onChange(data.publicUrl);
    } catch (error: any) {
      console.error(error);
      alert('Kunde inte ladda upp bilden: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="relative group border border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer overflow-hidden min-h-[120px]">
        <input 
          type="file" 
          accept="image/*"
          onChange={handleUpload}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          disabled={uploading}
        />
        {uploading ? (
          <div className="text-xs font-medium text-gray-500 flex items-center gap-2">
            <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" /> Laddar upp...
          </div>
        ) : value ? (
          <div className="absolute inset-0 w-full h-full">
            <img src={value} className="w-full h-full object-cover" alt="Preview" />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-gray-500">
            <Upload className="w-5 h-5 text-gray-400" />
            <span className="text-xs font-medium">{placeholder || "Ladda upp bild"}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Premium Rich Text Editor ---
function RichTextEditor({ value, onChange, placeholder, editorClassName }: { value: string, onChange: (val: string) => void, placeholder: string, editorClassName?: string }) {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

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
        <button type="button" onClick={() => executeCommand('bold')} className="p-1.5 text-gray-600 hover:bg-white rounded transition-all"><Bold className="w-3.5 h-3.5" /></button>
        <button type="button" onClick={() => executeCommand('italic')} className="p-1.5 text-gray-600 hover:bg-white rounded transition-all"><Italic className="w-3.5 h-3.5" /></button>
        <div className="w-px h-4 bg-gray-300 mx-1" />
        <button type="button" onClick={() => executeCommand('justifyLeft')} className="p-1.5 text-gray-600 hover:bg-white rounded transition-all"><AlignLeft className="w-3.5 h-3.5" /></button>
        <button type="button" onClick={() => executeCommand('justifyCenter')} className="p-1.5 text-gray-600 hover:bg-white rounded transition-all"><AlignCenter className="w-3.5 h-3.5" /></button>
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

export default function EditJobPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  useLeaveConfirmation(isDirty && !saving);
  
  // Job Metadata
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [published, setPublished] = useState(true);

  // Blocks state
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null);

  useEffect(() => {
    async function loadJob() {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error || !data) {
        alert("Kunde inte ladda tjänsten.");
        router.push("/admin/content/jobs");
        return;
      }

      setTitle(data.title || "");
      setSlug(data.slug || "");
      setLocation(data.location || "");
      setJobType(data.job_type || "");
      setExcerpt(data.excerpt || "");
      setPublished(data.published);
      
      if (data.blocks) {
        setBlocks(data.blocks);
      } else {
        setBlocks([
          { id: crypto.randomUUID(), type: 'h2', content: 'Om rollen' },
          { id: crypto.randomUUID(), type: 'p', content: data.content || 'Beskrivning...' }
        ]);
      }
      setLoading(false);
    }
    
    loadJob();
  }, [id, router]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (!slug) setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
  };

  const addBlock = (type: BlockType) => {
    setBlocks([...blocks, { id: crypto.randomUUID(), type, content: '' }]);
  };

  const updateBlock = (id: string, updates: Partial<Block>) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const removeBlock = (id: string) => {
    if (blocks.length === 1) return;
    setBlocks(blocks.filter(b => b.id !== id));
  };

  const generateHTML = () => {
    let html = '';
    blocks.forEach(block => {
      if (!block.content.trim() && block.type !== 'image') return;
      switch (block.type) {
        case 'h2': html += `<h2 class="editor-content">${block.content}</h2>\n`; break;
        case 'h3': html += `<h3 class="editor-content">${block.content}</h3>\n`; break;
        case 'p': html += `<p class="editor-content">${block.content}</p>\n`; break;
        case 'image': if (block.content) html += `<figure class="editor-content"><img src="${block.content}" alt="${block.alt || ''}" />${block.alt ? `<figcaption>${block.alt}</figcaption>` : ''}</figure>\n`; break;
      }
    });
    return html;
  };

  const handleSubmit = async () => {
    if (!title) return alert("Fyll i en titel!");
    setSaving(true);

    try {
      const htmlContent = generateHTML();
      const { error } = await supabase.from("jobs").update({
        title, 
        slug, 
        location,
        job_type: jobType,
        excerpt,
        content: htmlContent, 
        published,
        blocks: blocks
      }).eq('id', id);

      if (error) throw error;
      router.push("/admin/content/jobs");
      router.refresh();
    } catch (error: any) {
      console.error(error);
      alert("Kunde inte spara: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-20 text-center font-bold text-slate-400">Laddar tjänst...</div>;

  return (
    <div className="w-full pb-32">
      <div className="flex justify-between items-center bg-white/80 backdrop-blur-md px-8 py-5 border-b border-gray-200 sticky top-0 z-50">
        <div className="flex items-center gap-5">
          <Link href="/admin/content/jobs" className="p-2 text-gray-400 hover:text-gray-900 bg-gray-50 rounded-md border border-gray-200">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Redigera Tjänst</h1>
        </div>
        <button onClick={handleSubmit} disabled={saving} className="flex items-center gap-2 bg-[#1B263B] text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-blue-900 transition-colors disabled:opacity-50">
          {saving ? "Sparar..." : <><Save className="w-4 h-4" /> Spara Ändringar</>}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-0" onChange={() => setIsDirty(true)} onInput={() => setIsDirty(true)}>
        <div className="lg:w-[340px] xl:w-[380px] flex-shrink-0 border-r border-gray-200 bg-gray-50/50 p-8 space-y-8">
          <div className="space-y-6">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest border-b pb-2">Information</h3>
            <input type="text" value={title} onChange={handleTitleChange} className="w-full px-3 py-2.5 rounded-md border border-gray-200 text-sm bg-white" placeholder="Titel" />
            <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full px-3 py-2.5 rounded-md border border-gray-200 text-sm bg-white" placeholder="Ort" />
            <input type="text" value={jobType} onChange={(e) => setJobType(e.target.value)} className="w-full px-3 py-2.5 rounded-md border border-gray-200 text-sm bg-white" placeholder="Typ" />
            <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={3} className="w-full px-3 py-2.5 rounded-md border border-gray-200 text-sm bg-white" placeholder="Nyckelord..." />
          </div>
        </div>

        <div className="flex-1 bg-white p-8 lg:p-16">
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="bg-white border border-gray-200 rounded-2xl p-8 flex justify-between items-center shadow-sm">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-[#1B263B]">{title}</h3>
                  <div className="flex gap-4 text-gray-400 font-semibold text-sm">
                    <span>{location}</span>
                    <span>{jobType}</span>
                    <span className="text-blue-500">{excerpt}</span>
                  </div>
                </div>
            </div>

            <div className="space-y-6">
                {blocks.map((block) => (
                  <div key={block.id} className="group relative flex gap-4 px-6 py-4 rounded-2xl hover:bg-gray-50 transition-all">
                    <div className="flex-1">
                      {block.type === 'h2' && <RichTextEditor value={block.content} onChange={(c) => updateBlock(block.id, { content: c })} placeholder="Rubrik..." editorClassName="text-3xl font-bold text-gray-900 bg-transparent" />}
                      {block.type === 'p' && <RichTextEditor value={block.content} onChange={(c) => updateBlock(block.id, { content: c })} placeholder="Text..." editorClassName="text-lg text-gray-600 leading-relaxed" />}
                    </div>
                    <button onClick={() => removeBlock(block.id)} className="text-gray-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
            </div>
            
            <div className="flex gap-3">
                <button onClick={() => addBlock('h2')} className="text-xs font-bold text-gray-500 bg-gray-100 px-4 py-2 rounded-lg">Ny Rubrik</button>
                <button onClick={() => addBlock('p')} className="text-xs font-bold text-gray-500 bg-gray-100 px-4 py-2 rounded-lg">Ny Text</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
