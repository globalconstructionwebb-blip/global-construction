"use client";

import { useState, useRef, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, GripVertical, Plus, Type, Heading1, Heading2, Heading3, Image as ImageIcon, Trash2, Calendar, User, Upload, AlignLeft, AlignCenter, AlignJustify, Link as LinkIcon, Bold, Italic, Info } from "lucide-react";
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
      const filePath = `projects/${fileName}`;

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
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
               <span className="text-white text-xs font-medium tracking-wide">Klicka för att byta bild</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-gray-500">
            <Upload className="w-5 h-5 text-gray-400" />
            <span className="text-xs font-medium">{placeholder || "Klicka för att välja fil från datorn"}</span>
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-3 opacity-60">
         <div className="flex-1 h-px bg-gray-300"></div>
         <span className="text-[9px] uppercase font-bold text-gray-500 tracking-widest">Eller klistra in URL</span>
         <div className="flex-1 h-px bg-gray-300"></div>
      </div>
      
      <input 
        type="text" 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        placeholder="https://..."
        className="w-full px-3 py-2 rounded-md border border-gray-200 text-xs outline-none focus:border-gray-800 focus:ring-1 focus:ring-gray-800 transition-all bg-white"
      />
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
        <button type="button" onClick={() => executeCommand('bold')} className="p-1.5 text-gray-600 hover:bg-white hover:shadow-sm rounded transition-all" title="Fetstilt"><Bold className="w-3.5 h-3.5" /></button>
        <button type="button" onClick={() => executeCommand('italic')} className="p-1.5 text-gray-600 hover:bg-white hover:shadow-sm rounded transition-all" title="Kursiv"><Italic className="w-3.5 h-3.5" /></button>
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

