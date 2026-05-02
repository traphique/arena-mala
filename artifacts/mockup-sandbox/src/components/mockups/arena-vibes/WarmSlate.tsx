import React, { useState } from "react";
import "./_group.css";
import { Search, ShieldAlert, FileText, Link as LinkIcon, Hash, UploadCloud, AlertTriangle, CheckCircle, Clock, ShieldCheck, Settings, Activity, Shield, TerminalSquare, Server, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export function WarmSlate() {
  const [activeTab, setActiveTab] = useState("file");

  return (
    <div className="theme-warm-slate min-h-screen flex flex-col selection:bg-amber-600/30">
      {/* Header */}
      <header className="h-[52px] border-b border-border bg-card flex items-center justify-between px-6 shrink-0 relative z-10 shadow-sm shadow-black/20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-sm bg-amber-600/20 text-amber-500 flex items-center justify-center border border-amber-600/30">
            <Shield className="w-5 h-5" />
          </div>
          <span className="font-serif-playfair font-semibold text-lg tracking-wide text-amber-500/90">
            ArenaMala
          </span>
        </div>
        
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-muted-foreground">
          <a href="#" className="text-amber-500">Analysis</a>
          <a href="#" className="hover:text-foreground transition-colors">Hunting</a>
          <a href="#" className="hover:text-foreground transition-colors">Intelligence</a>
        </nav>

        <div className="flex items-center gap-4">
          <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/30 font-mono text-xs rounded-[3px]">
            <Server className="w-3 h-3 mr-1.5" />
            NODE: AM-US-WEST-04
          </Badge>
          <div className="w-8 h-8 rounded-sm bg-secondary border border-border flex items-center justify-center">
            <span className="text-xs font-bold text-muted-foreground">JD</span>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-[200px] bg-card border-r border-border shrink-0 flex flex-col py-6">
          <div className="px-4 mb-4 text-xs font-semibold tracking-wider text-muted-foreground uppercase opacity-80">
            Operations
          </div>
          <nav className="flex flex-col gap-1 px-2 text-sm font-medium">
            <NavItem icon={<Activity className="w-4 h-4" />} label="Dashboard" active />
            <NavItem icon={<TerminalSquare className="w-4 h-4" />} label="Public Feed" />
            <NavItem icon={<Search className="w-4 h-4" />} label="IOC Search" />
            <NavItem icon={<ShieldAlert className="w-4 h-4" />} label="Threat Intel" />
          </nav>
          
          <div className="mt-auto">
            <div className="px-4 mb-4 text-xs font-semibold tracking-wider text-muted-foreground uppercase opacity-80">
              System
            </div>
            <nav className="flex flex-col gap-1 px-2 text-sm font-medium">
              <NavItem icon={<Settings className="w-4 h-4" />} label="Settings" />
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-8 lg:p-12">
          <div className="max-w-5xl mx-auto space-y-10">
            
            {/* Hero / Header */}
            <div className="flex items-end justify-between border-b border-border pb-6">
              <div>
                <h1 className="font-serif-playfair text-4xl text-foreground mb-2">Sandbox Submission</h1>
                <p className="text-muted-foreground">Upload suspicious files, URLs, or hashes for dynamic analysis in an isolated environment.</p>
              </div>
              <Badge variant="outline" className="border-border bg-secondary text-muted-foreground py-1 px-3 rounded-[3px]">
                <ShieldCheck className="w-3.5 h-3.5 mr-2 text-emerald-500" />
                Systems Operational
              </Badge>
            </div>

            {/* Submit Form */}
            <Card className="border-border bg-card shadow-lg shadow-black/20">
              <CardContent className="p-0">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <div className="border-b border-border bg-secondary/50 p-2">
                    <TabsList className="bg-transparent space-x-2">
                      <TabsTrigger value="file" className="data-[state=active]:bg-card data-[state=active]:text-amber-500 data-[state=active]:shadow-sm rounded-[3px]">
                        <FileText className="w-4 h-4 mr-2" /> File
                      </TabsTrigger>
                      <TabsTrigger value="url" className="data-[state=active]:bg-card data-[state=active]:text-amber-500 data-[state=active]:shadow-sm rounded-[3px]">
                        <LinkIcon className="w-4 h-4 mr-2" /> URL
                      </TabsTrigger>
                      <TabsTrigger value="hash" className="data-[state=active]:bg-card data-[state=active]:text-amber-500 data-[state=active]:shadow-sm rounded-[3px]">
                        <Hash className="w-4 h-4 mr-2" /> Search
                      </TabsTrigger>
                    </TabsList>
                  </div>
                  
                  <div className="p-6">
                    <TabsContent value="file" className="mt-0 outline-none">
                      <div className="border-2 border-dashed border-border hover:border-amber-500/50 transition-colors rounded-[4px] bg-background/50 p-12 flex flex-col items-center justify-center text-center cursor-pointer group">
                        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4 group-hover:bg-amber-500/10 transition-colors">
                          <UploadCloud className="w-8 h-8 text-muted-foreground group-hover:text-amber-500 transition-colors" />
                        </div>
                        <h3 className="text-lg font-medium text-foreground mb-1 font-serif-playfair">Drag & drop your sample</h3>
                        <p className="text-sm text-muted-foreground max-w-md mb-6">
                          Supports PE, ELF, Mach-O, Office docs, PDFs, scripts, and archives. Maximum file size: 100MB.
                        </p>
                        <Button className="bg-secondary text-foreground hover:bg-secondary/80 border border-border">
                          Browse Files
                        </Button>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="url" className="mt-0 outline-none space-y-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Target URL</label>
                        <Input placeholder="https://suspicious-site.com/download/..." className="bg-background border-border h-12 text-base font-mono focus-visible:ring-amber-500 rounded-[3px]" />
                      </div>
                      <p className="text-xs text-muted-foreground">The URL will be visited by our instrumented browser in a sandboxed Windows 10 environment.</p>
                    </TabsContent>

                    <TabsContent value="hash" className="mt-0 outline-none space-y-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground mb-1.5 block">MD5, SHA-1, or SHA-256</label>
                        <Input placeholder="e.g. 44d88612fea8a8f36de82e1278abb02f" className="bg-background border-border h-12 text-base font-mono focus-visible:ring-amber-500 rounded-[3px]" />
                      </div>
                      <p className="text-xs text-muted-foreground">Search our intelligence database for existing reports of this indicator.</p>
                    </TabsContent>

                    <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" className="rounded-[2px] border-border bg-background text-amber-500 focus:ring-amber-500 w-4 h-4" />
                          <span className="text-sm text-muted-foreground">Private Submission</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" className="rounded-[2px] border-border bg-background text-amber-500 focus:ring-amber-500 w-4 h-4" defaultChecked />
                          <span className="text-sm text-muted-foreground">Heavy Evasion Detection</span>
                        </label>
                      </div>
                      <Button className="bg-amber-600 hover:bg-amber-500 text-white font-semibold tracking-wide px-8 rounded-[3px] shadow-[0_0_15px_rgba(217,119,6,0.2)]">
                        Analyze Sample <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </Tabs>
              </CardContent>
            </Card>

            {/* Recent Submissions */}
            <div className="space-y-4">
              <h2 className="font-serif-playfair text-2xl text-foreground">Recent Activity</h2>
              <div className="border border-border rounded-[4px] bg-card overflow-hidden shadow-sm shadow-black/10">
                <table className="w-full text-sm text-left">
                  <thead className="bg-secondary/80 text-muted-foreground font-medium border-b border-border">
                    <tr>
                      <th className="px-4 py-3 font-medium">Target</th>
                      <th className="px-4 py-3 font-medium">Type</th>
                      <th className="px-4 py-3 font-medium">Environment</th>
                      <th className="px-4 py-3 font-medium">Score</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium text-right">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    <SubmissionRow 
                      target="invoice_final_v2.exe" 
                      type="PE32 Executable" 
                      env="Windows 10 x64" 
                      score={98} 
                      verdict="Malicious" 
                      time="2 min ago" 
                    />
                    <SubmissionRow 
                      target="https://bit.ly/3xY8a9" 
                      type="URL" 
                      env="Browser (Chrome)" 
                      score={75} 
                      verdict="Suspicious" 
                      time="15 min ago" 
                    />
                    <SubmissionRow 
                      target="setup_util.dll" 
                      type="PE32 DLL" 
                      env="Windows 11 x64" 
                      score={12} 
                      verdict="Clean" 
                      time="1 hr ago" 
                    />
                    <SubmissionRow 
                      target="readme.pdf.js" 
                      type="JavaScript" 
                      env="Windows 10 x64" 
                      score={88} 
                      verdict="Malicious" 
                      time="2 hrs ago" 
                    />
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

function NavItem({ icon, label, active = false }: { icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <a 
      href="#" 
      className={`flex items-center gap-3 px-3 py-2 rounded-[3px] transition-colors ${
        active 
          ? "bg-amber-500/10 text-amber-500 font-medium" 
          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
      }`}
    >
      {icon}
      {label}
    </a>
  );
}

function SubmissionRow({ target, type, env, score, verdict, time }: { target: string, type: string, env: string, score: number, verdict: string, time: string }) {
  
  let verdictColor = "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
  let verdictIcon = <CheckCircle className="w-3.5 h-3.5 mr-1.5" />;
  
  if (verdict === "Malicious") {
    verdictColor = "text-red-500 bg-red-500/10 border-red-500/20";
    verdictIcon = <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />;
  } else if (verdict === "Suspicious") {
    verdictColor = "text-amber-500 bg-amber-500/10 border-amber-500/20";
    verdictIcon = <ShieldAlert className="w-3.5 h-3.5 mr-1.5" />;
  }

  return (
    <tr className="hover:bg-secondary/30 transition-colors group cursor-pointer">
      <td className="px-4 py-3 font-mono text-foreground">{target}</td>
      <td className="px-4 py-3 text-muted-foreground">{type}</td>
      <td className="px-4 py-3 text-muted-foreground">{env}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
            <div 
              className={`h-full ${score > 70 ? 'bg-red-500' : score > 40 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
              style={{ width: `${score}%` }}
            />
          </div>
          <span className="font-mono text-xs text-muted-foreground">{score}/100</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <Badge variant="outline" className={`rounded-[3px] border ${verdictColor}`}>
          {verdictIcon}
          {verdict}
        </Badge>
      </td>
      <td className="px-4 py-3 text-right text-muted-foreground text-xs font-mono">{time}</td>
    </tr>
  );
}
