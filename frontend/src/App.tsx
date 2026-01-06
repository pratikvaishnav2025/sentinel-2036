
import React, { useState, useEffect, useMemo } from 'react';
import { Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts';
import { 
  Shield, Hammer, FlaskConical, LayoutDashboard, Search, Cpu, 
  Link as LinkIcon, ExternalLink, Loader2, AlertTriangle, 
  CheckCircle2, Code2, Bug, FileJson, ChevronRight, Info, Filter,
  Copy, Check
} from 'lucide-react';
import { ScanType, SecurityReport, SAMPLES, Severity, Finding, Web3Finding } from './types';
import { api } from './services/api';

const SeverityBadge = ({ severity }: { severity: Severity }) => {
  const styles = {
    [Severity.CRITICAL]: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
    [Severity.HIGH]: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    [Severity.MEDIUM]: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    [Severity.LOW]: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
  };
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-black border tracking-widest uppercase ${styles[severity]}`}>
      {severity}
    </span>
  );
};

const CopyButton = ({ text, label }: { text: string; label?: string }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-950/50 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-500 hover:text-indigo-400 transition-all group"
      title={`Copy ${label || 'text'}`}
    >
      {copied ? (
        <Check size={10} className="text-emerald-500" />
      ) : (
        <Copy size={10} className="group-hover:scale-110 transition-transform" />
      )}
      {label && <span className="text-[9px] font-black uppercase tracking-tighter">{copied ? 'Copied' : label}</span>}
    </button>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    RUNNING: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    COMPLETED: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    FAILED: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
  };
  const icon = {
    RUNNING: <Loader2 size={10} className="animate-spin" />,
    COMPLETED: <CheckCircle2 size={10} />,
    FAILED: <AlertTriangle size={10} />,
  }[status] || <Info size={10} />;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-black border tracking-widest uppercase ${styles[status] || 'bg-slate-800 text-slate-400 border-slate-700'}`}>
      {icon}
      {status || 'UNKNOWN'}
    </span>
  );
};

