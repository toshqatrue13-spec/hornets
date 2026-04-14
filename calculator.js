// ═══════════════════════════════════════════════════════
//  BRAND TIERS — множник до базової ціни
// ═══════════════════════════════════════════════════════
const BRAND_TIERS = {
  budget: {
    label: 'Бюджетний клас',
    mul: 0.85,
    color: '#888',
    brands: ['Lada','ZAZ','Zaz','Daewoo','Chery','Lifan','FAW','JAC',
             'Bogdan','Moskvich','UAZ','GAZ','Tavria','Sens',
             'Great Wall','Wuling','Sunra','BYD','Baojun']
  },
  standard: {
    label: 'Стандартний клас',
    mul: 1.0,
    color: '#aaa',
    brands: ['Toyota','Honda','Mazda','Hyundai','Kia','Nissan','Ford',
             'Chevrolet','Opel','Skoda','Renault','Peugeot','Fiat',
             'Citroën','SEAT','Cupra','Dacia','Mitsubishi','Suzuki',
             'Subaru','Isuzu','Daihatsu','SsangYong','Geely','Haval',
             'Changan','MG','Roewe','Vinfast','Rivian','GMC','RAM',
             'Dodge','Buick','Pontiac','Mercury','Saturn']
  },
  premium: {
    label: 'Преміум клас',
    mul: 1.35,
    color: '#F7A800',
    brands: ['BMW','Mercedes-Benz','Audi','Volvo','Lexus','Infiniti',
             'Acura','Cadillac','Lincoln','Land Rover','Jaguar',
             'Alfa Romeo','DS','Genesis','MINI','Saab','Polestar',
             'Lynk & Co','Lucid','Tesla','Lancia','Hummer','Fisker']
  },
  luxury: {
    label: 'Люкс клас',
    mul: 1.75,
    color: '#e8c84a',
    brands: ['Porsche','Ferrari','Lamborghini','Bentley','Rolls-Royce',
             'Bugatti','McLaren','Aston Martin','Maserati','Koenigsegg',
             'Pagani','Maybach','Brabus','Lotus','Morgan']
  }
};

// ── Мапи brand → tier ──────────────────────────────────
const BRAND_TO_TIER = {};
Object.entries(BRAND_TIERS).forEach(([key, { brands }]) => {
  brands.forEach(b => { BRAND_TO_TIER[b.toLowerCase()] = key; });
});

function getTier(brand) {
  if (!brand) return null;
  return BRAND_TO_TIER[brand.toLowerCase()] || 'standard';
}

// ═══════════════════════════════════════════════════════
//  ВАЛЮТИ
// ═══════════════════════════════════════════════════════
const RATES = { UAH: 1, USD: 41, EUR: 44 };
const SYMBOLS = { UAH: '₴', USD: '$', EUR: '€' };
let activeCur = 'UAH';

// ═══════════════════════════════════════════════════════
//  СПИСОК МАРОК
// ═══════════════════════════════════════════════════════
const ALL_MAKES = [
  'Acura','Alfa Romeo','Aston Martin','Audi','Bentley','BMW','Bugatti',
  'Buick','BYD','Cadillac','Changan','Chery','Chevrolet','Chrysler',
  'Citroën','Cupra','Dacia','Daewoo','Daihatsu','Dodge','DS','FAW',
  'Ferrari','Fiat','Fisker','Ford','Geely','Genesis','GMC','Great Wall',
  'Haval','Honda','Hummer','Hyundai','Infiniti','Isuzu','JAC','Jaguar',
  'Jeep','Kia','Koenigsegg','Lada','Lamborghini','Lancia','Land Rover',
  'Lexus','Lifan','Lincoln','Lotus','Lucid','Lynk & Co','Maserati',
  'Mazda','McLaren','Mercedes-Benz','MG','MINI','Mitsubishi','Morgan',
  'Moskvich','Nissan','Opel','Pagani','Peugeot','Polestar','Pontiac',
  'Porsche','RAM','Renault','Rivian','Roewe','Rolls-Royce','Saab',
  'SEAT','Skoda','Smart','SsangYong','Subaru','Sunra','Suzuki','Tesla',
  'Toyota','UAZ','Vinfast','Volkswagen','Volvo','Wuling','ZAZ'
].sort((a, b) => a.localeCompare(b, 'uk'));

