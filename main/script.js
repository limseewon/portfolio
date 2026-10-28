/* =========================================================
   작품 데이터
   - img     : 이미지 경로 (예: 'images/work01.jpg'). 비워두면 빈 액자
   - ratio   : 가로/세로 비율 (세로형 0.7, 정사각형 1, 가로형 1.4 등)
   - featured: true 인 작품이 첫 화면에 나옵니다 (하나만)
   ========================================================= */
const works = [
  { title: '작품 제목 01', year: '2026', medium: '한지에 수묵담채', size: '00 × 00 cm', img: '', ratio: 0.72, featured: true },
  { title: '작품 제목 02', year: '2026', medium: '한지에 분채', size: '00 × 00 cm', img: '', ratio: 1.35 },
  { title: '작품 제목 03', year: '2025', medium: '장지에 채색', size: '00 × 00 cm', img: '', ratio: 0.6 },
  { title: '작품 제목 04', year: '2025', medium: '한지에 수묵', size: '00 × 00 cm', img: '', ratio: 0.85 },
  { title: '작품 제목 05', year: '2025', medium: '한지에 수묵담채', size: '00 × 00 cm', img: '', ratio: 1.1 },
  { title: '작품 제목 06', year: '2024', medium: '장지에 분채', size: '00 × 00 cm', img: '', ratio: 0.75 },
];

const $ = id => document.getElementById(id);
const pad = n => String(n + 1).padStart(2, '0');
const root = document.documentElement;

/* ---------- 인트로 ---------- */
const intro = $('intro');
function revealPage() {
  root.classList.add('ready');
}
if (root.classList.contains('intro-on')) {
  const t1 = setTimeout(revealPage, 3000);        // 문이 열리는 동안 첫 화면이 번지듯 등장
  const t2 = setTimeout(() => intro.remove(), 4000);
  intro.addEventListener('click', () => {         // 클릭하면 건너뛰기
    clearTimeout(t1); clearTimeout(t2);
    intro.classList.add('skip');
    revealPage();
    setTimeout(() => intro.remove(), 400);
  });
} else {
  root.classList.add('ready');
  intro && intro.remove();
}

/* ---------- 헤더: 스크롤하면 이중 괘선과 배경이 나타남 ---------- */
const header = $('header');
const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 30);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ---------- 렌더링 ---------- */
const media = (w, i) =>
  w.img ? `<img src="${w.img}" alt="${w.title}" loading="lazy" draggable="false">`
    : `<div class="ph">${pad(i)}</div>`;

const vcap = w => `
  <figcaption class="vcap">
    <span class="t">${w.title}</span>
    <span class="m">${w.medium} · <span class="y">${w.year}</span></span>
  </figcaption>`;

/* 첫 화면 대표 작품 */
const fi = Math.max(0, works.findIndex(w => w.featured));
$('heroWork').innerHTML = `
  <div class="work">
    <div class="mat">
      <div class="media" data-i="${fi}" style="--r:${works[fi].ratio}">${media(works[fi], fi)}</div>
    </div>
    ${vcap(works[fi])}
  </div>`;

$('total').textContent = `${works.length}점`;
const N = works.length;

/* ---------- 갤러리: 같은 크기의 칸 안에 작품이 가운데 ---------- */
const gallery = $('gallery');
gallery.innerHTML = works.map((w, i) => `
  <figure class="g-item" data-i="${i}" tabindex="0" style="--d:${(i % 3) * 0.1}s">
    <div class="g-frame"><div class="g-art" style="--r:${w.ratio}">${media(w, i)}</div></div>
    <figcaption class="g-cap">
      <span class="n">${pad(i)}</span>
      <span class="t">${w.title}</span>
      <span class="d">${w.medium} · ${w.year}</span>
    </figcaption>
  </figure>`).join('');
gallery.addEventListener('click', e => {
  const it = e.target.closest('.g-item');
  if (it) openLB(+it.dataset.i);
});
gallery.addEventListener('keydown', e => {
  const it = e.target.closest('.g-item');
  if (it && e.key === 'Enter') openLB(+it.dataset.i);
});

/* ---------- 병풍: 선택한 작품이 항상 가운데에 펼쳐진다 ---------- */
const screenEl = $('screen');
const GAP = 3;
let active = 0;
let mode = 'screen';