const LoadingOverlay = ({ message = "Sequencing Neural Link..." }: { message?: string }) => {
  const [dots, setDots] = useState("");
  const [subtext, setSubtext] = useState("Bypassing heuristic blockers...");

  useEffect(() => {
    const subMessages = [
      "Mapping vulnerability vectors...",
      "Intercepting secure handshake...",
      "Analyzing neural weights...",
      "Finalizing intelligence report...",
      "Synchronizing command registry..."
    ];
    let msgIndex = 0;
    const msgInterval = setInterval(() => {
      msgIndex = (msgIndex + 1) % subMessages.length;
      setSubtext(subMessages[msgIndex]);
    }, 2500);

    const dotInterval = setInterval(() => {
      setDots(d => (d.length > 2 ? "" : d + "."));
    }, 500);

    return () => {
      clearInterval(msgInterval);
      clearInterval(dotInterval);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-2xl z-[100] flex flex-col items-center justify-center transition-all animate-in fade-in duration-500">
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/20 blur-[150px] rounded-full"></div>
      </div>
      
      <div className="relative mb-12">
        <div className="w-32 h-32 border-4 border-indigo-500/10 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin duration-700"></div>
        <div className="absolute inset-0 flex items-center justify-center">
           <Cpu className="text-indigo-500 w-14 h-14 animate-pulse" />
        </div>
      </div>
      
      <div className="text-center space-y-6 max-w-sm px-8">
        <h3 className="text-2xl font-black tracking-[0.4em] uppercase text-white">
          {message}{dots}
        </h3>
        <div className="flex flex-col items-center gap-3">
           <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
             <div className="h-full bg-indigo-500 w-1/2 animate-[loading-bar_3s_infinite_ease-in-out]"></div>
           </div>
           <p className="text-[11px] font-mono text-indigo-400 tracking-widest uppercase transition-all duration-500 opacity-80 h-4">
             {subtext}
           </p>
        </div>
      </div>
      <style>{`
        @keyframes loading-bar {
          0% { transform: translateX(-100%); width: 30%; }
          50% { width: 60%; }
          100% { transform: translateX(350%); width: 30%; }
        }
      `}</style>
    </div>
  );
};

const ScanViewSkeleton = () => (
  <div className="space-y-8 py-6 animate-pulse">
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
      <div className="space-y-4 flex-1">
        <div className="h-4 w-32 bg-slate-800 rounded"></div>
        <div className="h-12 w-3/4 bg-slate-800 rounded-2xl"></div>
        <div className="h-3 w-48 bg-slate-800 rounded"></div>
      </div>
      <div className="h-28 w-56 bg-slate-900 border border-slate-800 rounded-3xl"></div>
    </div>
    
    <div className="grid lg:grid-cols-12 gap-8">
      <div className="lg:col-span-8 space-y-6">
        <div className="h-48 w-full bg-slate-900 border border-slate-800 rounded-[2.5rem]"></div>
        <div className="flex gap-2">
           <div className="h-10 w-32 bg-slate-900 rounded-xl"></div>
           <div className="h-10 w-32 bg-slate-900 rounded-xl"></div>
        </div>
        <div className="space-y-4">
           {[...Array(3)].map((_, i) => (
             <div key={i} className="h-56 w-full bg-slate-900 border border-slate-800 rounded-3xl"></div>
           ))}
        </div>
      </div>
      <div className="lg:col-span-4 space-y-6">
        <div className="h-80 w-full bg-slate-900 border border-slate-800 rounded-[2rem]"></div>
        <div className="h-64 w-full bg-slate-900 border border-slate-800 rounded-[2rem]"></div>
      </div>
    </div>
  </div>
);

const Header = () => (
  <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50">
    <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-4 group">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-indigo-500/20 shadow-lg group-hover:rotate-12 transition-transform">
          <Shield className="text-white w-6 h-6" />
        </div>
        <div>
          <h1 className="text-lg font-black tracking-tighter text-white">SENTINEL <span className="text-indigo-500">2036</span></h1>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Core Status: Optimal</span>
          </div>
        </div>
      </Link>
      <nav className="flex gap-6 items-center">
        <Link to="/command" className="text-[11px] font-black text-slate-400 hover:text-white transition-colors uppercase tracking-widest">Command Registry</Link>
        <Link to="/new-scan" className="bg-indigo-600/10 text-indigo-400 border border-indigo-500/30 px-4 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all">New Operation</Link>
      </nav>
    </div>
  </header>
);

const Dashboard = () => {
  const [scans, setScans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<ScanType | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<string | 'ALL'>('ALL');

  useEffect(() => {
    api.getScans()
      .then(setScans)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredScans = useMemo(() => {
    return scans.filter(s => {
      const matchType = typeFilter === 'ALL' || s.type === typeFilter;
      const matchStatus = statusFilter === 'ALL' || s.status === statusFilter;
      return matchType && matchStatus;
    });
  }, [scans, typeFilter, statusFilter]);

  return (
    <div className="space-y-8 py-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">COMMAND REGISTRY</h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.2em] mt-2">Active Node Intelligence Logs</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 flex items-center gap-3">
             <div className="text-right">
                <div className="text-[9px] font-black text-slate-500 uppercase">Registry Entities</div>
                <div className="text-lg font-bold text-white leading-none">{filteredScans.length} / {scans.length}</div>
             </div>
             <LayoutDashboard className="text-slate-600 w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-6 bg-slate-900/40 border border-slate-800 p-6 rounded-[2rem] backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Filter size={14} className="text-indigo-400" />
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Neural Filtering:</span>
        </div>
        
        <div className="flex flex-wrap gap-2">
           <button 
             onClick={() => setTypeFilter('ALL')} 
             className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${typeFilter === 'ALL' ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'}`}
           >
             All Types
           </button>
           {(['JAVA_CODE', 'OPENAPI', 'SMART_CONTRACT', 'BUG_ANALYSIS'] as ScanType[]).map(t => (
             <button 
               key={t}
               onClick={() => setTypeFilter(t)} 
               className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${typeFilter === t ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'}`}
             >
               {t.replace('_', ' ')}
             </button>
           ))}
        </div>

        <div className="h-6 w-px bg-slate-800 hidden md:block"></div>

        <div className="flex flex-wrap gap-2">
          {(['ALL', 'RUNNING', 'COMPLETED', 'FAILED']).map(s => (
            <button 
              key={s}
              onClick={() => setStatusFilter(s)} 
              className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${statusFilter === s ? 'bg-slate-100 border-white text-slate-950 shadow-lg' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-[2rem] overflow-hidden backdrop-blur-sm shadow-2xl">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-950/50 text-[10px] text-slate-500 font-black uppercase tracking-[0.1em] border-b border-slate-800">
            <tr>
              <th className="px-8 py-5">Target Artifact</th>
              <th className="px-8 py-5 text-center">Modality</th>
              <th className="px-8 py-5 text-center">System Status</th>
              <th className="px-8 py-5">Risk Posture</th>
              <th className="px-8 py-5 text-right">Operation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-8 py-6"><div className="h-4 w-48 bg-slate-800 rounded"></div></td>
                  <td className="px-8 py-6"><div className="h-4 w-20 bg-slate-800 rounded mx-auto"></div></td>
                  <td className="px-8 py-6"><div className="h-4 w-24 bg-slate-800 rounded mx-auto"></div></td>
                  <td className="px-8 py-6"><div className="h-4 w-32 bg-slate-800 rounded"></div></td>
                  <td className="px-8 py-6 text-right"><div className="h-8 w-8 bg-slate-800 rounded-full ml-auto"></div></td>
                </tr>
              ))
            ) : filteredScans.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-8 py-20 text-center text-slate-600 uppercase text-xs font-black tracking-widest">
                  No entities match the current neural filter parameters.
                </td>
              </tr>
            ) : (
              filteredScans.map(s => (
                <tr key={s.id} className="group hover:bg-indigo-500/[0.03] transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-500 group-hover:text-indigo-400 group-hover:border-indigo-500/30 transition-all">
                        {s.type === 'JAVA_CODE' && <Code2 size={18} />}
                        {s.type === 'OPENAPI' && <FileJson size={18} />}
                        {s.type === 'SMART_CONTRACT' && <LinkIcon size={18} />}
                        {s.type === 'BUG_ANALYSIS' && <Bug size={18} />}
                      </div>
                      <div>
                        <div className="text-sm font-black text-white group-hover:text-indigo-300 transition-colors uppercase tracking-tight">{s.targetName}</div>
                        <div className="text-[10px] font-mono text-slate-500 mt-0.5">#{s.id.split('-')[0].toUpperCase()}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className="text-[10px] font-black text-indigo-400/70 border border-indigo-500/20 px-2.5 py-1 rounded-md bg-indigo-500/5 uppercase">
                      {s.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <StatusBadge status={s.status} />
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 max-w-[100px] h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-1000 ${s.riskScore > 70 ? 'bg-rose-500' : s.riskScore > 40 ? 'bg-orange-500' : 'bg-emerald-500'}`} 
                          style={{ width: `${s.riskScore}%` }}
                        ></div>
                      </div>
                      <span className={`text-sm font-black ${s.riskScore > 70 ? 'text-rose-500' : 'text-emerald-400'}`}>{s.riskScore}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <Link to={`/scan/${s.id}`} className="inline-flex items-center justify-center w-9 h-9 bg-slate-950 border border-slate-800 rounded-xl text-slate-500 hover:text-white hover:border-indigo-500 hover:bg-indigo-600 transition-all shadow-lg">
                      <ChevronRight size={18}/>
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ScanView = () => {
  const { id } = useParams();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'FINDINGS' | 'WEB3' | 'TESTS'>('FINDINGS');

  useEffect(() => {
    if (id) {
      setLoading(true);
      api.getScan(id)
        .then(data => {
          setJob(data);
          try {
            const results = JSON.parse(data.results || '{}');
            if (results.web3Findings) setActiveTab('WEB3');
          } catch(e) {
            console.error("Result parsing failed", e);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  const report = useMemo(() => {
    if (!job?.results) return null;
    try {
      return JSON.parse(job.results) as SecurityReport;
    } catch {
      return null;
    }
  }, [job]);

  const chartData = useMemo(() => {
    if (!report) return [];
    const counts = { [Severity.CRITICAL]: 0, [Severity.HIGH]: 0, [Severity.MEDIUM]: 0, [Severity.LOW]: 0 };
    const findings = report.web3Findings || report.findings || [];
    findings.forEach(f => counts[f.severity as Severity]++);
    return [
      { name: 'Crit', val: counts[Severity.CRITICAL], fill: '#f43f5e' },
      { name: 'High', val: counts[Severity.HIGH], fill: '#f97316' },
      { name: 'Med', val: counts[Severity.MEDIUM], fill: '#eab308' },
      { name: 'Low', val: counts[Severity.LOW], fill: '#6366f1' },
    ];
  }, [report]);

  if (loading) return <ScanViewSkeleton />;
  if (!job || !report) return <div className="py-20 text-center text-slate-500">Operation log not found or corrupted.</div>;

  return (
    <div className="space-y-8 py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-4">
             <SeverityBadge severity={report.riskScore > 70 ? Severity.CRITICAL : report.riskScore > 40 ? Severity.HIGH : Severity.LOW} />
             <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Neural Scan ID: {id?.split('-')[0]}</span>
             <StatusBadge status={job.status} />
          </div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase">{job.targetName}</h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.2em] mt-3">Target: <span className="text-indigo-400">{job.type}</span></p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex items-center gap-6 shadow-2xl">
           <div className="text-right">
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Risk Quotient</div>
              <div className={`text-4xl font-black leading-none ${report.riskScore > 70 ? 'text-rose-500' : 'text-emerald-500'}`}>{report.riskScore}</div>
           </div>
           <div className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center ${report.riskScore > 70 ? 'border-rose-500/20' : 'border-emerald-500/20'}`}>
              <Shield size={28} className={report.riskScore > 70 ? 'text-rose-500' : 'text-emerald-500'} />
           </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-xl">
             <div className="flex items-center gap-3 mb-6">
                <Info size={16} className="text-indigo-400" />
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Neural Summary</h3>
             </div>
             <p className="text-lg text-slate-200 font-medium leading-relaxed italic border-l-2 border-indigo-500 pl-6 py-2">
               {report.summary}
             </p>
          </div>

          <div className="flex gap-2">
             {report.findings && <button onClick={() => setActiveTab('FINDINGS')} className={`px-6 py-3 rounded-xl text-[10px] font-black tracking-widest transition-all ${activeTab === 'FINDINGS' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-900 text-slate-500 hover:text-white'}`}>CORE FINDINGS</button>}
             {report.web3Findings && <button onClick={() => setActiveTab('WEB3')} className={`px-6 py-3 rounded-xl text-[10px] font-black tracking-widest transition-all ${activeTab === 'WEB3' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-900 text-slate-500 hover:text-white'}`}>WEB3 GUARD</button>}
             {(report.gherkinFeatures || report.apiTestCases) && <button onClick={() => setActiveTab('TESTS')} className={`px-6 py-3 rounded-xl text-[10px] font-black tracking-widest transition-all ${activeTab === 'TESTS' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' : 'bg-slate-900 text-slate-500 hover:text-white'}`}>QA FORGE ARTIFACTS</button>}
          </div>

          <div className="space-y-4">
             {activeTab === 'FINDINGS' && report.findings?.map((f, i) => (
                <div key={i} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 hover:border-slate-600 transition-all group">
                   <div className="flex justify-between items-start mb-4">
                      <div className="flex gap-3 items-center">
                         <SeverityBadge severity={f.severity as Severity} />
                         <span className="text-[10px] font-mono text-slate-500 uppercase">{f.category}</span>
                      </div>
                   </div>
                   <div className="flex items-start justify-between gap-4 mb-3">
                      <h4 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors">{f.title}</h4>
                      <CopyButton text={f.title} />
                   </div>
                   <div className="relative mb-6">
                      <p className="text-sm text-slate-400 leading-relaxed pr-10">{f.description}</p>
                      <div className="absolute top-0 right-0">
                         <CopyButton text={f.description} />
                      </div>
                   </div>
                   <div className="bg-emerald-500/5 border border-emerald-500/10 p-5 rounded-2xl flex gap-4 relative">
                      <CheckCircle2 className="text-emerald-500 mt-0.5 shrink-0" size={18} />
                      <div className="flex-1">
                         <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Defense Recommendation</div>
                         <p className="text-sm text-emerald-100/80 pr-10">{f.recommendation}</p>
                      </div>
                      <div className="absolute top-4 right-4">
                         <CopyButton text={f.recommendation} />
                      </div>
                   </div>
                </div>
             ))}

             {activeTab === 'WEB3' && report.web3Findings?.map((f, i) => (
                <div key={i} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 hover:border-emerald-500/30 transition-all group">
                   <div className="flex gap-3 items-center mb-4">
                      <SeverityBadge severity={f.severity as Severity} />
                      <span className="text-[10px] font-mono text-emerald-500 uppercase">{f.category}</span>
                   </div>
                   <div className="flex items-start justify-between gap-4 mb-3">
                      <h4 className="text-xl font-bold text-white group-hover:text-emerald-300 transition-colors">{f.title}</h4>
                      <CopyButton text={f.title} />
                   </div>
                   <div className="relative mb-6">
                      <p className="text-sm text-slate-400 leading-relaxed pr-10">{f.description}</p>
                      <div className="absolute top-0 right-0">
                         <CopyButton text={f.description} />
                      </div>
                   </div>
                   <div className="bg-indigo-500/5 border border-indigo-500/10 p-5 rounded-2xl flex gap-4 relative">
                      <FlaskConical className="text-indigo-400 mt-0.5 shrink-0" size={18} />
                      <div className="flex-1">
                         <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Guard Implementation</div>
                         <p className="text-sm text-indigo-100/80 pr-10">{f.recommendation}</p>
                      </div>
                      <div className="absolute top-4 right-4">
                         <CopyButton text={f.recommendation} />
                      </div>
                   </div>
                </div>
             ))}

             {activeTab === 'TESTS' && (
                <div className="space-y-6">
                   {report.gherkinFeatures?.map((g, i) => (
                      <div key={i} className="bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden shadow-xl">
                         <div className="bg-slate-800/50 px-8 py-4 border-b border-slate-800 flex justify-between items-center">
                            <span className="text-[10px] font-black text-purple-400 uppercase tracking-[0.2em]">{g.name}</span>
                            <CopyButton text={g.content} label="Copy BDD" />
                         </div>
                         <pre className="p-8 text-[11px] font-mono text-purple-200/70 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                            {g.content}
                         </pre>
                      </div>
                   ))}
                   {report.apiTestCases?.map((t, i) => (
                      <div key={i} className="bg-slate-900 border border-slate-800 rounded-3xl p-8 hover:border-purple-500/30 transition-all">
                         <div className="flex items-center justify-between gap-4 mb-6">
                            <h5 className="font-black text-white text-lg flex items-center gap-4">
                               <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center"><Bug size={14} className="text-purple-500" /></div>
                               {t.title}
                            </h5>
                            <CopyButton text={`${t.title}\nSteps:\n${t.steps.join('\n')}\nExpected: ${t.expected}`} label="Copy Case" />
                         </div>
                         <div className="space-y-4 mb-6">
                            {t.steps.map((step, si) => (
                               <div key={si} className="flex gap-4 text-sm text-slate-400">
                                  <span className="text-indigo-600 font-black">{si + 1}.</span>
                                  <span>{step}</span>
                               </div>
                            ))}
                         </div>
                         <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Expected Outcome</span>
                            <span className="text-xs font-mono text-emerald-400 font-bold">{t.expected}</span>
                         </div>
                      </div>
                   ))}
                </div>
             )}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
           <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-8 shadow-xl overflow-hidden">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-8">Severity Distribution</h3>
              <div className="h-64 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                       <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10, fontWeight: 800}} />
                       <Tooltip cursor={{fill: 'transparent'}} content={({active, payload}) => {
                          if (active && payload?.length) return (
                             <div className="bg-slate-950 border border-slate-800 px-3 py-2 rounded-lg text-[10px] font-black text-white uppercase tracking-widest">
                                {payload[0].payload.name}: {payload[0].value} findings
                             </div>
                          );
                          return null;
                       }} />
                       <Bar dataKey="val" radius={[6, 6, 0, 0]}>
                          {chartData.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                       </Bar>
                    </BarChart>
                 </ResponsiveContainer>
              </div>
           </div>

           {(report.quickFixChecklist || report.safeChecklist) && (
              <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-8 shadow-xl">
                 <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Defense Checklist</h3>
                 <div className="space-y-4">
                    {(report.quickFixChecklist || report.safeChecklist)?.map((item, i) => (
                       <div key={i} className="flex gap-4 text-xs text-slate-300 bg-slate-950/50 p-4 rounded-2xl border border-slate-800 transition-all hover:bg-slate-950">
                          <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                          <span className="font-medium">{item}</span>
                       </div>
                    ))}
                 </div>
              </div>
           )}
        </div>
      </div>
    </div>
  );
};

const NewScan = () => {
  const [type, setType] = useState<ScanType>('JAVA_CODE');
  const [content, setContent] = useState('');
  const [name, setName] = useState('');
  const [mode, setMode] = useState<'AUDIT' | 'FORGE'>('AUDIT');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleStart = async () => {
    if (!name || !content) {
      alert("Operational parameters missing: Name and Source Payload required.");
      return;
    }
    setLoading(true);
    try {
      await api.startScan({ name, content, type, mode });
      navigate('/command');
    } catch (e) { 
      alert(e); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-12">
      {loading && <LoadingOverlay message="Auditing Target Vectors..." />}
      <div className="text-center mb-12">
        <h2 className="text-4xl font-black text-white tracking-tighter">INITIALIZE NEURAL SCAN</h2>
        <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.3em] mt-3">Advanced Defensive Intelligence Gateway</p>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-[3rem] p-10 backdrop-blur-sm shadow-2xl space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Operation Configuration</h3>
          {type !== 'SMART_CONTRACT' && (
             <div className="bg-slate-950 p-1.5 rounded-2xl flex gap-1 border border-slate-800 shadow-inner">
                <button onClick={() => setMode('AUDIT')} className={`px-6 py-2 text-[10px] font-black rounded-xl transition-all ${mode === 'AUDIT' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-500 hover:text-white'}`}>AUDIT</button>
                <button onClick={() => setMode('FORGE')} className={`px-6 py-2 text-[10px] font-black rounded-xl transition-all ${mode === 'FORGE' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30' : 'text-slate-500 hover:text-white'}`}>FORGE</button>
             </div>
          )}
          {type === 'SMART_CONTRACT' && (
             <span className="px-4 py-2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                <LinkIcon size={12} /> Web3 Guard Active
             </span>
          )}
        </div>

        <div className="space-y-4">
           <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Registry Name</label>
           <input className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-sm text-white focus:border-indigo-500 outline-none transition-all shadow-inner" placeholder="e.g. Identity Management Hub v1.0" value={name} onChange={e => setName(e.target.value)}/>
        </div>

        <div className="space-y-4">
           <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Scan Modality</label>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(['JAVA_CODE', 'OPENAPI', 'SMART_CONTRACT', 'BUG_ANALYSIS'] as ScanType[]).map(t => (
                <button key={t} onClick={() => { setType(t); setContent(SAMPLES[t]); }} className={`py-4 text-[9px] font-black border rounded-2xl transition-all uppercase tracking-widest ${type === t ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400 shadow-lg' : 'border-slate-800 text-slate-500 hover:border-slate-700 hover:bg-slate-900'}`}>{t.replace('_', ' ')}</button>
              ))}
           </div>
        </div>

        <div className="space-y-4 relative">
           <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Source Payload</label>
           <textarea className="w-full h-80 bg-slate-950 border border-slate-800 rounded-3xl p-6 font-mono text-xs text-indigo-300/80 outline-none focus:border-indigo-500 transition-all resize-none shadow-inner leading-relaxed" placeholder={`Paste ${type.toLowerCase()} content...`} value={content} onChange={e => setContent(e.target.value)}/>
           <button onClick={() => setContent(SAMPLES[type])} className="absolute top-12 right-6 px-3 py-1.5 bg-indigo-600/10 border border-indigo-500/30 rounded-lg text-[9px] font-black text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all">LOAD SAMPLE</button>
        </div>

        <button onClick={handleStart} disabled={loading} className="group relative w-full py-6 bg-indigo-600 rounded-[2rem] font-black uppercase tracking-[0.3em] text-white shadow-2xl shadow-indigo-500/20 active:scale-95 transition-all overflow-hidden">
           <span className="relative z-10 flex items-center justify-center gap-3">
              {loading ? <Loader2 className="animate-spin" /> : <Cpu />}
              {loading ? 'Processing Operation...' : 'Initialize Analysis Engine'}
           </span>
           <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
        </button>
      </div>
    </div>
  );
};

const App = () => (
  <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-indigo-500/30">
    <Header />
    <main className="max-w-7xl mx-auto p-6">
      <Routes>
        <Route path="/" element={
          <div className="py-24 text-center relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 blur-[120px] rounded-full -z-10"></div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black tracking-widest uppercase mb-8">
               <Shield size={12} /> Neural Defense v3.11-STABLE
            </div>
            <h1 className="text-7xl md:text-8xl font-black text-white mb-8 tracking-tighter leading-none">SENTINEL <span className="text-indigo-500">2036</span></h1>
            <p className="max-w-2xl mx-auto text-slate-400 mb-12 text-xl font-medium leading-relaxed">Autonomous security intelligence platform for high-assurance code auditing and defensive test synthesis.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
               <Link to="/new-scan" className="bg-indigo-600 px-10 py-5 rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-2xl shadow-indigo-500/40 hover:scale-105 transition-transform active:scale-95">Initialize Operation</Link>
               <Link to="/command" className="border border-slate-800 bg-slate-900/50 px-10 py-5 rounded-[2rem] font-black uppercase text-xs tracking-widest text-slate-400 hover:text-white hover:border-slate-600 transition-all active:scale-95 backdrop-blur-sm">Command Center</Link>
            </div>
          </div>
        } />
        <Route path="/command" element={<Dashboard />} />
        <Route path="/new-scan" element={<NewScan />} />
        <Route path="/scan/:id" element={<ScanView />} />
      </Routes>
    </main>
  </div>
);

export default App;
