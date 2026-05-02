import React, { useState } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileBox,
  Hash,
  LayoutDashboard,
  Link as LinkIcon,
  Search,
  Settings,
  Shield,
  Terminal,
  UploadCloud,
} from "lucide-react";

export function StarkLight() {
  const [activeTab, setActiveTab] = useState("file");

  const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, active: true },
    { label: "Public Feed", icon: Activity },
    { label: "IOC Search", icon: Search },
    { label: "Threat Intel", icon: Shield },
    { label: "Settings", icon: Settings },
  ];

  const recentSubmissions = [
    {
      id: "SUB-8921",
      name: "invoice_final_v2.exe",
      type: "PE32 Executable",
      score: 98,
      verdict: "Malicious",
      time: "2 mins ago",
    },
    {
      id: "SUB-8920",
      name: "setup_win64.dll",
      type: "DLL",
      score: 75,
      verdict: "Suspicious",
      time: "15 mins ago",
    },
    {
      id: "SUB-8919",
      name: "readme_urgent.pdf.js",
      type: "JavaScript",
      score: 100,
      verdict: "Malicious",
      time: "1 hour ago",
    },
    {
      id: "SUB-8918",
      name: "report_q3.docx",
      type: "PDF Document",
      score: 12,
      verdict: "Clean",
      time: "3 hours ago",
    },
    {
      id: "SUB-8917",
      name: "http://secure-login-update.com/auth",
      type: "URL",
      score: 88,
      verdict: "Malicious",
      time: "4 hours ago",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f9fafb] text-black font-sans selection:bg-red-200 selection:text-red-900 flex flex-col">
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700&display=swap');
        .font-editorial { font-family: 'Instrument Serif', serif; }
        .font-sans { font-family: 'Inter', sans-serif; }
      `}} />

      {/* Header */}
      <header className="h-[52px] border-b border-gray-300 bg-white flex items-center justify-between px-6 shrink-0 z-10">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 font-bold text-lg tracking-tight">
            <Terminal className="w-5 h-5 text-red-600" strokeWidth={2.5} />
            <span>ARENAMALA</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-500">
            <button className="text-black border-b-2 border-red-600 pb-[15px] pt-[15px]">Analysis</button>
            <button className="hover:text-black transition-colors">Reports</button>
            <button className="hover:text-black transition-colors">API</button>
            <button className="hover:text-black transition-colors">Documentation</button>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-3 py-1 bg-white border border-red-600 text-red-600 text-xs font-bold uppercase tracking-wider rounded-none">
            Malware Analysis Sandbox
          </div>
          <div className="w-8 h-8 bg-gray-200 flex items-center justify-center text-sm font-bold">
            OP
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-[200px] bg-white border-r border-gray-300 shrink-0 py-6 flex flex-col">
          <nav className="flex flex-col gap-1 px-4 text-sm font-medium">
            {navItems.map((item, idx) => (
              <button
                key={idx}
                className={\`flex items-center gap-3 px-2 py-2 text-left transition-all \${
                  item.active
                    ? "text-black border-b border-red-600"
                    : "text-gray-500 hover:text-black"
                }\`}
              >
                <item.icon className={\`w-4 h-4 \${item.active ? "text-red-600" : ""}\`} />
                {item.label}
              </button>
            ))}
          </nav>
          <div className="mt-auto px-6 text-xs text-gray-400 font-mono">
            System Status: ONLINE<br/>
            Queue: 0 items<br/>
            Workers: 12/12
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-8 lg:p-12">
          <div className="max-w-5xl mx-auto space-y-12">
            
            {/* Hero Section */}
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-7xl font-editorial leading-none tracking-tight text-black">
                Execute. Observe. <span className="text-red-600">Neutralize.</span>
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl font-medium">
                Submit suspicious files, URLs, or hashes. Our isolated microVMs will trace behavioral patterns, extract IOCs, and deliver a comprehensive threat verdict.
              </p>
            </div>

            {/* Submit Form */}
            <div className="bg-white border border-gray-300 shadow-sm">
              <div className="flex border-b border-gray-300">
                <button 
                  onClick={() => setActiveTab("file")}
                  className={\`flex-1 py-3 text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors \${activeTab === 'file' ? 'bg-black text-white' : 'hover:bg-gray-50 text-gray-600'}\`}
                >
                  <FileBox className="w-4 h-4" /> File
                </button>
                <div className="w-px bg-gray-300" />
                <button 
                  onClick={() => setActiveTab("url")}
                  className={\`flex-1 py-3 text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors \${activeTab === 'url' ? 'bg-black text-white' : 'hover:bg-gray-50 text-gray-600'}\`}
                >
                  <LinkIcon className="w-4 h-4" /> URL
                </button>
                <div className="w-px bg-gray-300" />
                <button 
                  onClick={() => setActiveTab("hash")}
                  className={\`flex-1 py-3 text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors \${activeTab === 'hash' ? 'bg-black text-white' : 'hover:bg-gray-50 text-gray-600'}\`}
                >
                  <Hash className="w-4 h-4" /> Hash
                </button>
              </div>

              <div className="p-6 md:p-10 space-y-6">
                {activeTab === "file" && (
                  <div className="border-2 border-dashed border-black bg-[#f9fafb] p-12 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-100 transition-colors group">
                    <div className="w-12 h-12 bg-white border border-black flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <UploadCloud className="w-6 h-6 text-black" />
                    </div>
                    <p className="text-lg font-bold text-black mb-1">Drag and drop file here</p>
                    <p className="text-sm text-gray-500">or click to browse from your computer</p>
                    <p className="text-xs text-gray-400 mt-4 font-mono">Max file size: 100MB. Supported formats: PE, ELF, Mach-O, PDF, Office, Scripts.</p>
                  </div>
                )}

                {activeTab === "url" && (
                  <div className="space-y-2">
                    <label className="text-sm font-bold uppercase tracking-wider text-gray-700">Target URL</label>
                    <input 
                      type="text" 
                      placeholder="https://suspicious-domain.com/download" 
                      className="w-full p-4 border border-gray-300 text-black placeholder-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black font-mono text-sm"
                    />
                  </div>
                )}

                {activeTab === "hash" && (
                  <div className="space-y-2">
                    <label className="text-sm font-bold uppercase tracking-wider text-gray-700">Target Hash (MD5, SHA1, SHA256)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 44d88612fea8a8f36de82e1278abb02f" 
                      className="w-full p-4 border border-gray-300 text-black placeholder-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black font-mono text-sm"
                    />
                  </div>
                )}

                <div className="flex justify-between items-center pt-4">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="private" className="w-4 h-4 border-gray-300 text-black focus:ring-black rounded-none" />
                    <label htmlFor="private" className="text-sm font-medium text-gray-700">Private submission (do not share with public feed)</label>
                  </div>
                  <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-sm font-bold uppercase tracking-widest transition-colors flex items-center gap-2">
                    Analyze Target
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Submissions */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold tracking-tight">Recent Submissions</h2>
                <button className="text-sm text-red-600 hover:text-red-700 font-medium">View all activity →</button>
              </div>
              
              <div className="bg-white border border-gray-300 overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b border-gray-300 bg-[#f9fafb] text-gray-600 font-medium uppercase tracking-wider text-xs">
                      <th className="px-6 py-4">ID</th>
                      <th className="px-6 py-4">Target</th>
                      <th className="px-6 py-4">Type</th>
                      <th className="px-6 py-4">Score</th>
                      <th className="px-6 py-4">Verdict</th>
                      <th className="px-6 py-4 text-right">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {recentSubmissions.map((sub, idx) => (
                      <tr key={sub.id} className="hover:bg-gray-50 transition-colors group cursor-pointer">
                        <td className="px-6 py-4 font-mono text-gray-500">{sub.id}</td>
                        <td className="px-6 py-4 font-medium text-black truncate max-w-[200px]">{sub.name}</td>
                        <td className="px-6 py-4 text-gray-600">{sub.type}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-gray-200 overflow-hidden">
                              <div 
                                className={\`h-full \${sub.score > 80 ? 'bg-red-600' : sub.score > 40 ? 'bg-yellow-500' : 'bg-green-500'}\`} 
                                style={{ width: \`\${sub.score}%\` }}
                              />
                            </div>
                            <span className="font-mono text-xs w-6">{sub.score}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={\`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold uppercase tracking-wider \${
                            sub.verdict === 'Malicious' 
                              ? 'bg-red-50 text-red-700 border border-red-200' 
                              : sub.verdict === 'Suspicious'
                              ? 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                              : 'bg-green-50 text-green-700 border border-green-200'
                          }\`}>
                            {sub.verdict === 'Malicious' && <AlertTriangle className="w-3 h-3" />}
                            {sub.verdict === 'Suspicious' && <Activity className="w-3 h-3" />}
                            {sub.verdict === 'Clean' && <CheckCircle2 className="w-3 h-3" />}
                            {sub.verdict}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-gray-500 text-xs flex items-center justify-end gap-1.5">
                          <Clock className="w-3 h-3" />
                          {sub.time}
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