const panels = works.map((w, i) => {
  const el = document.createElement('div');
  el.className = 'panel';
  el.dataset.i = i;
  el.innerHTML = `
    <div class="p-bg">${w.img ? `<img src="${w.img}" alt="" draggable="false">` : ''}</div>
    <span class="p-no">${pad(i)}</span>
    <span class="p-title">${w.title}</span>
    <div class="p-art" style="--r:${w.ratio}">${w.img ? `<img src="${w.img}" alt="${w.title}" draggable="false">` : `<div class="ph">${pad(i)}</div>`}</div>
    <div class="vcap p-cap">
      <span class="t">${w.title}</span>
      <span class="m">${w.medium} · <span class="y">${w.year}</span></span>
    </div>`;
  screenEl.appendChild(el);
  return el;
});

/* 선택된 작품 기준 상대 위치 (…, -2, -1, 0, +1, +2, …) — 처음과 끝이 이어진다 */
const hl = Math.floor(N / 2);
const offsetOf = i => (((i - active + hl) % N) + N) % N - hl;
const state = panels.map(() => ({ o: null }));   // 이전 위치 기억

function layoutScreen(animate = true, prevActive = active) {
  const vertical = matchMedia('(max-width: 760px)').matches;
  screenEl.classList.toggle('v', vertical);
  screenEl.classList.toggle('no-anim', !animate);

  const size = vertical ? screenEl.clientHeight : screenEl.clientWidth;
  const L = Math.min(2, hl);                 // 왼쪽(위)에 보이는 패널 수
  const R = Math.min(2, N - 1 - hl);         // 오른쪽(아래)에 보이는 패널 수
  const cnt = L + R + 1;
  let C, A;                                  // 접힌 패널 / 펼친 패널 크기
  if (vertical) { C = 48; A = Math.max(140, size - 2 * GAP - (cnt - 1) * (C + GAP)); }
  else {
    A = cnt === 1 ? size - 2 * GAP : Math.round((size - 2 * GAP) * 0.5);
    C = cnt === 1 ? 0 : (size - 2 * GAP - A - (cnt - 1) * GAP) / (cnt - 1);
  }

  const startOf = o => {
    if (o < 0) return GAP + (o + L) * (C + GAP);
    if (o === 0) return GAP + L * (C + GAP);
    return GAP + L * (C + GAP) + A + GAP + (o - 1) * (C + GAP);
  };
  const set = (el, start, len) => {
    if (vertical) { el.style.top = `${start}px`; el.style.height = `${len}px`; el.style.left = ''; el.style.width = ''; }
    else { el.style.left = `${start}px`; el.style.width = `${len}px`; el.style.top = ''; el.style.height = ''; }
  };

  panels.forEach((el, i) => {
    const o = offsetOf(i);
    const visible = o >= -L && o <= R;
    const prev = state[i].o;
    const wrapped = animate && prev !== null && (o - prev) !== (prevActive - active);
    const len = o === 0 ? A : C;
    el.classList.toggle('on', o === 0);

    if (visible) {
      if (wrapped) {
        // 반대편에서 나타나는 패널: 제자리에 바로 놓고 서서히 나타남
        el.style.transition = 'none'; el.classList.add('gone');
        set(el, startOf(o), len);
        void el.offsetWidth;
        el.style.transition = ''; el.classList.remove('gone');
      } else {
        set(el, startOf(o), len);
        el.classList.remove('gone');
      }
    } else {
      const side = o < 0 ? -1 : 1;
      const hidden = side < 0 ? GAP - (C + GAP) : size;
      if (wrapped) {
        // 보이던 패널이 반대편으로 넘어갈 때: 그 자리에서 사라진 뒤 숨은 자리로 이동
        el.classList.add('gone');
        setTimeout(() => {
          if (offsetOf(i) !== o) return;
          el.style.transition = 'none'; set(el, hidden, C); void el.offsetWidth; el.style.transition = '';
        }, 700);
      } else {
        set(el, hidden, C);
        el.classList.add('gone');
      }
    }
    state[i].o = o;
  });
}

function updateCount() { $('scCount').textContent = `${pad(active)} / ${pad(N - 1)}`; }

