"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, GripVertical, Plus, Type, Heading1, Heading2, Heading3, Image as ImageIcon, Trash2, Calendar, User, Upload, AlignLeft, AlignCenter, AlignJustify, Link as LinkIcon, Bold, Italic, Info, MapPin, Briefcase } from "lucide-react";
import { supabase } from "@/lib/supabase";

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
      alert('Kunde inte ladda upp bilden. Fel: ' + error.message);
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
        <button type="button" onClick={() => executeCommand('bold')} className="p-1.5 text-gray-600 hover:bg-white rounded transition-all"><Bold className="w-3.5 h-3.5" /></button>
        <button type="button" onClick={() => executeCommand('italic')} className="p-1.5 text-gray-600 hover:bg-white rounded transition-all"><Italic className="w-3.5 h-3.5" /></button>
        <div className="w-px h-4 bg-gray-300 mx-1" />
        <button type="button" onClick={() => executeCommand('justifyLeft')} className="p-1.5 text-gray-600 hover:bg-white rounded transition-all"><AlignLeft className="w-3.5 h-3.5" /></button>
        <button type="button" onClick={() => executeCommand('justifyCenter')} className="p-1.5 text-gray-600 hover:bg-white rounded transition-all"><AlignCenter className="w-3.5 h-3.5" /></button>
        <div className="w-px h-4 bg-gray-300 mx-1" />
        <button type="button" onClick={() => {
          const url = prompt('Länk URL:');
          if (url) executeCommand('createLink', url);
        }} className="p-1.5 text-gray-600 hover:bg-white rounded transition-all"><LinkIcon className="w-3.5 h-3.5" /></button>
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


