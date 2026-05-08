/**
 * VaaS (Visual as a Service) Protocol v1.0
 * 专门为 Chat/流式交互设计的临床语义协议
 */

export type VaaSPattern = 
  | 'identity'    // 患者/医生身份卡片
  | 'metric'      // 单一或组指标（生命体征、检验值）
  | 'status'      // 风险级别、分诊状态
  | 'timeline'    // 诊疗时间线/历史流
  | 'entity-list' // 结构化列表（医嘱、诊断列表）
  | 'comparison'  // 对比视图（新旧结果对比）
  | 'layout-box'; // 通用容器布局

export interface VaaSNode {
  id: string;
  pattern?: VaaSPattern;
  
  // 核心内容基因
  title?: string;
  value?: string | number;
  subValue?: string; // 单位、副标题
  icon?: string;
  color?: string; // 语义颜色控制
  
  // 行为与状态
  trend?: 'up' | 'down' | 'steady';
  emphasis?: boolean;
  status?: string;
  
  // 布局与嵌套
  children?: VaaSNode[];
  columns?: {
    key: string;
    title: string;
    width?: string;
    align?: 'left' | 'right' | 'center';
  }[];
  width?: number; // 比例权重 (1-12)
  
  // 扩展元数据
  metadata?: Record<string, any>;
  className?: string;
}

export interface VaaSProtocol {
  version: '1.0';
  schema: VaaSNode;
  theme?: {
    mode: 'dark' | 'light';
    primaryColor: string;
    borderRadius: number;
  };
}
