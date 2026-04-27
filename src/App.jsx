import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Papa from 'papaparse';
import logoGaudez from './assets/logo-gaudez.png';
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
  PieChart,
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
  RotateCcw,
  Info,
  MoreVertical
} from 'lucide-react';

const Github = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.28 1.15-.28 2.35 0 3.5-.73 1.02-1.08 2.25-1 3.5 0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);
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
  MouseSensor,
  TouchSensor,
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

const StatCard = ({ title, value, icon: Icon, colorClass, className }) => (
  <div className={cn("bg-white p-3 md:p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-2 md:gap-3 transition-all hover:shadow-md", className)}>
    <div className={cn("p-1.5 md:p-2 rounded-lg", colorClass)}>
      <Icon className="w-4 h-4 md:w-5 md:h-5 text-white" />
    </div>
    <div className="min-w-0">
      <p className="text-[9px] md:text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate">{title}</p>
      <p className="text-sm md:text-xl font-black text-slate-900 leading-tight">{value}</p>
    </div>
  </div>
);

const JobDetailCard = ({ item, isExpanded, onToggle }) => {
  if (!isExpanded) return null;

  return (
    <div className="px-4 py-8 bg-slate-50 border-t-2 border-blue-100 animate-in fade-in slide-in-from-top-2">
      <div className="max-w-md mx-auto space-y-6 text-left">
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-1">
            <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Détails du poste</h4>
            <p className="text-sm font-black text-slate-900 leading-tight uppercase tracking-tight">{item['Intitulé du poste']}</p>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onToggle(item.Référence); }}
            className="p-2 bg-white rounded-xl shadow-sm border border-slate-200 text-slate-400 hover:text-blue-600 transition-colors"
          >
            <ChevronDown className="w-5 h-5 rotate-180" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-6">
          <div className="space-y-2">
            <p className="flex items-center gap-2 text-[9px] uppercase text-slate-400 font-black tracking-widest">
              <Building2 className="w-3.5 h-3.5" /> Ministère
            </p>
            <p className="text-[11px] font-bold text-slate-800 leading-snug">{item['Ministère']}</p>
          </div>

          <div className="space-y-2">
            <p className="flex items-center gap-2 text-[9px] uppercase text-slate-400 font-black tracking-widest">
              <MapPin className="w-3.5 h-3.5" /> Localisation
            </p>
            <p className="text-[11px] font-bold text-slate-800 leading-snug">{item['Localisation (Commune ou adresse exacte)']}</p>
            <p className="text-[10px] text-slate-500 font-black tracking-tighter mt-1">{item['Code postal']} — {item['Région']}</p>
          </div>

          <div className="space-y-2">
            <p className="flex items-center gap-2 text-[9px] uppercase text-slate-400 font-black tracking-widest">
              <Briefcase className="w-3.5 h-3.5" /> Environnement
            </p>
            <Badge variant={item['Env.'] === 'AC' ? 'ac' : 'ate'}>{item['Env.']}</Badge>
          </div>

          <div className="space-y-2">
            <p className="flex items-center gap-2 text-[9px] uppercase text-slate-400 font-black tracking-widest">
              <RotateCcw className="w-3.5 h-3.5" /> Thématique
            </p>
            <p className="text-[11px] font-bold italic text-slate-600 leading-snug">{item['Thématique']}</p>
          </div>
        </div>

        {item['Lien vers la fiche de poste'] && (
          <a
            href={item['Lien vers la fiche de poste']}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-center gap-3 w-full py-4 bg-blue-800 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-900/20 active:scale-[0.98] transition-all"
          >
            <ExternalLink className="w-4 h-4" /> Consulter la fiche de poste
          </a>
        )}
      </div>
    </div>
  );
};

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
        <div className="absolute z-10 left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
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

