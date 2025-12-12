// simplified renderer for the Instax catalog

// =========================
// Utils
// =========================
function getLang(){
  return localStorage.getItem('site-lang')
    || (navigator.language && navigator.language.startsWith('uz') ? 'uz'
    : (navigator.language && navigator.language.startsWith('en') ? 'en' : 'ru'));
}

function setLang(l){
  localStorage.setItem('site-lang', l);
  renderAll();
}

function formatPrice(v){
  if(!v && v!==0) return '';
  return v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' UZS';
}

function isInteractiveTarget(t){
  return !!t.closest('a,button,input,select,textarea,label');
}

function makeCardClickable(card, href){
  card.dataset.href = href;
  card.style.cursor = 'pointer';
  card.addEventListener('click', (e)=>{
    if(isInteractiveTarget(e.target)) return;
    window.location.href = card.dataset.href;
  });
}

function imagesHtml(images, alt){
  const list = (images || []);
  return list.map((im, idx) =>
    `<img src="${im}" alt="${alt || ''}"
      style="width:100%;height:100%;object-fit:cover;display:${idx===0?'block':'none'}">`
  ).join('');
}

// =========================
// Rendering: Featured
// =========================
function renderFeatured(){
  const cont = document.getElementById('featured-grid');
  if(!cont) return;

  cont.innerHTML = '';
  const list = window.PRODUCTS.slice(0, 6);
  const lang = getLang();

  list.forEach(p=>{
    const div = document.createElement('div');
    div.className = 'product';

    div.innerHTML = `
      <div class="image">
        <img src="${(p.images && p.images[0]) || ''}" alt="${p.name?.en || ''}">
      </div>
      <div style="font-weight:700;margin-top:6px">${p.name[lang]}</div>
      <div style="color:var(--muted);font-size:14px">${p.desc[lang]}</div>
      <div class="meta">
        <div class="price">${formatPrice(p.price)}</div>
        <a class="btn" href="product.html?id=${p.id}">Подробнее</a>
      </div>
    `;

    cont.appendChild(div);
  });

  attachProductCardHandlers();
}

// =========================
// Rendering: Grid
// =========================
function renderProductsGrid(filterText = '', category = 'all'){
  const grid = document.getElementById('products-grid');
  if(!grid) return;

  grid.innerHTML = '';
  const lang = getLang();
  const q = (filterText || '').toLowerCase();

  const list = window.PRODUCTS.filter(p =>
    (category === 'all' || p.category === category) &&
    (
      p.name[lang].toLowerCase().includes(q) ||
      p.desc[lang].toLowerCase().includes(q)
    )
  );

  if(list.length === 0){
    grid.innerHTML = '<div style="grid-column:1/-1;color:var(--muted)">No products found</div>';
    return;
  }

  list.forEach(p=>{
    const el = document.createElement('div');
    el.className = 'product';

    el.innerHTML = `
      <div class="image">
        ${imagesHtml(p.images, p.name?.en)}
      </div>

      <div style="display:flex;justify-content:space-between;align-items:center">
        <div style="font-weight:700">${p.name[lang]}</div>
      </div>

      <div style="color:var(--muted);font-size:14px">${p.desc[lang]}</div>

      <div style="font-size:13px;color:var(--muted);margin-top:6px">
        ${p.availability_note[getLang()]}
      </div>

      <div class="meta">
        <div class="price">${formatPrice(p.price)}</div>
        <div style="display:flex;gap:8px">
          <a class="btn"
             href="https://t.me/instax_uzbekistan?text=Здравствуйте!%20Хочу%20заказать%20${encodeURIComponent(p.name.ru)}"
             target="_blank" rel="noopener">
             Заказать
          </a>
        </div>
      </div>
    `;

    // ✅ Вся карточка кликабельна
    makeCardClickable(el, `product.html?id=${p.id}`);

    grid.appendChild(el);
  });

  attachProductCardHandlers();
}

// =========================
// Interactions: Cards (hover + tap)
// =========================
function attachProductCardHandlers(){
  document.querySelectorAll('.product').forEach(card=>{
    const imgs = Array.from(card.querySelectorAll('.image img'));
    if(imgs.length <= 1) return;

    let hoverInterval = null;
    let idx = 0;

    function show(i){
      imgs.forEach((im, k) => im.style.display = (k === i ? 'block' : 'none'));
    }

    // ПК: автолистание при наведении
    card.addEventListener('mouseenter', ()=>{
      hoverInterval = setInterval(()=>{
        idx = (idx + 1) % imgs.length;
        show(idx);
      }, 900);
    });

    card.addEventListener('mouseleave', ()=>{
      if(hoverInterval) clearInterval(hoverInterval);
      hoverInterval = null;
      idx = 0;
      show(0);
    });

    // Телефон: тап/клик по картинке листает и НЕ уводит по карточке
    const box = card.querySelector('.image');
    if(box){
      const next = ()=>{
        idx = (idx + 1) % imgs.length;
        show(idx);
      };

      box.addEventListener('click', (e)=>{
        e.stopPropagation();
        next();
      });

      box.addEventListener('touchstart', (e)=>{
        e.stopPropagation();
        next();
      }, { passive: true });
    }
  });
}

// =========================
// Rendering: Product Page
// =========================
function renderProductPage(){
  const container = document.getElementById('product-container');
  if(!container) return;

  const params = new URLSe
