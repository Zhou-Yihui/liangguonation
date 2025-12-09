/*  =====  0. 配置 =====  */
const HF_MODEL = 'facebook/opt-350m';          // 可换任意 HF 支持的模型
const HF_TOKEN = 'hf_PublicReadOnly';          // 公共只读 token，失效就去 HF 免费建一个
const MAX_NEW_TOKENS = 120;                    // 控制长度
const TEMPERATURE  = 0.9;

/*  =====  1. 通用 LLM 驱动 =====  */
async function llm(prompt, opts = {}) {
  const body = {
    inputs: prompt,
    parameters: {
      max_new_tokens: opts.maxTokens || MAX_NEW_TOKENS,
      temperature:  opts.temp      || TEMPERATURE,
      return_full_text: false
    }
  };
  const res = await fetch(`https://api-inference.huggingface.co/models/${HF_MODEL}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${HF_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error('HF 接口异常 ' + res.status);
  const json = await res.json();
  return json[0].generated_text.trim();
}

/*  =====  2. AI 类 =====  */
class AI {
  constructor(config) {
    this.config = config;
    this.ready  = false;
  }
  async loadModel() {
    // 这里只是打印，实际模型在第一次调用时才加载
    console.log('【ChildAI】已就绪，模型:', HF_MODEL);
    this.ready = true;
  }

  /* ---- 自由聊天 ---- */
  async generateResponse(userInput, systemPrompt = '') {
    const prompt = systemPrompt
      ? `${systemPrompt}\n\nUser: ${userInput}\nAI:`
      : `User: ${userInput}\nAI:`;
    return await llm(prompt, { temp: 0.8 });
  }

  /* ---- 写故事 ---- */
  async generateStory(userHint) {
    const prompt = `根据下面提示写一段 200 字左右的原创小故事，有起承转合。\n提示：${userHint}\n故事：`;
    return await llm(prompt, { maxTokens: 180, temp: 1.0 });
  }
}

/*  =====  3. 原 UI 逻辑不动 =====  */
const ai = new AI({});
await ai.loadModel();

const chatContainer      = document.getElementById('chat-container');
const chatInput          = document.getElementById('chat-input');
const sendBtn            = document.getElementById('send-btn');
const generateStoryBtn   = document.getElementById('generate-story-btn');
const systemPromptEl     = document.getElementById('system-prompt');
const themeSelect        = document.getElementById('theme-select');
const saveSettingsBtn    = document.getElementById('save-settings');

function appendMessage(text, type = 'ai') {
  const div = document.createElement('div');
  div.className = 'message ' + type;
  div.innerText = text;
  chatContainer.appendChild(div);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

/* ---- 聊天 ---- */
sendBtn.addEventListener('click', async () => {
  const userText = chatInput.value.trim();
  if (!userText) return;
  appendMessage(userText, 'user');
  chatInput.value = '';
  try {
    const reply = await ai.generateResponse(userText, systemPromptEl.value);
    appendMessage(reply, 'ai');
  } catch (e) {
    appendMessage('（生成失败，稍后再试）', 'ai');
  }
});

/* ---- 故事 ---- */
generateStoryBtn.addEventListener('click', async () => {
  const hint = chatInput.value.trim() || '随机童话';
  appendMessage(`📖 正在创作：${hint}`, 'ai');
  try {
    const story = await ai.generateStory(hint);
    appendMessage(story, 'ai');
  } catch (e) {
    appendMessage('（故事生成失败）', 'ai');
  }
});

/* ---- 其余原有功能保持不变 ---- */
saveSettingsBtn.addEventListener('click', () => {
  ai.config.systemPrompt = systemPromptEl.value;
  alert('配置已保存！');
});
themeSelect.addEventListener('change', () => {
  document.body.setAttribute('data-theme', themeSelect.value);
});
window.addEventListener('beforeunload', () => {
  const chats = Array.from(chatContainer.children).map(c => c.innerText);
  localStorage.setItem('chat_history', JSON.stringify(chats));
});
window.addEventListener('load', () => {
  const chats = JSON.parse(localStorage.getItem('chat_history') || '[]');
  chats.forEach(c => {
    const isAI = /^[😊✨🤗😆💖🌸📖（]/.test(c);
    appendMessage(c, isAI ? 'ai' : 'user');
  });
});
