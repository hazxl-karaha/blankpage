/* blAnk pAge. — survey: 단계 이동, 검증, 조건부 일정, 제출 */
(function () {
  'use strict';

  /* ───── 설정 ─────
     endpoint : 비워두면 Netlify Forms(사이트 루트 '/')로 전송합니다.
                별도 API(예: Apps Script, Supabase 함수)를 쓰려면 URL을 입력하세요.
     schedule : 밋업 희망 일정의 선택 가능 범위. from/to를 비우면 '오늘 +7일 ~ +37일'. */
  var CONFIG = {
    endpoint: '',
    schedule: {
      from: '',              // 예: '2026-11-09'
      to: '',                // 예: '2026-11-30'
      startHour: 9,          // 시작 시각
      endHour: 22,           // 마지막 시각
      weekdaysOnly: false,
      blockedDates: []       // 예: ['2026-11-21']
    }
  };

  var form = document.getElementById('sv');
  if (!form) return;

  var steps = [].slice.call(form.querySelectorAll('.step'));
  var labelEl = document.getElementById('svLabel');
  var countEl = document.getElementById('svCount');
  var barEl = document.getElementById('svBar');
  var prevBtn = document.getElementById('svPrev');
  var nextBtn = document.getElementById('svNext');
  var submitBtn = document.getElementById('svSubmit');
  var msgEl = document.getElementById('svMsg');
  var doneEl = document.getElementById('done');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var KEY = 'bp-survey-draft';
  var cur = 0;

  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function val(name) {
    var c = form.querySelector('input[name="' + name + '"]:checked');
    return c ? c.value : '';
  }
  function isActive(i) {
    return !(steps[i].getAttribute('data-when') === 'meetup-yes' && val('meetup') !== 'yes');
  }
  function activeList() {
    var out = [];
    steps.forEach(function (s, i) { if (isActive(i)) out.push(i); });
    return out;
  }

  /* ───── 일정 입력 ───── */
  var sc = CONFIG.schedule;
  var dateEl = document.getElementById('q-date');
  var slotsEl = document.getElementById('slots');
  function iso(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  (function setupSchedule() {
    var from = sc.from ? new Date(sc.from + 'T00:00:00') : (function () { var d = new Date(); d.setDate(d.getDate() + 7); return d; })();
    var to = sc.to ? new Date(sc.to + 'T00:00:00') : (function () { var d = new Date(from); d.setDate(d.getDate() + 30); return d; })();
    dateEl.min = iso(from);
    dateEl.max = iso(to);
    for (var h = sc.startHour; h <= sc.endHour; h++) {
      var t = pad(h) + ':00';
      slotsEl.insertAdjacentHTML('beforeend',
        '<label class="chip"><input type="radio" name="time" value="' + t + '"><span>' + t + '</span></label>');
    }
    dateEl.addEventListener('change', function () {
      var v = dateEl.value, msg = '';
      if (v) {
        var wd = new Date(v + 'T00:00:00').getDay();
        if (sc.weekdaysOnly && (wd === 0 || wd === 6)) msg = '평일만 선택할 수 있어요.';
        if (sc.blockedDates.indexOf(v) > -1) msg = '이 날짜는 예약이 어려워요.';
      }
      dateEl.setCustomValidity(msg);
      if (msg) dateEl.reportValidity();
    });
  })();

  /* 밋업에 '네'를 고른 경우에만 일정 필수 */
  function syncRequired() {
    var yes = val('meetup') === 'yes';
    dateEl.required = yes;
    [].forEach.call(slotsEl.querySelectorAll('input'), function (r) { r.required = yes; });
  }

  /* ───── 렌더 / 이동 ───── */
  function render() {
    steps.forEach(function (s, i) { s.hidden = (i !== cur); });
    var list = activeList();
    var pos = list.indexOf(cur) + 1;
    var total = list.length;
    labelEl.textContent = steps[cur].getAttribute('data-label');
    countEl.textContent = pad(pos) + ' / ' + pad(total);
    barEl.style.width = (pos / total * 100) + '%';
    prevBtn.hidden = (pos === 1);
    var last = (pos === total);
    nextBtn.hidden = last;
    submitBtn.hidden = !last;
    submitBtn.textContent = val('meetup') === 'yes' ? '설문 제출하고 일정 예약하기' : '설문 제출하기';
    syncRequired();
  }
  function go(i, scroll) {
    cur = i;
    msgEl.textContent = '';
    msgEl.className = 'msg';
    render();
    if (scroll !== false) {
      form.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    }
    var q = steps[cur].querySelector('.q');
    if (q) q.focus({ preventScroll: true });
  }

  function validateStep(step) {
    var els = [].slice.call(step.querySelectorAll('input, textarea, select'))
      .filter(function (el) { return !el.disabled && el.type !== 'hidden'; });
    for (var k = 0; k < els.length; k++) {
      if (!els[k].checkValidity()) { els[k].reportValidity(); return false; }
    }
    return true;
  }

  nextBtn.addEventListener('click', function () {
    if (!validateStep(steps[cur])) return;
    var n = cur + 1;
    while (n < steps.length && !isActive(n)) n++;
    if (n < steps.length) go(n);
  });
  prevBtn.addEventListener('click', function () {
    var p = cur - 1;
    while (p > 0 && !isActive(p)) p--;
    if (p >= 0) go(p);
  });

  /* Enter 키 : 제출 대신 다음 단계로 */
  form.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter') return;
    var t = e.target;
    if (t.tagName !== 'INPUT') return;
    if (t.type === 'checkbox' || t.type === 'radio' || t.type === 'submit' || t.type === 'button') return;
    e.preventDefault();
    (submitBtn.hidden ? nextBtn : submitBtn).click();
  });

  /* ───── 검증 메시지(한국어) ───── */
  form.addEventListener('invalid', function (e) {
    var el = e.target;
    if (el.validity.valueMissing) {
      if (el.type === 'checkbox') el.setCustomValidity('동의가 필요해요.');
      else if (el.type === 'radio') el.setCustomValidity('하나를 선택해줘.');
      else el.setCustomValidity('이 항목을 입력해줘.');
    } else if (el.validity.patternMismatch) {
      el.setCustomValidity(el.getAttribute('data-msg') || '형식을 확인해줘.');
    }
  }, true);
  function clearValidity(e) {
    var t = e.target;
    if (t === dateEl || !t.setCustomValidity) return;
    t.setCustomValidity('');
    // 라디오·체크박스는 같은 그룹 전체의 오류 상태를 함께 해제
    if ((t.type === 'radio' || t.type === 'checkbox') && t.name) {
      [].forEach.call(form.querySelectorAll('input[name="' + t.name + '"]'), function (g) { g.setCustomValidity(''); });
    }
  }
  form.addEventListener('input', clearValidity, true);
  form.addEventListener('change', clearValidity, true);
  form.addEventListener('change', function (e) {
    if (e.target.name === 'meetup') { syncRequired(); render(); }
  });

  /* ───── 에세이 미리보기 ───── */
  (function () {
    var imgs = [].slice.call(document.querySelectorAll('#essay .frame img'));
    var cnt = document.getElementById('essayCount');
    var i = 0;
    function show(n) {
      i = (n + imgs.length) % imgs.length;
      imgs.forEach(function (im, k) { im.hidden = (k !== i); });
      cnt.textContent = (i + 1) + ' / ' + imgs.length;
    }
    document.getElementById('essayPrev').addEventListener('click', function () { show(i - 1); });
    document.getElementById('essayNext').addEventListener('click', function () { show(i + 1); });
  })();

  /* ───── 임시 저장(탭을 닫으면 사라지는 sessionStorage) ───── */
  var SKIP = { consent: 1, 'bot-field': 1, 'form-name': 1 };
  function save() {
    try {
      var o = {};
      [].forEach.call(form.elements, function (el) {
        if (!el.name || SKIP[el.name]) return;
        if (el.type === 'radio') { if (el.checked) o[el.name] = el.value; }
        else if (el.type === 'checkbox') { if (el.checked) (o[el.name] = o[el.name] || []).push(el.value); }
        else if (el.value) o[el.name] = el.value;
      });
      sessionStorage.setItem(KEY, JSON.stringify(o));
    } catch (err) { /* 저장 불가 환경은 무시 */ }
  }
  function restore() {
    try {
      var o = JSON.parse(sessionStorage.getItem(KEY) || 'null');
      if (!o) return;
      [].forEach.call(form.elements, function (el) {
        if (!el.name || !(el.name in o)) return;
        var v = o[el.name];
        if (el.type === 'radio') el.checked = (el.value === v);
        else if (el.type === 'checkbox') el.checked = (v.indexOf(el.value) > -1);
        else el.value = v;
      });
    } catch (err) { /* 무시 */ }
  }
  form.addEventListener('input', save);
  form.addEventListener('change', save);

  /* ───── 제출 ───── */
  function showMsg(text, isErr) {
    msgEl.textContent = text;
    msgEl.className = 'msg' + (isErr ? ' err' : '');
  }
  function finish(demo) {
    try { sessionStorage.removeItem(KEY); } catch (err) { /* 무시 */ }
    form.hidden = true;
    doneEl.hidden = false;
    if (demo) document.getElementById('demoNote').hidden = false;
    doneEl.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    doneEl.focus({ preventScroll: true });
  }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validateStep(steps[cur])) return;

    var fd = new FormData(form);
    if (val('meetup') !== 'yes') { fd.delete('date'); fd.delete('time'); }

    // 로컬 파일로 열었고 endpoint도 없으면 미리보기 모드
    var demo = location.protocol === 'file:' && !CONFIG.endpoint;
    if (demo) {
      if (window.console) console.info('[survey:preview] 전송될 내용', Array.from(fd.entries()));
      finish(true);
      return;
    }

    submitBtn.disabled = true;
    showMsg('보내는 중…', false);
    fetch(CONFIG.endpoint || '/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(fd).toString()
    }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      finish(false);
    }).catch(function () {
      submitBtn.disabled = false;
      showMsg('전송에 실패했어요. 잠시 후 다시 시도하거나, 인스타그램 DM(@blank_page.mag)으로 알려주세요.', true);
    });
  });

  restore();
  go(0, false);
})();