function activate(i, animate = true) {
  const prevActive = active;
  active = ((i % N) + N) % N;
  layoutScreen(animate, prevActive);
  const w = works[active];
  const info = $('screenInfo');
  info.classList.remove('in');
  void info.offsetWidth;
  info.innerHTML = `<span class="n">${pad(active)} <em>/ ${pad(N - 1)}</em></span>
    <strong>${w.title}</strong><span class="d">${w.medium}, ${w.size}, ${w.year}</span>`;
  info.classList.add('in');
  updateCount();
}

/* 클릭: 접힌 패널은 가운데로, 가운데 작품은 크게 보기 */
let sMoved = false, sx0 = 0, sDown = false;
screenEl.addEventListener('pointerdown', e => { sDown = true; sMoved = false; sx0 = e.clientX; });
window.addEventListener('pointerup', e => {
  if (!sDown) return;
  sDown = false;
  const dx = e.clientX - sx0;
  if (Math.abs(dx) > 60) { sMoved = true; activate(active + (dx < 0 ? 1 : -1)); }
});
screenEl.addEventListener('click', e => {
  if (sMoved) { sMoved = false; return; }
  const p = e.target.closest('.panel');
  if (!p) return;
  const i = +p.dataset.i;
  if (i === active) openLB(i); else activate(i);
});
screenEl.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight') { e.preventDefault(); activate(active + 1); }
  if (e.key === 'ArrowLeft') { e.preventDefault(); activate(active - 1); }
  if (e.key === 'Enter') openLB(active);
});

$('scPrev').addEventListener('click', () => activate(active - 1));
$('scNext').addEventListener('click', () => activate(active + 1));

let rz;
window.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => layoutScreen(false), 80); });
window.addEventListener('load', () => layoutScreen(false));

/* ---------- 보기 방식: 병풍 / 갤러리 ---------- */
const worksEl = $('works');
function setMode(m) {
  mode = m;
  worksEl.dataset.mode = m;
  document.querySelectorAll('.toggle button').forEach(b => b.classList.toggle('on', b.dataset.mode === m));
  if (m === 'screen') layoutScreen(false);
}
document.querySelectorAll('.toggle button').forEach(btn => btn.addEventListener('click', () => setMode(btn.dataset.mode)));

/* 클릭하면 확대 (대표 작품) */
document.addEventListener('click', e => {
  const m = e.target.closest('.media[data-i]');
  if (m) openLB(+m.dataset.i);
});

/* 시작 */
setMode('screen');
activate(0, false);

/* ---------- 확대 보기 ---------- */
const lb = $('lightbox');
let idx = 0;

function render(i) {
  idx = (i + works.length) % works.length;
  const w = works[idx];
  $('lbMedia').innerHTML = media(w, idx);
  if (!w.img) {
    const ph = document.querySelector('#lbMedia .ph');
    ph.style.aspectRatio = w.ratio;
    ph.style.width = `min(100%, calc(62vh * ${w.ratio}))`;
  }
  $('lbIndex').textContent = `${pad(idx)} / ${pad(works.length - 1)}`;
  $('lbTitle').textContent = w.title;
  $('lbMeta').textContent = `${w.medium}, ${w.size}, ${w.year}`;
}
function openLB(i) {
  render(i);
  lb.classList.add('open');
  lb.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}
function closeLB() {
  lb.classList.remove('open');
  lb.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

$('lbClose').addEventListener('click', closeLB);
$('lbPrev').addEventListener('click', () => render(idx - 1));
$('lbNext').addEventListener('click', () => render(idx + 1));

document.addEventListener('keydown', e => {
  if (!lb.classList.contains('open')) return;
  if (e.key === 'Escape') closeLB();
  if (e.key === 'ArrowLeft') render(idx - 1);
  if (e.key === 'ArrowRight') render(idx + 1);
});

let sx = 0;
lb.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
lb.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - sx;
  if (Math.abs(dx) > 50) render(idx + (dx < 0 ? 1 : -1));
});


/* ---------- 스크롤 등장 효과 ---------- */
if (!matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
  root.classList.add('js-rv');
  const targets = document.querySelectorAll('.bar, .about .title, .statement, .cv, .contact .title, .contact-body, .g-item, .foot-grid');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { threshold: 0.12 });
  targets.forEach((el, i) => { el.classList.add('rv'); io.observe(el); });
}