export default function NewJobPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Job Metadata
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [location, setLocation] = useState("Stockholm");
  const [jobType, setJobType] = useState("Fulltid");
  const [excerpt, setExcerpt] = useState(""); // Used for the keywords on the card
  const [published, setPublished] = useState(true);

  // SEO Info state
  const [activeSeoField, setActiveSeoField] = useState<string | null>(null);

  // Blocks state for Job Detail
  const [blocks, setBlocks] = useState<Block[]>([
    { id: crypto.randomUUID(), type: 'h2', content: 'Om rollen' },
    { id: crypto.randomUUID(), type: 'p', content: 'Beskriv arbetsuppgifterna här...' },
    { id: crypto.randomUUID(), type: 'h2', content: 'Din profil' },
    { id: crypto.randomUUID(), type: 'p', content: 'Beskriv krav och önskemål här...' }
  ]);

  const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null);

  const generateSlug = (val: string) => {
    return val.toLowerCase().replace(/å/g, "a").replace(/ä/g, "a").replace(/ö/g, "o").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    setSlug(generateSlug(val));
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

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedBlockId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (!draggedBlockId || draggedBlockId === id) return;
    const draggedIndex = blocks.findIndex(b => b.id === draggedBlockId);
    const dropIndex = blocks.findIndex(b => b.id === id);
    if (draggedIndex === dropIndex) return;
    const newBlocks = [...blocks];
    const [draggedBlock] = newBlocks.splice(draggedIndex, 1);
    newBlocks.splice(dropIndex, 0, draggedBlock);
    setBlocks(newBlocks);
  };

  const handleDragEnd = () => setDraggedBlockId(null);

  const getBlockLabel = (type: BlockType) => {
    switch (type) {
      case 'h2': return 'H2 Rubrik';
      case 'h3': return 'H3 Rubrik';
      case 'p': return 'Text';
      case 'image': return 'Bild';
      default: return 'Block';
    }
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
    if (!title) return alert("Fyll i en jobbtitel först!");
    setLoading(true);

    try {
      const htmlContent = generateHTML();
      const { error } = await supabase.from("jobs").insert([{
        title, 
        slug, 
        location,
        job_type: jobType,
        excerpt, 
        description: excerpt, 
        requirements: "Se innehåll för detaljer", 
        content: htmlContent, 
        published,
        blocks: blocks
      }]);

      if (error) throw error;
      router.push("/admin/content/jobs");
      router.refresh();
    } catch (error: any) {
      console.error(error);
      alert("Ett fel uppstod. Har du kört SQL-skriptet 'update-all-schemas.sql'? Fel: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const SeoTip = ({ field }: { field: string }) => {
    if (field !== activeSeoField) return null;
    const tips: Record<string, { title: string, text: string, example: string }> = {
      title: { 
        title: "SEO-tips för Jobbtitel", 
        text: "Använd en tydlig yrkestitel som folk faktiskt söker på.",
        example: "Ex: 'Senior Konstruktionsingenjör'"
      },
      excerpt: { 
        title: "Kort Beskrivning / Nyckelord", 
        text: "Detta visas på jobb-kortet. Lista t.ex. tekniker eller huvudansvar.",
        example: "Ex: 'BIM / Revit / Projektledning'"
      }
    };
    const tip = tips[field];
    if (!tip) return null;
    return (
      <div className="absolute top-0 right-[calc(100%+20px)] w-72 p-5 bg-white border border-gray-200 shadow-2xl rounded-2xl animate-in fade-in slide-in-from-right-2 z-50">
        <div className="absolute top-4 -right-2 w-4 h-4 bg-white border-t border-r border-gray-200 transform rotate-45"></div>
        <div className="flex items-start gap-3 relative z-10">
          <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
          <div className="space-y-2">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{tip.title}</div>
            <div className="text-sm text-gray-700 leading-relaxed font-medium">{tip.text}</div>
            <div className="text-xs text-blue-600 bg-blue-50 p-2.5 rounded-lg border border-blue-100 font-medium italic">{tip.example}</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-[1600px] mx-auto pb-32">
      {/* Header */}
      <div className="flex justify-between items-center bg-white/80 backdrop-blur-md px-8 py-5 border-b border-gray-200 sticky top-0 z-50">
        <div className="flex items-center gap-5">
          <Link href="/admin/content/jobs" className="p-2 text-gray-400 hover:text-gray-900 bg-gray-50 rounded-md border border-gray-200 shadow-sm">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Ny Jobbtjänst</h1>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500 font-medium"><span>CMS</span><span className="text-gray-300">•</span><span>Job Editor</span></div>
          </div>
        </div>
        <button onClick={handleSubmit} disabled={loading} className="flex items-center gap-2 bg-[#1B263B] text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-blue-900 transition-colors shadow-sm disabled:opacity-50">
          {loading ? "Sparar..." : <><Save className="w-4 h-4" /> Spara Tjänst</>}
        </button>
      </div>

      <div className="flex flex-col xl:flex-row gap-0">
        {/* Sidebar */}
        <div className="xl:w-[380px] border-r border-gray-200 bg-gray-50/50 min-h-screen p-8 space-y-8">
          <div className="space-y-6">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest border-b pb-2">Information</h3>
            <div className="space-y-1.5 relative">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Titel / Roll <span className="text-red-500">*</span></label>
              <input type="text" value={title} onChange={handleTitleChange} onFocus={() => setActiveSeoField('title')} onBlur={() => setActiveSeoField(null)} className="w-full px-3 py-2.5 rounded-md border border-gray-200 focus:border-gray-800 outline-none text-sm bg-white font-medium" placeholder="T.ex. Senior Konstruktör" />
              <SeoTip field="title" />
            </div>
            <div className="space-y-1.5 relative">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Ort</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full pl-10 pr-3 py-2.5 rounded-md border border-gray-200 text-sm outline-none focus:border-gray-800 bg-white" placeholder="T.ex. Stockholm" />
              </div>
            </div>
            <div className="space-y-1.5 relative">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Anställningstyp</label>
              <div className="relative">
                <Briefcase className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input type="text" value={jobType} onChange={(e) => setJobType(e.target.value)} className="w-full pl-10 pr-3 py-2.5 rounded-md border border-gray-200 text-sm outline-none focus:border-gray-800 bg-white" placeholder="T.ex. Fulltid" />
              </div>
            </div>
            <div className="space-y-1.5 relative">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Nyckelord (på kortet)</label>
              <input type="text" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} onFocus={() => setActiveSeoField('excerpt')} onBlur={() => setActiveSeoField(null)} className="w-full px-3 py-2.5 rounded-md border border-gray-200 outline-none text-sm bg-white" placeholder="T.ex. BIM / Revit / Revit" />
              <SeoTip field="excerpt" />
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 bg-white p-8 lg:p-16">
          <div className="max-w-4xl mx-auto space-y-16">
            
            {/* CARD PREVIEW */}
            <div>
              <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-6">Förhandsvisning: Kort på hemsidan</h3>
              <div className="bg-white border border-gray-200 rounded-2xl p-8 flex justify-between items-center shadow-sm hover:shadow-md transition-all cursor-default max-w-[800px]">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-[#1B263B]">{title || 'Jobbtitel'}</h3>
                  <div className="flex gap-4 text-gray-400 font-semibold text-sm">
                    <span>{location}</span>
                    <span>{jobType}</span>
                    <span className="text-blue-500">{excerpt || 'Nyckelord...'}</span>
                  </div>
                </div>
                <div className="bg-[#1B263B] text-white px-6 py-2 rounded-full font-bold text-sm tracking-wide">ANSÖK NU</div>
              </div>
            </div>

            <div className="h-px bg-gray-100 w-full"></div>

            {/* BLOCK EDITOR */}
            <div>
              <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-10">Beskrivning av tjänsten</h3>
              <div className="space-y-6">
                {blocks.map((block) => (
                  <div key={block.id} className="group relative flex gap-4 -mx-6 px-6 py-4 rounded-2xl hover:bg-gray-50/50 transition-all">
                    <div className="absolute -top-3 right-6 px-2 py-1 bg-white border border-gray-200 text-gray-500 text-[10px] font-bold uppercase rounded shadow-sm opacity-0 group-hover:opacity-100 z-20">{getBlockLabel(block.type)}</div>
                    <div className="flex-1">
                      {block.type === 'h2' && <RichTextEditor value={block.content} onChange={(c) => updateBlock(block.id, { content: c })} placeholder="Rubrik..." editorClassName="text-3xl font-bold text-gray-900 bg-transparent min-h-[40px]" />}
                      {block.type === 'p' && <RichTextEditor value={block.content} onChange={(c) => updateBlock(block.id, { content: c })} placeholder="Beskrivning..." editorClassName="text-lg text-gray-600 leading-relaxed min-h-[120px]" />}
                    </div>
                    <button onClick={() => removeBlock(block.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 self-start"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
              <div className="mt-8 flex gap-3">
                <button onClick={() => addBlock('h2')} className="text-xs font-bold text-gray-500 hover:text-gray-800 bg-gray-100 px-4 py-2 rounded-lg transition-all">Ny Rubrik</button>
                <button onClick={() => addBlock('p')} className="text-xs font-bold text-gray-500 hover:text-gray-800 bg-gray-100 px-4 py-2 rounded-lg transition-all">Ny Text</button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
