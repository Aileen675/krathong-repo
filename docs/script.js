'use strict';

/* ---------- แบบกระทง ---------- */
const DESIGNS = [
  { id: 'lotus',    name: 'ดอกบัว',      back: '#f9a8d4', front: '#ec4899' },
  { id: 'marigold', name: 'ดาวเรือง',    back: '#fde047', front: '#f59e0b' },
  { id: 'butterfly',name: 'อัญชัน',      back: '#a5b4fc', front: '#6366f1' },
  { id: 'leaf',     name: 'ใบตอง',       back: '#bbf7d0', front: '#22c55e' }
];

function krathongSVG(d) {
  const back = [-70, -45, -20, 5, 30, 55, 75].map(a =>
    `<ellipse cx="60" cy="68" rx="9" ry="26" fill="${d.back}" transform="rotate(${a} 60 90)"/>`).join('');
  const front = [-58, -32, -6, 20, 46, 66].map(a =>
    `<ellipse cx="60" cy="74" rx="8" ry="19" fill="${d.front}" opacity=".95" transform="rotate(${a} 60 90)"/>`).join('');
  return `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <ellipse cx="60" cy="98" rx="50" ry="14" fill="#e9d29a"/>
    <ellipse cx="60" cy="94" rx="46" ry="11" fill="#5fa043"/>
    ${back}${front}
    <rect x="56" y="44" width="8" height="30" rx="2" fill="#fff7e0"/>
    <g class="flame"><path d="M60 24 C67 33 66 42 60 44 C54 42 53 33 60 24Z" fill="#ffb02e"/>
    <path d="M60 31 C63 36 63 41 60 43 C57 41 57 36 60 31Z" fill="#fff4b8"/></g>
  </svg>`;
}

/* ---------- องค์ประกอบหน้าเว็บ ---------- */
const $ = id => document.getElementById(id);
const designList = $('designList'), nameInput = $('nameInput'), wishInput = $('wishInput');
const wishCount = $('wishCount'), errorEl = $('error'), river = $('river');
const logList = $('logList'), totalEl = $('total');

/* ดาวบนท้องฟ้า */
(function makeStars() {
  const sky = $('sky');
  for (let i = 0; i < 90; i++) {
    const s = document.createElement('i');
    s.className = 'star';
    s.style.left = Math.random() * 100 + '%';
    s.style.top = Math.random() * 100 + '%';
    s.style.animationDelay = (Math.random() * 3) + 's';
    sky.appendChild(s);
  }
})();

/* ตัวเลือกแบบกระทง */
DESIGNS.forEach((d, i) => {
  const label = document.createElement('label');
  label.innerHTML =
    `<input type="radio" name="design" value="${d.id}" ${i === 0 ? 'checked' : ''}>
     <span class="thumb">${krathongSVG(d)}</span>${d.name}`;
  designList.appendChild(label);
});

wishInput.addEventListener('input', () => { wishCount.textContent = wishInput.value.length + '/80'; });

/* ---------- เก็บข้อมูลในเบราว์เซอร์ ---------- */
const KEY = 'loykrathong-v1';
function loadData() {
  try { return JSON.parse(localStorage.getItem(KEY)) || { total: 0, log: [] }; }
  catch (e) { return { total: 0, log: [] }; }
}
function saveData(data) {
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { /* ใช้งานต่อได้แม้เก็บไม่ได้ */ }
}
let data = loadData();

function renderLog() {
  totalEl.textContent = data.total;
  logList.textContent = '';
  if (!data.log.length) {
    const li = document.createElement('li');
    li.className = 'empty';
    li.textContent = 'ยังไม่มีกระทงลอย ลองลอยใบแรกได้เลย';
    logList.appendChild(li);
    return;
  }
  data.log.forEach(item => {
    const li = document.createElement('li');
    const b = document.createElement('b');
    b.textContent = item.name;
    li.append(b, ' : ' + item.wish);   // ใช้ textContent/append กัน XSS
    logList.appendChild(li);
  });
}

/* ---------- ลอยกระทง ---------- */
function floatKrathong(design, name, wish) {
  const k = document.createElement('div');
  k.className = 'kra show';
  k.tabIndex = 0;

  const lane = 22 + Math.random() * 48;            // ตำแหน่งในแม่น้ำ (% ของความสูง)
  const scale = 0.75 + (lane / 100) * 0.7;          // ยิ่งใกล้ ยิ่งใหญ่
  k.style.top = lane + '%';
  k.style.width = Math.round(110 * scale) + 'px';
  k.style.setProperty('--dur', (38 + Math.random() * 20) + 's');
  k.style.zIndex = Math.round(lane);

  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  bubble.textContent = wish;

  const inner = document.createElement('div');
  inner.className = 'kra-inner';
  inner.innerHTML = krathongSVG(design);
  inner.style.animationDelay = (-Math.random() * 3) + 's';

  const tag = document.createElement('div');
  tag.className = 'tag';
  tag.textContent = name;

  inner.appendChild(tag);
  k.append(bubble, inner);
  river.appendChild(k);

  setTimeout(() => k.classList.remove('show'), 6000);   // ข้อความอธิษฐานแสดงตอนแรก 6 วินาที
  k.addEventListener('click', () => k.classList.toggle('show'));
  k.addEventListener('animationend', e => { if (e.target === k) k.remove(); });
}

$('launchBtn').addEventListener('click', () => {
  const name = nameInput.value.trim();
  const wish = wishInput.value.trim();

  if (!name || !wish) {
    errorEl.textContent = 'กรุณากรอกชื่อและคำอธิษฐานก่อนลอยกระทง';
    errorEl.hidden = false;
    (name ? wishInput : nameInput).focus();
    return;
  }
  errorEl.hidden = true;

  const chosen = document.querySelector('input[name="design"]:checked').value;
  const design = DESIGNS.find(d => d.id === chosen);
  floatKrathong(design, name, wish);

  data.total += 1;
  data.log.unshift({ name, wish });
  data.log = data.log.slice(0, 8);
  saveData(data);
  renderLog();

  wishInput.value = '';
  wishCount.textContent = '0/80';
});

renderLog();
