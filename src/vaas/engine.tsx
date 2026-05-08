import React from 'react';
import { VaaSNode, VaaSProtocol } from './types';
import { motion } from 'motion/react';
import { 
  User, Activity, ShieldAlert, Clock, TrendingUp, TrendingDown, 
  ChevronRight, ArrowRight, FileText, CheckCircle2, AlertTriangle,
  Stethoscope, Pill, ClipboardList, Tag
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const ICON_MAP: Record<string, any> = {
  User, Activity, ShieldAlert, Clock, TrendingUp, TrendingDown,
  ArrowRight, FileText, CheckCircle2, AlertTriangle, Stethoscope,
  Pill, ClipboardList, Tag
};

const getIcon = (name?: string, size = 16) => {
  if (!name) return null;
  const Icon = ICON_MAP[name] || ICON_MAP.FileText;
  return <Icon size={size} />;
};

// 1. Primitive: Metric (单体征/数值)
const MetricPrimitive: React.FC<{ node: VaaSNode }> = ({ node }) => (
  <div className={cn("flex flex-col flex-1 p-3 transition-all hover:bg-white/[0.02]", node.className)} style={{ color: node.color }}>
    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1 flex items-center gap-1.5">
      {getIcon(node.icon, 10)} {node.title}
    </span>
    <div className="flex items-baseline gap-1">
      <span className={cn("text-2xl font-mono font-bold tracking-tight", node.emphasis ? "text-white" : "text-slate-300")}>
        {node.value}
      </span>
      {node.subValue && <span className="text-xs text-slate-600 font-medium">{node.subValue}</span>}
    </div>
    {node.trend && (
      <div className={cn(
        "flex items-center gap-1 text-[9px] font-bold mt-0.5",
        node.trend === 'up' ? "text-rose-500" : node.trend === 'down' ? "text-emerald-500" : "text-slate-500"
      )}>
        {node.trend === 'up' ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
        {node.trend.toUpperCase()}趋势
      </div>
    )}
  </div>
);

// 2. Primitive: Identity (实体身份)
const IdentityPrimitive: React.FC<{ node: VaaSNode }> = ({ node }) => (
  <div className={cn("flex items-center gap-4 p-4", node.className)}>
    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
      {getIcon(node.icon || 'User', 24)}
    </div>
    <div className="flex flex-col min-w-0">
      <h3 className="text-lg font-bold text-slate-100 truncate">{node.value}</h3>
      <div className="flex gap-2 items-center flex-wrap">
        <span className="text-[10px] bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-slate-500 font-bold uppercase">
          {node.title}
        </span>
        {node.children?.map(child => (
          <span key={child.id} className="text-[10px] text-slate-400 flex items-center gap-1">
            <span className="opacity-40">{child.title}:</span> {child.value}
          </span>
        ))}
      </div>
    </div>
  </div>
);

// 3. Primitive: Status/Tag
const StatusPrimitive: React.FC<{ node: VaaSNode }> = ({ node }) => (
  <div className={cn("p-4 flex flex-col justify-center", node.className)}>
    <span className="text-[10px] text-slate-600 uppercase font-bold tracking-widest mb-1.5">{node.title}</span>
    <div className={cn(
      "px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest border w-fit whitespace-nowrap",
      node.emphasis ? "shadow-[0_0_12px_rgba(255,255,255,0.05)]" : ""
    )} style={{ color: node.color, borderColor: `${node.color}44`, backgroundColor: `${node.color}11` }}>
      {node.value}
    </div>
  </div>
);

// 4. Primitive: Timeline (时间轴/流)
const TimelinePrimitive: React.FC<{ node: VaaSNode }> = ({ node }) => (
  <div className={cn("flex flex-col p-6 gap-6 relative", node.className)}>
    <div className="absolute left-8 top-8 bottom-8 w-px bg-gradient-to-b from-indigo-500/50 via-white/5 to-transparent" />
    {node.children?.map((item, idx) => (
      <div key={item.id} className="flex gap-6 relative group">
        <div className="w-20 text-right shrink-0">
          <span className="text-[10px] font-mono font-bold text-slate-500">{item.value}</span>
        </div>
        <div className="relative pt-0.5">
          <div className={cn(
            "w-2 h-2 rounded-full z-10 relative transition-transform group-hover:scale-150",
            item.emphasis ? "bg-indigo-400 shadow-[0_0_8px_#6366f1]" : "bg-slate-700"
          )} />
        </div>
        <div className="flex flex-col min-w-0 pb-4">
          <h4 className={cn("text-xs font-bold transition-colors", item.emphasis ? "text-slate-100" : "text-slate-400 group-hover:text-slate-300")}>
            {item.title}
          </h4>
          {item.subValue && <p className="text-[10px] text-slate-500 mt-1 italic">{item.subValue}</p>}
        </div>
      </div>
    ))}
  </div>
);

// 5. Primitive: EntityList (结构化清单)
const EntityListPrimitive: React.FC<{ node: VaaSNode }> = ({ node }) => {
  const hasColumns = node.columns && node.columns.length > 0;

  return (
    <div className={cn("flex flex-col divide-y divide-white/5", node.className)}>
      {node.title && !hasColumns && (
        <div className="px-5 py-3 bg-white/[0.01] flex items-center justify-between">
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em]">{node.title}</span>
          {getIcon(node.icon, 12)}
        </div>
      )}

      {hasColumns && (
        <div className="px-5 py-2 bg-indigo-500/[0.03] flex border-b border-white/5">
          {node.columns?.map(col => (
            <div 
              key={col.key} 
              style={{ flex: col.width || '1', textAlign: col.align || 'left' }}
              className="text-[9px] font-bold text-indigo-400/60 uppercase tracking-widest px-2"
            >
              {col.title}
            </div>
          ))}
        </div>
      )}

      {node.children?.map(item => (
        <div 
          key={item.id} 
          className={cn(
            "px-5 py-3 group hover:bg-white/[0.01] cursor-pointer transition-colors",
            hasColumns ? "flex" : "flex items-center justify-between"
          )}
        >
          {hasColumns ? (
            node.columns?.map(col => {
              const val = col.key === 'value' ? item.value : 
                         col.key === 'title' ? item.title :
                         col.key === 'subValue' ? item.subValue :
                         col.key === 'status' ? item.status :
                         item.metadata?.[col.key];
              
              return (
                <div 
                  key={col.key} 
                  style={{ flex: col.width || '1', textAlign: col.align || 'left' }}
                  className="px-2 overflow-hidden flex flex-col justify-center"
                >
                  <span className={cn(
                    "text-[11px] truncate",
                    col.key === 'value' || col.key === 'status' ? "font-bold text-slate-200" : "text-slate-500"
                  )}>
                    {val}
                  </span>
                </div>
              );
            })
          ) : (
            <>
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-800 group-hover:bg-indigo-500 transition-colors shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors truncate">{item.value}</span>
                  <span className="text-[10px] text-slate-600 truncate">{item.title}</span>
                </div>
              </div>
              <div className="flex items-baseline gap-1 shrink-0 ml-4">
                <span className="text-xs font-mono font-bold text-slate-400">{item.subValue}</span>
                {item.status && <span className="text-[8px] px-1 py-0.5 rounded bg-white/5 text-slate-500">{item.status}</span>}
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

// 6. Primitive: Comparison (结果对比)
const ComparisonPrimitive: React.FC<{ node: VaaSNode }> = ({ node }) => (
  <div className={cn("p-6 flex flex-col gap-4", node.className)}>
    <div className="flex items-center justify-between mb-2">
      <span className="text-xs font-bold text-slate-100">{node.title}</span>
      <div className="flex items-center gap-2">
         <span className="w-2 h-2 rounded bg-indigo-500 animate-pulse" />
         <span className="text-[9px] text-slate-400 uppercase font-bold tracking-tight">Latest Result</span>
      </div>
    </div>
    <div className="space-y-4">
      {node.children?.map(item => (
        <div key={item.id} className="flex flex-col gap-2 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-indigo-500/20 transition-all group/item">
           <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase">
             <span className="group-hover/item:text-slate-300 transition-colors uppercase tracking-widest">{item.title}</span>
             <span className="text-slate-400 font-mono">{item.subValue}</span>
           </div>
           <div className="flex items-center gap-4">
              <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden relative">
                 <div className="absolute inset-y-0 left-0 bg-slate-600 opacity-20" style={{ width: '40%' }} />
                 <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((Number(item.value) / 10) * 100, 100)}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 relative"
                 >
                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                 </motion.div>
              </div>
              <span className="text-sm font-mono font-bold text-white min-w-[30px]">{item.value}</span>
           </div>
           {item.trend && (
             <div className="flex items-center gap-2">
               <span className={cn(
                 "text-[9px] font-bold px-1.5 py-0.5 rounded", 
                 item.trend === 'up' ? "text-rose-400 bg-rose-400/10" : "text-emerald-400 bg-emerald-400/10"
               )}>
                 {item.trend === 'up' ? 'HIGH' : 'LOW'}
               </span>
               <span className="text-[9px] text-slate-600 font-medium">数值异常波动 {item.metadata?.diff || '-'}</span>
             </div>
           )}
        </div>
      ))}
    </div>
  </div>
);

// 7. Primitive: Layout Box (递归容器)
const LayoutBox: React.FC<{ node: VaaSNode }> = ({ node }) => {
  const isRow = node.className?.includes('flex-row') || !node.className?.includes('flex-col');
  
  return (
    <div 
      className={cn(
        "flex min-w-0",
        isRow ? "flex-row divide-x divide-white/5" : "flex-col divide-y divide-white/5",
        node.className
      )}
      style={{ flex: node.width || '1' }}
    >
      {node.children?.map(child => <VaaSEngine key={child.id} node={child} />)}
    </div>
  );
};

// Main Engine: The "Plugin" Entry Point
export const VaaSEngine: React.FC<{ node: VaaSNode }> = ({ node }) => {
  switch (node.pattern) {
    case 'metric': return <MetricPrimitive node={node} />;
    case 'identity': return <IdentityPrimitive node={node} />;
    case 'layout-box': return <LayoutBox node={node} />;
    case 'status': return <StatusPrimitive node={node} />;
    case 'timeline': return <TimelinePrimitive node={node} />;
    case 'entity-list': return <EntityListPrimitive node={node} />;
    case 'comparison': return <ComparisonPrimitive node={node} />;
    default:
      return (
        <div className={cn("p-4 text-xs text-slate-400 leading-relaxed", node.className)}>
          {node.title && <div className="text-[10px] font-bold text-slate-600 uppercase mb-1">{node.title}</div>}
          <div className="text-slate-200">{node.value}</div>
          {node.children?.map(child => <VaaSEngine key={child.id} node={child} />)}
        </div>
      );
  }
};

export const VaaSComponent: React.FC<{ protocol: VaaSProtocol }> = ({ protocol }) => {
  return (
    <div className="vaas-container overflow-hidden border border-white/10 bg-[#111114] shadow-2xl transition-all hover:shadow-indigo-500/10"
         style={{ borderRadius: `${protocol.theme?.borderRadius || 12}px` }}>
      <VaaSEngine node={protocol.schema} />
    </div>
  );
};
