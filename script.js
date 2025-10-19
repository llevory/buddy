// Buddy Hunt — progressive quiz
(() => {
  const questions = [
    {
      id: 1,
      text: '蔡徐坤成名曲歌词里，唱，跳，rap 的下一句是什么？',
      options: ['篮球', '足球', '乒乓球'],
      correctIndex: 0
    },
    {
      id: 2,
      text: '《鸡你太美》的练习时长是多久？',
      options: ['两分半', '两年半', '凉拌'],
      correctIndex: 1
    },
    {
      id: 3,
      text: '你是蔡徐坤的真爱粉吗？',
      options: ['真爱粉', '小黑子'],
      correctIndex: 0
    }
  ];

  // DOM
  const questionArea = document.getElementById('questionArea');
  const submitBtn = document.getElementById('submitBtn');
  const nextBtn = document.getElementById('nextBtn');
  const feedback = document.getElementById('feedback');
  const progressBar = document.getElementById('progressBar');

  let current = 0;
  let selectedOption = null;

  function renderQuestion() {
    const q = questions[current];
    progressBar.style.width = `${(current / questions.length) * 100}%`;
    feedback.textContent = '';
    feedback.className = 'feedback';
    submitBtn.disabled = true;
    nextBtn.hidden = true;
    selectedOption = null;

    // build HTML
    questionArea.innerHTML = '';
    const title = document.createElement('div');
    title.className = 'q-title';
    title.textContent = `第 ${current + 1} 题： ${q.text}`;
    questionArea.appendChild(title);

    const opts = document.createElement('div');
    opts.className = 'options';
    q.options.forEach((opt, idx) => {
      const o = document.createElement('label');
      o.className = 'option';
      o.tabIndex = 0;
      o.setAttribute('data-idx', idx);

      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = 'opt';
      radio.value = idx;
      radio.setAttribute('aria-label', opt);

      const span = document.createElement('span');
      span.className = 'label';
      span.textContent = opt;

      o.appendChild(radio);
      o.appendChild(span);
      opts.appendChild(o);

      // click/select handlers
      o.addEventListener('click', () => {
        selectOption(idx, o);
      });
      o.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          selectOption(idx, o);
        }
      });
    });

    questionArea.appendChild(opts);
  }

  function selectOption(idx, node) {
    selectedOption = idx;
    // mark UI
    document.querySelectorAll('.option').forEach(el => el.classList.remove('selected'));
    node.classList.add('selected');
    // check radio
    const input = node.querySelector('input');
    if (input) input.checked = true;
    submitBtn.disabled = false;
    feedback.textContent = '';
  }

  function showFeedback(text, type) {
    feedback.textContent = text;
    feedback.className = 'feedback ' + type;
  }

  function handleSubmit() {
    if (selectedOption === null) return;
    const q = questions[current];
    if (selectedOption === q.correctIndex) {
      showFeedback('回答正确 ✔', 'success');
      // mark progress to next
      nextBtn.hidden = false;
      submitBtn.disabled = true;
      runConfetti();
    } else {
      // wrong: allow retry
      animateShake();
      showFeedback('回答错误，请再试一次。', 'error');
    }
  }

  function handleNext() {
    current++;
    if (current >= questions.length) {
      // finished
      progressBar.style.width = '100%';
      showFinalMessage();
    } else {
      renderQuestion();
    }
  }

  function showFinalMessage() {
    questionArea.innerHTML = `
      <div class="q-title">恭喜你答对了所有问题！</div>
      <div style="margin-top:10px;color:var(--muted)">
        现在请到 <strong>Dry Lab外的204 locker</strong> 里获取你的线索！
      </div>
    `;
    nextBtn.hidden = true;
    submitBtn.hidden = true;
    feedback.textContent = '';
    runConfetti(900);
  }

  function animateShake() {
    const card = document.querySelector('.card');
    card.animate(
      [{ transform: 'translateX(0)' }, { transform: 'translateX(-8px)' }, { transform: 'translateX(8px)' }, { transform: 'translateX(0)' }],
      { duration: 360, easing: 'cubic-bezier(.2,.8,.2,1)' }
    );
  }

  // Basic confetti implementation
  function runConfetti(duration = 1400) {
    const canvas = document.getElementById('confettiCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    // resize
    canvas.width = innerWidth;
    canvas.height = innerHeight;

    const pieces = [];
    const colors = ['#ffb86b', '#7ce7c7', '#8be9fd', '#ff8bcb', '#caa2ff'];

    for (let i = 0; i < 80; i++) {
      pieces.push({
        x: Math.random() * canvas.width,
        y: Math.random() * -canvas.height,
        w: 6 + Math.random() * 8,
        h: 8 + Math.random() * 8,
        vx: -2 + Math.random() * 4,
        vy: 2 + Math.random() * 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        rot: Math.random() * Math.PI * 2,
        vr: -0.1 + Math.random() * 0.2
      });
    }

    let start = performance.now();
    function frame(now) {
      const t = now - start;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.02; // gravity
        p.rot += p.vr;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });
      if (t < duration) {
        requestAnimationFrame(frame);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    requestAnimationFrame(frame);
    // auto-clear after duration
    setTimeout(() => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }, duration + 250);
  }

  // Event listeners
  submitBtn.addEventListener('click', handleSubmit);
  nextBtn.addEventListener('click', handleNext);

  // Initialize
  renderQuestion();

  // Accessibility: allow Enter on submit button when focused
  submitBtn.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && !submitBtn.disabled) {
      e.preventDefault();
      handleSubmit();
    }
  });

  // make progress reach 100% when final
  const observer = new MutationObserver(() => {
    if (current >= questions.length) progressBar.style.width = '100%';
  });
  observer.observe(document.getElementById('app'), { childList: true, subtree: true });
})();