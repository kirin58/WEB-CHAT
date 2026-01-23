"use client";

import { useMemo, useState, useEffect, useRef } from "react";

type Msg = { role: "user" | "assistant"; text: string };

// --- Components: Icons (เพื่อความสวยงามโดยไม่ต้องลง lib เพิ่ม) ---
const BotIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-white" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2a2 2 0 012 2v2a2 2 0 01-2 2 2 2 0 01-2-2V4a2 2 0 012-2z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11v2a2 2 0 01-2 2H7a2 2 0 01-2-2v-2a2 2 0 012-2h10a2 2 0 012 2z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 16v4a1 1 0 001 1h2a1 1 0 001-1v-4" />
    <circle cx="9" cy="12" r="1" fill="currentColor" />
    <circle cx="15" cy="12" r="1" fill="currentColor" />
  </svg>
);

const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-indigo-600" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const SendIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M22 2L11 13" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M22 2l-7 20-4-9-9-4 20-7z" />
  </svg>
);

export default function Page() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", text: "สวัสดีครับ! ผมคือผู้ช่วยดูแลหอพัก มีอะไรให้ผมช่วยไหมครับ?" },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, busy]);

  const sessionId = useMemo(() => {
    if (typeof window === "undefined") return "demo";
    const key = "session_id";
    const existing = localStorage.getItem(key);
    if (existing) return existing;
    const id = crypto.randomUUID();
    localStorage.setItem(key, id);
    return id;
  }, []);

  async function send() {
    const text = input.trim();
    if (!text || busy) return;

    setInput("");
    setMessages((m) => [...m, { role: "user", text }]);
    setBusy(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          user_id: "U-001",
          customer_name: "Somchai",
          message: text,
        }),
      });

      const data = await res.json();
      console.log("Raw Response:", data);

      let reply = "";
      if (typeof data === "string") {
        reply = data;
      } else if (data && data.reply) {
        reply = data.reply;
      } else {
        reply = "ขออภัย ระบบขัดข้องเล็กน้อย กรุณาลองใหม่";
      }

      setMessages((m) => [...m, { role: "assistant", text: reply }]);
    } catch (error) {
      console.error("Fetch Error:", error);
      setMessages((m) => [...m, { role: "assistant", text: "เกิดข้อผิดพลาดในการเชื่อมต่อ" }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    // Background Gradient & Layout
    <main className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-50 via-white to-purple-50 text-slate-800 font-sans">
      
      {/* Main Card Container */}
      <div className="w-full max-w-4xl bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white/50 overflow-hidden flex flex-col h-[85vh]">
        
        {/* Header */}
        <header className="px-6 py-5 bg-white/90 border-b border-indigo-50 flex items-center justify-between sticky top-0 z-10 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <BotIcon />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 leading-none">Dormitory Chatbot</h1>
              <p className="text-xs text-indigo-500 font-medium mt-1">AI Assistant • Online</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 rounded-full border border-indigo-100">
            <span className={`w-2 h-2 rounded-full ${busy ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`}></span>
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
              {busy ? 'THINKING' : 'READY'}
            </span>
          </div>
        </header>

        {/* Chat Area */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
        >
          {messages.map((m, i) => (
            <div key={i} className={`flex w-full ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`flex max-w-[85%] md:max-w-[70%] gap-3 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center border ${
                  m.role === "user" ? "bg-indigo-50 border-indigo-100" : "bg-purple-600 border-purple-600"
                }`}>
                  {m.role === "user" ? <UserIcon /> : <BotIcon />}
                </div>

                {/* Bubble */}
                <div className={`px-5 py-3.5 shadow-sm relative leading-relaxed text-sm md:text-base ${
                  m.role === "user" 
                    ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-2xl rounded-tr-none" 
                    : "bg-white border border-slate-100 text-slate-700 rounded-2xl rounded-tl-none"
                }`}>
                  {m.text}
                </div>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {busy && (
            <div className="flex w-full justify-start animate-fade-in">
              <div className="flex max-w-[80%] gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-600 flex-shrink-0 flex items-center justify-center border border-purple-600">
                  <BotIcon />
                </div>
                <div className="bg-white border border-slate-100 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex gap-1 items-center h-12">
                  <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer / Input Area */}
        <div className="p-4 bg-white border-t border-indigo-50">
          <div className="relative flex items-center gap-2">
            <input
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 rounded-full pl-5 pr-14 py-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all shadow-inner"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="พิมพ์คำถามของคุณที่นี่..."
              disabled={busy}
            />
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg active:scale-95"
              onClick={send}
              disabled={busy || !input.trim()}
            >
              <SendIcon />
            </button>
          </div>
          <div className="text-center mt-3">
             <p className="text-[10px] text-slate-400 font-mono">
               SESSION ID: {sessionId.slice(0, 8)}...
             </p>
          </div>
        </div>
        
      </div>
    </main>
  );
}