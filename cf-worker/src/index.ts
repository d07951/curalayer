interface Env {
  AI: {
    run: <T = { response?: string }>(
      model: string,
      options: { messages: Array<{ role: string; content: string }> }
    ) => Promise<T>;
  };
}

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

const CLINICAL_SYSTEM_PROMPT = [
  '你是一名临床场景 AI 助手，只讨论医疗与临床相关主题。',
  '如果用户问题与临床无关，请礼貌拒绝并引导回临床主题。',
  '回答风格：专业、简洁、避免夸大，不提供违法或危险建议。',
  '如涉及诊疗建议，请提示需要结合执业医生判断。'
].join('\n');

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'POST, OPTIONS',
      'access-control-allow-headers': 'content-type'
    }
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return json({ ok: true });
    }

    if (request.method !== 'POST') {
      return json({ error: 'Method not allowed' }, 405);
    }

    try {
      const body = (await request.json()) as { messages?: ChatMessage[] };
      const messages = (body.messages || []).filter((m) => m && m.content && (m.role === 'user' || m.role === 'assistant'));

      if (messages.length === 0) {
        return json({ error: 'messages is required' }, 400);
      }

      const result = await env.AI.run<{ response?: string }>('@cf/meta/llama-3.1-8b-instruct', {
        messages: [
          { role: 'system', content: CLINICAL_SYSTEM_PROMPT },
          ...messages
        ]
      });

      const text = result?.response?.trim() || '当前无法生成临床回复，请稍后重试。';
      return json({ text });
    } catch (error) {
      return json({ error: 'internal_error' }, 500);
    }
  }
};