const POPULAR = [
  'Toyota','BMW','Mercedes-Benz','Audi','Volkswagen','Ford','Honda',
  'Hyundai','Kia','Mazda','Nissan','Lexus','Skoda','Renault','Peugeot',
  'Opel','Chevrolet','Jeep','Land Rover','Volvo','Porsche','Subaru',
  'Mitsubishi','Suzuki','Tesla','Lada','Alfa Romeo','Fiat','Geely','Haval'
];

// ═══════════════════════════════════════════════════════
//  STATE
// ═══════════════════════════════════════════════════════
let selectedBrand = null;
let selectedMul   = null;
let selectedBase  = null;

// ═══════════════════════════════════════════════════════
//  DOM
// ═══════════════════════════════════════════════════════
const elSearch   = document.getElementById('brand-search');
const elClear    = document.getElementById('brand-clear');
const elDropdown = document.getElementById('brand-dropdown');
const elPopular  = document.getElementById('brand-popular');
const elSelected = document.getElementById('brand-selected');
const elSelName  = document.getElementById('brand-selected-name');
const elDeselect = document.getElementById('brand-deselect');
const carOpts    = document.querySelectorAll('#car-options .calc-opt');
const svcOpts    = document.querySelectorAll('#service-options .calc-opt');
const elPrice    = document.getElementById('result-price');
const elBreak    = document.getElementById('result-breakdown');
const elTier     = document.getElementById('result-tier');
const elOrderBtn = document.getElementById('calc-order-btn');
const elReset    = document.getElementById('calc-reset');
const curBtns    = document.querySelectorAll('.cur-btn');

// ═══════════════════════════════════════════════════════
//  POPULAR CHIPS
// ═══════════════════════════════════════════════════════
POPULAR.forEach(name => {
  const chip = document.createElement('button');
  chip.type = 'button';
  chip.className = 'brand-chip';
  chip.textContent = name;
  // show tier color hint
  const tier = getTier(name);
  if (tier) chip.dataset.tier = tier;
  chip.addEventListener('click', () => selectBrand(name));
  elPopular.appendChild(chip);
});

// ═══════════════════════════════════════════════════════
//  SEARCH
// ═══════════════════════════════════════════════════════
elSearch.addEventListener('input', () => {
  const q = elSearch.value.trim();
  elClear.style.display = q ? 'flex' : 'none';
  renderDropdown(q);
});

elSearch.addEventListener('focus', () => {
  if (elSearch.value.trim()) renderDropdown(elSearch.value.trim());
});

elSearch.addEventListener('blur', () => {
  setTimeout(() => { elDropdown.style.display = 'none'; }, 150);
});

function renderDropdown(q) {
  if (!q) { elDropdown.style.display = 'none'; return; }

  const matches = ALL_MAKES
    .filter(m => m.toLowerCase().includes(q.toLowerCase()))
    .slice(0, 10);

  if (!matches.length) {
    elDropdown.innerHTML = '<div class="brand-dd-empty">Нічого не знайдено</div>';
  } else {
    elDropdown.innerHTML = matches.map(m => {
      const i  = m.toLowerCase().indexOf(q.toLowerCase());
      const hl = m.slice(0, i)
               + '<mark>' + m.slice(i, i + q.length) + '</mark>'
               + m.slice(i + q.length);
      const tier = getTier(m);
      const tierLabel = tier ? BRAND_TIERS[tier].label : '';
      return `<button type="button" class="brand-dd-item" data-name="${m}">
                <span>${hl}</span>
                <span class="dd-tier" data-tier="${tier}">${tierLabel}</span>
              </button>`;
    }).join('');

    elDropdown.querySelectorAll('.brand-dd-item').forEach(btn => {
      btn.addEventListener('mousedown', e => {
        e.preventDefault();
        selectBrand(btn.dataset.name);
        elSearch.value = '';
        elClear.style.display = 'none';
        elDropdown.style.display = 'none';
      });
    });
  }
  elDropdown.style.display = 'block';
}

elClear.addEventListener('click', () => {
  elSearch.value = '';
  elClear.style.display = 'none';
  elDropdown.style.display = 'none';
  elSearch.focus();
});

