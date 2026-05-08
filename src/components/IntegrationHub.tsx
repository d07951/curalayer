import React from 'react';
import { Code, Copy, Layers, Share2, Zap } from 'lucide-react';

export const IntegrationHub: React.FC = () => {
  const codeExample = `
import { CuraLayerComponent } from '@curalayer/core';

// 1. 你的 AI 或 后端输出 JSON 协议
const protocol = await ai.generateClinicalResponse(query);

// 2. 在你的 Chat UI 中直接渲染
return (
  <div className="my-chat-bubble">
    <CuraLayerComponent protocol={protocol} />
  </div>
);
  `;

  return (
    <div className="p-6 bg-[#0d0d10] border-l border-white/5 w-80 flex flex-col overflow-y-auto shrink-0 shadow-2xl">
      <div className="flex items-center gap-2 mb-6">
        <Zap size={18} className="text-indigo-400" />
        <h3 className="font-bold text-sm text-white">CuraLayer 集成指南</h3>
      </div>

      <div className="space-y-6">
        <section>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-5 h-5 rounded bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <Layers size={12} />
            </div>
            <h4 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">技术价值</h4>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            下游系统只需引入 <code className="text-indigo-300">curalayer-core.js</code>，将 AI 生成的语义协议透传给组件，即可实现复杂临床视图的毫秒级渲染。
          </p>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-5 h-5 rounded bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Code size={12} />
            </div>
            <h4 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">开发者接入 (SDK)</h4>
          </div>
          <div className="relative group">
            <pre className="p-3 rounded-xl bg-black/40 border border-white/5 text-[10px] text-indigo-200 font-mono overflow-x-auto">
              {codeExample.trim().replace(/VaaS/g, 'CuraLayer')}
            </pre>
            <button className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-500 opacity-0 group-hover:opacity-100 transition-all">
              <Copy size={12} />
            </button>
          </div>
        </section>

        <div className="pt-6 border-t border-white/5">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-cyan-500/5 border border-indigo-500/20">
            <h5 className="text-xs font-bold text-white mb-2 flex items-center gap-2">
              <Share2 size={12} className="text-indigo-400" />
              交付价值点
            </h5>
            <ul className="space-y-2">
              {[
                '临床语义高度抽象 (Context-Aware)',
                '多端(Web/App/H5) 视图同源',
                '响应式布局 (Auto-Layout)',
                '极简交付：一串 JSON 换一个看板'
              ].map(item => (
                <li key={item} className="flex items-start gap-2 text-[10px] text-slate-400">
                  <div className="w-1 h-1 rounded-full bg-indigo-500 mt-1" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
