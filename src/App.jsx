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
  Info,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  Star,
  CheckCircle2,
  Circle,
  EyeOff,
  Eye,
  Download,
  Upload,
  Trophy,
  LayoutGrid,
  ListOrdered,
  X,
  GripVertical
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
const ITEMS_PER_PAGE = 10;

const COLORS = [
  '#000091', // Bleu France
  '#E1000F', // Rouge
  '#00AC8E', // Vert
  '#FFB800', // Jaune
  '#718096', // Slate
  '#ED8936', // Orange
  '#4299E1', // Bleu clair
  '#9F7AEA', // Violet
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

const SortableItem = ({ id, item, index, isTaken, toggleTaken, toggleShortlist }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 0,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "bg-white flex items-center gap-4 p-4 transition-all group relative",
        isDragging && "shadow-2xl ring-2 ring-blue-500/20 bg-slate-50 z-10",
        !isDragging && "hover:bg-slate-50/50",
        isTaken && "opacity-50 grayscale bg-slate-50"
      )}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-2 text-slate-300 hover:text-slate-600 transition-colors"
      >
        <GripVertical className="w-5 h-5" />
      </div>

      <div className="flex items-center justify-center w-8 shrink-0">
        <span className="text-xl font-black text-slate-300 group-hover:text-slate-500 transition-colors">{index + 1}</span>
      </div>

      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 flex-shrink-0">
            {id}
          </span>
          <h3 className={cn("text-base font-bold text-slate-900 truncate", isTaken && "line-through")}>
            {item['Intitulé du poste']}
          </h3>
          <Badge variant={item['Env.'] === 'AC' ? 'ac' : 'ate'}>{item['Env.']}</Badge>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-slate-500 text-xs font-medium">
          <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" /> {item['Ministère']}</span>
          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {item['Localisation (Commune ou adresse exacte)']}</span>
          {item['LIEN FICHE DE POSTE'] && (
            <a
              href={item['LIEN FICHE DE POSTE']}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 font-bold text-blue-800 uppercase tracking-tighter hover:underline"
            >
              Fiche <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => toggleTaken(id)}
          className={cn(
            "p-2 rounded-xl transition-all border",
            isTaken ? "bg-red-600 text-white border-red-600 shadow-inner" : "bg-white text-slate-300 border-slate-200 hover:text-red-600 hover:border-red-100"
          )}
        >
          <CheckCircle2 className="w-5 h-5" />
        </button>
        <button
          onClick={() => toggleShortlist(id)}
          className="p-2 text-slate-200 hover:text-red-500 transition-all"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // View State
  const [viewMode, setViewMode] = useState('explore');

  // Persistence States
  const [shortlisted, setShortlisted] = useState(() => {
    const saved = localStorage.getItem('ira_shortlisted');
    return saved ? JSON.parse(saved) : [];
  });
  const [taken, setTaken] = useState(() => {
    const saved = localStorage.getItem('ira_taken');
    return saved ? JSON.parse(saved) : [];
  });

  // Filters
  const [search, setSearch] = useState('');
  const [envFilter, setEnvFilter] = useState('Tous');
  const [minFilter, setMinFilter] = useState('Tous');
  const [themeFilter, setThemeFilter] = useState('Tous');
  const [hideTaken, setHideTaken] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // DND Configuration
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('ira_shortlisted', JSON.stringify(shortlisted));
  }, [shortlisted]);

  useEffect(() => {
    localStorage.setItem('ira_taken', JSON.stringify(taken));
  }, [taken]);

  // --- Data Fetching ---
  useEffect(() => {
    Papa.parse(CSV_URL, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const cleanedData = results.data.map((row) => {
          const newRow = {};
          Object.keys(row).forEach(key => {
            const normalizedKey = key.replace(/\s+/g, ' ').trim();
            newRow[normalizedKey] = row[key] ? row[key].trim() : '';
          });
          return newRow;
        });
        setData(cleanedData);
        setLoading(false);
      },
      error: (err) => {
        setError("Impossible de récupérer les fiches de poste.");
        setLoading(false);
      }
    });
  }, []);

  // --- Actions ---
  const toggleShortlist = (id) => {
    setShortlisted(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleTaken = (id) => {
    setTaken(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setShortlisted((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const exportSession = () => {
    const sessionData = { shortlisted, taken, timestamp: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(sessionData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `session-ira-amphi.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importSession = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        if (json.shortlisted) setShortlisted(json.shortlisted);
        if (json.taken) setTaken(json.taken);
      } catch (err) {
        alert("Erreur de format.");
      }
    };
    reader.readAsText(file);
  };

  // --- Derivative State ---
  const ministries = useMemo(() => {
    const set = new Set(data.map(item => item['Ministère']).filter(Boolean));
    return ['Tous', ...Array.from(set).sort()];
  }, [data]);

  const themes = useMemo(() => {
    const set = new Set(data.map(item => item['Thématique']).filter(Boolean));
    return ['Tous', ...Array.from(set).sort()];
  }, [data]);

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const id = item.Référence;
      const searchLower = search.toLowerCase();
      const matchesSearch = !search ||
        (item['Intitulé du poste'] || '').toLowerCase().includes(searchLower) ||
        (item['Localisation (Commune ou adresse exacte)'] || '').toLowerCase().includes(searchLower) ||
        (item['Région'] || '').toLowerCase().includes(searchLower) ||
        (item['Code postal'] || '').toLowerCase().includes(searchLower);

      const matchesEnv = envFilter === 'Tous' || item['Env.'] === envFilter;
      const matchesMin = minFilter === 'Tous' || item['Ministère'] === minFilter;
      const matchesTheme = themeFilter === 'Tous' || item['Thématique'] === themeFilter;
      const matchesTaken = !hideTaken || !taken.includes(id);

      return matchesSearch && matchesEnv && matchesMin && matchesTheme && matchesTaken;
    });
  }, [data, search, envFilter, minFilter, themeFilter, hideTaken, taken]);

  const rankedData = useMemo(() => {
    return shortlisted
      .map(id => data.find(item => item.Référence === id))
      .filter(Boolean);
  }, [shortlisted, data]);

  const stats = useMemo(() => {
    const total = filteredData.length;
    const ac = filteredData.filter(item => item['Env.'] === 'AC').length;
    return { total, ac, selection: shortlisted.length };
  }, [filteredData, shortlisted]);

  // Pagination for explore mode
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const pagedData = filteredData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, envFilter, minFilter, themeFilter, hideTaken]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 gap-4">
        <Loader2 className="w-10 h-10 text-blue-800 animate-spin" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Préparation de l'amphi...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 px-4 py-8 md:px-8 lg:px-12 selection:bg-blue-100 selection:text-blue-900">
      <div className="max-w-[1400px] mx-auto space-y-8">

        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="w-2 h-10 bg-blue-800 rounded-full" />
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                Amphi Session <span className="bg-blue-800 text-white px-3 py-1 rounded-xl text-xl md:text-2xl">PRO</span>
              </h1>
            </div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] ml-5">
              Outil d'aide au choix • École d'administration
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input type="file" ref={fileInputRef} onChange={importSession} className="hidden" accept=".json" />
            <button onClick={() => fileInputRef.current.click()} className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all shadow-sm group">
              <Upload className="w-5 h-5 text-slate-400 group-hover:text-blue-800" />
            </button>
            <button onClick={exportSession} className="flex items-center gap-3 px-6 py-3 bg-blue-800 text-white rounded-2xl font-bold hover:bg-blue-900 transition-all shadow-lg shadow-blue-100">
              <Download className="w-5 h-5" /> Sauvegarder
            </button>
          </div>
        </header>

        {/* Navigation */}
        <nav className="flex flex-col md:flex-row gap-4 items-center justify-center">
          <div className="flex p-1.5 bg-slate-200/50 rounded-2xl shadow-inner w-full md:w-fit">
            <button
              onClick={() => setViewMode('explore')}
              className={cn(
                "flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-black transition-all text-sm uppercase tracking-wider",
                viewMode === 'explore' ? "bg-white text-blue-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              <LayoutGrid className="w-5 h-5" /> Explorateur
            </button>
            <button
              onClick={() => setViewMode('ranking')}
              className={cn(
                "flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-black transition-all text-sm uppercase tracking-wider relative",
                viewMode === 'ranking' ? "bg-white text-blue-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              <ListOrdered className="w-5 h-5" /> Mon Ranking
              {shortlisted.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[10px] w-6 h-6 flex items-center justify-center rounded-full border-4 border-slate-50 ring-1 ring-amber-200">
                  {shortlisted.length}
                </span>
              )}
            </button>
          </div>
        </nav>

        {viewMode === 'explore' ? (
          <>
            {/* Explorer KPIs */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard title="Postes Dispo" value={stats.total} icon={Briefcase} colorClass="bg-slate-900" />
              <StatCard title="Admin. Centrale" value={stats.ac} icon={Building2} colorClass="bg-blue-700" />
              <StatCard title="Ma Sélection" value={stats.selection} icon={Trophy} colorClass="bg-amber-500" />
            </section>

            {/* Filters */}
            <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-50 pb-6">
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-blue-800" />
                  <h2 className="font-black text-slate-800 uppercase tracking-widest text-xs">Paramètres de recherche</h2>
                </div>
                <button
                  onClick={() => setHideTaken(!hideTaken)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all border uppercase tracking-widest",
                    hideTaken ? "bg-red-50 border-red-200 text-red-600" : "bg-white border-slate-200 text-slate-400 hover:bg-slate-50"
                  )}
                >
                  {hideTaken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  Cacher les occupés
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest flex items-center gap-1"><Search className="w-3 h-3" /> Mot-Clé / Ville</label>
                  <input
                    type="text"
                    placeholder="Ex: Paris, Juriste..."
                    className="w-full px-5 py-3.5 bg-slate-100 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl transition-all outline-none font-medium"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest flex items-center gap-1"><Briefcase className="w-3 h-3" /> Environnement</label>
                  <select
                    className="w-full px-5 py-3.5 bg-slate-100 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl transition-all outline-none appearance-none cursor-pointer font-bold"
                    value={envFilter}
                    onChange={(e) => setEnvFilter(e.target.value)}
                  >
                    <option value="Tous">Tous</option>
                    <option value="AC">Admin. Centrale</option>
                    <option value="ATE">Admin. Territoriale</option>
                  </select>
                </div>

                <div className="space-y-2 md:col-span-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Ministère</label>
                  <select className="w-full px-5 py-3.5 bg-slate-100 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl transition-all outline-none appearance-none cursor-pointer font-bold"
                    value={minFilter} onChange={(e) => setMinFilter(e.target.value)}>
                    {ministries.map(m => (
                      <option key={m} value={m}>{m === 'Tous' ? 'Tous les Ministères' : m}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Thématique</label>
                  <select className="w-full px-5 py-3.5 bg-slate-100 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl transition-all outline-none appearance-none cursor-pointer font-bold"
                    value={themeFilter} onChange={(e) => setThemeFilter(e.target.value)}>
                    {themes.map(t => (
                      <option key={t} value={t}>{t === 'Tous' ? 'Toutes thématiques' : t}</option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            {/* Table */}
            <section className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="px-6 py-5 text-center w-20">❤️</th>
                      <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Détails du Poste</th>
                      <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Lieu / Ministère</th>
                      <th className="px-6 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Env.</th>
                      <th className="px-6 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest w-32">Session</th>
                      <th className="px-6 py-5 text-right w-32"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {pagedData.map((item, idx) => {
                      const id = item.Référence;
                      const isShortlisted = shortlisted.includes(id);
                      const isTaken = taken.includes(id);
                      return (
                        <tr key={`${id}-${idx}`} className={cn(
                          "transition-all group",
                          isTaken && "opacity-40 grayscale bg-slate-50/50",
                          isShortlisted && "bg-amber-50/20"
                        )}>
                          <td className="px-6 py-5 text-center">
                            <button onClick={() => toggleShortlist(id)} className={cn(
                              "transition-all hover:scale-125 active:scale-90",
                              isShortlisted ? "text-amber-500 drop-shadow-sm" : "text-slate-200 hover:text-amber-400"
                            )}>
                              <Star className={cn("w-7 h-7", isShortlisted && "fill-current animate-in zoom-in-50")} />
                            </button>
                          </td>
                          <td className="px-6 py-5">
                            <div className={cn("space-y-1.5", isTaken && "line-through")}>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200">{id}</span>
                                <p className="font-bold text-slate-900 line-clamp-1 group-hover:text-blue-800 transition-colors uppercase tracking-tight">{item['Intitulé du poste']}</p>
                              </div>
                              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest opacity-70 italic">{item['Thématique']}</p>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <p className="text-xs font-black text-slate-800 truncate max-w-[180px]">{item['Ministère']}</p>
                            <p className="text-[11px] text-slate-500 flex items-center gap-1 font-medium"><MapPin className="w-3 h-3 text-slate-300" /> {item['Localisation (Commune ou adresse exacte)']} ({item['Code postal']})</p>
                          </td>
                          <td className="px-6 py-5 text-center">
                            <Badge variant={item['Env.'] === 'AC' ? 'ac' : 'ate'}>{item['Env.']}</Badge>
                          </td>
                          <td className="px-6 py-5 text-center">
                            <button onClick={() => toggleTaken(id)} className={cn(
                              "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                              isTaken ? "bg-red-600 text-white shadow-lg shadow-red-100" : "bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100"
                            )}>
                              {isTaken ? 'INDISPO' : 'DISPO'}
                            </button>
                          </td>
                          <td className="px-6 py-5 text-right">
                            {item['LIEN FICHE DE POSTE'] &&
                              <a href={item['LIEN FICHE DE POSTE']} target="_blank" rel="noreferrer"
                                className="text-blue-800 hover:bg-blue-800 hover:text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-blue-100 transition-all">
                                Fiche
                              </a>
                            }
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="p-6 bg-slate-50/50 flex items-center justify-between border-t border-slate-100">
                  <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white disabled:opacity-30">Précédent</button>
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Page {currentPage} / {totalPages}</span>
                  <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white disabled:opacity-30">Suivant</button>
                </div>
              )}
            </section>
          </>
        ) : (
          /* Ranking Mode - Drag & Drop Content */
          <section className="space-y-6">
            <div className="bg-amber-100/50 border border-amber-200/50 p-6 rounded-3xl flex items-center gap-6">
              <div className="w-14 h-14 bg-amber-500 rounded-2xl text-white flex items-center justify-center rotate-3 shadow-xl shadow-amber-200">
                <Trophy className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-amber-950 tracking-tight italic">Mon Ranking Stratégique</h2>
                <p className="text-amber-800/70 text-xs font-black uppercase tracking-widest">Amphi Session • Organisez vos priorités</p>
              </div>
            </div>

            {rankedData.length > 0 ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
                modifiers={[restrictToVerticalAxis]}
              >
                <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-xl divide-y divide-slate-100">
                  <SortableContext
                    items={shortlisted}
                    strategy={verticalListSortingStrategy}
                  >
                    {rankedData.map((item, idx) => (
                      <SortableItem
                        key={item.Référence}
                        id={item.Référence}
                        item={item}
                        index={idx}
                        isTaken={taken.includes(item.Référence)}
                        toggleTaken={toggleTaken}
                        toggleShortlist={toggleShortlist}
                      />
                    ))}
                  </SortableContext>
                </div>
              </DndContext>
            ) : (
              <div className="bg-white border-4 border-dashed border-slate-100 rounded-[3rem] p-20 text-center space-y-6">
                <div className="w-24 h-24 bg-slate-50 flex items-center justify-center mx-auto rounded-full">
                  <Star className="w-12 h-12 text-slate-200" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Ranking Vide</h3>
                  <p className="text-slate-400 font-bold max-w-sm mx-auto text-sm uppercase tracking-widest leading-relaxed">Retournez dans l'explorateur pour ajouter vos postes coups de ❤️.</p>
                </div>
                <button
                  onClick={() => setViewMode('explore')}
                  className="px-8 py-4 bg-blue-800 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-xl shadow-blue-100"
                >
                  Décollage
                </button>
              </div>
            )}
          </section>
        )}

        {/* Real-time Charts if in explore */}
        {viewMode === 'explore' && filteredData.length > 0 && (
          <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-10">
              <BarChart3 className="w-6 h-6 text-blue-800" />
              <h2 className="font-black text-slate-800 uppercase tracking-widest text-xs">Aperçu par Ministère (Filtré)</h2>
            </div>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={Object.entries(filteredData.reduce((acc, curr) => {
                  const min = curr['Ministère'] || 'Inconnu';
                  acc[min] = (acc[min] || 0) + 1;
                  return acc;
                }, {})).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 10)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 9, fontWeight: 900, fill: '#94a3b8' }} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="count" radius={[0, 10, 10, 0]} barSize={25}>
                    {COLORS.map((color, index) => <Cell key={`cell-${index}`} fill={color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}

        {/* Footer info */}
        <footer className="pt-20 pb-10 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6 opacity-40 hover:opacity-100 transition-opacity">
          <div className="font-black text-xl tracking-tighter text-slate-900 border-x-4 border-slate-900 px-4 py-1 flex items-center gap-3">
            <span className="bg-slate-900 text-white px-2 rounded">AMPHI</span> CHOICE
          </div>
          <div className="flex flex-col items-end gap-1">
            <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest">Système de Session Localisé / Sécurisé</p>
            <p className="text-[11px] font-black text-slate-900 tracking-tighter uppercase">{new Date().toLocaleDateString('fr-FR')} • {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        </footer>

      </div>
    </div>
  );
}
