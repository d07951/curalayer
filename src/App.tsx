import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Send, Bot, User, Sparkles, Terminal, 
  ArrowLeft, MoreVertical, 
  MessageSquare, Layout, Code,
  Activity, FileText, Clock, ClipboardList, Share2
} from 'lucide-react';
import { VaaSProtocol } from './vaas/types';
import { VaaSComponent } from './vaas/engine';
import { matchDemoProtocol } from './vaas/demoRules';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const ICON_MAP: Record<string, any> = {
  Activity, FileText, Clock, ClipboardList
};

const getIcon = (name: string, size = 16) => {
  const Icon = ICON_MAP[name] || FileText;
  return <Icon size={size} />;
};

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  payload?: VaaSProtocol; // The VaaS structure
  timestamp: string;
}

import { IntegrationHub } from './components/IntegrationHub';

export default function App() {
  const chatApiUrl = import.meta.env.VITE_CHAT_API_URL || '/api/chat';
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-system-init',
      role: 'system',
      content: 'CuraLayer (Clinical Semantic Schema) 协议引擎已就绪。',
      timestamp: '10:00'
    },
    {
      id: 'msg-welcome',
      role: 'assistant',
      content: '您好，李医生。患者 李延年 的最新检验结果已反馈，情况由于昨日的手术出现了一些波动，请查看实时看板：',
      timestamp: '10:01',
      payload: {
        version: '1.0',
        theme: { borderRadius: 16, primaryColor: '#6366f1', mode: 'dark' },
        schema: {
          id: 'init-vitals-root',
          pattern: 'layout-box',
          className: 'flex-col',
          children: [
            {
              id: 'init-identity',
              pattern: 'identity',
              value: '李延年 (Li Yannian)',
              title: '住院患者 · 043床',
              icon: 'User',
              children: [
                { id: 'init-attr-age', title: 'Age', value: '42岁' },
                { id: 'init-attr-status', title: 'Status', value: '术后 R1' }
              ]
            },
            {
              id: 'init-vitals-row',
              pattern: 'layout-box',
              className: 'flex-row bg-white/[0.02]',
              children: [
                { id: 'init-v1', pattern: 'metric', title: 'BP', value: '142/92', subValue: 'mmHg', emphasis: true, trend: 'up', color: '#fbbf24' },
                { id: 'init-v2', pattern: 'metric', title: 'Pulse', value: '102', subValue: 'bpm', trend: 'up' },
                { id: 'init-v3', pattern: 'metric', title: 'SPO2', value: '94', subValue: '%', trend: 'down', color: '#f87171' }
              ]
            }
          ]
        }
      }
    },
    {
      id: 'msg-timeline-init',
      role: 'assistant',
      content: '同时，这是该患者近24小时的临床关键事件流，手术后的引流量变化值得注意：',
      timestamp: '10:02',
      payload: {
        version: '1.0',
        schema: {
          id: 'init-timeline',
          pattern: 'timeline',
          children: [
            { id: 'init-t1', title: '手术结束，进入复苏室', value: '08:00', emphasis: false },
            { id: 'init-t2', title: '转入普通病房', value: '10:30', emphasis: false },
            { id: 'init-t3', title: '体温波动 (38.5℃)', value: '14:20', subValue: '给予物理降温处理', emphasis: true },
            { id: 'init-t4', title: '最新引流量监测', value: '18:00', subValue: '引流量 120ml, 颜色深红', emphasis: true }
          ]
        }
      }
    },
    {
      id: 'msg-comp-init',
      role: 'assistant',
      content: '这是血常规指标的纵向对比分析：',
      timestamp: '10:03',
      payload: {
        version: '1.0',
        schema: {
          id: 'init-lab-comp',
          pattern: 'comparison',
          title: '实验室指标对比 (Lab Comparison)',
          children: [
            { id: 'init-c1', title: 'WBC (白细胞)', value: 12.5, subValue: '10^9/L', trend: 'up', metadata: { diff: '+2.1' } },
            { id: 'init-c2', title: 'HGB (血红蛋白)', value: 105, subValue: 'g/L', trend: 'down', metadata: { diff: '-8' } },
            { id: 'init-c3', title: 'PLT (血小板)', value: 198, subValue: '10^9/L', trend: 'steady', metadata: { diff: '0' } }
          ]
        }
      }
    }
  ]);

  const [input, setInput] = useState('');
  const [isJsonMode, setIsJsonMode] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showIntegrationHub, setShowIntegrationHub] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const timestamp = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;

    const rawInput = input.trim();

    const newUserMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: isJsonMode ? '🚀 [Protocol Injection Request]' : rawInput,
      timestamp: timestamp()
    };

    setMessages(prev => [...prev, newUserMsg]);
    setInput('');

    if (isJsonMode) {
      try {
        const parsed = JSON.parse(rawInput);
        const aiMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'VaaS Core: 协议注入成功，实时渲染结果如下：',
          timestamp: timestamp(),
          payload: parsed
        };
        setMessages(prev => [...prev, aiMsg]);
        setIsJsonMode(false);
        return;
      } catch (err) {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'system',
          content: '❌ Invalid VaaS Protocol: JSON 格式错误',
          timestamp: 'ERROR'
        }]);
        return;
      }
    }

    const demo = matchDemoProtocol(rawInput);
    if (demo) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: demo.content,
        payload: demo.payload,
        timestamp: timestamp()
      }]);
      return;
    }

    setIsSending(true);
    try {
      const chatHistory = [...messages, newUserMsg]
        .filter((msg) => msg.role === 'user' || msg.role === 'assistant')
        .map((msg) => ({
          role: msg.role,
          content: msg.content
        }));

      const response = await fetch(chatApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: chatHistory })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = (await response.json()) as { text?: string };
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.text || '暂无可用回复，请稍后重试。',
        timestamp: timestamp()
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'system',
        content: '⚠️ 聊天服务暂不可用，请检查 Cloudflare Worker 配置或稍后再试。',
        timestamp: 'ERROR'
      }]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#0a0a0c] text-slate-200 font-sans selection:bg-indigo-500/30 overflow-hidden">
      {/* Sidebar - Branding */}
      <div className="hidden lg:flex w-72 flex-col border-r border-white/5 bg-[#0d0d10] shrink-0 h-full overflow-hidden">
        {/* Sidebar Header */}
        <div className="p-6 pb-2 shrink-0">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles size={20} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold tracking-tight text-white leading-tight text-sm">CuraLayer</h1>
              <p className="text-[10px] uppercase tracking-widest text-slate-600 font-bold">Clinical Protocol</p>
            </div>
          </div>
        </div>

        {/* Sidebar Nav - Scrollable */}
        <nav className="flex-1 overflow-y-auto scrollbar-hide px-6 py-4 space-y-8 min-h-0">
          {[
            {
              title: 'Metric (指标原语)',
              icon: 'Activity',
              items: [
                { label: 'SOFA 脏器功能评分', prompt: '展示该患者 SOFA 功能衰竭评分' },
                { label: 'APACHE II 严重度评分', prompt: '展示 APACHE II 评分' },
                { label: 'NEWS2 早期预警评分', prompt: '展示 NEWS2 评分' },
                { label: 'GCS 昏迷指数评估', prompt: '展示 GCS 昏迷指数评估' }
              ]
            },
            {
              title: 'Timeline (时空原语)',
              icon: 'Clock',
              items: [
                { label: '溶栓治疗路径 (D2B)', prompt: '生成该患者的溶栓治疗 D2B 里程碑' },
                { label: '抗生素降阶梯历程', prompt: '展示抗生素使用及降阶梯记录' },
                { label: 'D-Dimer 动态释放轴', prompt: '展示 D-Dimer 变化峰值轴' }
              ]
            },
            {
              title: 'Comparison (对比原语)',
              icon: 'FileText',
              items: [
                { label: '血气分析动态对照', prompt: '展示动脉血气数据的动态对照分析' },
                { label: '左右心室功能对比', prompt: '对比左右心室功能数据' },
                { label: '影像学评估演进', prompt: '对比影像学表现的演进' }
              ]
            },
            {
              title: 'EntityList (清单原语)',
              icon: 'ClipboardList',
              items: [
                { label: '多列活动医嘱清单', prompt: '以多列形式展示该患者目前的医嘱详情' },
                { label: '高危药物重点监控', prompt: '列出高危药物警示' },
                { label: 'MDT 多学科会诊摘要', prompt: '展示 MDT 会诊意见摘要' }
              ]
            }
          ].map(group => (
            <div key={group.title} className="space-y-1">
              <div className="px-1 py-1.5 flex items-center gap-2 mb-1">
                <div className="text-slate-700 opacity-50">{getIcon(group.icon, 12)}</div>
                <span className="text-[10px] font-bold text-slate-700 uppercase tracking-[0.2em]">{group.title}</span>
              </div>
              <div className="space-y-0.5">
                {group.items.map(item => (
                  <button 
                    key={item.label}
                    onClick={() => setInput(item.prompt)}
                    className="w-full group flex items-center px-3 py-2 text-slate-600 hover:text-indigo-400 hover:bg-white/[0.015] transition-all text-left"
                  >
                    <div className="w-1 h-1 rounded-full bg-slate-900 group-hover:bg-indigo-500/50 mr-3 transition-colors shrink-0" />
                    <span className="text-[11px] font-medium leading-tight">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-6 shrink-0 border-t border-white/5 bg-[#0d0d10]">
          <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
            <h4 className="text-[10px] font-bold text-indigo-400 mb-2 uppercase tracking-widest">Cura Protocol V1.0</h4>
            <p className="text-[10px] text-slate-500 leading-relaxed italic">
              "将临床逻辑下沉到协议层，让 AI 决定呈现的语义，而不是 UI 布局。"
            </p>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen bg-[#0a0a0c]">
        {/* Header Bar */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-white/5 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <h2 className="text-sm font-bold text-white">智慧诊疗助手</h2>
              <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-1 opacity-80">
                <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                VaaS 解析管道已连接
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <button 
               onClick={() => setShowIntegrationHub(!showIntegrationHub)}
               className={cn(
                 "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border",
                 showIntegrationHub 
                   ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" 
                   : "text-slate-500 border-white/5 hover:bg-white/5"
               )}
             >
               <Share2 size={14} />
               集成指南
             </button>
             <button className="p-2 text-slate-500 hover:text-white transition-colors"><Terminal size={18}/></button>
          </div>
        </header>

        {/* Scrollable Messages */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide min-h-0">
          <div className="max-w-3xl mx-auto space-y-8">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={cn(
                  "flex gap-4",
                  msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                )}
              >
                <div className={cn(
                  "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-lg",
                  msg.role === 'user' ? "bg-slate-800" : msg.role === 'system' ? "bg-indigo-500/10 border border-indigo-500/20" : "bg-gradient-to-br from-indigo-600 to-indigo-700"
                )}>
                  {msg.role === 'user' ? <User size={16} className="text-slate-400" /> : <Bot size={16} className="text-white" />}
                </div>

                <div className={cn("flex-1 flex flex-col gap-2 max-w-[80%]", msg.role === 'user' ? "items-end" : "items-start")}>
                  <div className={cn(
                    "relative group/msg px-4 py-3 rounded-2xl text-[13px] leading-relaxed",
                    msg.role === 'user' 
                      ? "bg-indigo-600 text-white rounded-tr-none shadow-indigo-500/10" 
                      : msg.role === 'system'
                      ? "bg-slate-900/50 border border-white/5 text-slate-500 italic text-[11px] rounded-tl-none"
                      : "bg-[#111114] border border-white/5 text-slate-200 rounded-tl-none shadow-xl"
                  )}>
                    {msg.content}
                    {msg.payload && (
                      <button 
                        onClick={() => {
                          const win = window.open('', '_blank');
                          win?.document.write(`<html><body style="background:#000;color:#0f0;font-family:monospace;padding:20px"><pre>${JSON.stringify(msg.payload, null, 2)}</pre></body></html>`);
                        }}
                        className="absolute -right-12 top-0 p-2 text-slate-600 hover:text-indigo-400 opacity-0 group-hover/msg:opacity-100 transition-all"
                        title="View VaaS Protocol"
                      >
                        <Code size={14} />
                      </button>
                    )}
                  </div>
                  
                  {msg.payload && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.4 }}
                      className="w-full mt-2"
                    >
                      <VaaSComponent protocol={msg.payload} />
                    </motion.div>
                  )}

                  <span className="text-[10px] text-slate-700 font-mono mt-1 px-1">{msg.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
          <div ref={messagesEndRef} />
        </div>

        {/* Input Box Area */}
        <div className="px-6 py-4 shrink-0 bg-[#0a0a0c] z-20">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-4">
                <button 
                  type="button"
                  onClick={() => setIsJsonMode(!isJsonMode)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1 pb-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border",
                    isJsonMode 
                      ? "bg-indigo-500 text-white border-indigo-400 shadow-[0_0_12px_#6366f133]" 
                      : "bg-white/5 text-slate-500 border-white/5 hover:bg-white/10"
                  )}
                >
                  <Code size={12} />
                  {isJsonMode ? 'Protocol Mode' : 'Clinical Mode'}
                </button>
                <div className="h-4 w-px bg-white/5" />
                <span className="text-[10px] text-slate-600 font-medium hidden sm:block">
                  {isJsonMode ? '核心协议资产：标准化的临床语义' : '实战演练：模拟临床交互'}
                </span>
              </div>
              
              {messages.some(m => m.payload) && (
                <button 
                  type="button"
                  onClick={() => {
                    const lastMsg = [...messages].reverse().find(m => m.payload);
                    if (lastMsg?.payload) {
                      setInput(JSON.stringify(lastMsg.payload, null, 2));
                      setIsJsonMode(true);
                    }
                  }}
                  className="text-[10px] text-indigo-400 font-bold hover:underline"
                >
                  回填最近示例
                </button>
              )}
            </div>

            <form 
              onSubmit={handleSend}
              className="relative bg-[#1a1a1e] border border-white/10 rounded-2xl p-1.5 focus-within:border-indigo-500/40 focus-within:ring-4 focus-within:ring-indigo-500/5 transition-all shadow-2xl overflow-hidden"
            >
              {isJsonMode ? (
                <textarea 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="在此粘贴 CuraLayer JSON 样例..."
                  rows={4}
                  className="w-full bg-transparent border-none focus:ring-0 text-[12px] px-4 pt-3 pb-12 text-indigo-200 placeholder:text-slate-700 font-mono scrollbar-hide resize-none"
                />
              ) : (
                <input 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="输入'ICU看板'、'GCS评分'、'医嘱详情'..."
                  className="w-full bg-transparent border-none focus:ring-0 text-[13px] px-4 py-3 text-slate-200 placeholder:text-slate-600"
                />
              )}
              <button 
                type="submit"
                disabled={!input.trim() || isSending}
                className={cn(
                  "absolute right-2 bottom-2 aspect-square bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition-all flex items-center justify-center shadow-lg shadow-indigo-500/20 disabled:opacity-20",
                  "h-10 w-10"
                )}
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      </div>
      {showIntegrationHub && <IntegrationHub />}
    </div>
  );
}
