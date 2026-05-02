import React, { useState } from "react";
import { 
  Terminal as TerminalIcon, 
  Activity, 
  Search, 
  ShieldAlert, 
  Settings,
  FileCode,
  Link,
  Hash,
  Upload,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  Cpu,
  Clock,
  Eye,
  Server,
  X,
  Globe
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- Custom Styles for Terminal Theme ---
const TerminalStyles = () => (
  <style dangerouslySetInnerHTML={{ __html: `
    @import url('https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400;1,700&display=swap');

    .terminal-theme {
      font-family: 'Space Mono', monospace;
      background-color: #050505;
      color: #39ff14;
    }

    .terminal-theme * {
      border-radius: 0 !important;
      border-color: rgba(57, 255, 20, 0.18) !important;
    }

    .terminal-theme .bg-background {
      background-color: #050505 !important;
    }

    .terminal-theme .text-foreground {
      color: #39ff14 !important;
    }

    .terminal-theme .border-border {
      border-color: rgba(57, 255, 20, 0.18) !important;
    }

    .terminal-theme .bg-card {
      background-color: transparent !important;
    }

    .terminal-theme .text-card-foreground {
      color: #39ff14 !important;
    }

    .terminal-theme .bg-muted {
      background-color: rgba(57, 255, 20, 0.05) !important;
    }

    .terminal-theme .text-muted-foreground {
      color: rgba(57, 255, 20, 0.6) !important;
    }

    .terminal-theme .bg-primary {
      background-color: #39ff14 !important;
      color: #050505 !important;
    }

    .terminal-theme .text-primary-foreground {
      color: #050505 !important;
    }
    
    .terminal-theme .hover\\:bg-muted:hover {
      background-color: rgba(57, 255, 20, 0.1) !important;
    }

    .terminal-theme .hover\\:text-foreground:hover {
      color: #39ff14 !important;
    }

    .terminal-theme ::selection {
      background-color: #39ff14;
      color: #050505;
    }

    @keyframes blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0; }
    }
    .animate-blink {
      animation: blink 1s step-end infinite;
    }
    
    .terminal-scrollbar::-webkit-scrollbar {
      width: 8px;
    }
    .terminal-scrollbar::-webkit-scrollbar-track {
      background: #050505;
      border-left: 1px solid rgba(57, 255, 20, 0.18);
    }
    .terminal-scrollbar::-webkit-scrollbar-thumb {
      background: rgba(57, 255, 20, 0.3);
    }
    .terminal-scrollbar::-webkit-scrollbar-thumb:hover {
      background: rgba(57, 255, 20, 0.5);
    }
    
    .crt-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      background: linear-gradient(
        rgba(18, 16, 16, 0) 50%, 
        rgba(0, 0, 0, 0.25) 50%
      );
      background-size: 100% 4px;
      z-index: 100;
      opacity: 0.15;
    }
  `}} />
);

// --- Sample Data ---
const RECENT_SUBMISSIONS = [
  { id: "sub_1", filename: "invoice_final.exe", type: "file", status: "malicious", score: 98, time: "2m ago", size: "4.2 MB", hash: "a8f3b2...9c1" },
  { id: "sub_2", filename: "setup.dll", type: "file", status: "suspicious", score: 75, time: "15m ago", size: "1.1 MB", hash: "f7d2e1...b4a" },
  { id: "sub_3", filename: "https://secure-login-update.com/auth", type: "url", status: "malicious", score: 100, time: "1h ago", size: "-", hash: "-" },
  { id: "sub_4", filename: "readme.pdf.js", type: "file", status: "malicious", score: 85, time: "2h ago", size: "45 KB", hash: "c3b1a0...f9d" },
  { id: "sub_5", filename: "update_patch_v2.msi", type: "file", status: "clean", score: 12, time: "3h ago", size: "15.6 MB", hash: "e5f6g7...h8i" },
  { id: "sub_6", filename: "e9a8f7b6c5d4e3f2a1b0c9d8e7f6a5b4", type: "hash", status: "suspicious", score: 62, time: "5h ago", size: "-", hash: "e9a8f7...5b4" },
];

const STATS = [
  { label: "VMS_ONLINE", value: "14/16" },
  { label: "QUEUED", value: "3" },
  { label: "THREATS_TODAY", value: "48" },
  { label: "API_USAGE", value: "84%" }
];

export function Terminal() {
  const [activeTab, setActiveTab] = useState<"file" | "url" | "hash">("file");
  const [isDragging, setIsDragging] = useState(false);

  return (
    <div className="terminal-theme min-h-screen bg-background text-foreground flex flex-col uppercase overflow-hidden relative">
      <TerminalStyles />
      <div className="crt-overlay"></div>

      {/* Header */}
      <header className="h-[52px] border-b border-border flex items-center justify-between px-4 shrink-0 relative z-10 bg-background">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-primary font-bold tracking-widest text-lg">
            <TerminalIcon className="w-5 h-5" />
            <span>ARENA_MALA</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">WORKSPACE</a>
            <a href="#" className="hover:text-foreground transition-colors">REPORTS</a>
            <a href="#" className="hover:text-foreground transition-colors">API</a>
          </nav>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex gap-4 mr-4 text-muted-foreground hidden lg:flex">
            {STATS.map(stat => (
              <div key={stat.label} className="flex gap-2">
                <span>{stat.label}:</span>
                <span className="text-foreground">{stat.value}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 px-3 py-1 border border-border">
            <div className="w-2 h-2 bg-primary"></div>
            <span>SYS_OK</span>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative z-10">
        {/* Sidebar */}
        <aside className="w-[200px] border-r border-border shrink-0 flex flex-col bg-background">
          <div className="p-4 border-b border-border text-xs text-muted-foreground">
            [MENU_OPTIONS]
          </div>
          <nav className="flex-1 py-2">
            {[
              { icon: Activity, label: "DASHBOARD", active: true },
              { icon: Globe, label: "PUBLIC_FEED" },
              { icon: Search, label: "IOC_SEARCH" },
              { icon: ShieldAlert, label: "THREAT_INTEL" },
              { icon: Settings, label: "SETTINGS" },
            ].map((item, i) => (
              <a
                key={i}
                href="#"
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 text-sm group border-l-2 transition-colors",
                  item.active 
                    ? "border-primary bg-muted text-foreground" 
                    : "border-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <span className="opacity-50 group-hover:opacity-100">{item.active ? ">" : "$"}</span>
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </a>
            ))}
          </nav>
          
          <div className="p-4 border-t border-border text-xs">
            <div className="mb-2 text-muted-foreground">CURRENT_USER:</div>
            <div>root@arena-mala</div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-y-auto terminal-scrollbar bg-background">
          <div className="p-6 max-w-6xl mx-auto w-full space-y-6">
            
            {/* Hero */}
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 text-sm text-primary mb-2">
                <span>[ STATUS: ACTIVE_MONITORING ]</span>
                <span className="w-2 h-4 bg-primary animate-blink inline-block"></span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                INITIATE_ANALYSIS<span className="animate-blink">_</span>
              </h1>
              <p className="text-muted-foreground text-sm max-w-2xl">
                Submit artifacts for detonated analysis in isolated hypervisor environments. 
                Full behavioral mapping, memory dumping, and network packet capture enabled by default.
              </p>
            </div>

            {/* Submit Form */}
            <div className="border border-border flex flex-col">
              <div className="flex border-b border-border text-sm">
                {[
                  { id: "file", icon: FileCode, label: "./FILE" },
                  { id: "url", icon: Link, label: "https://URL" },
                  { id: "hash", icon: Hash, label: "0xHASH" }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-3 border-r border-border last:border-r-0 transition-colors",
                      activeTab === tab.id 
                        ? "bg-primary text-primary-foreground font-bold" 
                        : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>
              
              <div className="p-6 flex flex-col gap-6">
                {activeTab === "file" && (
                  <div 
                    className={cn(
                      "border-2 border-dashed border-border p-12 flex flex-col items-center justify-center text-center transition-colors cursor-pointer",
                      isDragging ? "bg-muted border-primary" : "hover:bg-muted/50"
                    )}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => { e.preventDefault(); setIsDragging(false); }}
                  >
                    <Upload className="w-10 h-10 mb-4 text-muted-foreground" />
                    <div className="text-lg font-bold mb-2">DROP_FILE_HERE</div>
                    <div className="text-sm text-muted-foreground">or click to browse local filesystem</div>
                    <div className="mt-6 flex gap-4 text-xs text-muted-foreground">
                      <span className="border border-border px-2 py-1">MAX_SIZE: 100MB</span>
                      <span className="border border-border px-2 py-1">AUTO_EXTRACT: TRUE</span>
                    </div>
                  </div>
                )}

                {activeTab === "url" && (
                  <div className="space-y-4">
                    <label className="text-sm text-muted-foreground">TARGET_URL:</label>
                    <div className="flex items-center border border-border px-3 py-2 focus-within:border-primary transition-colors">
                      <span className="text-muted-foreground mr-2">$&gt;</span>
                      <input 
                        type="text" 
                        placeholder="https://..." 
                        className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground/50"
                      />
                    </div>
                  </div>
                )}

                {activeTab === "hash" && (
                  <div className="space-y-4">
                    <label className="text-sm text-muted-foreground">TARGET_HASH (MD5/SHA1/SHA256):</label>
                    <div className="flex items-center border border-border px-3 py-2 focus-within:border-primary transition-colors">
                      <span className="text-muted-foreground mr-2">$&gt;</span>
                      <input 
                        type="text" 
                        placeholder="e.g. 44d88612fea8a8f36de82e1278abb02f" 
                        className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground/50"
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center pt-4 border-t border-border border-dashed">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Settings className="w-4 h-4" />
                    <span>ADVANCED_OPTIONS_HIDDEN</span>
                  </div>
                  
                  <button className="bg-primary text-primary-foreground font-bold px-6 py-3 flex items-center gap-2 hover:bg-primary/90 transition-colors">
                    <span>EXECUTE_ANALYSIS</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Submissions */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <span className="text-primary">&gt;</span> ls -la /recent_submissions
                </h2>
                <a href="#" className="text-xs text-muted-foreground hover:text-foreground border-b border-transparent hover:border-foreground transition-colors">
                  VIEW_ALL
                </a>
              </div>
              
              <div className="border border-border overflow-x-auto">
                <table className="w-full text-sm text-left whitespace-nowrap">
                  <thead className="text-xs text-muted-foreground bg-muted/50 border-b border-border">
                    <tr>
                      <th className="px-4 py-3 font-normal">TIMESTAMP</th>
                      <th className="px-4 py-3 font-normal">TARGET</th>
                      <th className="px-4 py-3 font-normal">SCORE</th>
                      <th className="px-4 py-3 font-normal">VERDICT</th>
                      <th className="px-4 py-3 font-normal">ENV</th>
                      <th className="px-4 py-3 font-normal text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {RECENT_SUBMISSIONS.map((sub) => (
                      <tr key={sub.id} className="hover:bg-muted/30 transition-colors group cursor-pointer">
                        <td className="px-4 py-3 text-muted-foreground">{sub.time}</td>
                        <td className="px-4 py-3 font-bold flex items-center gap-2">
                          {sub.type === "file" && <FileCode className="w-4 h-4 text-muted-foreground" />}
                          {sub.type === "url" && <Link className="w-4 h-4 text-muted-foreground" />}
                          {sub.type === "hash" && <Hash className="w-4 h-4 text-muted-foreground" />}
                          <span className="truncate max-w-[200px] inline-block">{sub.filename}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn(
                            "inline-block px-1",
                            sub.score >= 80 ? "text-destructive bg-destructive/10" : 
                            sub.score >= 50 ? "text-yellow-500 bg-yellow-500/10" : 
                            "text-primary bg-primary/10"
                          )}>
                            {sub.score}/100
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            {sub.status === "malicious" && <AlertTriangle className="w-4 h-4 text-destructive" />}
                            {sub.status === "suspicious" && <AlertTriangle className="w-4 h-4 text-yellow-500" />}
                            {sub.status === "clean" && <CheckCircle className="w-4 h-4 text-primary" />}
                            <span className={cn(
                              sub.status === "malicious" ? "text-destructive" :
                              sub.status === "suspicious" ? "text-yellow-500" :
                              "text-primary"
                            )}>
                              {sub.status.toUpperCase()}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">WIN10_X64</td>
                        <td className="px-4 py-3 text-right">
                          <button className="opacity-0 group-hover:opacity-100 transition-opacity text-primary hover:text-primary/80 border border-primary px-2 py-1 text-xs">
                            READ_REPORT
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