// ═══════════════════════════════════════════════════════
//  SELECT / DESELECT BRAND
// ═══════════════════════════════════════════════════════
function selectBrand(name) {
  selectedBrand = name;
  document.querySelectorAll('.brand-chip').forEach(c =>
    c.classList.toggle('active', c.textContent === name)
  );
  elSelName.textContent    = name;
  elSelected.style.display = 'inline-flex';
  updateResult();
}

elDeselect.addEventListener('click', () => {
  selectedBrand = null;
  elSelected.style.display = 'none';
  elSelName.textContent = '';
  document.querySelectorAll('.brand-chip').forEach(c => c.classList.remove('active'));
  elSearch.value = '';
  updateResult();
});

// ═══════════════════════════════════════════════════════
//  CAR TYPE & SERVICE
// ═══════════════════════════════════════════════════════
carOpts.forEach(btn => {
  btn.addEventListener('click', () => {
    carOpts.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedMul = parseFloat(btn.dataset.mul);
    updateResult();
  });
});

svcOpts.forEach(btn => {
  btn.addEventListener('click', () => {
    svcOpts.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedBase = parseInt(btn.dataset.base);
    updateResult();
  });
});

// ═══════════════════════════════════════════════════════
//  CURRENCY
// ═══════════════════════════════════════════════════════
curBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    curBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeCur = btn.dataset.cur;
    updateResult();
  });
});

function formatPrice(uah) {
  const rate = RATES[activeCur];
  const sym  = SYMBOLS[activeCur];
  const val  = Math.round(uah / rate);
  // round nicely
  const step = activeCur === 'UAH' ? 100 : 5;
  const rounded = Math.round(val / step) * step;
  return `${sym}\u202F${rounded.toLocaleString('uk-UA')}`;
}

// ═══════════════════════════════════════════════════════
//  CALCULATE & RENDER
// ═══════════════════════════════════════════════════════
function updateResult() {
  if (!selectedMul || !selectedBase) return;

  const tierKey  = getTier(selectedBrand);
  const tierMul  = tierKey ? BRAND_TIERS[tierKey].mul : 1.0;
  const tierData = tierKey ? BRAND_TIERS[tierKey] : null;

  const baseUAH  = Math.round(selectedBase * selectedMul * tierMul / 100) * 100;
  const toUAH    = Math.round(baseUAH * 1.2 / 100) * 100;

  elPrice.innerHTML =
    `${formatPrice(baseUAH)} <span class="price-sep">—</span> ${formatPrice(toUAH)}`;
  elPrice.classList.add('has-price');

  // breakdown
  const carName = document.querySelector('#car-options .calc-opt.active .opt-name')?.textContent || '';
  const svcName = document.querySelector('#service-options .calc-opt.active .opt-name')?.textContent || '';
  const brand   = selectedBrand ? selectedBrand + ' · ' : '';
  elBreak.textContent = brand + carName + (carName && svcName ? ' · ' : '') + svcName;

  // tier badge
  if (tierData && selectedBrand) {
    elTier.innerHTML =
      `<span class="tier-badge" style="color:${tierData.color};border-color:${tierData.color}">
        ${tierData.label}
      </span>`;
  } else {
    elTier.innerHTML = '';
  }

  elOrderBtn.style.display = 'inline-block';
  elReset.style.display    = 'inline-block';
}

// ── Reset all ──────────────────────────────────────────
elReset.addEventListener('click', () => {
  // brand
  selectedBrand = null;
  elSelected.style.display = 'none';
  elSelName.textContent    = '';
  elSearch.value           = '';
  elClear.style.display    = 'none';
  document.querySelectorAll('.brand-chip').forEach(c => c.classList.remove('active'));

  // car type & service
  selectedMul  = null;
  selectedBase = null;
  carOpts.forEach(b => b.classList.remove('active'));
  svcOpts.forEach(b => b.classList.remove('active'));

  // result
  elPrice.textContent      = '—';
  elPrice.classList.remove('has-price');
  elBreak.textContent      = '';
  elTier.innerHTML         = '';
  elOrderBtn.style.display = 'none';
  elReset.style.display    = 'none';

  // scroll back to calculator top
  document.getElementById('calculator').scrollIntoView({ behavior: 'smooth', block: 'start' });
});