export default function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  useLeaveConfirmation(isDirty && !saving);
  
  // Metadata state
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [client, setClient] = useState("");
  const [clientLogo, setClientLogo] = useState("");
  const [category, setCategory] = useState("");
  const [city, setCity] = useState("");
  const [projectLeader, setProjectLeader] = useState("");
  const [projectLeaderImage, setProjectLeaderImage] = useState("");
  const [publishDate, setPublishDate] = useState("");
  const [mainImage, setMainImage] = useState("");
  const [published, setPublished] = useState(true);

  // SEO Info state
  const [activeSeoField, setActiveSeoField] = useState<string | null>(null);

  // Blocks state
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null);

  useEffect(() => {
    async function loadProject() {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error || !data) {
        alert("Kunde inte ladda projektet.");
        router.push("/admin/content/projects");
        return;
      }

      setTitle(data.title || "");
      setSlug(data.slug || "");
      setExcerpt(data.excerpt || "");
      let fetchedClientName = data.client || "";
      let fetchedClientLogo = "";
      if (data.client && data.client.startsWith('{')) {
        try {
          const parsed = JSON.parse(data.client);
          fetchedClientName = parsed.name || "";
          fetchedClientLogo = parsed.logo || "";
        } catch(e) {}
      }
      setClient(fetchedClientName);
      setClientLogo(fetchedClientLogo);
      setCategory(data.category || "");
      setCity(data.city || "");
      setProjectLeader(data.author || "");
      setProjectLeaderImage(data.author_image || "");
      setPublishDate(data.publish_date ? data.publish_date.split('T')[0] : "");
      setMainImage(data.images?.[0] || data.image_url || "");
      setPublished(data.published);
      
      if (data.blocks) {
        setBlocks(data.blocks);
      } else {
        setBlocks([
          { id: crypto.randomUUID(), type: 'p', content: data.content || 'Beskriv projektet här...' }
        ]);
      }
      setLoading(false);
    }
    
    loadProject();
  }, [id, router]);

  const generateSlug = (val: string) => {
    return val.toLowerCase().replace(/å/g, "a").replace(/ä/g, "a").replace(/ö/g, "o").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (!slug) setSlug(generateSlug(val));
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

  const handleDragEnd = () => {
    setDraggedBlockId(null);
  };

  const getBlockLabel = (type: BlockType) => {
    switch (type) {
      case 'h1': return 'H1 Rubrik';
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
        case 'h1': html += `<h1 class="editor-content">${block.content}</h1>\n`; break;
        case 'h2': html += `<h2 class="editor-content">${block.content}</h2>\n`; break;
        case 'h3': html += `<h3 class="editor-content">${block.content}</h3>\n`; break;
        case 'p': html += `<p class="editor-content">${block.content}</p>\n`; break;
        case 'image': if (block.content) html += `<figure class="editor-content"><img src="${block.content}" alt="${block.alt || ''}" />${block.alt ? `<figcaption>${block.alt}</figcaption>` : ''}</figure>\n`; break;
      }
    });
    return html;
  };

  const handleSubmit = async () => {
    if (!title) return alert("Fyll i en projekttitel!");
    setSaving(true);

    try {
      const htmlContent = generateHTML();
      const combinedClient = (client || clientLogo) ? JSON.stringify({ name: client, logo: clientLogo }) : "";
      const { error } = await supabase.from("projects").update({
        title, 
        slug, 
        category, 
        city,
        client: combinedClient,
        excerpt,
        content: htmlContent, 
        description: excerpt,
        images: [mainImage],
        author: projectLeader, 
        author_image: projectLeaderImage, 
        publish_date: new Date(publishDate).toISOString(), 
        published,
        blocks: blocks
      }).eq('id', id);

      if (error) throw error;
      router.push("/admin/content/projects");
      router.refresh();
    } catch (error: any) {
      console.error(error);
      alert("Kunde inte spara: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const SeoTip = ({ field }: { field: string }) => {
    if (field !== activeSeoField) return null;
    const tips: Record<string, { title: string, text: string, example: string }> = {
      title: { title: "SEO-tips för Projekttitel", text: "Håll titeln saklig och beskrivande.", example: "Ex: 'Nyproduktion i Solna'" },
      slug: { title: "SEO-tips för URL", text: "Kort och ren URL utan å, ä, ö.", example: "Ex: 'nyproduktion-solna'" },
      excerpt: { title: "SEO-tips för Ingress", text: "Sammanfatta på ca 150 tecken.", example: "Ex: 'Vi uppförde 45 lägenheter...'" },
      category: { title: "SEO-tips för Kategori", text: "Beskriv projektets art.", example: "Ex: 'Konstruktion'" },
      city: { title: "SEO-tips för Stad", text: "Viktigt för lokal SEO.", example: "Ex: 'Solna'" }
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

  if (loading) return <div className="p-20 text-center font-bold text-slate-400">Laddar projekt...</div>;

  const tocItems = blocks.filter(b => b.type === 'h2' || b.type === 'h3');

  return (
    <div className="w-full pb-32">
      {/* Top Header */}
      <div className="flex justify-between items-center bg-white/80 backdrop-blur-md px-8 py-5 border-b border-gray-200 sticky top-0 z-50">
        <div className="flex items-center gap-5">
          <Link href="/admin/content/projects" className="p-2 text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors border border-gray-200 shadow-sm">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Redigera Projekt</h1>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500 font-medium">
              <span>Uppdatera "{title}"</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-5">
          <label className="flex items-center gap-2 cursor-pointer group">
            <div className="relative">
              <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} className="sr-only" />
              <div className={`block w-10 h-6 rounded-full transition-colors ${published ? 'bg-green-500' : 'bg-gray-200'}`}></div>
              <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${published ? 'transform translate-x-4' : ''}`}></div>
            </div>
            <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors">Publicerad</span>
          </label>
          <div className="w-px h-6 bg-gray-200"></div>
          <button onClick={handleSubmit} disabled={saving} className="flex items-center gap-2 bg-[#1B263B] text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-blue-900 transition-colors shadow-sm disabled:opacity-50">
            {saving ? "Sparar..." : <><Save className="w-4 h-4" /> Spara Ändringar</>}
          </button>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-0 mt-0" onChange={() => setIsDirty(true)} onInput={() => setIsDirty(true)}>
        
        {/* Vänster kolumn: Metadata */}
        <div className="xl:w-[380px] flex-shrink-0 border-r border-gray-200 bg-gray-50/50 min-h-screen p-8 space-y-8">
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-gray-200 pb-2">
               <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Projektinfo</h3>
            </div>
            
            <div className="space-y-1.5 relative">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Projektnamn <span className="text-red-500">*</span></label>
              <input type="text" value={title} onChange={handleTitleChange} onFocus={() => setActiveSeoField('title')} onBlur={() => setActiveSeoField(null)} className="w-full px-3 py-2.5 rounded-md border border-gray-200 focus:border-gray-800 outline-none text-sm bg-white shadow-sm font-medium" />
              <SeoTip field="title" />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Kund / Beställare</label>
              <input type="text" value={client} onChange={(e) => setClient(e.target.value)} className="w-full px-3 py-2.5 rounded-md border border-gray-200 text-sm bg-white shadow-sm" placeholder="T.ex. HSB / Riksbyggen" />
              <div className="pt-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Logotyp (Frivilligt)</label>
                <ImageUploader value={clientLogo} onChange={setClientLogo} placeholder="Ladda upp logotyp" />
              </div>
            </div>

            <div className="space-y-1.5 relative">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Ingress</label>
              <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} onFocus={() => setActiveSeoField('excerpt')} onBlur={() => setActiveSeoField(null)} rows={3} className="w-full px-3 py-2.5 rounded-md border border-gray-200 text-sm bg-white shadow-sm resize-none" />
              <SeoTip field="excerpt" />
            </div>

            <div className="space-y-3 pt-2 relative">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Kategori & Stad</label>
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3 py-2 rounded-md border border-gray-200 text-sm bg-white shadow-sm appearance-none cursor-pointer font-medium">
                    <option value="">— Välj —</option>
                    <option value="konstruktion">Konstruktion</option>
                    <option value="skyddsrum">Skyddsrum</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
                <input type="text" value={city} onChange={(e) => setCity(e.target.value)} onFocus={() => setActiveSeoField('city')} onBlur={() => setActiveSeoField(null)} className="px-3 py-2 rounded-md border border-gray-200 text-sm bg-white shadow-sm" placeholder="Stad" />
              </div>
              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-[10px] text-amber-800 font-semibold leading-relaxed">⚠️ VIKTIGT: Vald kategori styr automatiskt vilken landningssida detta projekt visas under (de 5 senaste under Konstruktion respektive Skyddsrum). Välj noggrant!</p>
              </div>
              <SeoTip field="city" />
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Huvudbild</label>
              <ImageUploader value={mainImage} onChange={setMainImage} />
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-gray-200 pb-2">Ansvarig</h3>
            <div className="space-y-4">
              <input type="text" value={projectLeader} onChange={(e) => setProjectLeader(e.target.value)} className="w-full px-3 py-2.5 rounded-md border border-gray-200 text-sm bg-white shadow-sm" placeholder="Namn" />
              <ImageUploader value={projectLeaderImage} onChange={setProjectLeaderImage} placeholder="Profilbild" />
              <input type="date" value={publishDate} onChange={(e) => setPublishDate(e.target.value)} className="w-full px-3 py-2.5 rounded-md border border-gray-200 text-sm bg-white shadow-sm" />
            </div>
          </div>
        </div>

        {/* Höger kolumn: Editor & Previews */}
        <div className="flex-1 bg-white relative">
          
          {/* Floating Action Bar */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-40">
             <div className="bg-gray-900 p-1.5 rounded-xl shadow-2xl flex items-center gap-1 border border-gray-800">
               <button onClick={() => addBlock('h2')} className="px-4 py-2 hover:bg-gray-800 text-gray-300 hover:text-white rounded-lg flex items-center gap-2 transition-colors text-xs font-bold"><Heading2 className="w-4 h-4" /> H2</button>
               <button onClick={() => addBlock('h3')} className="px-4 py-2 hover:bg-gray-800 text-gray-300 hover:text-white rounded-lg flex items-center gap-2 transition-colors text-xs font-bold"><Heading3 className="w-4 h-4" /> H3</button>
               <button onClick={() => addBlock('p')} className="px-4 py-2 hover:bg-gray-800 text-gray-300 hover:text-white rounded-lg flex items-center gap-2 transition-colors text-xs font-bold"><Type className="w-4 h-4" /> Text</button>
               <button onClick={() => addBlock('image')} className="px-4 py-2 hover:bg-gray-800 text-gray-300 hover:text-white rounded-lg flex items-center gap-2 transition-colors text-xs font-bold"><ImageIcon className="w-4 h-4" /> Bild</button>
             </div>
          </div>

          <div className="p-8 lg:p-12 max-w-[1500px] mt-10 w-full">
            
            {/* Previews */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 mb-20 items-start">
               <div className="xl:col-span-8 space-y-6">
                  <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">Förhandsvisning: Hero</h3>
                  <div className="relative w-full rounded-[32px] overflow-hidden aspect-[16/9] md:aspect-[21/9] flex flex-col justify-end p-10 lg:p-16 bg-[#1B263B] shadow-2xl">
                    {mainImage && <img src={mainImage} className="absolute inset-0 w-full h-full object-cover opacity-60" alt="Hero" />}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1B263B] via-[#1B263B]/40 to-transparent"></div>
                    <div className="relative z-10 w-full">
                      <div className="flex gap-2 mb-6">
                         <span className="px-4 py-1 rounded-full border border-white/20 text-white text-[10px] font-bold bg-white/10 uppercase tracking-wider">{category || 'Kategori'}</span>
                         <span className="px-4 py-1 rounded-full border border-blue-400/30 text-blue-300 text-[10px] font-bold bg-blue-400/10 uppercase tracking-wider">{city || 'Stad'}</span>
                      </div>
                      <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-6 font-outfit break-words line-clamp-2 w-full">{title || 'Projekttitel'}</h1>
                      <p className="text-white/80 font-outfit break-words w-full line-clamp-2">{excerpt || 'Ingress...'}</p>
                    </div>
                  </div>
               </div>

               <div className="xl:col-span-4 space-y-6">
                  <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">Förhandsvisning: Kort</h3>
                  <div className="bg-white rounded-[24px] overflow-hidden shadow-2xl border border-gray-100 max-w-[350px]">
                    <div className="aspect-[4/3] bg-gray-100">{mainImage && <img src={mainImage} className="w-full h-full object-cover" alt="Card" />}</div>
                    <div className="p-6 space-y-3">
                       <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex gap-2"><span>{publishDate}</span> <span>|</span> <span>{category}</span></div>
                       <h3 className="text-xl font-extrabold text-[#1B263B] font-outfit break-words">{title}</h3>
                       <p className="text-xs text-gray-500 line-clamp-2 break-words">{excerpt}</p>
                    </div>
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
              {/* Blocks Editor */}
              <div className="lg:col-span-8 space-y-6">
                {blocks.map((block) => (
                  <div key={block.id} draggable onDragStart={(e) => handleDragStart(e, block.id)} onDragOver={(e) => handleDragOver(e, block.id)} onDragEnd={handleDragEnd} className={`group relative flex gap-4 -mx-6 px-6 py-4 rounded-2xl transition-all ${draggedBlockId === block.id ? 'opacity-40 bg-gray-50 border-dashed border-gray-300 border' : 'hover:bg-gray-50 border border-transparent'}`}>
                    <div className="absolute -top-3 right-6 px-2 py-1 bg-white border border-gray-200 text-gray-500 text-[10px] font-bold uppercase rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-20">{getBlockLabel(block.type)}</div>
                    <div className="cursor-grab text-gray-300 hover:text-gray-600 mt-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"><GripVertical className="w-5 h-5" /></div>
                    <div className="flex-1 min-w-0">
                      {block.type === 'h2' && <RichTextEditor value={block.content} onChange={(content) => updateBlock(block.id, { content })} placeholder="H2..." editorClassName="text-3xl font-bold text-gray-900 bg-transparent" />}
                      {block.type === 'h3' && <RichTextEditor value={block.content} onChange={(content) => updateBlock(block.id, { content })} placeholder="H3..." editorClassName="text-xl font-bold text-gray-800 bg-transparent" />}
                      {block.type === 'p' && <RichTextEditor value={block.content} onChange={(content) => updateBlock(block.id, { content })} placeholder="Text..." editorClassName="text-lg text-gray-600 leading-relaxed" />}
                      {block.type === 'image' && (
                        <div className="space-y-3 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                          <ImageUploader value={block.content} onChange={(content) => updateBlock(block.id, { content })} />
                          <input type="text" value={block.alt || ''} onChange={(e) => updateBlock(block.id, { alt: e.target.value })} placeholder="Bildtext..." className="w-full px-3 py-2 rounded-md border border-gray-200 text-xs bg-gray-50" />
                        </div>
                      )}
                    </div>
                    <button onClick={() => removeBlock(block.id)} className="text-gray-300 hover:text-red-500 mt-3 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>

              {/* TOC Preview Sidebar */}
              <div className="lg:col-span-4 space-y-10">
                 <div>
                   <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6">Innehållsförteckning</h4>
                   <div className="space-y-3 text-sm font-medium text-gray-600">
                      {tocItems.map((item, idx) => (
                        <div key={idx} className={item.type === 'h3' ? 'pl-4 text-gray-400' : ''}>{item.content.replace(/<[^>]*>?/gm, '') || '[Rubrik]'}</div>
                      ))}
                   </div>
                 </div>
                 <div>
                   <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6">Ansvarig</h4>
                   <div className="flex items-center gap-4">
                     {projectLeaderImage ? <img src={projectLeaderImage} className="w-12 h-12 rounded-full object-cover border border-gray-200" alt="Author" /> : <div className="w-12 h-12 rounded-full bg-gray-100 border border-dashed border-gray-300 flex items-center justify-center"><User className="w-4 h-4 text-gray-400" /></div>}
                     <div><div className="font-bold text-gray-900">{projectLeader || 'Namn'}</div><div className="text-gray-500 text-xs font-medium">Global Construction</div></div>
                   </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
