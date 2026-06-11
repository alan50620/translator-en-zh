// ===== DOM 元素 =====
const inputArea = document.getElementById('input-area');
const outputText = document.getElementById('output-text');
const outputPlaceholder = document.getElementById('output-placeholder');
const statusIcon = document.getElementById('status-icon');
const statusText = document.getElementById('status-text');
const charCount = document.getElementById('char-count');
const btnCopy = document.getElementById('btn-copy');
const btnSwap = document.getElementById('btn-swap');
const arrowEl = document.getElementById('arrow');
const directionIndicator = document.getElementById('direction-indicator');
const inputLangTag = document.getElementById('input-lang-tag');
const outputLangTag = document.getElementById('output-lang-tag');
const inputLabel = document.getElementById('input-label');
const outputLabel = document.getElementById('output-label');

// ===== 方向状态 =====
// 'en2zh' — 英文 → 中文
// 'zh2en' — 中文 → 英文
let direction = 'en2zh';

const DIR_CONFIG = {
  en2zh: {
    langpair: 'en|zh-CN',
    inputLang: 'EN',
    outputLang: '中',
    inputLabel: '英文输入',
    outputLabel: '中文翻译',
    placeholder: '在这里输入英文，实时翻译成中文...',
    outputPlaceholder: '翻译结果将在这里显示...',
    directionLabel: 'EN → 中',
    statusReady: '就绪',
    statusTranslating: '翻译中...',
    statusError: '翻译出错，请稍后重试',
  },
  zh2en: {
    langpair: 'zh-CN|en',
    inputLang: '中',
    outputLang: 'EN',
    inputLabel: '中文输入',
    outputLabel: '英文翻译',
    placeholder: '在这里输入中文，实时翻译成英文...',
    outputPlaceholder: '翻译结果将在这里显示...',
    directionLabel: '中 → EN',
    statusReady: '就绪',
    statusTranslating: '翻译中...',
    statusError: '翻译出错，请稍后重试',
  },
};

// ===== 更新 UI 以匹配当前方向 =====
function updateDirectionUI() {
  const cfg = DIR_CONFIG[direction];

  directionIndicator.textContent = cfg.directionLabel;
  inputLangTag.textContent = cfg.inputLang;
  outputLangTag.textContent = cfg.outputLang;
  inputLabel.textContent = cfg.inputLabel;
  outputLabel.textContent = cfg.outputLabel;
  inputArea.placeholder = cfg.placeholder;
  outputPlaceholder.textContent = cfg.outputPlaceholder;

  // 更新语言标签颜色
  if (direction === 'en2zh') {
    inputLangTag.style.background = 'var(--en-color)';
    outputLangTag.style.background = 'var(--zh-color)';
    directionIndicator.classList.remove('reversed');
  } else {
    inputLangTag.style.background = 'var(--zh-color)';
    outputLangTag.style.background = 'var(--en-color)';
    directionIndicator.classList.add('reversed');
  }

  // 更新箭头方向
  arrowEl.textContent = '↓';
}

// ===== 翻译 API =====
const API_URL = 'https://api.mymemory.translated.net/get';

async function translate(text) {
  const langpair = DIR_CONFIG[direction].langpair;
  const params = new URLSearchParams({
    q: text,
    langpair: langpair,
  });

  const response = await fetch(`${API_URL}?${params}`);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const data = await response.json();
  if (data.responseStatus !== 200 && data.responseStatus !== 403) {
    throw new Error(data.responseDetails || '翻译失败');
  }

  return data.responseData.translatedText;
}

// ===== 防抖函数 =====
function debounce(fn, delay) {
  let timer = null;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// ===== 状态管理 =====
const cfg = () => DIR_CONFIG[direction];

function setStatus(state) {
  switch (state) {
    case 'ready':
      statusIcon.textContent = '🟢';
      statusText.textContent = cfg().statusReady;
      arrowEl.classList.remove('translating');
      break;
    case 'translating':
      statusIcon.textContent = '🟡';
      statusText.textContent = cfg().statusTranslating;
      arrowEl.classList.add('translating');
      break;
    case 'error':
      statusIcon.textContent = '🔴';
      statusText.textContent = cfg().statusError;
      arrowEl.classList.remove('translating');
      break;
  }
}

function setOutput(text) {
  if (text) {
    outputPlaceholder.style.display = 'none';
    outputText.style.display = 'block';
    outputText.textContent = text;
  } else {
    outputPlaceholder.style.display = 'inline';
    outputText.style.display = 'none';
    outputText.textContent = '';
  }
}

function updateCharCount() {
  const count = inputArea.value.length;
  charCount.textContent = `${count} 字符`;
}

// ===== 核心翻译逻辑 =====
const doTranslate = debounce(async () => {
  const text = inputArea.value.trim();

  updateCharCount();

  if (!text) {
    setOutput('');
    setStatus('ready');
    return;
  }

  setStatus('translating');

  try {
    const result = await translate(text);
    setOutput(result);
    setStatus('ready');
  } catch (err) {
    console.error('翻译错误:', err);
    setStatus('error');
    // 保留上一次的翻译结果
  }
}, 500);

// ===== 方向切换 =====
function swapDirection() {
  // 把当前输出文本移到输入区，清空输出，方便用户立即看回译效果
  const currentOutput = outputText.textContent;

  direction = direction === 'en2zh' ? 'zh2en' : 'en2zh';
  updateDirectionUI();

  if (currentOutput) {
    inputArea.value = currentOutput;
    outputText.textContent = '';
    outputPlaceholder.style.display = 'inline';
    outputText.style.display = 'none';
    updateCharCount();
    // 触发新方向下的翻译
    doTranslate();
  } else {
    // 没有输出时也触发翻译（可能输入区已有文字）
    if (inputArea.value.trim()) {
      doTranslate();
    }
  }
}

btnSwap.addEventListener('click', swapDirection);

// ===== 事件监听 =====
inputArea.addEventListener('input', doTranslate);

// 初始化
updateCharCount();
updateDirectionUI();

// ===== 复制按钮 =====
btnCopy.addEventListener('click', async () => {
  const text = outputText.textContent;
  if (!text) return;

  try {
    await navigator.clipboard.writeText(text);
    btnCopy.textContent = '✅ 已复制';
    btnCopy.classList.add('copied');

    setTimeout(() => {
      btnCopy.textContent = '📋 复制';
      btnCopy.classList.remove('copied');
    }, 2000);
  } catch {
    // 降级方案：手动选择复制
    const range = document.createRange();
    range.selectNodeContents(outputText);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    document.execCommand('copy');
    selection.removeAllRanges();

    btnCopy.textContent = '✅ 已复制';
    btnCopy.classList.add('copied');
    setTimeout(() => {
      btnCopy.textContent = '📋 复制';
      btnCopy.classList.remove('copied');
    }, 2000);
  }
});

// ===== 快捷键 =====
document.addEventListener('keydown', (e) => {
  // Ctrl+S 切换翻译方向
  if (e.ctrlKey && e.key === 's' && e.target === document.body) {
    e.preventDefault();
    swapDirection();
  }

  // 无选中文本时 Ctrl+C 自动复制输出
  if (e.ctrlKey && e.key === 'c' && !e.shiftKey) {
    const selection = window.getSelection();
    if (selection.toString().length === 0 && outputText.textContent) {
      btnCopy.click();
    }
  }
});