const SortableItem = ({ id, item, index, isTaken, toggleTaken, toggleShortlist, isExpanded, onToggle }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 10 : 0 };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => onToggle(id)}
      className={cn(
        "bg-white flex items-start gap-2 md:gap-4 p-2 md:p-4 transition-all group relative cursor-pointer",
        isDragging && "shadow-2xl ring-2 ring-blue-500/20 bg-slate-50 z-10",
        !isDragging && "hover:bg-slate-50/50",
        isTaken && "opacity-50 grayscale bg-slate-50"
      )}
    >
      {/* Left side: Rank + Handle stacked */}
      <div className="flex flex-col items-center justify-center gap-1 shrink-0 px-1 border-r border-slate-100 self-stretch">
        <div
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          className="cursor-grab active:cursor-grabbing p-1.5 md:p-2 text-slate-300 hover:text-slate-600 transition-colors touch-none touch-manipulation"
          style={{ touchAction: 'none' }}
        >
          <GripVertical className="w-4 h-4" />
        </div>
        <span className="text-[10px] font-black text-slate-400">{index + 1}</span>
      </div>

      {/* Middle: Content */}
      <div className="flex-1 min-w-0 flex flex-col gap-1 py-1">
        <div className="flex items-center gap-2">
          <span className="text-[10px] md:text-[11px] font-black text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-lg border border-slate-200 flex-shrink-0 tabular-nums tracking-tight">{id}</span>
          <Badge variant={item['Env.'] === 'AC' ? 'ac' : 'ate'}>{item['Env.']}</Badge>
          {!isExpanded && item['LIEN FICHE DE POSTE'] && (
            <a
              href={item['LIEN FICHE DE POSTE']}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-1 text-slate-300 hover:text-blue-600 transition-colors shrink-0"
              title="Voir la fiche"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        <h3 className={cn(
          "text-xs md:text-sm font-bold text-slate-900 leading-tight",
          !isExpanded && "truncate",
          isTaken && "line-through"
        )}>
          {item['Intitulé du poste']}
        </h3>

        {!isExpanded && (
          <div className="flex flex-col gap-0.5 text-slate-700 md:text-slate-600 text-[10px] md:text-xs font-medium">
            <span className="flex items-center gap-1 truncate italic">
              <Building2 className="w-2.5 h-2.5 text-slate-400" />
              {item['Ministère']}
            </span>
            <span className="flex items-center gap-1 truncate font-bold text-blue-800">
              <MapPin className="w-2.5 h-2.5 text-blue-700" />
              {item['Localisation (Commune ou adresse exacte)']} <span className="text-slate-400 font-normal ml-1">• {item['Région']}</span>
            </span>
          </div>
        )}

        <JobDetailCard item={item} isExpanded={isExpanded} onToggle={onToggle} />
      </div>

      {/* Right side: Buttons stacked */}
      <div className="flex flex-col items-center justify-center gap-1 shrink-0 pl-1 border-l border-slate-100 self-stretch md:flex-row md:border-l-0 md:gap-2">
        <button
          onClick={(e) => { e.stopPropagation(); toggleTaken(id); }}
          className={cn("p-1.5 md:p-2 rounded-lg transition-all border", isTaken ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-300 border-slate-200 hover:text-blue-600 hover:border-blue-200")}
          title={isTaken ? "Marquer comme disponible" : "Marquer comme pris"}
        >
          <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); toggleShortlist(id); }}
          className="p-1.5 md:p-2 text-amber-500 hover:text-red-500 transition-all"
          title="Retirer du ranking"
        >
          <Star className="w-4 h-4 md:w-5 md:h-5 fill-current" />
        </button>
      </div>
    </div>
  );
};

