/* ============================================================
   豆懂 AI 动物英语微课 · 交互逻辑
   - 动物卡片渲染与主题筛选
   - 详情弹层（发音、短语、例句）
   - 口语跟读（Web Speech Recognition）
   - 小测验（随机 5 题）
   ============================================================ */

(function () {
  'use strict';

  const WORDS = window.ANIMAL_WORDS || [];
  const QUIZ_LENGTH = 5;

  // ---------- 工具：发音（带按钮波形反馈） ----------
  // 优先播放预生成 mp3（Boson TTS，自然音色），失败回退浏览器 TTS
  let currentAudio = null;  // 当前在播的 Audio 元素，用于停止

  function stopAllAudio() {
    if (currentAudio) {
      try { currentAudio.pause(); } catch (_) {}
      currentAudio = null;
    }
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  }

  function clearTrigger(trigger, timer) {
    if (trigger) trigger.classList.remove('is-speaking');
    if (timer) clearTimeout(timer);
  }

  function playAudio(src, opts) {
    opts = opts || {};
    stopAllAudio();

    const trigger = opts.trigger;
    let settled = false;     // 防止多次回调
    let fallbackEnabled = true;  // 是否允许降级到浏览器 TTS

    // 按钮波形反馈
    let timer = null;
    if (trigger) {
      trigger.classList.add('is-speaking');
      timer = setTimeout(() => clearTrigger(trigger, timer), 15000);
    }

    // 每次都创建新 Audio 元素，避免 cache 导致的状态污染
    const audio = new Audio();
    audio.preload = 'auto';

    const cleanup = () => {
      if (settled) return;
      settled = true;
      // 禁用 fallback——后续触发的 error 事件（如清空 src 导致的）不应降级
      fallbackEnabled = false;
      clearTrigger(trigger, timer);
      try { audio.pause(); } catch (_) {}
      try { audio.src = ''; } catch (_) {}  // 释放资源
      if (currentAudio === audio) currentAudio = null;
    };

    audio.addEventListener('ended', cleanup);
    audio.addEventListener('error', () => {
      if (settled) return;  // cleanup 已执行（可能是清空 src 触发的 error），不降级
      cleanup();
      if (fallbackEnabled) {
        fallbackBrowserTTS(opts.text, opts, trigger);
      }
    });

    // play() 是 Promise，可能 reject（autoplay 策略等）
    audio.src = src;
    currentAudio = audio;
    audio.play().then(() => {
      // 开始播放成功
    }).catch(err => {
      if (settled) return;  // 已 cleanup，不重复处理
      cleanup();
      // 降级浏览器 TTS（除非是 AbortError，那是因为我们主动 stop 的）
      if (fallbackEnabled && err.name !== 'AbortError') {
        fallbackBrowserTTS(opts.text, opts, trigger);
      }
    });
  }

  function fallbackBrowserTTS(text, opts, trigger) {
    if (!('speechSynthesis' in window) || !text) {
      // 连浏览器 TTS 都没有，至少清掉按钮状态
      if (trigger) trigger.classList.remove('is-speaking');
      return;
    }
    const u = new SpeechSynthesisUtterance(text);
    u.lang = opts.lang || 'en-US';
    u.rate = opts.rate || 0.85;
    u.pitch = opts.pitch || 1;
    if (trigger) {
      trigger.classList.add('is-speaking');
      const timer = setTimeout(() => clearTrigger(trigger), 15000);
      u.onend = () => clearTrigger(trigger, timer);
      u.onerror = () => clearTrigger(trigger, timer);
    }
    window.speechSynthesis.speak(u);
  }

  // 按动物 + 类型发音（kind: 'word' | 'phrase' | 'sentence'）
  function speakAnimal(word, kind, opts) {
    opts = opts || {};
    const src = `assets/audio/${word.theme}_${word.en}_${kind}.mp3`;
    const text = kind === 'word' ? word.en
               : kind === 'phrase' ? word.phrase
               : word.sentence;
    opts.text = text;
    playAudio(src, opts);
  }

  // ---------- 卡片渲染 ----------
  const grid = document.getElementById('animalGrid');
  let currentTheme = 'all';

  function renderCards() {
    const list = currentTheme === 'all'
      ? WORDS
      : WORDS.filter(w => w.theme === currentTheme);

    grid.innerHTML = '';
    list.forEach((w, index) => {
      const card = document.createElement('article');
      card.className = 'animal-card';
      card.setAttribute('data-theme', w.theme);
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', `${w.en} ${w.cn}，点击查看详情`);
      // stagger 入场：每张卡片延迟 40ms，最多 800ms
      card.style.animationDelay = Math.min(index * 40, 800) + 'ms';

      // 图片，缺失则用 emoji 兜底
      const imgHtml = w.img
        ? `<img class="animal-card__img" src="${w.img}" alt="${w.en}" loading="lazy"
             onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
           <div class="animal-card__img fallback" style="display:none;">${w.icon}</div>`
        : `<div class="animal-card__img fallback">${w.icon}</div>`;

      card.innerHTML = `
        ${imgHtml}
        <div class="animal-card__body">
          <p class="animal-card__word">${w.en}</p>
          <p class="animal-card__cn">${w.cn}</p>
          <span class="animal-card__theme-tag">${w.themeCn}</span>
        </div>
      `;
      card.addEventListener('click', () => openModal(w));
      card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(w); }
      });
      grid.appendChild(card);
    });

    if (list.length === 0) {
      grid.innerHTML = '<p style="color:var(--ink-soft);padding:20px;">这个主题暂时没有动物。</p>';
    }
  }

  // ---------- 主题切换 ----------
  document.getElementById('themeTabs').addEventListener('click', e => {
    const btn = e.target.closest('.theme-tab');
    if (!btn) return;
    document.querySelectorAll('.theme-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentTheme = btn.getAttribute('data-theme');
    renderCards();
  });

  // ---------- 详情弹层 ----------
  const modalMask = document.getElementById('modalMask');
  let currentWord = null;

  function openModal(w) {
    currentWord = w;
    document.getElementById('modalImg').src = w.img;
    document.getElementById('modalImg').alt = w.en;
    document.getElementById('modalWord').textContent = w.en;
    document.getElementById('modalCn').textContent = w.cn;
    document.getElementById('modalPhrase').textContent = w.phrase;
    document.getElementById('modalPhraseCn').textContent = w.phraseCn;
    document.getElementById('modalSentence').textContent = w.sentence;
    document.getElementById('modalSentenceCn').textContent = w.sentenceCn;
    document.getElementById('practiceTarget').textContent = w.phrase;
    setRecorderStatus('准备好就点开始', '');
    stopRecording();
    modalMask.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modalMask.classList.remove('open');
    document.body.style.overflow = '';
    stopRecording();
    window.speechSynthesis.cancel();
  }

  document.getElementById('modalClose').addEventListener('click', closeModal);
  modalMask.addEventListener('click', e => { if (e.target === modalMask) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  // 弹层内发音按钮（优先播放预生成 mp3，回退浏览器 TTS）
  document.getElementById('btnSpeakWord').addEventListener('click', function() {
    if (currentWord) speakAnimal(currentWord, 'word', { rate: 0.8, trigger: this });
  });
  document.getElementById('btnSpeakPhrase').addEventListener('click', function() {
    if (currentWord) speakAnimal(currentWord, 'phrase', { rate: 0.85, trigger: this });
  });
  document.getElementById('btnSpeakSentence').addEventListener('click', function() {
    if (currentWord) speakAnimal(currentWord, 'sentence', { rate: 0.85, trigger: this });
  });

  // ---------- 口语跟读（Web Speech Recognition）----------
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  let recognition = null;
  let isRecording = false;

  function setRecorderStatus(text, cls) {
    const el = document.getElementById('recorderStatus');
    el.textContent = text;
    el.className = 'recorder-status ' + (cls || '');
  }

  function startRecording() {
    if (!SR) {
      setRecorderStatus('当前浏览器不支持语音识别，请用 Chrome / Edge。', 'mismatch');
      return;
    }
    if (!currentWord) return;
    recognition = new SR();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 3;

    setRecorderStatus('🎙 正在听……大声读出：' + currentWord.phrase, 'listening');
    document.getElementById('btnRecord').textContent = '⏹ 停止录音';
    isRecording = true;

    recognition.onresult = event => {
      const heard = event.results[0][0].transcript.trim().toLowerCase();
      const target = currentWord.phrase.toLowerCase().replace(/[^a-z\s]/g, '').trim();
      const similarity = wordSimilarity(heard, target);
      if (similarity >= 0.7) {
        setRecorderStatus(`✓ 读得不错！听到："${heard}"（相似度 ${Math.round(similarity*100)}%）`, 'match');
      } else {
        setRecorderStatus(`再试一次：听到 "${heard}"，目标是 "${currentWord.phrase}"`, 'mismatch');
      }
    };
    recognition.onerror = e => {
      setRecorderStatus('录音出错：' + (e.error || '未知错误'), 'mismatch');
      resetRecordBtn();
    };
    recognition.onend = () => { resetRecordBtn(); };

    recognition.start();
  }

  function stopRecording() {
    if (recognition && isRecording) {
      try { recognition.stop(); } catch (_) {}
    }
    resetRecordBtn();
  }

  function resetRecordBtn() {
    isRecording = false;
    const btn = document.getElementById('btnRecord');
    if (btn) btn.textContent = '🎤 开始录音';
  }

  document.getElementById('btnRecord').addEventListener('click', () => {
    if (isRecording) stopRecording();
    else startRecording();
  });

  // 朴素的相似度：基于词集合的 Jaccard + 编辑距离混合
  function wordSimilarity(a, b) {
    if (!a || !b) return 0;
    if (a === b) return 1;
    const aw = new Set(a.split(/\s+/).filter(Boolean));
    const bw = new Set(b.split(/\s+/).filter(Boolean));
    const inter = [...aw].filter(x => bw.has(x)).length;
    const union = new Set([...aw, ...bw]).size;
    const jaccard = union ? inter / union : 0;
    const lev = levenshtein(a, b);
    const maxLen = Math.max(a.length, b.length);
    const levScore = maxLen ? 1 - lev / maxLen : 0;
    return Math.max(jaccard, levScore);
  }

  function levenshtein(a, b) {
    const m = a.length, n = b.length;
    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const cost = a[i-1] === b[j-1] ? 0 : 1;
        dp[i][j] = Math.min(dp[i-1][j] + 1, dp[i][j-1] + 1, dp[i-1][j-1] + cost);
      }
    }
    return dp[m][n];
  }

  // ---------- 数字人视频 ----------
  const teacherVideo = document.getElementById('teacherVideo');
  document.getElementById('btnReplayTeacher').addEventListener('click', () => {
    teacherVideo.currentTime = 0;
    teacherVideo.play().catch(() => {});
  });
  // 检测视频是否能加载
  teacherVideo.addEventListener('error', () => {
    document.getElementById('teacherFallback').style.display = 'flex';
  });

  // ---------- 小测验 ----------
  let quizOrder = [], quizIdx = 0, quizScore = 0, quizLocked = false;

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function startQuiz() {
    quizOrder = shuffle(WORDS).slice(0, QUIZ_LENGTH);
    quizIdx = 0;
    quizScore = 0;
    quizLocked = false;
    document.getElementById('qScore').textContent = '0';
    document.getElementById('qScoreFill').style.width = '0%';
    document.getElementById('btnNext').style.display = 'none';
    renderQuizQuestion();
  }

  function renderQuizQuestion() {
    if (quizIdx >= quizOrder.length) {
      finishQuiz();
      return;
    }
    const q = quizOrder[quizIdx];
    quizLocked = false;
    document.getElementById('qIndex').textContent = quizIdx + 1;
    document.getElementById('qScore').textContent = quizScore;
    document.getElementById('qQuestion').innerHTML = `"<strong>${q.en}</strong>" 的中文意思是？`;
    document.getElementById('qFeedback').textContent = '';
    document.getElementById('qFeedback').className = 'quiz__feedback';
    document.getElementById('btnNext').style.display = 'none';

    // 4 个选项：1 正确 + 3 干扰
    const correct = q.cn;
    const distractors = shuffle(WORDS.filter(w => w.cn !== correct)).slice(0, 3).map(w => w.cn);
    const options = shuffle([correct, ...distractors]);

    const box = document.getElementById('qAnswers');
    box.innerHTML = '';
    options.forEach(opt => {
      const b = document.createElement('button');
      b.className = 'quiz__answer';
      b.textContent = opt;
      b.addEventListener('click', () => chooseAnswer(b, opt, correct, q));
      box.appendChild(b);
    });
  }

  function chooseAnswer(btn, chosen, correct, q) {
    if (quizLocked) return;
    quizLocked = true;
    const feedback = document.getElementById('qFeedback');
    const allBtns = document.querySelectorAll('.quiz__answer');

    if (chosen === correct) {
      quizScore++;
      btn.classList.add('correct');
      feedback.className = 'quiz__feedback ok';
      feedback.textContent = '✓ 答对啦！';
    } else {
      btn.classList.add('wrong');
      feedback.className = 'quiz__feedback bad';
      feedback.textContent = `再记一下：${q.en} 的意思是"${correct}"。`;
      // 标出正确答案
      allBtns.forEach(b => { if (b.textContent === correct) b.classList.add('correct'); });
    }
    allBtns.forEach(b => b.disabled = true);

    document.getElementById('qScore').textContent = quizScore;
    const pct = ((quizIdx + 1) / QUIZ_LENGTH) * 100;
    document.getElementById('qScoreFill').style.width = pct + '%';

    // 同时念一下这个单词，加深记忆
    speakAnimal(q, 'word', { rate: 0.8 });

    document.getElementById('btnNext').style.display = 'inline-block';
  }

  function finishQuiz() {
    document.getElementById('qQuestion').textContent = `完成！最终得分：${quizScore} / ${QUIZ_LENGTH}`;
    const fb = document.getElementById('qFeedback');
    fb.className = 'quiz__feedback ok';
    fb.textContent = quizScore === QUIZ_LENGTH
      ? '太棒了，全部答对！🏆'
      : quizScore >= 3
        ? '不错！再练一次会更熟。'
        : '别灰心，回去看看卡片再试一次。';
    document.getElementById('qAnswers').innerHTML = '';
    document.getElementById('btnNext').style.display = 'none';
  }

  document.getElementById('btnNext').addEventListener('click', () => {
    quizIdx++;
    renderQuizQuestion();
  });
  document.getElementById('btnRestart').addEventListener('click', startQuiz);

  // ---------- 启动 ----------
  renderCards();
  startQuiz();

})();
