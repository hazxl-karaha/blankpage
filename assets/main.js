/* blAnk pAge. — shared script: 헤더/푸터/위젯 주입, 페이저, 인터랙션 */
(function () {
  var PAGES = [
    { k: 'index',     t: 'blAnk pAge.', h: 'index.html',     n: '001', name: 'Cover',     c: '#ec7230', ink: '#000' },
    { k: 'about',     t: 'About',       h: 'about.html',     n: '002', name: 'About',     c: '#3d8df5', ink: '#06142e' },
    { k: 'letter',    t: 'Letter',      h: 'letter.html',    n: '003', name: 'Letter',    c: '#6edb5a', ink: '#000' },
    { k: 'interview', t: 'Interview',   h: 'interview.html', n: '004', name: 'Interview', c: '#f8dc4a', ink: '#000' },
    { k: 'objects',   t: 'Objects',     h: 'objects.html',   n: '005', name: 'Objects',   c: '#f49ac1', ink: '#000' },
    { k: 'contact',   t: 'Contact',     h: 'contact.html',   n: '006', name: 'Contact',   c: '#b9a2ff', ink: '#000' },
    { k: 'information', t: 'Information', h: 'information.html', n: '007', name: 'Information', c: '#5fd4c4', ink: '#000' }
  ];
  // 메뉴에는 노출하지 않는 페이지 (홈·Interview·Contact·FAQ에서 링크)
  var HIDDEN = [
    { k: 'survey', t: 'Survey', h: 'survey.html', n: '008', name: 'Survey', c: '#ff6b5b', ink: '#000' }
  ];
  var ALL = PAGES.concat(HIDDEN);
  var IG = 'https://www.instagram.com/blank_page.mag/';
  var MAIL = 'blankpage.mag@gmail.com';
  var cur = document.body.getAttribute('data-page') || 'index';
  var idx = PAGES.findIndex(function (p) { return p.k === cur; });
  var isHidden = idx < 0;
  var meta = ALL.filter(function (p) { return p.k === cur; })[0] || PAGES[0];
  if (idx < 0) idx = 0;

  /* 헤더 */
  var hd = document.getElementById('hd');
  if (hd) {
    hd.innerHTML = PAGES.map(function (p) {
      var cls = (p.k === 'index' ? 'brand ' : '') + (p.k === cur ? 'on' : '');
      return '<a class="' + cls.trim() + '" href="' + p.h + '"' +
        (p.k === cur ? ' aria-current="page"' : '') +
        (p.k === 'index' ? ' aria-label="blAnk pAge. 홈"' : '') + '>' + p.t + '</a>';
    }).join('') +
      '<button class="menu-btn" id="menuBtn" aria-expanded="false" aria-controls="hd">Menu +</button>';
    var mb = document.getElementById('menuBtn');
    mb.addEventListener('click', function () {
      var o = hd.classList.toggle('open');
      mb.setAttribute('aria-expanded', o);
      mb.textContent = o ? 'Close ×' : 'Menu +';
    });
  }

  /* 푸터 */
  var ft = document.getElementById('ft');
  if (ft) {
    ft.innerHTML =
      '<div class="col"><h3>blAnk pAge.</h3><ul><li>LIFESTYLE MAGAZINE</li><li>ISSUE 001 · 2026.07</li></ul></div>' +
      '<div class="col"><h3>Index</h3><ul>' +
      PAGES.slice(1).map(function (p) { return '<li><a href="' + p.h + '">' + p.t + '</a></li>'; }).join('') +
      '</ul></div>' +
      '<div class="col"><h3>Contact</h3><ul>' +
      '<li><a href="' + IG + '" target="_blank" rel="noopener">@blank_page.mag</a></li>' +
      '<li><a href="mailto:' + MAIL + '">' + MAIL + '</a></li>' +
      '<li><a href="survey.html">인터뷰 신청</a></li></ul></div>' +
      '<div class="col"><h3>Colophon</h3><ul><li>발행 blAnk pAge STUDIO</li><li>창간 2026.07 · SEOUL</li><li>같은 서울, 다른 이야기</li></ul></div>' +
      '<div class="copy"><span>© 2026 blAnk pAge. All pages reserved.</span>' +
      '<span class="legal"><a href="information.html#terms">이용약관</a><a href="information.html#privacy">개인정보처리방침</a><a href="information.html#copyright">저작권</a><a href="information.html#corrections">정정·삭제 요청</a></span>' +
      '<span>— Page ' + meta.n + ' —</span></div>';
  }

  /* 위젯 : 시계 + 크로스워드 */
  var clock = document.createElement('div');
  clock.className = 'clock';
  clock.setAttribute('aria-hidden', 'true');
  clock.innerHTML =
    '<svg viewBox="0 0 120 120"><g id="letters"></g>' +
    '<g id="hHand"><line x1="60" y1="68" x2="60" y2="34" stroke="#3f6df2" stroke-width="2.2" stroke-linecap="round"/></g>' +
    '<g id="mHand"><line x1="60" y1="70" x2="60" y2="15" stroke="#e0553a" stroke-width="1.3" stroke-linecap="round"/></g>' +
    '<g id="sHand"><line x1="60" y1="73" x2="60" y2="9" stroke="#000" stroke-width=".6"/></g>' +
    '<circle cx="60" cy="60" r="3.2" fill="#fff" stroke="#000" stroke-width="1"/></svg>';
  document.body.appendChild(clock);

  var cross = document.createElement('div');
  cross.className = 'cross';
  cross.setAttribute('aria-hidden', 'true');
  document.body.appendChild(cross);

  (function () {
    var word = 'BLANKPAGE001', g = document.getElementById('letters'), ns = 'http://www.w3.org/2000/svg';
    var radii = [50, 47, 45, 47, 50, 48, 50, 47, 45, 47, 50, 48];
    word.split('').forEach(function (ch, i) {
      var a = (i * 30 - 90) * Math.PI / 180;
      var t = document.createElementNS(ns, 'text');
      t.setAttribute('x', 60 + radii[i] * Math.cos(a));
      t.setAttribute('y', 60 + radii[i] * Math.sin(a));
      t.textContent = ch;
      g.appendChild(t);
    });
    // 실제 현재 시각(접속한 기기의 시간대)에 맞춰 시침·분침·초침이 움직입니다.
    var hH = document.getElementById('hHand'),
        mH = document.getElementById('mHand'),
        sH = document.getElementById('sHand');
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function rot(el, deg) { el.setAttribute('transform', 'rotate(' + deg + ' 60 60)'); }
    function tick() {
      var d = new Date();
      var sec = d.getSeconds() + (reduce ? 0 : d.getMilliseconds() / 1000);
      var min = d.getMinutes() + sec / 60;
      var hr  = (d.getHours() % 12) + min / 60;
      rot(hH, hr * 30);
      rot(mH, min * 6);
      rot(sH, sec * 6);
    }
    tick();
    if (reduce) { setInterval(tick, 1000); }
    else { (function loop() { tick(); requestAnimationFrame(loop); })(); }

    // 크로스워드 : BLANK(세로) × PAGE(가로)
    [['', 'B', '', ''], ['', 'L', '', ''], ['P', 'A', 'G', 'E'], ['', 'N', '', ''], ['', 'K', '', '']]
      .reduce(function (a, b) { return a.concat(b); }, [])
      .forEach(function (c) {
        var i = document.createElement('i');
        if (c) { i.className = 'l'; i.textContent = c; }
        cross.appendChild(i);
      });
  })();

  /* 글자 간격 펼치기 */
  document.querySelectorAll('[data-spread]').forEach(function (el) {
    el.setAttribute('aria-label', el.getAttribute('data-spread'));
    el.innerHTML = el.getAttribute('data-spread').split('').map(function (c) {
      return '<span aria-hidden="true">' + c + '</span>';
    }).join('');
  });

  /* 페이지 링크 hover 색 = 대상 페이지의 강조색 */
  document.querySelectorAll('.tbl a[href]').forEach(function (a) {
    var t = ALL.filter(function (p) { return p.h === a.getAttribute('href'); })[0];
    if (t) a.style.setProperty('--h', t.c);
  });

  /* 이전/다음 페이지 카드 (서브페이지) */
  var board = document.querySelector('.board');
  if (board && cur !== 'index' && !isHidden) {
    var prev = PAGES[(idx - 1 + PAGES.length) % PAGES.length];
    var next = PAGES[(idx + 1) % PAGES.length];
    board.insertAdjacentHTML('beforeend',
      '<a class="card pager prev s6 rv" href="' + prev.h + '"><span class="lb">Previous, Page ' + prev.n + '</span><span class="pg">' + prev.name + '</span></a>' +
      '<a class="card pager next s6 rv" style="background:' + next.c + ';color:' + next.ink + '" href="' + next.h + '"><span class="lb">Next, Page ' + next.n + '</span><span class="pg">' + next.name + '</span></a>');
  }

  /* 연락 폼 (백엔드 연결 전까지 메일 앱으로 전달) */
  var form = document.getElementById('cf');
  if (form) {
    var msg = form.querySelector('.msg');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        msg.className = 'msg err';
        msg.textContent = '* 표시된 항목과 개인정보 수집·이용 동의를 확인해주세요.';
        form.reportValidity();
        return;
      }
      var f = new FormData(form);
      var subject = '[' + f.get('topic') + '] ' + f.get('name') + ' — blAnk pAge. 문의';
      var body = '용건: ' + f.get('topic') + '\n이름: ' + f.get('name') + '\n이메일: ' + f.get('email') + '\n\n' + f.get('message');
      msg.className = 'msg';
      msg.textContent = '메일 앱이 열립니다. 전송은 메일 앱에서 마무리해주세요.';
      window.location.href = 'mailto:' + MAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    });
  }

  /* Information 서브메뉴 : 현재 섹션 표시 */
  var secs = document.querySelectorAll('.doc-body section[id]');
  if (secs.length) {
    var links = {};
    document.querySelectorAll('.subnav a').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
    var so = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting && links[e.target.id]) {
          Object.keys(links).forEach(function (k) { links[k].classList.remove('on'); });
          links[e.target.id].classList.add('on');
        }
      });
    }, { rootMargin: '-20% 0px -70% 0px' });
    secs.forEach(function (s) { so.observe(s); });
  }

  /* 스크롤 리빌 */
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
        setTimeout(function () { e.target.style.transitionDelay = '0ms'; }, 1000);
      }
    });
  }, { threshold: .08, rootMargin: '0px 0px -4% 0px' });
  document.querySelectorAll('.rv').forEach(function (el, i) {
    el.style.transitionDelay = (i % 4) * 60 + 'ms';
    io.observe(el);
  });
})();
