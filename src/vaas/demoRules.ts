import { VaaSProtocol } from './types';

export interface DemoMatchResult {
  content: string;
  payload: VaaSProtocol;
}

interface DemoRule {
  keywords: string[];
  result: DemoMatchResult;
}

const DEMO_RULES: DemoRule[] = [
  {
    keywords: ['icu', '看板', '监护'],
    result: {
      content: '已命中演示语义，返回 ICU 临床看板富 UI：',
      payload: {
        version: '1.0',
        schema: {
          id: 'demo-icu-root',
          pattern: 'layout-box',
          className: 'flex-col divide-y divide-white/5',
          children: [
            {
              id: 'demo-icu-id',
              pattern: 'identity',
              value: '李延年 (Li Yannian)',
              title: '住院号: 20240508001',
              icon: 'User',
              children: [
                { id: 'demo-bed', title: '床位', value: 'ICU-043' },
                { id: 'demo-level', title: '分级', value: '特级护理', color: '#f87171' }
              ]
            },
            {
              id: 'demo-icu-vitals',
              pattern: 'layout-box',
              className: 'flex-row bg-indigo-500/[0.03]',
              children: [
                { id: 'demo-bp', pattern: 'metric', title: 'BP', value: '142/92', subValue: 'mmHg', trend: 'up', color: '#fbbf24' },
                { id: 'demo-hr', pattern: 'metric', title: 'HR', value: '102', subValue: 'bpm', trend: 'up', color: '#f87171' },
                { id: 'demo-spo2', pattern: 'metric', title: 'SpO2', value: '94', subValue: '%', trend: 'down', color: '#f87171' }
              ]
            }
          ]
        }
      }
    }
  },
  {
    keywords: [
      'sofa',
      '评分',
      'apache',
      'apache ii',
      'news2',
      'gcs',
      '严重度',
      '早期预警',
      '昏迷指数'
    ],
    result: {
      content: '已命中演示语义，返回 SOFA 评分富 UI：',
      payload: {
        version: '1.0',
        schema: {
          id: 'demo-sofa-root',
          pattern: 'layout-box',
          className: 'flex-row bg-indigo-500/5',
          children: [
            { id: 'demo-sofa-total', pattern: 'metric', title: 'SOFA 总分', value: '14', subValue: '分', emphasis: true, color: '#ef4444' },
            { id: 'demo-sofa-resp', pattern: 'metric', title: '呼吸系统', value: '3', subValue: 'PaO2/FiO2', color: '#fbbf24' },
            { id: 'demo-sofa-cvs', pattern: 'metric', title: '循环系统', value: '4', subValue: 'MAP/血压', color: '#ef4444' }
          ]
        }
      }
    }
  },
  {
    keywords: ['d2b', '溶栓', '治疗路径', '里程碑', '抗生素', '降阶梯', 'd-dimer', '峰值轴'],
    result: {
      content: '已命中演示语义，返回临床事件时间轴富 UI：',
      payload: {
        version: '1.0',
        schema: {
          id: 'demo-timeline-root',
          pattern: 'timeline',
          title: '临床事件时间轴',
          children: [
            { id: 'demo-t1', title: '患者到院', value: '08:30', subValue: '急诊分诊完成' },
            { id: 'demo-t2', title: '首份评估', value: '08:38', subValue: '完成初步风险分层' },
            { id: 'demo-t3', title: '治疗启动', value: '09:02', subValue: '关键治疗已执行', emphasis: true },
            { id: 'demo-t4', title: '复评与调整', value: '10:15', subValue: '方案进入稳态监测', emphasis: true }
          ]
        }
      }
    }
  },
  {
    keywords: ['血气', '动态对照', '左右心室', '心室功能', '影像学', '评估演进', '对比'],
    result: {
      content: '已命中演示语义，返回关键指标对比富 UI：',
      payload: {
        version: '1.0',
        schema: {
          id: 'demo-comparison-root',
          pattern: 'comparison',
          title: '关键指标对比',
          children: [
            { id: 'demo-c1', title: '指标 A', value: 7.36, subValue: '参考范围 7.35-7.45', trend: 'steady', metadata: { diff: '0.00' } },
            { id: 'demo-c2', title: '指标 B', value: 42, subValue: 'mmHg', trend: 'up', metadata: { diff: '+4' } },
            { id: 'demo-c3', title: '指标 C', value: 91, subValue: '%', trend: 'down', metadata: { diff: '-2' } }
          ]
        }
      }
    }
  },
  {
    keywords: ['医嘱', '清单', '多列活动医嘱', '医嘱详情', '高危药物', '重点监控', 'mdt', '会诊摘要', '会诊'],
    result: {
      content: '已命中演示语义，返回医嘱清单富 UI：',
      payload: {
        version: '1.0',
        schema: {
          id: 'demo-orders',
          pattern: 'entity-list',
          title: '当前活动医嘱列表',
          columns: [
            { key: 'title', title: '频次', width: '1' },
            { key: 'value', title: '医嘱内容', width: '2' },
            { key: 'subValue', title: '途径', width: '1' },
            { key: 'status', title: '状态', width: '0.8', align: 'right' }
          ],
          children: [
            { id: 'demo-order-1', title: 'q12h', value: '低分子肝素钠 4000u', subValue: '皮下注射', status: '执行中' },
            { id: 'demo-order-2', title: 'tid', value: '昂丹司琼 8mg', subValue: '静脉泵入', status: '已发药' },
            { id: 'demo-order-3', title: 'st', value: '1/2NS + KCl 500ml', subValue: '静滴', status: '待审核' }
          ]
        }
      }
    }
  }
];

export function matchDemoProtocol(input: string): DemoMatchResult | null {
  const normalized = input.toLowerCase();
  for (const rule of DEMO_RULES) {
    if (rule.keywords.some((keyword) => normalized.includes(keyword))) {
      return rule.result;
    }
  }
  return null;
}
