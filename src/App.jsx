import React, { useState, useEffect, useMemo, useRef } from 'react';
import Papa from 'papaparse';
import {
  Search,
  Building2,
  MapPin,
  Briefcase,
  ExternalLink,
  Filter,
  BarChart3,
  ChevronDown,
  Loader2,
  Star,
  CheckCircle2,
  Download,
  Upload,
  FileText,
  Trophy,
  LayoutGrid,
  ListOrdered,
  X,
  GripVertical,
  ChevronRight,
  ChevronLeft,
  Check,
  RotateCcw
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Utility for Tailwind class merging */
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// --- Configuration ---
const CSV_URL = "https://docs.google.com/spreadsheets/d/189NQW59RAkWaFWD296qfVhVd1yIWUxgk5XRoPcLKqRw/export?format=csv&gid=0";

const COLORS = [
  '#000091', '#E1000F', '#00AC8E', '#FFB800', '#718096', '#ED8936', '#4299E1', '#9F7AEA'
];

// --- Components ---

const StatCard = ({ title, value, icon: Icon, colorClass }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4 transition-all hover:shadow-md">
    <div className={cn("p-3 rounded-lg", colorClass)}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div>
      <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{title}</p>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
    </div>
  </div>
);

const Badge = ({ children, variant = 'default' }) => {
  const variants = {
    default: "bg-slate-100 text-slate-700",
    ac: "bg-blue-100 text-blue-700 border border-blue-200 font-bold px-3 py-1 ring-2 ring-blue-50/50",
    ate: "bg-amber-100 text-amber-700 border border-amber-200"
  };
  return (
    <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-tight", variants[variant])}>
      {children}
    </span>
  );
};

const MultiSelect = ({ label, options, selected, onChange, placeholder, icon: Icon }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt =>
    (opt || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleOption = (opt) => {
    const newSelected = selected.includes(opt)
      ? selected.filter(o => o !== opt)
      : [...selected, opt];
    onChange(newSelected);
  };

  const clearAll = () => onChange([]);
  const selectAll = () => onChange([...options]);

  return (
    <div className="space-y-2 relative" ref={dropdownRef}>
      <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest flex items-center gap-1">
        {Icon && <Icon className="w-3 h-3" />} {label}
      </label>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full px-4 py-3 bg-slate-100 border-2 border-transparent rounded-2xl cursor-pointer flex items-center justify-between transition-all hover:bg-slate-200/50",
          isOpen && "border-blue-500 bg-white"
        )}
      >
        <div className="flex-1 truncate text-sm font-bold text-slate-700">
          {selected.length === 0 ? (
            <span className="text-slate-400 font-medium">{placeholder}</span>
          ) : (
            selected.length === 1 ? selected[0] : `${selected.length} sélectionnés`
          )}
        </div>
        <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", isOpen && "rotate-180")} />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-3 border-b border-slate-100 bg-slate-50/50 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                autoFocus
                type="text"
                placeholder="Rechercher..."
                className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button onClick={selectAll} className="p-2 text-[10px] font-black text-blue-800 uppercase hover:bg-blue-50 rounded-lg shrink-0">Tous</button>
            <button onClick={clearAll} className="p-2 text-[10px] font-black text-red-600 uppercase hover:bg-red-50 rounded-lg shrink-0">Vider</button>
          </div>
          <div className="max-h-[250px] overflow-y-auto p-2 space-y-0.5">
            {filteredOptions.length === 0 ? (
              <p className="p-4 text-center text-xs text-slate-400 font-bold uppercase italic">Aucun résultat</p>
            ) : (
              filteredOptions.map(opt => (
                <div
                  key={opt}
                  onClick={() => toggleOption(opt)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all",
                    selected.includes(opt) ? "bg-blue-800 text-white" : "hover:bg-slate-100 text-slate-700"
                  )}
                >
                  <div className={cn(
                    "w-4 h-4 rounded border flex items-center justify-center shrink-0",
                    selected.includes(opt) ? "bg-white border-white" : "border-slate-300"
                  )}>
                    {selected.includes(opt) && <Check className="w-3 h-3 text-blue-800" />}
                  </div>
                  <span className="text-sm font-bold truncate">{opt}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const SortableItem = ({ id, item, index, isTaken, toggleTaken, toggleShortlist }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 10 : 0 };

  return (
    <div ref={setNodeRef} style={style} className={cn(
      "bg-white flex items-center gap-4 p-4 transition-all group relative",
      isDragging && "shadow-2xl ring-2 ring-blue-500/20 bg-slate-50 z-10",
      !isDragging && "hover:bg-slate-50/50",
      isTaken && "opacity-50 grayscale bg-slate-50"
    )}>
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-2 text-slate-300 hover:text-slate-600 transition-colors">
        <GripVertical className="w-5 h-5" />
      </div>
      <div className="flex items-center justify-center w-8 shrink-0">
        <span className="text-xl font-black text-slate-300 group-hover:text-slate-500 transition-colors">{index + 1}</span>
      </div>
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 flex-shrink-0">{id}</span>
          <h3 className={cn("text-base font-bold text-slate-900 truncate", isTaken && "line-through")}>{item['Intitulé du poste']}</h3>
          <Badge variant={item['Env.'] === 'AC' ? 'ac' : 'ate'}>{item['Env.']}</Badge>
          {item['LIEN FICHE DE POSTE'] && (
            <a href={item['LIEN FICHE DE POSTE']} target="_blank" rel="noreferrer" className="p-1 text-slate-300 hover:text-blue-600 transition-colors shrink-0" title="Voir la fiche">
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-slate-500 text-xs font-medium">
          <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" /> {item['Ministère']}</span>
          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {item['Localisation (Commune ou adresse exacte)']} ({item['Code postal']}) — {item['Région']}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={() => toggleTaken(id)} className={cn("p-2 rounded-xl transition-all border", isTaken ? "bg-red-600 text-white border-red-600" : "bg-white text-slate-300 border-slate-200 hover:text-red-600 hover:border-red-100")}>
          <CheckCircle2 className="w-5 h-5" />
        </button>
        <button onClick={() => toggleShortlist(id)} className="p-2 text-slate-200 hover:text-red-500 transition-all"><X className="w-6 h-6" /></button>
      </div>
    </div>
  );
};

export default function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const [viewMode, setViewMode] = useState('explore');

  // Persistence States
  const [shortlisted, setShortlisted] = useState(() => JSON.parse(localStorage.getItem('ira_shortlisted') || '[]'));
  const [taken, setTaken] = useState(() => JSON.parse(localStorage.getItem('ira_taken') || '[]'));

  // Multi-Filter States
  const [search, setSearch] = useState('');
  const [envFilter, setEnvFilter] = useState([]);
  const [minFilter, setMinFilter] = useState([]);
  const [themeFilter, setThemeFilter] = useState([]);
  const [regionFilter, setRegionFilter] = useState([]);
  const [deptFilter, setDeptFilter] = useState([]);
  const [hideTaken, setHideTaken] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => { localStorage.setItem('ira_shortlisted', JSON.stringify(shortlisted)); }, [shortlisted]);
  useEffect(() => { localStorage.setItem('ira_taken', JSON.stringify(taken)); }, [taken]);

  useEffect(() => {
    Papa.parse(CSV_URL, {
      download: true, header: true, skipEmptyLines: true,
      complete: (results) => {
        setData(results.data.map(row => {
          const r = {};
          Object.keys(row).forEach(k => { r[k.replace(/\s+/g, ' ').trim()] = row[k]?.trim() || ''; });
          return r;
        }));
        setLoading(false);
      },
      error: () => { setError("Erreur de récupération."); setLoading(false); }
    });
  }, []);

  const toggleShortlist = (id) => setShortlisted(p => p.includes(id) ? p.filter(i => i !== id) : [...p, id]);
  const toggleTaken = (id) => setTaken(p => p.includes(id) ? p.filter(i => i !== id) : [...p, id]);
  const handleDragEnd = (e) => {
    if (e.active.id !== e.over.id) {
      setShortlisted((items) => arrayMove(items, items.indexOf(e.active.id), items.indexOf(e.over.id)));
    }
  };

  const exportSession = () => {
    const blob = new Blob([JSON.stringify({ shortlisted, taken }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `session-ira.json`; a.click();
  };

  const importSession = (e) => {
    const f = e.target.files[0]; if (!f) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const json = JSON.parse(ev.target.result);
      if (json.shortlisted) setShortlisted(json.shortlisted);
      if (json.taken) setTaken(json.taken);
    };
    reader.readAsText(f);
  };

  const options = useMemo(() => ({
    min: Array.from(new Set(data.map(i => i['Ministère'])).values()).filter(Boolean).sort(),
    themes: Array.from(new Set(data.map(i => i['Thématique'])).values()).filter(Boolean).sort(),
    env: ['AC', 'ATE'],
    regions: Array.from(new Set(data.map(i => i['Région']))).filter(Boolean).sort(),
    depts: Array.from(new Set(data.map(i => {
      const cp = i['Code postal'];
      return cp ? cp.substring(0, 2) : null;
    }))).filter(Boolean).sort()
  }), [data]);

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const id = item.Référence;
      const searchTerms = search.toLowerCase().split(/[ ,]+/).filter(Boolean);
      const matchesSearch = searchTerms.length === 0 || searchTerms.some(term =>
        id.toLowerCase().includes(term) ||
        (item['Intitulé du poste'] || '').toLowerCase().includes(term) ||
        (item['Localisation (Commune ou adresse exacte)'] || '').toLowerCase().includes(term)
      );

      const matchesEnv = envFilter.length === 0 || envFilter.includes(item['Env.']);
      const matchesMin = minFilter.length === 0 || minFilter.includes(item['Ministère']);
      const matchesTheme = themeFilter.length === 0 || themeFilter.includes(item['Thématique']);
      const matchesRegion = regionFilter.length === 0 || regionFilter.includes(item['Région']);
      const matchesDept = deptFilter.length === 0 || deptFilter.includes(item['Code postal']?.substring(0, 2));
      const matchesTaken = !hideTaken || !taken.includes(id);

      return matchesSearch && matchesEnv && matchesMin && matchesTheme && matchesRegion && matchesDept && matchesTaken;
    });
  }, [data, search, envFilter, minFilter, themeFilter, regionFilter, deptFilter, hideTaken, taken]);

  const rankedData = useMemo(() => shortlisted.map(id => data.find(i => i.Référence === id)).filter(Boolean), [shortlisted, data]);
  const stats = useMemo(() => ({ total: filteredData.length, ac: filteredData.filter(i => i['Env.'] === 'AC').length, sel: shortlisted.length }), [filteredData, shortlisted]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const pagedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => { setCurrentPage(1); }, [search, envFilter, minFilter, themeFilter, regionFilter, deptFilter, hideTaken, itemsPerPage]);

  if (loading) return <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 gap-4"><Loader2 className="w-10 h-10 text-blue-800 animate-spin" /><p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Chargement...</p></div>;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 px-4 py-8 md:px-8 lg:px-12 selection:bg-blue-100 selection:text-blue-900">
      <div className="max-w-[1400px] mx-auto space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3"><div className="w-2 h-10 bg-blue-800 rounded-full" /><h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">Amphi Session <span className="bg-blue-800 text-white px-3 py-1 rounded-xl text-xl md:text-2xl">PRO</span></h1></div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] ml-5">Outil d'aide au choix • ESIRA</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <a
              href="https://docs.google.com/spreadsheets/d/189NQW59RAkWaFWD296qfVhVd1yIWUxgk5XRoPcLKqRw/edit"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 transition-all font-bold text-sm shadow-lg shadow-emerald-100"
              title="Voir le Spreadsheet Google"
            >
              <FileText className="w-5 h-5" />
              <span className="hidden sm:inline">Source Spreadsheet</span>
              <ExternalLink className="w-4 h-4 opacity-70" />
            </a>
            <input type="file" ref={fileInputRef} onChange={importSession} className="hidden" accept=".json" />
            <button onClick={() => fileInputRef.current.click()} className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all shadow-sm group" title="Importer une session">
              <Upload className="w-5 h-5 text-slate-400 group-hover:text-blue-800" />
            </button>
            <button onClick={exportSession} className="flex items-center gap-3 px-6 py-3 bg-blue-800 text-white rounded-2xl font-bold hover:bg-blue-900 transition-all shadow-lg shadow-blue-100">
              <Download className="w-5 h-5" />
              <span className="hidden sm:inline">Sauvegarder</span>
            </button>
          </div>
        </header>

        <nav className="flex justify-center">
          <div className="flex p-1.5 bg-slate-200/50 rounded-2xl shadow-inner w-full md:w-fit">
            <button onClick={() => setViewMode('explore')} className={cn("flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-black transition-all text-sm uppercase tracking-wider", viewMode === 'explore' ? "bg-white text-blue-800 shadow-sm" : "text-slate-500 hover:text-slate-700")}><LayoutGrid className="w-5 h-5" /> Explorateur</button>
            <button onClick={() => setViewMode('ranking')} className={cn("flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-black transition-all text-sm uppercase tracking-wider relative", viewMode === 'ranking' ? "bg-white text-blue-800 shadow-sm" : "text-slate-500 hover:text-slate-700")}><ListOrdered className="w-5 h-5" /> Mon Ranking {shortlisted.length > 0 && <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[10px] w-6 h-6 flex items-center justify-center rounded-full border-4 border-slate-50 ring-1 ring-amber-200">{shortlisted.length}</span>}</button>
          </div>
        </nav>

        {viewMode === 'explore' ? (
          <>
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard title="Postes Dispo" value={stats.total} icon={Briefcase} colorClass="bg-slate-900" />
              <StatCard title="Admin. Centrale" value={stats.ac} icon={Building2} colorClass="bg-blue-700" />
              <StatCard title="Ma Sélection" value={stats.sel} icon={Trophy} colorClass="bg-amber-500" />
            </section>

            <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-50 pb-6">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2"><Filter className="w-5 h-5 text-blue-800" /><h2 className="font-black text-slate-800 uppercase tracking-widest text-xs">Filtres Avancés</h2></div>
                  {(envFilter.length > 0 || minFilter.length > 0 || themeFilter.length > 0 || regionFilter.length > 0 || deptFilter.length > 0) && (
                    <button onClick={() => { setEnvFilter([]); setMinFilter([]); setThemeFilter([]); setRegionFilter([]); setDeptFilter([]); }} className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-black uppercase hover:bg-slate-800 hover:text-white transition-all"><RotateCcw className="w-3 h-3" /> Réinitialiser</button>
                  )}
                </div>
                <button onClick={() => setHideTaken(!hideTaken)} className={cn("flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all border uppercase tracking-widest", hideTaken ? "bg-red-50 border-red-200 text-red-600" : "bg-white border-slate-200 text-slate-400 hover:bg-slate-50")}>{hideTaken ? <X className="w-4 h-4" /> : <Filter className="w-4 h-4" />} Cacher Indispo</button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest flex items-center gap-1"><Search className="w-3 h-3" /> Recherche Libre</label>
                  <input type="text" placeholder="ID, Poste, Mots-clés..." className="w-full px-5 py-3.5 bg-slate-100 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl transition-all outline-none font-bold text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <MultiSelect label="Environnement" icon={Briefcase} options={options.env} selected={envFilter} onChange={setEnvFilter} placeholder="Tous" />
                <MultiSelect label="Ministère" icon={Building2} options={options.min} selected={minFilter} onChange={setMinFilter} placeholder="Tous les ministères" />
                <MultiSelect label="Thématique" icon={RotateCcw} options={options.themes} selected={themeFilter} onChange={setThemeFilter} placeholder="Toutes thématiques" />
                <MultiSelect label="Région" icon={MapPin} options={options.regions} selected={regionFilter} onChange={setRegionFilter} placeholder="Toutes régions" />
                <MultiSelect label="Département" icon={MapPin} options={options.depts} selected={deptFilter} onChange={setDeptFilter} placeholder="Tous les dépts" />
              </div>
            </section>

            <section className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                <div className="flex items-center gap-2 font-black text-slate-800 text-sm uppercase tracking-widest"><LayoutGrid className="w-4 h-4" /> Résultats ({filteredData.length})</div>
                <div className="flex items-center gap-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Afficher</label>
                  <select
                    className="bg-slate-100 px-3 py-1.5 rounded-lg text-xs font-black border-transparent focus:ring-0 outline-none cursor-pointer"
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  >
                    {[10, 25, 50, 100].map(v => <option key={v} value={v}>{v} postes</option>)}
                  </select>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="px-6 py-5 text-center w-20">❤️</th>
                      <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Détails</th>
                      <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Lieu / Min.</th>
                      <th className="px-6 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Env.</th>
                      <th className="px-6 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest w-32">Status</th>
                      <th className="px-6 py-5 text-right w-32"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {pagedData.map((item, idx) => (
                      <tr key={`${item.Référence}-${idx}`} className={cn("transition-all group", taken.includes(item.Référence) && "opacity-40 grayscale bg-slate-50/50", shortlisted.includes(item.Référence) && "bg-amber-50/20")}>
                        <td className="px-6 py-5 text-center"><button onClick={() => toggleShortlist(item.Référence)} className={cn("transition-all hover:scale-125 active:scale-90", shortlisted.includes(item.Référence) ? "text-amber-500" : "text-slate-200 hover:text-amber-400")}><Star className={cn("w-7 h-7", shortlisted.includes(item.Référence) && "fill-current animate-in zoom-in-50")} /></button></td>
                        <td className="px-6 py-5"><div className={cn("space-y-1.5", taken.includes(item.Référence) && "line-through")}><div className="flex items-center gap-2 flex-wrap"><span className="text-[10px] font-black bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200">{item.Référence}</span><p className="font-bold text-slate-900 group-hover:text-blue-800 transition-colors uppercase tracking-tight text-sm">{item['Intitulé du poste']}</p></div><p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{item['Thématique']}</p></div></td>
                        <td className="px-6 py-5">
                          <p className="text-xs font-black text-slate-800 truncate max-w-[180px]">{item['Ministère']}</p>
                          <p className="text-[11px] text-slate-500 font-medium italic flex flex-col">
                            <span>{item['Localisation (Commune ou adresse exacte)']} ({item['Code postal']})</span>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">— {item['Région']} —</span>
                          </p>
                        </td>
                        <td className="px-6 py-5 text-center"><Badge variant={item['Env.'] === 'AC' ? 'ac' : 'ate'}>{item['Env.']}</Badge></td>
                        <td className="px-6 py-5 text-center"><button onClick={() => toggleTaken(item.Référence)} className={cn("px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", taken.includes(item.Référence) ? "bg-red-600 text-white shadow-lg shadow-red-100" : "bg-emerald-50 text-emerald-600 border border-emerald-100")}>{taken.includes(item.Référence) ? 'INDISPO' : 'DISPO'}</button></td>
                        <td className="px-6 py-5 text-right">
                          {item['LIEN FICHE DE POSTE'] && (
                            <a
                              href={item['LIEN FICHE DE POSTE']}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-800 hover:bg-blue-800 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest border border-blue-100 transition-all shadow-sm shadow-blue-50"
                            >
                              <FileText className="w-4 h-4 text-blue-400 group-hover:text-white" />
                              Fiche
                              <ExternalLink className="w-3.5 h-3.5 opacity-50" />
                            </a>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className="p-6 bg-slate-50/50 flex items-center justify-between border-t border-slate-100">
                  <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 disabled:opacity-30 flex items-center gap-2"><ChevronLeft className="w-4 h-4" /> Précédent</button>
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Page {currentPage} / {totalPages}</span>
                  <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 disabled:opacity-30 flex items-center gap-2">Suivant <ChevronRight className="w-4 h-4" /></button>
                </div>
              )}
            </section>
          </>
        ) : (
          <section className="space-y-6">
            <div className="bg-amber-100/50 border border-amber-200/50 p-6 rounded-3xl flex items-center gap-6"><div className="w-14 h-14 bg-amber-500 rounded-2xl text-white flex items-center justify-center rotate-3 shadow-xl"><Trophy className="w-8 h-8" /></div><div><h2 className="text-2xl font-black text-amber-950 tracking-tight italic">Mon Ranking Stratégique</h2><p className="text-amber-800/70 text-xs font-black uppercase tracking-widest">Amphi Session • Organisez vos priorités</p></div></div>
            {rankedData.length > 0 ? (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd} modifiers={[restrictToVerticalAxis]}>
                <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-xl divide-y divide-slate-100">
                  <SortableContext items={shortlisted} strategy={verticalListSortingStrategy}>
                    {rankedData.map((item, idx) => <SortableItem key={item.Référence} id={item.Référence} item={item} index={idx} isTaken={taken.includes(item.Référence)} toggleTaken={toggleTaken} toggleShortlist={toggleShortlist} />)}
                  </SortableContext>
                </div>
              </DndContext>
            ) : (
              <div className="bg-white border-4 border-dashed border-slate-100 rounded-[3rem] p-20 text-center space-y-6"><div className="w-24 h-24 bg-slate-50 flex items-center justify-center mx-auto rounded-full"><Star className="w-12 h-12 text-slate-200" /></div><h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Ranking Vide</h3><button onClick={() => setViewMode('explore')} className="px-8 py-4 bg-blue-800 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all">Décollage</button></div>
            )}
          </section>
        )}

        <footer className="pt-20 pb-10 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6 opacity-40 hover:opacity-100 transition-all">
          <div className="font-black text-xl tracking-tighter text-slate-900 border-x-4 border-slate-900 px-4 py-1 flex items-center gap-3"><span className="bg-slate-900 text-white px-2 rounded">AMPHI</span> CHOICE</div>
          <div className="flex flex-col items-end gap-1"><p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest">Système de Session • ESIRA</p><p className="text-[11px] font-black text-slate-900 tracking-tighter uppercase">{new Date().toLocaleDateString('fr-FR')} • {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p></div>
        </footer>
      </div>
    </div>
  );
}
