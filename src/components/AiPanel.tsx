import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  RotateCcw,
  Copy,
  Check,
  Volume2,
  VolumeX,
  FileText,
  AlertTriangle,
  Table,
  Languages,
  HelpCircle,
  CheckCircle2,
  Loader2,
  MessageSquare,
  Wand2,
  Info
} from 'lucide-react';
import { MarkdownView } from './MarkdownView';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  mode?: string;
  timestamp: string;
}

interface AiPanelProps {
  pdfBase64: string;
  docTitle: string;
  suggestedQuestions?: string[];
  docCategory?: string;
}

export const AiPanel: React.FC<AiPanelProps> = ({
  pdfBase64,
  docTitle,
  suggestedQuestions = [],
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'tools' | 'info'>('chat');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      text: `สวัสดีครับ! ผมคือ **AI PDF Intelligence Assistant** ขับเคลื่อนด้วยโมเดล Gemini 3.8 Flash

ผมได้อ่านและทำความเข้าใจเนื้อหาในไฟล์เอกสาร **"${docTitle}"** เรียบร้อยแล้วครับ

คุณสามารถ:
- ถามคำถามเจาะจงเกี่ยวกับเนื้อหา ข้อมูลตัวเลข หรือเงื่อนไขในเอกสาร
- ใช้แท็บ **"เครื่องมือวิเคราะห์ด่วน"** ด้านบนเพื่อสั่งสรุป, สกัดตาราง, หรือวิเคราะห์ความเสี่ยงในคลิกเดียว
- เลือกลองถามจากคำถามแนะนำด้านล่างนี้ได้เลยครับ!`,
      timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSynthesisAvailable, setSpeechSynthesisAvailable] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSpeechSynthesisAvailable(true);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText]);

  // When docTitle changes, reset welcome message
  useEffect(() => {
    setMessages([
      {
        id: 'welcome-' + Date.now(),
        role: 'model',
        text: `พร้อมวิเคราะห์เอกสารใหม่: **"${docTitle}"**

คุณสามารถถามคำถามหรือสั่งให้ AI วิเคราะห์ประเด็นที่สนใจได้ทันทีครับ!`,
        timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  }, [docTitle]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeak = (text: string) => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    // Clean markdown before speaking
    const cleanText = text
      .replace(/\[(หน้า|Page).*?\]/g, '')
      .replace(/[*#`_~]/g, '')
      .replace(/\|.*?\|/g, '')
      .slice(0, 500); // Read first 500 chars

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'th-TH';
    utterance.rate = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (customPrompt?: string, mode?: string) => {
    const promptToSend = customPrompt || inputPrompt.trim();
    if (!promptToSend || isLoading) return;

    const userMsg: Message = {
      id: 'user-' + Date.now(),
      role: 'user',
      text: promptToSend,
      mode,
      timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setIsLoading(true);
    setStreamingText('');

    try {
      // Build history for context
      const historyPayload = messages
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({
          role: m.role,
          text: m.text,
        }));

      // Try SSE streaming
      const response = await fetch('/api/analyze-pdf/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pdfBase64,
          prompt: promptToSend,
          mode,
          history: historyPayload,
        }),
      });

      if (!response.ok) {
        // Fallback to standard unary endpoint
        const fallbackRes = await fetch('/api/analyze-pdf', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            pdfBase64,
            prompt: promptToSend,
            mode,
            history: historyPayload,
          }),
        });

        const data = await fallbackRes.json();
        if (data.error) throw new Error(data.error);

        setMessages((prev) => [
          ...prev,
          {
            id: 'model-' + Date.now(),
            role: 'model',
            text: data.result,
            mode,
            timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
        setIsLoading(false);
        return;
      }

      // Read SSE stream
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const parsed = JSON.parse(line.substring(6));
                if (parsed.text) {
                  accumulated += parsed.text;
                  setStreamingText(accumulated);
                } else if (parsed.error) {
                  throw new Error(parsed.error);
                }
              } catch {
                // Ignore parse error on partial SSE frames
              }
            }
          }
        }
      }

      setMessages((prev) => [
        ...prev,
        {
          id: 'model-' + Date.now(),
          role: 'model',
          text: accumulated || 'ไม่ได้รับข้อความตอบกลับจากระบบ',
          mode,
          timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setStreamingText('');
    } catch (err: any) {
      console.error('Error during AI analysis:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: 'error-' + Date.now(),
          role: 'model',
          text: `⚠️ **เกิดข้อผิดพลาดในการประมวลผล:**\n${err?.message || 'ไม่สามารถติดต่อเซิร์ฟเวอร์วิเคราะห์ PDF ได้ กรุณาลองใหม่อีกครั้ง'}`,
          timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setStreamingText('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setMessages([
      {
        id: 'welcome-reset',
        role: 'model',
        text: `ล้างประวัติการสนทนาเรียบร้อยแล้วครับ สามารถเริ่มต้นถามคำถามใหม่เกี่ยวกับ **"${docTitle}"** ได้ทันที`,
        timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const ONE_CLICK_TOOLS = [
    {
      id: 'summary',
      name: 'สรุปภาพรวมด่วน',
      nameEn: 'Executive Summary',
      icon: FileText,
      color: 'from-blue-500/20 to-indigo-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30',
      description: 'สรุปประเด็นหลัก วัตถุประสงค์ และข้อสรุปสำคัญทั้งเล่มพร้อมระบุหน้า',
      prompt: 'กรุณาสรุปภาพรวมและสาระสำคัญของเอกสารนี้อย่างครอบคลุม พร้อมระบุเลขหน้าอ้างอิง',
    },
    {
      id: 'key_takeaways',
      name: 'ประเด็นสำคัญ & Action Items',
      nameEn: 'Key Takeaways',
      icon: CheckCircle2,
      color: 'from-emerald-500/20 to-teal-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
      description: 'สกัดประเด็นที่ต้องรู้ สิ่งที่ต้องดำเนินการต่อ และเงื่อนไขกำหนดการ',
      prompt: 'สกัดประเด็นสำคัญที่ต้องรู้ (Key Takeaways) และสิ่งที่ต้องทำต่อ (Action Items) จากเอกสารนี้',
    },
    {
      id: 'tables',
      name: 'ดึงตาราง & สถิติตัวเลข',
      nameEn: 'Tables & Metrics',
      icon: Table,
      color: 'from-amber-500/20 to-orange-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30',
      description: 'แปลงตารางข้อมูลการเงิน สถิติ และตัวเลขให้ออกมาเป็น Markdown Table',
      prompt: 'กรุณาสกัดข้อมูลตาราง สถิติ ตัวเลขการเงิน หรือเกณฑ์เปรียบเทียบในเอกสารนี้ให้อยู่ในรูปแบบ Table',
    },
    {
      id: 'risks',
      name: 'วิเคราะห์ความเสี่ยง & ข้อควรระวัง',
      nameEn: 'Risk & Clause Analysis',
      icon: AlertTriangle,
      color: 'from-rose-500/20 to-red-500/20 text-rose-600 dark:text-rose-400 border-rose-500/30',
      description: 'ค้นหาข้อสัญญาที่เป็นภาระ ความเสี่ยง บทลงโทษ หรือข้อควรสังเกต',
      prompt: 'วิเคราะห์จุดที่ต้องระวัง ความเสี่ยง เงื่อนไขการปรับ หรือข้อจำกัดที่ระบุไว้ในเอกสารนี้',
    },
    {
      id: 'translate',
      name: 'แปลสรุปภาษาไทย',
      nameEn: 'Translate to Thai',
      icon: Languages,
      color: 'from-purple-500/20 to-pink-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30',
      description: 'แปลและเรียบเรียงเนื้อหาเอกสารเป็นภาษาไทยอย่างสละสลวย ชัดเจน',
      prompt: 'แปลและสรุปเนื้อหาสำคัญของเอกสารนี้เป็นภาษาไทยที่เข้าใจง่ายและเป็นทางการ',
    },
    {
      id: 'quiz',
      name: 'สร้างแบบทดสอบความเข้าใจ',
      nameEn: 'Quiz & FAQs',
      icon: HelpCircle,
      color: 'from-cyan-500/20 to-sky-500/20 text-cyan-600 dark:text-cyan-400 border-cyan-500/30',
      description: 'สร้างชุดคำถาม-ตอบ (Q&A 5 ข้อ) พร้อมเฉลยเพื่อทดสอบความเข้าใจ',
      prompt: 'สร้างชุดคำถามและคำตอบ (Q&A / FAQs) 5 ข้อพร้อมเฉลยและอ้างอิงหน้าจากเอกสารนี้',
    },
  ];

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
      {/* Header Tabs */}
      <div className="flex items-center justify-between px-3.5 py-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-xs">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'chat'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/50 dark:hover:bg-slate-800'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>ถาม-ตอบ (Chat)</span>
          </button>

          <button
            onClick={() => setActiveTab('tools')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'tools'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/50 dark:hover:bg-slate-800'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>เครื่องมือวิเคราะห์ด่วน</span>
          </button>

          <button
            onClick={() => setActiveTab('info')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'info'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/50 dark:hover:bg-slate-800'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            <span>ความสามารถ AI</span>
          </button>
        </div>

        {/* Clear chat button */}
        {activeTab === 'chat' && (
          <button
            onClick={handleClearHistory}
            className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 px-2 py-1 rounded hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
            title="ล้างการสนทนา"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">ล้างแชท</span>
          </button>
        )}
      </div>

      {/* Tab 1: Chat Workspace */}
      {activeTab === 'chat' && (
        <div className="flex-1 flex flex-col min-h-0">
          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 select-text">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.role === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1 px-1">
                  {msg.role === 'model' ? (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                      <Sparkles className="w-3 h-3" /> Gemini 3.8 Flash
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      คุณ (User)
                    </span>
                  )}
                  <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
                </div>

                <div
                  className={`max-w-[92%] rounded-2xl p-3.5 text-xs shadow-2xs ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-xs border border-slate-200/60 dark:border-slate-700/60'
                  }`}
                >
                  {msg.role === 'user' ? (
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                  ) : (
                    <MarkdownView content={msg.text} />
                  )}

                  {/* Actions for model messages */}
                  {msg.role === 'model' && (
                    <div className="flex items-center justify-end gap-2 mt-2 pt-2 border-t border-slate-200/50 dark:border-slate-700/50 text-slate-500 dark:text-slate-400 text-[11px]">
                      {speechSynthesisAvailable && (
                        <button
                          onClick={() => handleSpeak(msg.text)}
                          className="flex items-center gap-1 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                          title="ฟังเสียงอ่านข้อความ"
                        >
                          {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-rose-500" /> : <Volume2 className="w-3.5 h-3.5" />}
                          <span>{isSpeaking ? 'หยุดอ่าน' : 'อ่านให้ฟัง'}</span>
                        </button>
                      )}
                      <button
                        onClick={() => handleCopy(msg.text, msg.id)}
                        className="flex items-center gap-1 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                        title="คัดลอกข้อความ"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-emerald-500 font-semibold">คัดลอกแล้ว</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>คัดลอก</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Live Streaming Message Bubble */}
            {isLoading && (
              <div className="flex flex-col items-start">
                <div className="flex items-center gap-1.5 mb-1 px-1">
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                    <Sparkles className="w-3 h-3 animate-spin" /> กำลังอ่านเอกสารและประมวลผล...
                  </span>
                </div>
                <div className="max-w-[92%] rounded-2xl rounded-bl-xs p-3.5 text-xs bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/60 dark:border-slate-700/60 shadow-2xs">
                  {streamingText ? (
                    <>
                      <MarkdownView content={streamingText} />
                      <span className="inline-block w-1.5 h-3 bg-blue-500 ml-1 animate-pulse" />
                    </>
                  ) : (
                    <div className="flex items-center gap-2 text-slate-500 py-1">
                      <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                      <span>Gemini กำลังอ่านโครงสร้างไฟล์ PDF และวิเคราะห์คำตอบ...</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Questions Pills */}
          {suggestedQuestions.length > 0 && !isLoading && (
            <div className="px-3.5 py-2 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" /> คำถามแนะนำสำหรับเอกสารนี้:
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                {suggestedQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(q)}
                    className="text-[11px] text-left px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-700 transition-colors shadow-2xs"
                  >
                    💬 {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Box */}
          <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                placeholder="พิมพ์คำถามเกี่ยวกับเนื้อหาในเอกสาร เช่น สรุปหน้า 1, ค้นหาค่าปรับ..."
                disabled={isLoading}
                className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!inputPrompt.trim() || isLoading}
                className="flex items-center gap-1 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors shrink-0 cursor-pointer disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <span>ส่งคำถาม</span>
                    <Send className="w-3 h-3" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Tab 2: One-Click Tools */}
      {activeTab === 'tools' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="mb-2">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Wand2 className="w-4 h-4 text-blue-500" /> คำสั่งวิเคราะห์ด่วนด้วยปุ่มเดียว
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              คลิกเพื่อสั่งให้ Gemini อ่านและวิเคราะห์เอกสารในรูปแบบเฉพาะเจาะจง
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {ONE_CLICK_TOOLS.map((tool) => {
              const Icon = tool.icon;
              return (
                <button
                  key={tool.id}
                  disabled={isLoading}
                  onClick={() => {
                    setActiveTab('chat');
                    handleSend(tool.prompt, tool.id);
                  }}
                  className={`text-left p-3 rounded-xl border bg-linear-to-br ${tool.color} hover:brightness-105 active:scale-[0.98] transition-all shadow-2xs group flex flex-col justify-between`}
                >
                  <div className="flex items-start justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-white/80 dark:bg-slate-900/80 shadow-2xs">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">
                          {tool.name}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                          {tool.nameEn}
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed mt-1">
                    {tool.description}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-[11px] text-slate-600 dark:text-slate-400 mt-4 space-y-1">
            <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              💡 เคล็ดลับการวิเคราะห์ PDF:
            </div>
            <p>• เมื่อกดใช้งาน เครื่องมือจะสลับไปยังหน้าต่างแชทเพื่อแสดงผลการวิเคราะห์แบบเรียลไทม์</p>
            <p>• ผลการตอบทุกอันจะมีการระบุหน้าอ้างอิง <span className="text-blue-500 font-semibold">[หน้า X]</span> เพื่อให้ตรวจสอบย้อนกลับได้ง่าย</p>
          </div>
        </div>
      )}

      {/* Tab 3: AI Capabilities & Technical Overview */}
      {activeTab === 'info' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs text-slate-700 dark:text-slate-300 select-text">
          <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60">
            <h4 className="text-sm font-bold text-blue-900 dark:text-blue-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              คำตอบ: นายอ่านไฟล์ PDF ได้ไหม?
            </h4>
            <p className="mt-1.5 text-xs text-blue-950 dark:text-blue-200 leading-relaxed font-medium">
              **อ่านได้ 100% ครับ!** ระบบนี้เชื่อมต่อกับ **Google Gemini 3.8 Flash** ซึ่งมีความสามารถ Multimodal ในการประมวลผลไฟล์ PDF ทั้งหมดโดยตรง
            </p>
          </div>

          <div className="space-y-3">
            <h5 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> สิ่งที่ AI สามารถทำได้กับเอกสาร PDF:
            </h5>

            <div className="grid grid-cols-1 gap-2.5">
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60">
                <span className="font-semibold text-slate-900 dark:text-white block mb-0.5">
                  1. รองรับทั้ง Text PDF และ Scanned PDF (OCR)
                </span>
                <span className="text-slate-600 dark:text-slate-400 text-[11px]">
                  ไม่ว่าไฟล์ PDF จะเกิดจากการแปลง Word, สไลด์ PowerPoint หรือเอกสารกระดาษที่ถูกสแกนเป็นรูปภาพ โมเดลจะอ่านข้อความด้วยระบบ Vision OCR อัตโนมัติ
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60">
                <span className="font-semibold text-slate-900 dark:text-white block mb-0.5">
                  2. สรุปใจความสำคัญและสกัดตารางข้อมูล (Tables & Data Extraction)
                </span>
                <span className="text-slate-600 dark:text-slate-400 text-[11px]">
                  สามารถเข้าใจโครงสร้างตารางข้อมูล รายงานงบการเงิน ตัวเลข สถิติ และแปลงออกมาเป็นตาราง Markdown ให้สามารถนำไปคำนวณต่อได้
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60">
                <span className="font-semibold text-slate-900 dark:text-white block mb-0.5">
                  3. อ้างอิงเลขหน้าอย่างแม่นยำ (Accurate Page Citations)
                </span>
                <span className="text-slate-600 dark:text-slate-400 text-[11px]">
                  ทุกคำตอบจะระบุ [หน้า X] เพื่อให้คุณตรวจสอบกับเอกสารต้นฉบับได้ทันที ลดปัญหา AI มโนข้อมูล (Hallucination)
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60">
                <span className="font-semibold text-slate-900 dark:text-white block mb-0.5">
                  4. รองรับหลายภาษา (Multilingual Comprehension)
                </span>
                <span className="text-slate-600 dark:text-slate-400 text-[11px]">
                  อ่านเอกสารภาษาอังกฤษ จีน ญี่ปุ่น หรือภาษาอื่นๆ แล้วแปลและสรุปเป็นภาษาไทย หรือตอบคำถามเป็นภาษาไทยได้ตามต้องการ
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-500">
            <strong>ความปลอดภัยและความเป็นส่วนตัว:</strong> เอกสารที่อัปโหลดจะถูกส่งผ่านเซิร์ฟเวอร์แบบ End-to-End เพื่อส่งให้ Gemini วิเคราะห์ และไม่มีการเผยแพร่ API Key หรือข้อมูลลับออกสู่สาธารณะ
          </div>
        </div>
      )}
    </div>
  );
};
