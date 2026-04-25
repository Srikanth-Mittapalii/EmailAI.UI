import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Mail, 
  Zap, 
  LogOut, 
  ChevronRight,
  BarChart3,
  Sparkles,
  Layout,
  Lock,
  Database,
  Terminal,
  Activity,
  Bell,
  Settings,
  Cpu,
  Monitor
} from 'lucide-react';
import api from '../services/api';
import { authService } from '../services/api';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const [emails, setEmails] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('neural-feed');
  const [filterCategory, setFilterCategory] = useState('All Units');
  const [isIngestModalOpen, setIsIngestModalOpen] = useState(false);
  const [ingestData, setIngestData] = useState({ subject: '', body: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResponse, setSearchResponse] = useState<any>(null);
  const [actionExecuting, setActionExecuting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEmails();
  }, []);

  const fetchEmails = async () => {
    try {
      const response = await api.get('/email/list');
      setEmails(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredEmails = filterCategory === 'All Units' 
    ? emails 
    : emails.filter(e => e.category === filterCategory);

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  const handleQuickIngest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/email/ingest', {
        subject: ingestData.subject || "Manual Intelligence Sync",
        body: ingestData.body,
        sender: "user@core-os.terminal"
      });
      setIngestData({ subject: '', body: '' });
      setIsIngestModalOpen(false);
      await fetchEmails();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const result = await authService.queryEmails(searchQuery);
      setSearchResponse(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleExecuteAction = async () => {
    if (!selectedEmail) return;
    setActionExecuting(true);
    // Mocking API delay for visual feedback
    await new Promise(resolve => setTimeout(resolve, 1500));
    alert(`NEURAL ACTION EXECUTED: ${selectedEmail.action || 'Default Policy Applied'}`);
    setActionExecuting(false);
  };

  const getEmailId = (email: any) => {
    if (!email || !email.id) return Math.random().toString();
    if (typeof email.id === 'string') return email.id;
    return JSON.stringify(email.id);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'analytics':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <h2 className="text-3xl font-black text-white">Neural Analytics Engine</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="ops-card bg-[#070a1a]">
                <p className="text-xs font-black text-indigo-400 uppercase mb-6">Processing Latency Trend</p>
                <div className="flex items-end gap-2 h-40">
                   {[40, 70, 45, 90, 65, 80, 50, 95].map((h, i) => (
                      <motion.div 
                        key={i} 
                        initial={{ height: 0 }} 
                        animate={{ height: `${h}%` }} 
                        className="flex-1 bg-indigo-500/20 border-t-2 border-indigo-500 rounded-t-sm" 
                      />
                   ))}
                </div>
              </div>
              <div className="ops-card bg-[#070a1a] flex items-center justify-center gap-8">
                 <div className="neural-load-ring">
                    <span className="text-xl">
                      {emails.length > 0 ? Math.min(99.9, 85 + (emails.length * 0.5)).toFixed(1) : '0'}%
                    </span>
                 </div>
                 <div>
                    <h4 className="font-bold text-white">Categorization Density</h4>
                    <p className="text-xs text-slate-500">{emails.length} Records Analyzed</p>
                 </div>
              </div>
            </div>
            
            <div className="intelligence-grid">
               {['Urgent', 'Finance', 'HR', 'Work', 'Personal'].map(cat => {
                 const count = emails.filter(e => e.category === cat).length;
                 const percent = emails.length > 0 ? (count / emails.length) * 100 : 0;
                 return (
                   <div key={cat} className="ops-card">
                      <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-2">{cat}</p>
                      <div className="flex items-end justify-between">
                        <h3 className="text-2xl font-black text-white">{count}</h3>
                        <p className="text-[10px] text-indigo-400 font-bold">{percent.toFixed(0)}% Cluster Share</p>
                      </div>
                      <div className="w-full bg-slate-900 h-1 mt-3 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${percent}%` }}
                          className={`h-full ${cat === 'Urgent' ? 'bg-rose-500' : 'bg-indigo-500'}`}
                        />
                      </div>
                   </div>
                 );
               })}
            </div>
          </motion.div>
        );
      case 'classification':
        return (
          <div className="space-y-6">
             <div className="flex items-center justify-between">
                <h2 className="text-3xl font-black text-white">Cluster Explorer</h2>
                <div className="flex gap-2 p-1 bg-slate-900/50 rounded-xl border border-slate-800">
                   {['All Units', 'Urgent', 'Finance', 'HR', 'Work', 'Personal'].map(cat => (
                      <button 
                        key={cat} 
                        onClick={() => setFilterCategory(cat)}
                        className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${filterCategory === cat ? 'bg-indigo-500 text-white' : 'text-slate-500 hover:text-white'}`}
                      >
                         {cat}
                      </button>
                   ))}
                </div>
             </div>
             <div className="intelligence-grid">
                {filteredEmails.length === 0 ? (
                  <div className="col-span-full py-20 glass border-dashed flex flex-col items-center">
                     <p className="text-slate-500 font-mono text-sm uppercase tracking-widest">No Intelligence Records in {filterCategory}</p>
                  </div>
                ) : (
                  filteredEmails.map(email => (
                    <motion.div
                      layout
                      key={getEmailId(email)}
                      onClick={() => setSelectedEmail(email)}
                      className={`classification-card ${email.category || 'Work'} cursor-pointer group`}
                    >
                      <div className="card-badge">{email.category || 'Processed'}</div>
                      <h4 className="font-bold text-white mb-2">{email.subject}</h4>
                      <p className="text-xs text-slate-400 line-clamp-2">{email.body}</p>
                    </motion.div>
                  ))
                )}
             </div>
          </div>
        );
      case 'vault':
        return (
          <div className="flex flex-col items-center justify-center py-40 glass border-dashed">
             <Lock className="text-indigo-500/20 mb-4" size={64} />
             <p className="text-slate-500 font-mono text-sm uppercase tracking-[0.5em]">Encryption Active. Vault Locked.</p>
          </div>
        );
      case 'systems':
        return (
          <div className="space-y-4">
             {['Node-Alpha', 'Node-Beta', 'Vertex-Sync-01'].map(node => (
                <div key={node} className="ops-card flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <Monitor className="text-indigo-400" />
                      <div>
                         <p className="text-sm font-bold text-white">{node}</p>
                         <p className="text-[10px] text-slate-500 font-mono">STATUS: OPTIMAL</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="text-[10px] text-emerald-500 font-black">99.9% UPTIME</p>
                   </div>
                </div>
             ))}
          </div>
        );
      default:
        return (
          <>
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                 <div>
                   <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest leading-none mb-1">Operational Overview</p>
                   <h2 className="text-2xl font-black tracking-tight text-white">Intelligence Core Dashboard</h2>
                 </div>
                 <div className="flex gap-3">
                   <button className="btn-secondary text-xs">Generate Report</button>
                   <button onClick={() => setIsIngestModalOpen(true)} className="btn-primary text-xs flex items-center gap-2">
                     <Terminal size={14} />
                     <span>New Command</span>
                   </button>
                 </div>
              </div>

              {/* HUD Metrics */}
              <section className="ops-overview">
                <div className="ops-card flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Emails Processed</p>
                    <h3 className="text-3xl font-black text-white">{emails.length.toLocaleString()}</h3>
                    <p className="text-[10px] text-emerald-400 mt-2 font-bold">↑ 12% vs last 24h</p>
                  </div>
                  <Mail className="text-slate-800" size={40} />
                </div>
                <div className="ops-card flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">AI Confidence</p>
                    <h3 className="text-3xl font-black text-white">99.82%</h3>
                    <p className="text-[10px] text-emerald-400 mt-2 font-bold">Optimized</p>
                  </div>
                  <BarChart3 className="text-slate-800" size={40} />
                </div>
                <div className="ops-card flex items-center justify-between">
                   <div>
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">System Health</p>
                    <h3 className="text-3xl font-black text-white">Optimal</h3>
                    <p className="text-[10px] text-indigo-400 mt-2 font-bold">14ms Latency</p>
                  </div>
                  <Activity className="text-slate-800" size={40} />
                </div>
              </section>
            </div>

            {/* Intelligence Grid */}
            <section className="flex-1">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                   <Layout size={20} className="text-indigo-500" />
                   Intelligence Classification
                </h3>
                <button onClick={() => setActiveTab('classification')} className="text-xs text-indigo-400 font-bold hover:underline">View All Clusters</button>
              </div>

              <div className="intelligence-grid">
                {emails.length === 0 ? (
                  <div className="col-span-full py-20 glass border-dashed flex flex-col items-center">
                     <Terminal className="text-indigo-500 mb-4 animate-pulse" size={48} />
                     <p className="text-slate-400 font-mono uppercase tracking-widest">Awaiting Data Streams...</p>
                  </div>
                ) : (
                  emails.map((email) => (
                    <motion.div
                      key={getEmailId(email)}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => setSelectedEmail(email)}
                      className={`classification-card ${email.category || 'Work'} cursor-pointer group`}
                    >
                      <div className="card-badge">{email.category || 'Processed'}</div>
                      <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center mb-4 border border-slate-800 group-hover:border-indigo-500 transition-colors">
                         <Mail size={18} className="text-indigo-400" />
                      </div>
                      <h4 className="font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">{email.subject}</h4>
                      <p className="text-xs text-slate-400 leading-relaxed mb-4 line-clamp-2">{email.body}</p>
                      
                      <div className="flex items-center justify-between mt-auto">
                        <p className="text-[9px] text-slate-500 font-mono">{new Date(email.timestamp).toLocaleString()}</p>
                        <ChevronRight size={14} className="text-indigo-500 translate-x-0 group-hover:translate-x-2 transition-transform" />
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </section>
          </>
        );
    }
  };

  return (
    <div className="app-shell custom-scrollbar">
      {/* Sidebar Navigation */}
      <aside className="sidebar-navigation">
        <div className="logo-section">
          <div className="logo-icon">⚡</div>
          <div>
            <h1 className="text-sm font-black tracking-tighter">CORE OS</h1>
            <p className="text-[9px] text-slate-500 font-mono">V2.0.4-OBSIDIAN</p>
          </div>
        </div>

        <nav className="nav-links">
          {[
            { id: 'neural-feed', label: 'Neural Feed', Icon: Zap },
            { id: 'analytics', label: 'Analytics', Icon: BarChart3 },
            { id: 'classification', label: 'Classification', Icon: Layout },
            { id: 'vault', label: 'Vault', Icon: Lock },
            { id: 'systems', label: 'Systems', Icon: Database }
          ].map(({ id, label, Icon }) => (
            <div 
              key={id}
              onClick={() => setActiveTab(id)}
              className={`nav-item ${activeTab === id ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span>{label}</span>
            </div>
          ))}
        </nav>

        <div className="mt-auto space-y-2">
          <div className="nav-item">
            <Settings size={18} />
            <span>Support</span>
          </div>
          <div onClick={handleLogout} className="nav-item">
            <LogOut size={18} />
            <span>Sign Out</span>
          </div>
        </div>
      </aside>

      {/* Main Dashboard Viewport */}
      <main className="dashboard-viewport custom-scrollbar">
        {/* Top Header Search */}
        <header className="flex items-center justify-between mb-8">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input 
              type="text" 
              placeholder="Search Neural Query..."
              className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:border-indigo-500 transition-all outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-500" />
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-emerald-500 font-black uppercase">System Online</span>
            </div>
            <Bell size={18} className="text-slate-400 cursor-pointer hover:text-white" />
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center overflow-hidden">
               <Monitor size={16} className="text-indigo-400" />
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex-1"
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Neural Assistant Panel */}
      <aside className="assistant-panel">
         <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center shadow-[0_0_15px_rgba(79,70,229,0.3)]">
               <Sparkles size={16} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-black text-white leading-none">Neural Assistant</p>
              <p className="text-[10px] text-indigo-400 uppercase font-black">Active Insight Mode</p>
            </div>
         </div>

         <div className="ai-brief-card">
            <p className="text-sm text-slate-200 italic leading-relaxed">
              {selectedEmail 
                ? `${selectedEmail.summary}`
                : emails.length > 0 
                  ? `I have indexed ${emails.length} emails. ${emails.filter(e => e.category === 'Urgent').length} items require immediate attention.`
                  : `"I've detected a significant spike in urgent records today. Would you like me to initiate the priority reconciliation workflow?"`}
            </p>
            <button 
              onClick={handleExecuteAction}
              disabled={actionExecuting || !selectedEmail}
              className="w-full btn-primary text-[11px] uppercase tracking-widest font-black mt-4"
            >
              {actionExecuting ? 'Executing...' : selectedEmail ? 'Execute Policy' : 'Execute Neural Action'}
            </button>
         </div>

         <div className="space-y-6">
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-4">Latest Intelligence Records</p>
              <div className="space-y-4">
                 {emails.slice(0, 3).map((email, i) => (
                   <div key={i} className="flex gap-3 cursor-pointer group" onClick={() => setSelectedEmail(email)}>
                      <div className={`w-1.5 h-1.5 rounded-full mt-1.5 ${email.category === 'Urgent' ? 'bg-rose-500' : 'bg-indigo-500'}`} />
                      <div>
                        <p className="text-xs font-bold text-white group-hover:text-indigo-400 transition-colors">{email.subject}</p>
                        <p className="text-[10px] text-slate-500">{email.category || 'Processed'}</p>
                      </div>
                   </div>
                 ))}
                 {emails.length === 0 && (
                   <p className="text-[10px] text-slate-600 italic">No telemetry data streaming...</p>
                 )}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800">
               <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-4">System Nodes</p>
               <div className="space-y-3">
                 <div className="flex items-center justify-between glass p-3 border-transparent bg-slate-900/40">
                    <div className="flex items-center gap-2">
                       <Cpu size={14} className="text-indigo-400" />
                       <span className="text-xs text-white">Central Cluster</span>
                    </div>
                    <span className="text-[9px] text-emerald-500 uppercase font-black">Healthy</span>
                 </div>
                 <div className="flex items-center justify-between glass p-3 border-transparent bg-slate-900/40">
                    <div className="flex items-center gap-2">
                       <Database size={14} className="text-indigo-400" />
                       <span className="text-xs text-white">Storage Node A</span>
                    </div>
                    <span className="text-[9px] text-emerald-500 uppercase font-black">98% CAP</span>
                 </div>
               </div>
            </div>
         </div>
      </aside>

      {/* Ingest Command Terminal Modal */}
      <AnimatePresence>
        {isIngestModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg glass border-indigo-500/50 bg-[#070a1a] shadow-[0_0_50px_rgba(79,70,229,0.3)] overflow-hidden"
            >
              <div className="bg-indigo-500 p-3 flex justify-between items-center bg-gradient-to-r from-indigo-600 to-indigo-500">
                 <div className="flex items-center gap-2">
                    <Terminal size={14} className="text-white" />
                    <span className="text-[10px] font-black uppercase text-white tracking-widest">Neural Command Terminal</span>
                 </div>
                 <button onClick={() => setIsIngestModalOpen(false)} className="text-white hover:bg-white/10 p-1 rounded">✕</button>
              </div>

              <form onSubmit={handleQuickIngest} className="p-6 space-y-4">
                 <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Neural Subject</label>
                    <input 
                      required
                      placeholder="e.g. CORE-SEC-01: Unauthorized Record Ingestion"
                      className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-sm text-indigo-400 font-mono outline-none focus:border-indigo-500 transition-colors"
                      value={ingestData.subject}
                      onChange={(e) => setIngestData({ ...ingestData, subject: e.target.value })}
                    />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Raw Data Stream</label>
                    <textarea 
                      required
                      rows={6}
                      placeholder="Paste unstructured email content or telemetry logs here..."
                      className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-sm text-indigo-300 font-mono outline-none focus:border-indigo-500 transition-colors resize-none"
                      value={ingestData.body}
                      onChange={(e) => setIngestData({ ...ingestData, body: e.target.value })}
                    />
                 </div>
                 <div className="flex justify-end gap-3 pt-4">
                    <button type="button" onClick={() => setIsIngestModalOpen(false)} className="btn-secondary text-xs uppercase font-black">Abort</button>
                    <button type="submit" disabled={loading} className="btn-primary text-xs uppercase font-black px-8">
                       {loading ? 'Processing...' : 'Execute Sync'}
                    </button>
                 </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Semantic Search Result Modal */}
      <AnimatePresence>
        {searchResponse && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-4xl max-h-[80vh] flex flex-col glass border-indigo-500/50 bg-[#070a1a] shadow-[0_0_100px_rgba(79,70,229,0.2)] overflow-hidden"
            >
              <div className="p-6 border-b border-indigo-500/20 flex justify-between items-center bg-gradient-to-r from-indigo-900/40 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center animate-pulse">
                    <Sparkles className="text-white" size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white">Neural Response Engine</h2>
                    <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest">Retriever-Augmented Generation Active</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSearchResponse(null)}
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 text-white transition-colors"
                >✕</button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="max-w-2xl mx-auto space-y-10">
                  <section>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-4">AI Generated Answer</p>
                    <div className="text-lg text-slate-200 leading-relaxed font-medium bg-slate-900/40 p-6 rounded-2xl border border-slate-800/50">
                      {searchResponse.response}
                    </div>
                  </section>

                  {searchResponse.emails && searchResponse.emails.length > 0 && (
                    <section>
                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-4">Neural Source References ({searchResponse.emails.length})</p>
                      <div className="space-y-4">
                        {searchResponse.emails.map((email: any) => (
                          <div 
                            key={getEmailId(email)} 
                            className="ops-card flex items-center justify-between group cursor-pointer hover:border-indigo-500/50 transition-all"
                            onClick={() => {
                              setSelectedEmail(email);
                              setSearchResponse(null);
                            }}
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center border border-slate-800 group-hover:border-indigo-500/50">
                                <Mail size={14} className="text-indigo-400" />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">{email.subject}</p>
                                <p className="text-[10px] text-slate-500">{email.category || 'Processed'}</p>
                              </div>
                            </div>
                            <ChevronRight size={16} className="text-slate-700 group-hover:text-indigo-500 transition-colors" />
                          </div>
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              </div>

              {searchResponse.metrics && (
                <div className="p-4 bg-slate-950/50 border-t border-slate-900 flex items-center justify-center gap-8">
                  <div className="flex items-center gap-2">
                    <Zap size={12} className="text-amber-500" />
                    <span className="text-[10px] font-mono text-slate-500">LATENCY: {searchResponse.metrics.totalTimeMs}ms</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Terminal size={12} className="text-indigo-500" />
                    <span className="text-[10px] font-mono text-slate-500">TOKENS: {searchResponse.metrics.tokensUsed}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Database size={12} className="text-emerald-500" />
                    <span className="text-[10px] font-mono text-slate-500">SOURCES: {searchResponse.emails?.length || 0}</span>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