const StatsView = ({ data, stats, onClose }) => {
  const getTop = useCallback((key, limit = 12) => {
    const counts = {};
    data.forEach(item => {
      const val = item[key]?.trim() || 'Autre';
      counts[val] = (counts[val] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, limit);
  }, [data]);

  const chartMin = useMemo(() => getTop('Ministère', 10), [getTop]);
  const chartReg = useMemo(() => getTop('Région', 10), [getTop]);
  const chartEnv = useMemo(() => getTop('Env.', 5), [getTop]);
  const chartTheme = useMemo(() => getTop('Thématique', 10), [getTop]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-50/95 backdrop-blur-sm overflow-y-auto w-[100dvw] h-[100dvh]">
      <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

        {/* Header */}
        <div className="flex items-center justify-between bg-white p-4 md:p-6 rounded-3xl border border-slate-200 shadow-sm sticky top-4 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 flex items-center justify-center rounded-2xl text-blue-700 shadow-inner">
              <PieChart className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight uppercase">Tableau de Bord</h1>
              <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-400">Vue d'ensemble des données</p>
            </div>
          </div>
          <button onClick={onClose} className="px-4 py-2 bg-slate-100 text-slate-500 hover:bg-slate-800 hover:text-white rounded-2xl transition-all font-bold text-[10px] md:text-xs uppercase tracking-widest flex items-center gap-2 shadow-sm">
            <span className="hidden sm:inline">Fermer</span>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Stats - Compact Grid */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
          <StatCard title="Total Postes" value={stats.total} icon={Briefcase} colorClass="bg-slate-900" />
          <StatCard title="Admin. Centrale" value={stats.ac} icon={Building2} colorClass="bg-blue-700" />
          <StatCard title="Serv. Déconcentrés" value={stats.sd} icon={MapPin} colorClass="bg-emerald-600" />
          <StatCard title="Sélectionnés" value={stats.sel} icon={Trophy} colorClass="bg-amber-500" />
        </section>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 pb-20">
          <ChartCard title="Ministère" subtitle="Top 10" data={chartMin} color="#1E40AF" />
          <ChartCard title="Région" subtitle="Top 10" data={chartReg} color="#059669" />
          <ChartCard title="Thématique" subtitle="Top 10" data={chartTheme} color="#D97706" />
          <ChartCard title="Périmètre" subtitle="AC vs ATE" data={chartEnv} color="#4338CA" />
        </div>
      </div>
    </div>
  );
};

const ChartCard = ({ title, subtitle, data, color }) => (
  <section className="bg-white p-5 md:p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between border-b border-slate-50 pb-3">
      <div>
        <h2 className="text-sm md:text-md font-black text-slate-900 tracking-tight uppercase">Répartition par {title}</h2>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{subtitle}</p>
      </div>
      <div className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest" style={{ backgroundColor: `${color}1A`, color: color }}>
        {data.length} entrées
      </div>
    </div>
    <div className="h-[250px] md:h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
          <XAxis type="number" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
          <YAxis dataKey="name" type="category" tick={{ fontSize: 9, fill: '#475569', fontWeight: 600 }} width={120} axisLine={false} tickLine={false} />
          <Tooltip
            cursor={{ fill: '#F8FAFC' }}
            contentStyle={{ borderRadius: '12px', border: '1px solid #F1F5F9', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', fontSize: '11px', fontWeight: 600 }}
          />
          <Bar dataKey="value" fill={color} radius={[0, 4, 4, 0]} maxBarSize={32}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fillOpacity={index === 0 ? 1 : index < 3 ? 0.8 : 0.6} fill={color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  </section>
);

export default function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const [viewMode, setViewMode] = useState('explore'); // 'explore' or 'ranking'
  const [showDashboard, setShowDashboard] = useState(false);
  const [showRankingHelp, setShowRankingHelp] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showMobileStats, setShowMobileStats] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
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
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedIds, setExpandedIds] = useState(new Set());

  // Filter state indicators
  const filterCount = [envFilter, minFilter, themeFilter, regionFilter, deptFilter].filter(f => f.length > 0).length + (search ? 1 : 0);
  const hasActiveFilters = filterCount > 0 || hideTaken;

  // Body scroll lock on mobile when filters are open
  useEffect(() => {
    if (showFilters && window.innerWidth < 768) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      return () => {
        const top = document.body.style.top;
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        if (top) window.scrollTo(0, parseInt(top || '0') * -1);
      };
    }
  }, [showFilters]);

  const toggleExpand = (id) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 10 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
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

  const options = useMemo(() => {
    const getOptions = (key) => {
      const uniqueVals = Array.from(new Set(data.map(i => i[key]?.trim() || "")));
      const hasEmpty = uniqueVals.includes("");
      const sortedValues = uniqueVals.filter(v => v !== "").sort();
      return hasEmpty ? [...sortedValues, "(Non renseigné)"] : sortedValues;
    };

    return {
      min: getOptions('Ministère'),
      themes: getOptions('Thématique'),
      env: getOptions('Env.'),
      regions: getOptions('Région'),
      depts: Array.from(new Set(data.map(i => {
        const cp = i['Code postal']?.trim();
        return cp ? cp.substring(0, 2) : "(Non renseigné)";
      }))).sort()
    };
  }, [data]);

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const id = item.Référence;
      const searchTerms = search.toLowerCase().split(/[ ,]+/).filter(Boolean);
      const matchesSearch = searchTerms.length === 0 || searchTerms.some(term =>
        id.toLowerCase().includes(term) ||
        (item['Intitulé du poste'] || '').toLowerCase().includes(term) ||
        (item['Localisation (Commune ou adresse exacte)'] || '').toLowerCase().includes(term)
      );

      const matchesEnv = envFilter.length === 0 || envFilter.includes(item['Env.']?.trim() || "(Non renseigné)");
      const matchesMin = minFilter.length === 0 || minFilter.includes(item['Ministère']?.trim() || "(Non renseigné)");
      const matchesTheme = themeFilter.length === 0 || themeFilter.includes(item['Thématique']?.trim() || "(Non renseigné)");
      const matchesRegion = regionFilter.length === 0 || regionFilter.includes(item['Région']?.trim() || "(Non renseigné)");
      const matchesDept = deptFilter.length === 0 || deptFilter.includes(item['Code postal']?.trim()?.substring(0, 2) || "(Non renseigné)");
      const matchesTaken = !hideTaken || !taken.includes(id);

      return matchesSearch && matchesEnv && matchesMin && matchesTheme && matchesRegion && matchesDept && matchesTaken;
    });
  }, [data, search, envFilter, minFilter, themeFilter, regionFilter, deptFilter, hideTaken, taken]);

  const rankedData = useMemo(() => shortlisted.map(id => data.find(i => i.Référence === id)).filter(Boolean), [shortlisted, data]);
  const stats = useMemo(() => ({
    total: filteredData.length,
    ac: filteredData.filter(i => i['Env.'] === 'AC').length,
    sd: filteredData.filter(i => i['Env.'] !== 'AC').length,
    sel: shortlisted.length
  }), [filteredData, shortlisted]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const pagedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => { setCurrentPage(1); }, [search, envFilter, minFilter, themeFilter, regionFilter, deptFilter, hideTaken, itemsPerPage]);

  if (loading) return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-50 gap-6">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-blue-50 rounded-full animate-pulse" />
        <Loader2 className="w-16 h-16 text-blue-800 animate-spin absolute inset-0" />
      </div>
      <div className="flex flex-col items-center gap-2">
        <p className="text-slate-900 font-black uppercase tracking-[0.3em] text-sm animate-pulse">Chargement</p>
        <div className="h-1 w-24 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-blue-800 animate-progress w-full" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 px-3 md:px-8 lg:px-12 selection:bg-blue-100 selection:text-blue-900 pb-20">
      {showDashboard && <StatsView data={data} stats={stats} onClose={() => setShowDashboard(false)} />}

      <div className="max-w-[1400px] mx-auto space-y-4 md:space-y-8 pt-4 md:pt-10">
        <header className="flex justify-between items-start md:items-center gap-4 md:gap-6">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-1.5 h-6 md:w-2 md:h-10 bg-blue-800 rounded-full shrink-0" />
              <h1 className="text-xl md:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-2 md:gap-3 truncate">
                Amphi Session <span className="bg-blue-800 text-white px-2 py-0.5 md:px-3 md:py-1 rounded-lg md:rounded-xl text-sm md:text-2xl shrink-0">PRO</span>
              </h1>
            </div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[8px] md:text-[10px] ml-3 md:ml-5 flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="truncate">Outil d'aide au choix • ESIRA</span>
              <span className="opacity-20 hidden sm:inline">•</span>
              <a
                href="https://www.gaudeztechlab.com"
                target="_blank"
                rel="noreferrer"
                className="transition-all duration-300 flex items-center gap-1.5 group/hbadge hover:text-blue-600 shrink-0"
              >
                <span className="opacity-40 group-hover/hbadge:opacity-100 transition-all duration-300 group-hover/hbadge:-translate-x-1">Built by</span>
                <img src={logoGaudez} alt="" className="h-3 md:h-4 w-auto opacity-80 group-hover/hbadge:opacity-100 transition-all duration-500 group-hover/hbadge:scale-125 group-hover/hbadge:rotate-[5deg] drop-shadow-sm" />
                <span className="group-hover/hbadge:translate-x-1 transition-all duration-300">Gaudez Tech Lab</span>
              </a>
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0 md:mt-0">
            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-2">
              <a
                href="https://docs.google.com/spreadsheets/d/189NQW59RAkWaFWD296qfVhVd1yIWUxgk5XRoPcLKqRw/edit"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 md:gap-2 px-3 py-2 md:px-4 md:py-3 bg-emerald-600 text-white rounded-xl md:rounded-2xl hover:bg-emerald-700 transition-all font-bold text-xs md:text-sm shadow-md md:shadow-lg shadow-emerald-100"
                title="Voir le Spreadsheet Google"
              >
                <FileText className="w-4 h-4 md:w-5 md:h-5" />
                <span>Source Spreadsheet</span>
                <ExternalLink className="w-3.5 h-3.5 md:w-4 md:h-4 opacity-70" />
              </a>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowDashboard(true)}
                  className="p-2 md:p-3 bg-white border border-slate-200 text-slate-700 rounded-xl md:rounded-2xl hover:bg-slate-50 transition-all shadow-sm group flex items-center gap-1.5"
                  title="Voir le tableau de bord"
                >
                  <PieChart className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                  <span className="font-bold uppercase tracking-widest text-[10px]">Tableau de Bord</span>
                </button>
                <input type="file" ref={fileInputRef} onChange={importSession} className="hidden" accept=".json" />
                <button onClick={() => fileInputRef.current.click()} className="p-2 md:p-3 bg-white border border-slate-200 rounded-xl md:rounded-2xl hover:bg-slate-50 transition-all shadow-sm group" title="Importer une session (JSON)">
                  <Upload className="w-4 h-4 md:w-5 md:h-5 text-slate-400 group-hover:text-blue-800" />
                </button>
                <button onClick={exportSession} className="p-2 md:p-3 bg-blue-800 text-white rounded-xl md:rounded-2xl hover:bg-blue-900 transition-all shadow-md md:shadow-lg shadow-blue-100 group" title="Sauvegarder la session (JSON)">
                  <Download className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              </div>
            </div>

            {/* Mobile Actions Menu */}
            <div className="md:hidden relative">
              <button
                onClick={() => setShowActionsMenu(!showActionsMenu)}
                className="p-2 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-all shadow-sm flex items-center justify-center w-10 h-10"
              >
                <MoreVertical className="w-5 h-5" />
              </button>

              {showActionsMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowActionsMenu(false)} />
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 flex flex-col gap-1 animate-in fade-in slide-in-from-top-2 origin-top-right">
                    <button
                      onClick={() => { setShowDashboard(true); setShowActionsMenu(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50 rounded-xl transition-colors font-black text-[11px] uppercase tracking-widest text-blue-700"
                    >
                      <PieChart className="w-4 h-4" />
                      Tableau de bord
                    </button>
                    <div className="h-px w-full bg-slate-100 my-1" />
                    <a
                      href="https://docs.google.com/spreadsheets/d/189NQW59RAkWaFWD296qfVhVd1yIWUxgk5XRoPcLKqRw/edit"
                      target="_blank"
                      rel="noreferrer"
                      className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-50 rounded-xl transition-colors font-bold text-[11px] uppercase tracking-widest text-emerald-700"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-emerald-600" />
                        Spreadsheet
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 opacity-50" />
                    </a>
                    <button
                      onClick={() => { exportSession(); setShowActionsMenu(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 rounded-xl transition-colors font-bold text-[11px] uppercase tracking-widest text-slate-600"
                    >
                      <Download className="w-4 h-4 text-slate-400" />
                      Exporter session
                    </button>
                    <button
                      onClick={() => { fileInputRef.current.click(); setShowActionsMenu(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 rounded-xl transition-colors font-bold text-[11px] uppercase tracking-widest text-slate-600"
                    >
                      <Upload className="w-4 h-4 text-slate-400" />
                      Importer session
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <nav className="flex justify-center mt-0 md:mt-0">
          <div className="flex p-1 bg-slate-200/50 rounded-2xl shadow-inner w-full md:w-fit">
            <button
              onClick={() => setViewMode('explore')}
              className={cn("flex-1 md:flex-none flex items-center justify-center gap-2 px-3 md:px-8 py-2.5 md:py-3 rounded-xl font-black transition-all text-xs md:text-sm uppercase tracking-wider", viewMode === 'explore' ? "bg-white text-blue-800 shadow-sm" : "text-slate-500 hover:text-slate-700")}
            >
              <LayoutGrid className="w-4 h-4 md:w-5 md:h-5" />
              <span>Explorateur</span>
            </button>
            <button
              onClick={() => setViewMode('ranking')}
              className={cn("flex-1 md:flex-none flex items-center justify-center gap-2 px-3 md:px-8 py-2.5 md:py-3 rounded-xl font-black transition-all text-xs md:text-sm uppercase tracking-wider relative", viewMode === 'ranking' ? "bg-white text-blue-800 shadow-sm" : "text-slate-500 hover:text-slate-700")}
            >
              <ListOrdered className="w-4 h-4 md:w-5 md:h-5" />
              <span>Mon Ranking</span>
              {shortlisted.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[9px] md:text-[10px] w-5 h-5 md:w-6 md:h-6 flex items-center justify-center rounded-full border-2 md:border-4 border-slate-50 shadow-sm">
                  {shortlisted.length}
                </span>
              )}
            </button>
          </div>
        </nav>

        {viewMode === 'explore' ? (
          <div className="flex flex-col gap-3 md:gap-6">

            {/* Filter Bar (Sticky) */}
            <section className={cn(
              "p-3 md:p-6 rounded-2xl md:rounded-3xl shadow-sm border sticky top-2 z-30 md:static md:top-auto md:overflow-visible transition-all duration-300",
              hasActiveFilters ? "bg-blue-50/80 backdrop-blur-md border-blue-200 ring-2 ring-blue-500/10 shadow-blue-900/5" : "bg-white border-slate-100 shadow-sm"
            )}>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Filter className={cn("w-5 h-5 shrink-0 transition-colors", hasActiveFilters ? "text-blue-800" : "text-slate-400")} />
                    <h2 className={cn("font-black uppercase tracking-widest text-[10px] hidden sm:block", hasActiveFilters ? "text-blue-900" : "text-slate-500")}>
                      Filtres {filterCount > 0 && `(${filterCount})`}
                    </h2>
                  </div>
                  {filterCount > 0 && (
                    <button
                      onClick={() => { setSearch(''); setEnvFilter([]); setMinFilter([]); setThemeFilter([]); setRegionFilter([]); setDeptFilter([]); }}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white text-blue-600 rounded-xl text-[9px] font-black uppercase shadow-sm border border-blue-100 hover:bg-blue-800 hover:text-white transition-all shrink-0"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span className="hidden xs:inline">Réinitialiser</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 min-w-0">
                  <button
                    onClick={() => setHideTaken(!hideTaken)}
                    className={cn(
                      "p-2.5 md:px-4 md:py-2 rounded-xl text-[9px] md:text-xs font-black transition-all border uppercase tracking-wider flex items-center gap-2 shrink-0 shadow-sm",
                      hideTaken
                        ? "bg-amber-100 border-amber-300 text-amber-800 ring-2 ring-amber-500/20"
                        : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                    )}
                  >
                    {hideTaken ? <RotateCcw className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    <span className="hidden md:inline">{hideTaken ? "Tout voir" : "Masquer les pris"}</span>
                    <span className="md:hidden">Pris</span>
                  </button>

                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={cn(
                      "px-4 py-2.5 rounded-xl border transition-all flex items-center gap-2 text-[9px] font-black uppercase shadow-xl shrink-0 relative",
                      showFilters
                        ? "bg-blue-800 text-white border-blue-900 ring-4 ring-blue-100"
                        : hasActiveFilters
                          ? "bg-blue-700 text-white border-blue-900 shadow-blue-900/20"
                          : "bg-white border-slate-200 text-blue-800"
                    )}
                  >
                    <Filter className="w-3.5 h-3.5" />
                    <span>Filtrer</span>
                    {filterCount > 0 && (
                      <span className={cn(
                        "absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-[10px] shadow-lg border-2",
                        showFilters ? "bg-white text-blue-800 border-blue-800" : "bg-white text-blue-800 border-blue-700"
                      )}>
                        {filterCount}
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* Desktop Filters Inline */}
              <div className="hidden md:block pt-6 border-t border-slate-50">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest flex items-center gap-1"><Search className="w-3 h-3" /> Recherche Lib.</label>
                    <input type="text" placeholder="ID, Poste..." className="w-full px-4 py-2.5 bg-slate-100 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-xl transition-all outline-none font-bold text-xs" value={search} onChange={(e) => setSearch(e.target.value)} />
                  </div>
                  <MultiSelect label="Environnement" icon={Briefcase} options={options.env} selected={envFilter} onChange={setEnvFilter} placeholder="Tous" />
                  <MultiSelect label="Ministère" icon={Building2} options={options.min} selected={minFilter} onChange={setMinFilter} placeholder="Tous les ministères" />
                  <MultiSelect label="Thématique" icon={RotateCcw} options={options.themes} selected={themeFilter} onChange={setThemeFilter} placeholder="Toutes thématiques" />
                  <MultiSelect label="Lieu / Région" icon={MapPin} options={[...options.regions, ...options.depts]} selected={[...regionFilter, ...deptFilter]} onChange={(vals) => {
                    setRegionFilter(vals.filter(v => options.regions.includes(v)));
                    setDeptFilter(vals.filter(v => options.depts.includes(v)));
                  }} placeholder="Toutes zones" />
                </div>
              </div>
            </section>

            {/* Mobile Filters Drawer */}
            {showFilters && (
              <div className="md:hidden fixed inset-0 z-[100] flex flex-col justify-end overflow-hidden outline-none">
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setShowFilters(false)} />
                <div
                  className="relative bg-white rounded-t-[3rem] shadow-2xl flex flex-col animate-in slide-in-from-bottom duration-300 ease-out overflow-hidden w-full left-0 right-0 border-x border-slate-100"
                  style={{ maxHeight: '85vh', maxHeight: '85dvh' }}
                >
                  <div className="px-8 pt-8 pb-4 flex justify-between items-center shrink-0 bg-white border-b border-slate-50 relative z-30">
                    <div className="space-y-1">
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Filtres avancés</h3>
                      <p className="text-[10px] text-blue-600 font-black uppercase tracking-tight">{filteredData.length} postes correspondants</p>
                    </div>
                    <button onClick={() => setShowFilters(false)} className="p-2 active:scale-90 bg-slate-100 rounded-2xl text-slate-400">
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto px-8 pt-6 pb-32 space-y-7 overscroll-contain min-h-0 bg-white">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest flex items-center gap-1"><Search className="w-3.5 h-3.5" /> Recherche Libre</label>
                      <input
                        type="text"
                        placeholder="ID, Poste, Mots-clés..."
                        className="w-full px-6 py-4 bg-slate-100 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl transition-all outline-none font-bold text-sm shadow-inner"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </div>
                    <div className="space-y-6">
                      <MultiSelect label="Environnement" icon={Briefcase} options={options.env} selected={envFilter} onChange={setEnvFilter} placeholder="Tous" />
                      <MultiSelect label="Ministère" icon={Building2} options={options.min} selected={minFilter} onChange={setMinFilter} placeholder="Tous les ministères" />
                      <MultiSelect label="Thématique" icon={RotateCcw} options={options.themes} selected={themeFilter} onChange={setThemeFilter} placeholder="Toutes thématiques" />
                      <MultiSelect label="Région" icon={MapPin} options={options.regions} selected={regionFilter} onChange={setRegionFilter} placeholder="Toutes régions" />
                      <MultiSelect label="Département" icon={MapPin} options={options.depts} selected={deptFilter} onChange={setDeptFilter} placeholder="Tous les dépts" />
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 px-8 pt-6 pb-10 bg-gradient-to-t from-white via-white to-white/0 pointer-events-none z-30">
                    <button
                      onClick={() => setShowFilters(false)}
                      className="w-full py-5 bg-blue-800 text-white rounded-2xl font-black uppercase tracking-[0.25em] shadow-2xl shadow-blue-900/40 active:scale-95 transition-all text-xs flex items-center justify-center gap-2 pointer-events-auto"
                    >
                      Voir les résultats
                    </button>
                  </div>
                </div>
              </div>
            )}

            <section className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-4 md:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                <div className="flex items-center gap-2 font-black text-slate-800 text-xs md:text-sm uppercase tracking-widest">
                  <LayoutGrid className="w-4 h-4" />
                  <span>Résultats ({filteredData.length})</span>
                </div>
                <div className="flex items-center gap-2 md:gap-4">
                  <label className="hidden sm:inline text-[10px] font-black text-slate-400 uppercase tracking-widest">Afficher</label>
                  <select
                    className="bg-slate-100 px-2 md:px-3 py-1.5 rounded-lg text-xs font-black border-transparent focus:ring-0 outline-none cursor-pointer"
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  >
                    {[10, 25, 50, 100, 250, 500, 1000].map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse table-fixed md:table-auto">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="px-2 md:px-6 py-4 md:py-5 text-center w-10 md:w-20">❤️</th>
                      <th className="px-2 md:px-6 py-4 md:py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Poste</th>
                      <th className="px-2 md:px-6 py-4 md:py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Lieu / Min.</th>
                      <th className="hidden md:table-cell px-6 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest w-20">Env.</th>
                      <th className="hidden md:table-cell px-4 md:px-6 py-4 md:py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest w-24 md:w-32">Status</th>
                      <th className="hidden md:table-cell px-2 md:px-6 py-4 md:py-5 text-right w-10 md:w-32"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pagedData.map((item, idx) => (
                      <React.Fragment key={`${item.Référence}-${idx}`}>
                        <tr
                          onClick={() => toggleExpand(item.Référence)}
                          className={cn("transition-all group cursor-pointer", taken.includes(item.Référence) && "opacity-40 grayscale bg-slate-50/50", shortlisted.includes(item.Référence) && "bg-amber-50/20")}
                        >
                          <td className="px-2 md:px-6 py-4 md:py-5 text-center">
                            <button
                              onClick={(e) => { e.stopPropagation(); toggleShortlist(item.Référence); }}
                              className={cn("transition-all hover:scale-125 active:scale-90", shortlisted.includes(item.Référence) ? "text-amber-500" : "text-slate-200 hover:text-amber-400")}
                            >
                              <Star className={cn("w-5 h-5 md:w-7 md:h-7", shortlisted.includes(item.Référence) && "fill-current animate-in zoom-in-50")} />
                            </button>
                          </td>
                          <td className="px-2 md:px-6 py-4 md:py-5">
                            <div className={cn("flex flex-col gap-0.5 md:gap-1.5", taken.includes(item.Référence) && "line-through")}>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[9px] md:text-[11px] font-black bg-slate-100 text-slate-500 px-1 py-0.5 rounded border border-slate-200 w-fit tabular-nums tracking-tight">{item.Référence}</span>
                                <Badge variant={item['Env.'] === 'AC' ? 'ac' : 'ate'} className="md:hidden !px-1.5 !py-0 !text-[8px]">{item['Env.']}</Badge>
                              </div>
                              <p className="font-bold text-slate-900 group-hover:text-blue-800 transition-colors uppercase tracking-tight text-[10px] md:text-sm leading-tight line-clamp-2 md:line-clamp-none whitespace-normal">{item['Intitulé du poste']}</p>
                              <p className="text-[8px] md:text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate">{item['Thématique']}</p>
                            </div>
                          </td>
                          <td className="px-2 md:px-6 py-4 md:py-5">
                            <div className="flex flex-col gap-0.5 min-w-0">
                              <p className="flex items-center gap-1 text-[9px] md:text-xs text-blue-700 md:text-slate-700 font-bold leading-tight">
                                <MapPin className="w-2.5 h-2.5 shrink-0 text-blue-500 md:text-slate-400" />
                                <span className="truncate">{item['Localisation (Commune ou adresse exacte)']} <span className="text-[8px] md:text-[10px] text-slate-400 font-normal ml-0.5">• {item['Région']}</span></span>
                              </p>
                              <p className="flex items-center gap-1 text-[8px] md:text-[10px] text-slate-500 font-bold uppercase tracking-widest truncate">
                                <Building2 className="w-2.5 h-2.5 shrink-0 text-slate-300 md:text-slate-400" />
                                <span className="truncate">{item['Ministère']}</span>
                              </p>
                            </div>
                          </td>
                          <td className="hidden md:table-cell px-6 py-5 text-center">
                            <Badge variant={item['Env.'] === 'AC' ? 'ac' : 'ate'}>{item['Env.']}</Badge>
                          </td>
                          <td className="hidden md:table-cell px-4 md:px-6 py-4 md:py-5 text-center">
                            <button
                              onClick={(e) => { e.stopPropagation(); toggleTaken(item.Référence); }}
                              className={cn(
                                "w-8 h-8 md:w-10 md:h-10 rounded-xl border-2 flex items-center justify-center transition-all shadow-sm",
                                taken.includes(item.Référence)
                                  ? "bg-blue-800 border-blue-800 text-white"
                                  : "bg-white border-slate-200 text-slate-300 hover:border-blue-300 hover:text-blue-400"
                              )}
                              title={taken.includes(item.Référence) ? "Remettre en disponible" : "Marquer comme pris"}
                            >
                              <Check className={cn("w-4 h-4 md:w-5 md:h-5", taken.includes(item.Référence) ? "stroke-[3px]" : "stroke-[2px]")} />
                            </button>
                          </td>
                          <td className="hidden md:table-cell px-2 md:px-6 py-4 md:py-5 text-right">
                            {item['Lien vers la fiche de poste'] && (
                              <a
                                href={item['Lien vers la fiche de poste']}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center text-slate-300 hover:text-blue-600 transition-colors"
                                title="Voir la fiche"
                              >
                                <ExternalLink className="w-5 h-5" />
                              </a>
                            )}
                          </td>
                        </tr>
                        {expandedIds.has(item.Référence) && (
                          <tr className="md:hidden">
                            <td colSpan="3" className="p-0 border-none">
                              <JobDetailCard item={item} isExpanded={true} onToggle={toggleExpand} />
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
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
          </div>
        ) : (
          <section className="space-y-4 md:space-y-6">
            <div className="space-y-3 md:space-y-4">
              <div className="flex items-center gap-3 bg-amber-50 p-3 md:p-4 rounded-2xl md:rounded-3xl border border-amber-100 shadow-sm relative overflow-hidden group">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-amber-500 rounded-lg md:rounded-xl flex items-center justify-center text-white shadow-md shadow-amber-200 shrink-0 transition-transform group-hover:scale-110">
                  <Trophy className="w-4 h-4 md:w-5 md:h-5" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm md:text-lg font-black text-amber-900 tracking-tight leading-tight uppercase hidden md:block">Mon Ranking</h2>
                  <p className="text-[9px] md:text-[10px] text-amber-600/60 font-black uppercase tracking-widest truncate">Organisez vos priorités stratégiques</p>
                </div>
                <button
                  onClick={() => setShowRankingHelp(!showRankingHelp)}
                  className={cn("ml-auto p-2 rounded-xl transition-all flex items-center gap-2 font-bold text-[11px] uppercase tracking-wider", showRankingHelp ? "bg-amber-500 text-white shadow-md shadow-amber-200" : "text-amber-600 hover:bg-amber-200/50")}
                >
                  <Info className="w-5 h-5" />
                  <span className="hidden sm:inline">{showRankingHelp ? "Fermer" : "Aide"}</span>
                </button>
              </div>

              {showRankingHelp && (
                <div className="bg-white border-2 border-amber-200 rounded-[2rem] p-6 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex items-start gap-4">
                      <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 shadow-sm"><GripVertical className="w-5 h-5 text-slate-400" /></div>
                      <div>
                        <p className="text-xs font-black text-slate-900 uppercase tracking-wide">Réordonner</p>
                        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">Cliquez et faites glisser le poste pour changer votre ordre de priorité stratégique.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="bg-blue-50 p-2 rounded-xl border border-blue-100 shadow-sm"><CheckCircle2 className="w-5 h-5 text-blue-800" /></div>
                      <div>
                        <p className="text-xs font-black text-slate-900 uppercase tracking-wide">Marquer comme "Pris"</p>
                        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">Cochez cette case lorsqu'un poste est choisi par un autre candidat lors de l'amphi.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="bg-amber-50 p-2 rounded-xl border border-amber-100 shadow-sm"><Star className="w-5 h-5 text-amber-500 fill-current" /></div>
                      <div>
                        <p className="text-xs font-black text-slate-900 uppercase tracking-wide">Retirer</p>
                        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">Retire le poste de votre sélection stratégique (le bouton étoile devient gris).</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {rankedData.length > 0 ? (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd} modifiers={[restrictToVerticalAxis]}>
                <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-xl divide-y divide-slate-100">
                  <SortableContext items={shortlisted} strategy={verticalListSortingStrategy}>
                    {rankedData.map((item, idx) => (
                      <SortableItem
                        key={item.Référence}
                        id={item.Référence}
                        item={item}
                        index={idx}
                        isTaken={taken.includes(item.Référence)}
                        toggleTaken={toggleTaken}
                        toggleShortlist={toggleShortlist}
                        isExpanded={expandedIds.has(item.Référence)}
                        onToggle={toggleExpand}
                      />
                    ))}
                  </SortableContext>
                </div>
              </DndContext>
            ) : (
              <div className="bg-white border-4 border-dashed border-slate-100 rounded-[3rem] p-20 text-center space-y-6"><div className="w-24 h-24 bg-slate-50 flex items-center justify-center mx-auto rounded-full"><Star className="w-12 h-12 text-slate-200" /></div><h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Ranking Vide</h3><button onClick={() => setViewMode('explore')} className="px-8 py-4 bg-blue-800 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all">Décollage</button></div>
            )}
          </section>
        )}

        <footer className="pt-20 pb-10 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-8 transition-all">
          <div className="font-black text-xl tracking-tighter text-slate-900 border-l-4 border-slate-900 pl-4 py-1 flex items-center gap-3"><span className="bg-slate-900 text-white px-2 rounded">AMPHI</span> CHOICE</div>

          <div className="flex flex-col items-center gap-2.5 flex-1 order-3 md:order-2 px-4 border-slate-100 md:border-x group/logo">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] group-hover/logo:text-blue-500 transition-colors">Propulsé par Gaudez Tech Lab</p>
            <div className="flex items-center gap-3 transition-transform duration-300 group-hover/logo:-translate-y-1">
              <a href="https://www.gaudeztechlab.com" target="_blank" rel="noreferrer" className="block hover:scale-110 transition-transform duration-300">
                <img src={logoGaudez} alt="Gaudez Tech Lab" className="h-6 w-auto" />
              </a>
              <a href="https://www.gaudeztechlab.com" target="_blank" rel="noreferrer" className="text-[10px] text-blue-600 font-bold transition-all underline decoration-blue-600/20 underline-offset-4 tracking-tight hover:decoration-blue-600">www.gaudeztechlab.com</a>
            </div>
            <a
              href="https://github.com/lgaudez/amphi-session-lesira"
              target="_blank"
              rel="noreferrer"
              className="mt-2 text-[9px] text-slate-400 hover:text-blue-600 transition-colors flex items-center gap-1.5 group/github"
            >
              <Github className="w-3 h-3 opacity-50 group-hover/github:opacity-100 transition-opacity" />
              <span>Une question / un bug ? Voir sur GitHub</span>
            </a>
          </div>

          <div className="flex flex-col md:items-end items-center gap-1 order-2 md:order-3">
            <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest">Système de Session • ESIRA</p>
            <p className="text-[11px] font-black text-slate-900 tracking-tighter uppercase">
              {new Date().toLocaleDateString('fr-FR')} • {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </footer>
      </div>
    </div >
  );
}
