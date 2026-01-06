
import React, { useState, useMemo } from 'react';
import { runSecurityScan } from './services/geminiService.ts';
import { SecurityReport, ScanType, Severity, SAMPLES } from './types.ts';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const SeverityBadge = ({ severity }: { severity: Severity }) => {
  const styles = {
    [Severity.CRITICAL]: 'bg-red-500/10 text-red-500 border-red-500/20',
    [Severity.HIGH]: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    [Severity.MEDIUM]: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    [Severity.LOW]: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  };
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border tracking-wider uppercase ${styles[severity]}`}>
      {severity}
    </span>
  );
};

const Header = ({ activeTab, onTabChange }: { activeTab: string, onTabChange: (t: string) => void }) => (
  <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50">
    <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <i className="fas fa-shield-virus text-white"></i>
        </div>
        <div>
          <h1 className="text-lg font-black tracking-tighter text-white">SENTINEL <span className="text-indigo-500">2036</span></h1>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">Core Status: Optimal</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <nav className="flex items-center gap-4">
          <button onClick={() => onTabChange('analyzer')} className={`text-xs font-bold transition-colors ${activeTab === 'analyzer' ? 'text-indigo-400' : 'text-slate-500 hover:text-white'}`}>ANALYZER</button>
        </nav>
      </div>
    </div>
  </header>
);

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('analyzer');
  const [content, setContent] = useState('');
  const [scanType, setScanType] = useState<ScanType>('JAVA_CODE');
  const [mode, setMode] = useState<'AUDIT' | 'FORGE'>('AUDIT');
  const [report, setReport] = useState<SecurityReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [resultTab, setResultTab] = useState<'FINDINGS' | 'GHERKIN' | 'TESTS' | 'WEB3'>('FINDINGS');

  const handleScan = async () => {
    if (!content.trim()) return;
    setLoading(true);
    setReport(null);
    try {
      const result = await runSecurityScan(content, scanType, mode);
      setReport(result);
      if (scanType === 'SMART_CONTRACT') {
        setResultTab('WEB3');
      } else if (mode === 'FORGE') {
        setResultTab('GHERKIN');
      } else {
        setResultTab('FINDINGS');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const chartData = useMemo(() => {
    if (!report) return [];
    const counts = { [Severity.CRITICAL]: 0, [Severity.HIGH]: 0, [Severity.MEDIUM]: 0, [Severity.LOW]: 0 };
    const findings = report.web3Findings || report.findings || [];
    findings.forEach(f => counts[f.severity as Severity]++);
    return [
      { name: 'Crit', val: counts[Severity.CRITICAL], color: '#ef4444' },
      { name: 'High', val: counts[Severity.HIGH], color: '#f97316' },
      { name: 'Med', val: counts[Severity.MEDIUM], color: '#eab308' },
      { name: 'Low', val: counts[Severity.LOW], color: '#3b82f6' },
    ];
  }, [report]);

  const checklist = useMemo(() => {
    if (!report) return [];
    return report.safeChecklist || report.quickFixChecklist || [];
  }, [report]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-indigo-500/30">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="max-w-7xl mx-auto p-6">
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Input Sidebar */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 backdrop-blur-sm shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Operation Config</h2>
                {scanType !== 'SMART_CONTRACT' && (
                  <div className="flex bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                    <button onClick={() => setMode('AUDIT')} className={`px-4 py-1.5 text-[10px] font-black rounded-lg transition-all ${mode === 'AUDIT' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500'}`}>AUDIT</button>
                    <button onClick={() => setMode('FORGE')} className={`px-4 py-1.5 text-[10px] font-black rounded-lg transition-all ${mode === 'FORGE' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' : 'text-slate-500'}`}>FORGE</button>
                  </div>
                )}
                {scanType === 'SMART_CONTRACT' && (
                  <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-lg text-[10px] font-black uppercase tracking-widest">Web3 Guard Active</span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 mb-6">
                {(['JAVA_CODE', 'OPENAPI', 'SMART_CONTRACT', 'BUG_ANALYSIS'] as ScanType[]).map(t => (
                  <button key={t} onClick={() => setScanType(t)} className={`py-2.5 text-[10px] font-black border rounded-xl transition-all ${scanType === t ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400' : 'border-slate-800 text-slate-500 hover:border-slate-700'}`}>{t.replace('_', ' ')}</button>
                ))}
              </div>

              <div className="relative">
                <textarea 
                  className="w-full h-96 bg-slate-950 border border-slate-800 rounded-2xl p-5 font-mono text-sm text-indigo-300 outline-none focus:border-indigo-500 transition-all resize-none shadow-inner" 
                  value={content} 
                  onChange={e => setContent(e.target.value)} 
                  placeholder={`Paste ${scanType === 'SMART_CONTRACT' ? 'Solidity code' : 'target content'}...`} 
                />
                <button 
                  onClick={() => setContent(SAMPLES[scanType])}
                  className="absolute top-4 right-4 text-[10px] font-black bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-3 py-1.5 rounded-lg"
                >
                  USE SAMPLE
                </button>
              </div>

              <button onClick={handleScan} disabled={loading || !content.trim()} className={`w-full py-5 mt-6 rounded-2xl font-black tracking-[0.2em] transition-all transform active:scale-95 ${loading ? 'bg-slate-800 text-slate-600' : scanType === 'SMART_CONTRACT' ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl shadow-emerald-500/20' : mode === 'AUDIT' ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-500/20' : 'bg-purple-600 hover:bg-purple-500 text-white shadow-xl shadow-purple-500/20'}`}>
                {loading ? <i className="fas fa-circle-notch animate-spin mr-3"></i> : <i className={`fas ${scanType === 'SMART_CONTRACT' ? 'fa-ethereum' : mode === 'AUDIT' ? 'fa-shield-halved' : 'fa-hammer'} mr-3`}></i>}
                {loading ? 'PROCESSING...' : scanType === 'SMART_CONTRACT' ? 'SCAN CONTRACT' : `INITIALIZE ${mode}`}
              </button>
            </div>

            {report && checklist.length > 0 && (
              <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6">
                <h3 className="text-[10px] font-black uppercase text-slate-500 mb-6 tracking-widest">Defense Checklist</h3>
                <div className="space-y-3">
                  {checklist.map((item, i) => (
                    <div key={i} className="flex gap-3 text-xs text-slate-300 bg-slate-950/50 p-3 rounded-xl border border-slate-800/50">
                      <i className={`fas ${scanType === 'SMART_CONTRACT' ? 'fa-shield' : 'fa-shield-check'} text-emerald-500 mt-0.5`}></i>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Results Area */}
          <div className="lg:col-span-7 space-y-6">
            {!report && !loading && (
              <div className="h-full flex flex-col items-center justify-center text-slate-800 border-2 border-dashed border-slate-900 rounded-[3rem] p-20 text-center">
                <i className={`fas ${scanType === 'SMART_CONTRACT' ? 'fa-cubes-stacked' : 'fa-radar'} text-7xl mb-6 opacity-10`}></i>
                <h3 className="text-xl font-black tracking-tight mb-2 text-slate-700">AWAITING SYSTEM INPUT</h3>
                <p className="text-xs max-w-xs text-slate-600 uppercase tracking-widest font-bold">The neural link is ready for defensive synthesis.</p>
              </div>
            )}

            {loading && (
              <div className="h-full flex flex-col items-center justify-center space-y-8 py-20">
                <div className="relative">
                  <div className="w-24 h-24 border-4 border-indigo-500/10 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
                  <i className={`fas ${scanType === 'SMART_CONTRACT' ? 'fa-link' : 'fa-brain'} absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl text-indigo-500 animate-pulse`}></i>
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-black text-white uppercase tracking-widest">{scanType === 'SMART_CONTRACT' ? 'Auditing State Logic' : 'Sequencing Data'}</h3>
                  <p className="text-xs font-mono text-indigo-400 animate-pulse mt-2">Running cognitive security checks...</p>
                </div>
              </div>
            )}

            {report && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Posture Analysis</h4>
                    <p className="text-sm text-slate-300 font-medium leading-relaxed">{report.summary}</p>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col items-center justify-center text-center shadow-xl">
                    <h4 className="text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">RISK SCORE</h4>
                    <div className={`text-5xl font-black ${report.riskScore > 60 ? 'text-red-500' : 'text-emerald-500'}`}>{report.riskScore}</div>
                  </div>
                </div>

                <div className="flex gap-2 mb-6">
                  {report.findings && (
                    <button onClick={() => setResultTab('FINDINGS')} className={`px-5 py-2.5 rounded-xl text-[10px] font-black transition-all ${resultTab === 'FINDINGS' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-500 hover:text-white'}`}>CORE FINDINGS</button>
                  )}
                  {report.web3Findings && (
                    <button onClick={() => setResultTab('WEB3')} className={`px-5 py-2.5 rounded-xl text-[10px] font-black transition-all ${resultTab === 'WEB3' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-900 text-slate-500 hover:text-white'}`}>WEB3 GUARD FINDINGS</button>
                  )}
                  {report.gherkinFeatures && (
                    <button onClick={() => setResultTab('GHERKIN')} className={`px-5 py-2.5 rounded-xl text-[10px] font-black transition-all ${resultTab === 'GHERKIN' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' : 'bg-slate-900 text-slate-500 hover:text-white'}`}>GHERKIN SPECS</button>
                  )}
                  {report.apiTestCases && (
                    <button onClick={() => setResultTab('TESTS')} className={`px-5 py-2.5 rounded-xl text-[10px] font-black transition-all ${resultTab === 'TESTS' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-900 text-slate-500 hover:text-white'}`}>NEGATIVE TESTS</button>
                  )}
                </div>

                {resultTab === 'WEB3' && report.web3Findings && (
                  <div className="space-y-4">
                    {report.web3Findings.map((f, i) => (
                      <div key={i} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 hover:border-emerald-500/30 transition-all shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <SeverityBadge severity={f.severity as Severity} />
                            <span className="text-[10px] font-mono font-bold text-emerald-500/60 uppercase tracking-tighter">{f.category}</span>
                          </div>
                        </div>
                        <h5 className="font-bold text-slate-100 text-lg mb-3">{f.title}</h5>
                        <p className="text-xs text-slate-400 mb-5 leading-relaxed">{f.description}</p>
                        <div className="bg-emerald-500/5 p-5 rounded-2xl border border-emerald-500/10 flex gap-4">
                           <i className="fas fa-code-branch text-emerald-600 mt-1"></i>
                           <div>
                              <div className="text-[10px] font-black text-emerald-500 uppercase mb-1">SECURE PATTERN</div>
                              <p className="text-sm text-emerald-100/90 leading-relaxed">{f.recommendation}</p>
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {resultTab === 'FINDINGS' && report.findings && (
                  <div className="space-y-4">
                    {report.findings.map((f, i) => (
                      <div key={i} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 hover:border-slate-600 transition-all shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <SeverityBadge severity={f.severity as Severity} />
                            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-tighter opacity-50">{f.category}</span>
                          </div>
                        </div>
                        <h5 className="font-bold text-slate-100 text-lg mb-3">{f.title}</h5>
                        <p className="text-xs text-slate-400 mb-5 leading-relaxed">{f.description}</p>
                        <div className="bg-emerald-500/5 p-5 rounded-2xl border border-emerald-500/10 flex gap-4">
                           <i className="fas fa-shield-halved text-emerald-600 mt-1"></i>
                           <div>
                              <div className="text-[10px] font-black text-emerald-500 uppercase mb-1">REMEDIATION</div>
                              <p className="text-sm text-emerald-100/90 leading-relaxed">{f.recommendation}</p>
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {resultTab === 'GHERKIN' && report.gherkinFeatures && (
                  <div className="space-y-6">
                    {report.gherkinFeatures.map((feat, i) => (
                      <div key={i} className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                        <div className="bg-slate-800/50 px-6 py-3 border-b border-slate-800 flex justify-between items-center">
                          <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">{feat.name}</span>
                          <button onClick={() => navigator.clipboard.writeText(feat.content)} className="text-[10px] font-black text-slate-500 hover:text-white">COPY FEATURE</button>
                        </div>
                        <pre className="p-6 text-xs font-mono text-purple-200/80 leading-relaxed overflow-x-auto whitespace-pre-wrap">
                          {feat.content}
                        </pre>
                      </div>
                    ))}
                  </div>
                )}

                {resultTab === 'TESTS' && report.apiTestCases && (
                  <div className="space-y-4">
                    {report.apiTestCases.map((test, i) => (
                      <div key={i} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
                        <h5 className="font-bold text-emerald-400 text-base mb-4 flex items-center gap-3">
                          <i className="fas fa-vial"></i> {test.title}
                        </h5>
                        <div className="space-y-3 mb-5">
                          {test.steps.map((step, si) => (
                            <div key={si} className="flex gap-3 text-xs text-slate-400">
                              <span className="text-slate-600 font-mono font-bold">{si + 1}.</span>
                              <span>{step}</span>
                            </div>
                          ))}
                        </div>
                        <div className="bg-black/30 p-4 rounded-xl border border-slate-800 flex items-center gap-3">
                          <span className="text-[10px] font-black text-slate-500 uppercase">Expected:</span>
                          <span className="text-xs font-mono text-emerald-300">{test.expected}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
