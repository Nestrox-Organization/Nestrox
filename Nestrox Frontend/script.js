/* ============================================================
   Nestrox — Auth Page Logic
   ============================================================ */

(function () {
  'use strict';

  /* ---------- Country codes (comprehensive list with flags) ---------- */
  const COUNTRIES = [
    { name: 'Afghanistan', code: 'AF', dial: '+93', flag: '🇦🇫' },
    { name: 'Albania', code: 'AL', dial: '+355', flag: '🇦🇱' },
    { name: 'Algeria', code: 'DZ', dial: '+213', flag: '🇩🇿' },
    { name: 'Andorra', code: 'AD', dial: '+376', flag: '🇦🇩' },
    { name: 'Angola', code: 'AO', dial: '+244', flag: '🇦🇴' },
    { name: 'Antigua & Barbuda', code: 'AG', dial: '+1-268', flag: '🇦🇬' },
    { name: 'Argentina', code: 'AR', dial: '+54', flag: '🇦🇷' },
    { name: 'Armenia', code: 'AM', dial: '+374', flag: '🇦🇲' },
    { name: 'Australia', code: 'AU', dial: '+61', flag: '🇦🇺' },
    { name: 'Austria', code: 'AT', dial: '+43', flag: '🇦🇹' },
    { name: 'Azerbaijan', code: 'AZ', dial: '+994', flag: '🇦🇿' },
    { name: 'Bahamas', code: 'BS', dial: '+1-242', flag: '🇧🇸' },
    { name: 'Bahrain', code: 'BH', dial: '+973', flag: '🇧🇭' },
    { name: 'Bangladesh', code: 'BD', dial: '+880', flag: '🇧🇩' },
    { name: 'Barbados', code: 'BB', dial: '+1-246', flag: '🇧🇧' },
    { name: 'Belarus', code: 'BY', dial: '+375', flag: '🇧🇾' },
    { name: 'Belgium', code: 'BE', dial: '+32', flag: '🇧🇪' },
    { name: 'Belize', code: 'BZ', dial: '+501', flag: '🇧🇿' },
    { name: 'Benin', code: 'BJ', dial: '+229', flag: '🇧🇯' },
    { name: 'Bhutan', code: 'BT', dial: '+975', flag: '🇧🇹' },
    { name: 'Bolivia', code: 'BO', dial: '+591', flag: '🇧🇴' },
    { name: 'Bosnia & Herzegovina', code: 'BA', dial: '+387', flag: '🇧🇦' },
    { name: 'Botswana', code: 'BW', dial: '+267', flag: '🇧🇼' },
    { name: 'Brazil', code: 'BR', dial: '+55', flag: '🇧🇷' },
    { name: 'Brunei', code: 'BN', dial: '+673', flag: '🇧🇳' },
    { name: 'Bulgaria', code: 'BG', dial: '+359', flag: '🇧🇬' },
    { name: 'Burkina Faso', code: 'BF', dial: '+226', flag: '🇧🇫' },
    { name: 'Burundi', code: 'BI', dial: '+257', flag: '🇧🇮' },
    { name: 'Cabo Verde', code: 'CV', dial: '+238', flag: '🇨🇻' },
    { name: 'Cambodia', code: 'KH', dial: '+855', flag: '🇰🇭' },
    { name: 'Cameroon', code: 'CM', dial: '+237', flag: '🇨🇲' },
    { name: 'Canada', code: 'CA', dial: '+1', flag: '🇨🇦' },
    { name: 'Central African Republic', code: 'CF', dial: '+236', flag: '🇨🇫' },
    { name: 'Chad', code: 'TD', dial: '+235', flag: '🇹🇩' },
    { name: 'Chile', code: 'CL', dial: '+56', flag: '🇨🇱' },
    { name: 'China', code: 'CN', dial: '+86', flag: '🇨🇳' },
    { name: 'Colombia', code: 'CO', dial: '+57', flag: '🇨🇴' },
    { name: 'Comoros', code: 'KM', dial: '+269', flag: '🇰🇲' },
    { name: 'Congo (DRC)', code: 'CD', dial: '+243', flag: '🇨🇩' },
    { name: 'Congo (Republic)', code: 'CG', dial: '+242', flag: '🇨🇬' },
    { name: 'Costa Rica', code: 'CR', dial: '+506', flag: '🇨🇷' },
    { name: "Côte d'Ivoire", code: 'CI', dial: '+225', flag: '🇨🇮' },
    { name: 'Croatia', code: 'HR', dial: '+385', flag: '🇭🇷' },
    { name: 'Cuba', code: 'CU', dial: '+53', flag: '🇨🇺' },
    { name: 'Cyprus', code: 'CY', dial: '+357', flag: '🇨🇾' },
    { name: 'Czech Republic', code: 'CZ', dial: '+420', flag: '🇨🇿' },
    { name: 'Denmark', code: 'DK', dial: '+45', flag: '🇩🇰' },
    { name: 'Djibouti', code: 'DJ', dial: '+253', flag: '🇩🇯' },
    { name: 'Dominica', code: 'DM', dial: '+1-767', flag: '🇩🇲' },
    { name: 'Dominican Republic', code: 'DO', dial: '+1-809', flag: '🇩🇴' },
    { name: 'Ecuador', code: 'EC', dial: '+593', flag: '🇪🇨' },
    { name: 'Egypt', code: 'EG', dial: '+20', flag: '🇪🇬' },
    { name: 'El Salvador', code: 'SV', dial: '+503', flag: '🇸🇻' },
    { name: 'Equatorial Guinea', code: 'GQ', dial: '+240', flag: '🇬🇶' },
    { name: 'Eritrea', code: 'ER', dial: '+291', flag: '🇪🇷' },
    { name: 'Estonia', code: 'EE', dial: '+372', flag: '🇪🇪' },
    { name: 'Eswatini', code: 'SZ', dial: '+268', flag: '🇸🇿' },
    { name: 'Ethiopia', code: 'ET', dial: '+251', flag: '🇪🇹' },
    { name: 'Fiji', code: 'FJ', dial: '+679', flag: '🇫🇯' },
    { name: 'Finland', code: 'FI', dial: '+358', flag: '🇫🇮' },
    { name: 'France', code: 'FR', dial: '+33', flag: '🇫🇷' },
    { name: 'Gabon', code: 'GA', dial: '+241', flag: '🇬🇦' },
    { name: 'Gambia', code: 'GM', dial: '+220', flag: '🇬🇲' },
    { name: 'Georgia', code: 'GE', dial: '+995', flag: '🇬🇪' },
    { name: 'Germany', code: 'DE', dial: '+49', flag: '🇩🇪' },
    { name: 'Ghana', code: 'GH', dial: '+233', flag: '🇬🇭' },
    { name: 'Greece', code: 'GR', dial: '+30', flag: '🇬🇷' },
    { name: 'Grenada', code: 'GD', dial: '+1-473', flag: '🇬🇩' },
    { name: 'Guatemala', code: 'GT', dial: '+502', flag: '🇬🇹' },
    { name: 'Guinea', code: 'GN', dial: '+224', flag: '🇬🇳' },
    { name: 'Guinea-Bissau', code: 'GW', dial: '+245', flag: '🇬🇼' },
    { name: 'Guyana', code: 'GY', dial: '+592', flag: '🇬🇾' },
    { name: 'Haiti', code: 'HT', dial: '+509', flag: '🇭🇹' },
    { name: 'Honduras', code: 'HN', dial: '+504', flag: '🇭🇳' },
    { name: 'Hungary', code: 'HU', dial: '+36', flag: '🇭🇺' },
    { name: 'Iceland', code: 'IS', dial: '+354', flag: '🇮🇸' },
    { name: 'India', code: 'IN', dial: '+91', flag: '🇮🇳' },
    { name: 'Indonesia', code: 'ID', dial: '+62', flag: '🇮🇩' },
    { name: 'Iran', code: 'IR', dial: '+98', flag: '🇮🇷' },
    { name: 'Iraq', code: 'IQ', dial: '+964', flag: '🇮🇶' },
    { name: 'Ireland', code: 'IE', dial: '+353', flag: '🇮🇪' },
    { name: 'Israel', code: 'IL', dial: '+972', flag: '🇮🇱' },
    { name: 'Italy', code: 'IT', dial: '+39', flag: '🇮🇹' },
    { name: 'Jamaica', code: 'JM', dial: '+1-876', flag: '🇯🇲' },
    { name: 'Japan', code: 'JP', dial: '+81', flag: '🇯🇵' },
    { name: 'Jordan', code: 'JO', dial: '+962', flag: '🇯🇴' },
    { name: 'Kazakhstan', code: 'KZ', dial: '+7', flag: '🇰🇿' },
    { name: 'Kenya', code: 'KE', dial: '+254', flag: '🇰🇪' },
    { name: 'Kiribati', code: 'KI', dial: '+686', flag: '🇰🇮' },
    { name: 'Kosovo', code: 'XK', dial: '+383', flag: '🇽🇰' },
    { name: 'Kuwait', code: 'KW', dial: '+965', flag: '🇰🇼' },
    { name: 'Kyrgyzstan', code: 'KG', dial: '+996', flag: '🇰🇬' },
    { name: 'Laos', code: 'LA', dial: '+856', flag: '🇱🇦' },
    { name: 'Latvia', code: 'LV', dial: '+371', flag: '🇱🇻' },
    { name: 'Lebanon', code: 'LB', dial: '+961', flag: '🇱🇧' },
    { name: 'Lesotho', code: 'LS', dial: '+266', flag: '🇱🇸' },
    { name: 'Liberia', code: 'LR', dial: '+231', flag: '🇱🇷' },
    { name: 'Libya', code: 'LY', dial: '+218', flag: '🇱🇾' },
    { name: 'Liechtenstein', code: 'LI', dial: '+423', flag: '🇱🇮' },
    { name: 'Lithuania', code: 'LT', dial: '+370', flag: '🇱🇹' },
    { name: 'Luxembourg', code: 'LU', dial: '+352', flag: '🇱🇺' },
    { name: 'Madagascar', code: 'MG', dial: '+261', flag: '🇲🇬' },
    { name: 'Malawi', code: 'MW', dial: '+265', flag: '🇲🇼' },
    { name: 'Malaysia', code: 'MY', dial: '+60', flag: '🇲🇾' },
    { name: 'Maldives', code: 'MV', dial: '+960', flag: '🇲🇻' },
    { name: 'Mali', code: 'ML', dial: '+223', flag: '🇲🇱' },
    { name: 'Malta', code: 'MT', dial: '+356', flag: '🇲🇹' },
    { name: 'Marshall Islands', code: 'MH', dial: '+692', flag: '🇲🇭' },
    { name: 'Mauritania', code: 'MR', dial: '+222', flag: '🇲🇷' },
    { name: 'Mauritius', code: 'MU', dial: '+230', flag: '🇲🇺' },
    { name: 'Mexico', code: 'MX', dial: '+52', flag: '🇲🇽' },
    { name: 'Micronesia', code: 'FM', dial: '+691', flag: '🇫🇲' },
    { name: 'Moldova', code: 'MD', dial: '+373', flag: '🇲🇩' },
    { name: 'Monaco', code: 'MC', dial: '+377', flag: '🇲🇨' },
    { name: 'Mongolia', code: 'MN', dial: '+976', flag: '🇲🇳' },
    { name: 'Montenegro', code: 'ME', dial: '+382', flag: '🇲🇪' },
    { name: 'Morocco', code: 'MA', dial: '+212', flag: '🇲🇦' },
    { name: 'Mozambique', code: 'MZ', dial: '+258', flag: '🇲🇿' },
    { name: 'Myanmar', code: 'MM', dial: '+95', flag: '🇲🇲' },
    { name: 'Namibia', code: 'NA', dial: '+264', flag: '🇳🇦' },
    { name: 'Nauru', code: 'NR', dial: '+674', flag: '🇳🇷' },
    { name: 'Nepal', code: 'NP', dial: '+977', flag: '🇳🇵' },
    { name: 'Netherlands', code: 'NL', dial: '+31', flag: '🇳🇱' },
    { name: 'New Zealand', code: 'NZ', dial: '+64', flag: '🇳🇿' },
    { name: 'Nicaragua', code: 'NI', dial: '+505', flag: '🇳🇮' },
    { name: 'Niger', code: 'NE', dial: '+227', flag: '🇳🇪' },
    { name: 'Nigeria', code: 'NG', dial: '+234', flag: '🇳🇬' },
    { name: 'North Korea', code: 'KP', dial: '+850', flag: '🇰🇵' },
    { name: 'North Macedonia', code: 'MK', dial: '+389', flag: '🇲🇰' },
    { name: 'Norway', code: 'NO', dial: '+47', flag: '🇳🇴' },
    { name: 'Oman', code: 'OM', dial: '+968', flag: '🇴🇲' },
    { name: 'Pakistan', code: 'PK', dial: '+92', flag: '🇵🇰' },
    { name: 'Palau', code: 'PW', dial: '+680', flag: '🇵🇼' },
    { name: 'Palestine', code: 'PS', dial: '+970', flag: '🇵🇸' },
    { name: 'Panama', code: 'PA', dial: '+507', flag: '🇵🇦' },
    { name: 'Papua New Guinea', code: 'PG', dial: '+675', flag: '🇵🇬' },
    { name: 'Paraguay', code: 'PY', dial: '+595', flag: '🇵🇾' },
    { name: 'Peru', code: 'PE', dial: '+51', flag: '🇵🇪' },
    { name: 'Philippines', code: 'PH', dial: '+63', flag: '🇵🇭' },
    { name: 'Poland', code: 'PL', dial: '+48', flag: '🇵🇱' },
    { name: 'Portugal', code: 'PT', dial: '+351', flag: '🇵🇹' },
    { name: 'Qatar', code: 'QA', dial: '+974', flag: '🇶🇦' },
    { name: 'Romania', code: 'RO', dial: '+40', flag: '🇷🇴' },
    { name: 'Russia', code: 'RU', dial: '+7', flag: '🇷🇺' },
    { name: 'Rwanda', code: 'RW', dial: '+250', flag: '🇷🇼' },
    { name: 'Saint Kitts & Nevis', code: 'KN', dial: '+1-869', flag: '🇰🇳' },
    { name: 'Saint Lucia', code: 'LC', dial: '+1-758', flag: '🇱🇨' },
    { name: 'Saint Vincent', code: 'VC', dial: '+1-784', flag: '🇻🇨' },
    { name: 'Samoa', code: 'WS', dial: '+685', flag: '🇼🇸' },
    { name: 'San Marino', code: 'SM', dial: '+378', flag: '🇸🇲' },
    { name: 'São Tomé & Príncipe', code: 'ST', dial: '+239', flag: '🇸🇹' },
    { name: 'Saudi Arabia', code: 'SA', dial: '+966', flag: '🇸🇦' },
    { name: 'Senegal', code: 'SN', dial: '+221', flag: '🇸🇳' },
    { name: 'Serbia', code: 'RS', dial: '+381', flag: '🇷🇸' },
    { name: 'Seychelles', code: 'SC', dial: '+248', flag: '🇸🇨' },
    { name: 'Sierra Leone', code: 'SL', dial: '+232', flag: '🇸🇱' },
    { name: 'Singapore', code: 'SG', dial: '+65', flag: '🇸🇬' },
    { name: 'Slovakia', code: 'SK', dial: '+421', flag: '🇸🇰' },
    { name: 'Slovenia', code: 'SI', dial: '+386', flag: '🇸🇮' },
    { name: 'Solomon Islands', code: 'SB', dial: '+677', flag: '🇸🇧' },
    { name: 'Somalia', code: 'SO', dial: '+252', flag: '🇸🇴' },
    { name: 'South Africa', code: 'ZA', dial: '+27', flag: '🇿🇦' },
    { name: 'South Korea', code: 'KR', dial: '+82', flag: '🇰🇷' },
    { name: 'South Sudan', code: 'SS', dial: '+211', flag: '🇸🇸' },
    { name: 'Spain', code: 'ES', dial: '+34', flag: '🇪🇸' },
    { name: 'Sri Lanka', code: 'LK', dial: '+94', flag: '🇱🇰' },
    { name: 'Sudan', code: 'SD', dial: '+249', flag: '🇸🇩' },
    { name: 'Suriname', code: 'SR', dial: '+597', flag: '🇸🇷' },
    { name: 'Sweden', code: 'SE', dial: '+46', flag: '🇸🇪' },
    { name: 'Switzerland', code: 'CH', dial: '+41', flag: '🇨🇭' },
    { name: 'Syria', code: 'SY', dial: '+963', flag: '🇸🇾' },
    { name: 'Taiwan', code: 'TW', dial: '+886', flag: '🇹🇼' },
    { name: 'Tajikistan', code: 'TJ', dial: '+992', flag: '🇹🇯' },
    { name: 'Tanzania', code: 'TZ', dial: '+255', flag: '🇹🇿' },
    { name: 'Thailand', code: 'TH', dial: '+66', flag: '🇹🇭' },
    { name: 'Timor-Leste', code: 'TL', dial: '+670', flag: '🇹🇱' },
    { name: 'Togo', code: 'TG', dial: '+228', flag: '🇹🇬' },
    { name: 'Tonga', code: 'TO', dial: '+676', flag: '🇹🇴' },
    { name: 'Trinidad & Tobago', code: 'TT', dial: '+1-868', flag: '🇹🇹' },
    { name: 'Tunisia', code: 'TN', dial: '+216', flag: '🇹🇳' },
    { name: 'Turkey', code: 'TR', dial: '+90', flag: '🇹🇷' },
    { name: 'Turkmenistan', code: 'TM', dial: '+993', flag: '🇹🇲' },
    { name: 'Tuvalu', code: 'TV', dial: '+688', flag: '🇹🇻' },
    { name: 'Uganda', code: 'UG', dial: '+256', flag: '🇺🇬' },
    { name: 'Ukraine', code: 'UA', dial: '+380', flag: '🇺🇦' },
    { name: 'United Arab Emirates', code: 'AE', dial: '+971', flag: '🇦🇪' },
    { name: 'United Kingdom', code: 'GB', dial: '+44', flag: '🇬🇧' },
    { name: 'United States', code: 'US', dial: '+1', flag: '🇺🇸' },
    { name: 'Uruguay', code: 'UY', dial: '+598', flag: '🇺🇾' },
    { name: 'Uzbekistan', code: 'UZ', dial: '+998', flag: '🇺🇿' },
    { name: 'Vanuatu', code: 'VU', dial: '+678', flag: '🇻🇺' },
    { name: 'Vatican City', code: 'VA', dial: '+379', flag: '🇻🇦' },
    { name: 'Venezuela', code: 'VE', dial: '+58', flag: '🇻🇪' },
    { name: 'Vietnam', code: 'VN', dial: '+84', flag: '🇻🇳' },
    { name: 'Yemen', code: 'YE', dial: '+967', flag: '🇾🇪' },
    { name: 'Zambia', code: 'ZM', dial: '+260', flag: '🇿🇲' },
    { name: 'Zimbabwe', code: 'ZW', dial: '+263', flag: '🇿🇼' }
  ];

  /* ---------- DOM References ---------- */
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const tabBar     = $('.tab-bar');
  const tabs       = $$('.tab');
  const loginForm  = $('#form-login');
  const regForm    = $('#form-register');
  const countryEl  = $('#country-code');  // hidden input
  const toastBox   = $('#toast-container');

  /* ---------- Custom Country Picker ---------- */
  const trigger    = $('#country-trigger');
  const dropdown   = $('#country-dropdown');
  const searchIn   = $('#country-search');
  const listEl     = $('#country-list');
  let   selected   = COUNTRIES.find((c) => c.code === 'IN');

  function setTrigger(country) {
    trigger.querySelector('.ct-flag').textContent = country.flag;
    trigger.querySelector('.ct-dial').textContent = country.dial;
    countryEl.value = country.dial;
    selected = country;
  }

  function renderList(filter = '') {
    const q = filter.toLowerCase();
    const filtered = COUNTRIES
      .filter((c) => c.name.toLowerCase().includes(q) || c.dial.includes(q) || c.code.toLowerCase().includes(q))
      .sort((a, b) => a.name.localeCompare(b.name));

    listEl.innerHTML = '';

    if (filtered.length === 0) {
      const li = document.createElement('li');
      li.className = 'no-results';
      li.textContent = 'No countries found';
      listEl.appendChild(li);
      return;
    }

    filtered.forEach((c) => {
      const li = document.createElement('li');
      if (selected && selected.code === c.code) li.classList.add('selected');
      li.innerHTML = `<span class="cl-flag">${c.flag}</span><span class="cl-name">${c.name}</span><span class="cl-dial">${c.dial}</span>`;
      li.addEventListener('click', () => {
        setTrigger(c);
        closeDropdown();
      });
      listEl.appendChild(li);
    });
  }

  function openDropdown() {
    dropdown.classList.add('open');
    trigger.classList.add('open');
    searchIn.value = '';
    renderList();
    // scroll selected into view
    requestAnimationFrame(() => {
      const sel = listEl.querySelector('.selected');
      if (sel) sel.scrollIntoView({ block: 'center', behavior: 'instant' });
      searchIn.focus();
    });
  }

  function closeDropdown() {
    dropdown.classList.remove('open');
    trigger.classList.remove('open');
  }

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.contains('open') ? closeDropdown() : openDropdown();
  });

  searchIn.addEventListener('input', () => renderList(searchIn.value));
  searchIn.addEventListener('click', (e) => e.stopPropagation());

  // close on outside click
  document.addEventListener('click', (e) => {
    if (!dropdown.contains(e.target) && !trigger.contains(e.target)) {
      closeDropdown();
    }
  });

  // close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeDropdown();
  });

  // init trigger with default country
  setTrigger(selected);

  /* ---------- Tab / Form Switching ---------- */
  function switchTo(target) {
    const isRegister = target === 'register';

    tabs.forEach((t) => t.classList.toggle('active', t.dataset.target === target));
    tabBar.dataset.active = target;

    loginForm.classList.toggle('active', !isRegister);
    regForm.classList.toggle('active', isRegister);

    // clear all errors when switching
    $$('.error-msg').forEach((e) => { e.textContent = ''; e.classList.remove('show'); });
    $$('.input-wrap').forEach((w) => w.classList.remove('error'));
  }

  tabs.forEach((t) => t.addEventListener('click', () => switchTo(t.dataset.target)));
  $$('.switch-form').forEach((btn) => btn.addEventListener('click', () => switchTo(btn.dataset.target)));

  /* ---------- Password Visibility Toggle ---------- */
  $$('.toggle-pw').forEach((btn) => {
    btn.addEventListener('click', () => {
      const input = document.getElementById(btn.dataset.target);
      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';
      btn.classList.toggle('visible', isPassword);
    });
  });

  /* ---------- Validation Helpers ---------- */
  function showError(id, msg) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    // mark the input wrap
    const wrap = el.previousElementSibling;
    if (wrap && wrap.classList.contains('input-wrap')) wrap.classList.add('error');
    // also check sibling input-wrap (if error is after pw-strength, etc.)
    const field = el.closest('.field');
    if (field) field.querySelector('.input-wrap')?.classList.add('error');
  }

  function clearError(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = '';
    el.classList.remove('show');
    const field = el.closest('.field');
    if (field) field.querySelector('.input-wrap')?.classList.remove('error');
  }

  function clearAllErrors(prefix) {
    $$(`[id^="err-${prefix}"]`).forEach((el) => clearError(el.id));
  }

  function isValidEmail(email) {
    // Gmail format: letters, numbers, dots before @gmail.com
    return /^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(email);
  }

  function isStrongPassword(pw) {
    // min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special
    return pw.length >= 8
      && /[A-Z]/.test(pw)
      && /[a-z]/.test(pw)
      && /[0-9]/.test(pw)
      && /[^A-Za-z0-9]/.test(pw);
  }

  function passwordStrength(pw) {
    if (!pw) return 0;
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score; // 0-4
  }

  function isValidMobile(num) {
    const digits = num.replace(/\D/g, '');
    return digits.length >= 6 && digits.length <= 15;
  }

  /* ---------- Password Strength Meter ---------- */
  const pwStrengthEl = $('#pw-strength');
  const regPwInput   = $('#reg-password');

  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];

  regPwInput.addEventListener('input', () => {
    const val = regPwInput.value;
    if (val.length === 0) {
      pwStrengthEl.classList.remove('visible');
      pwStrengthEl.removeAttribute('data-level');
      return;
    }
    const level = passwordStrength(val);
    pwStrengthEl.classList.add('visible');
    pwStrengthEl.dataset.level = level;
    pwStrengthEl.querySelector('.pw-label').textContent = strengthLabels[level] || '';
  });

  /* ---------- Toast Notifications ---------- */
  function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icon = type === 'success'
      ? '<svg viewBox="0 0 24 24"><path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/></svg>'
      : '<svg viewBox="0 0 24 24"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>';

    toast.innerHTML = `${icon}<span>${message}</span>`;
    toastBox.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('out');
      toast.addEventListener('animationend', () => toast.remove());
    }, 3500);
  }

  /* ---------- Login Validation ---------- */
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    clearAllErrors('login');

    const identifier = $('#login-identifier').value.trim();
    const password   = $('#login-password').value;

    let valid = true;

    if (!identifier) {
      showError('err-login-identifier', 'Username or email is required.');
      valid = false;
    }

    if (!password) {
      showError('err-login-password', 'Password is required.');
      valid = false;
    }

    if (!valid) return;

    // Simulate login
    const btn = loginForm.querySelector('.btn-primary');
    btn.classList.add('loading');
    setTimeout(() => {
      btn.classList.remove('loading');
      window.location.href = 'dashboard.html';
    }, 1200);
  });

  /* ---------- Register Validation ---------- */
  regForm.addEventListener('submit', (e) => {
    e.preventDefault();
    clearAllErrors('reg');

    const username = $('#reg-username').value.trim();
    const email    = $('#reg-email').value.trim();
    const mobile   = $('#reg-mobile').value.trim();
    const password = $('#reg-password').value;
    const confirm  = $('#reg-confirm').value;

    let valid = true;

    // Username
    if (!username) {
      showError('err-reg-username', 'Username is required.');
      valid = false;
    } else if (username.length < 3) {
      showError('err-reg-username', 'Username must be at least 3 characters.');
      valid = false;
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      showError('err-reg-username', 'Only letters, numbers, and underscores allowed.');
      valid = false;
    }

    // Email
    if (!email) {
      showError('err-reg-email', 'Email is required.');
      valid = false;
    } else if (!isValidEmail(email)) {
      showError('err-reg-email', 'Please enter a valid Gmail address (e.g. you@gmail.com).');
      valid = false;
    }

    // Mobile
    if (!mobile) {
      showError('err-reg-mobile', 'Mobile number is required.');
      valid = false;
    } else if (!isValidMobile(mobile)) {
      showError('err-reg-mobile', 'Enter a valid mobile number (6–15 digits).');
      valid = false;
    }

    // Password
    if (!password) {
      showError('err-reg-password', 'Password is required.');
      valid = false;
    } else if (!isStrongPassword(password)) {
      showError('err-reg-password', 'Min 8 chars with uppercase, lowercase, number & special character.');
      valid = false;
    }

    // Confirm password
    if (!confirm) {
      showError('err-reg-confirm', 'Please confirm your password.');
      valid = false;
    } else if (password !== confirm) {
      showError('err-reg-confirm', 'Passwords do not match.');
      valid = false;
    }

    if (!valid) return;

    // Simulate registration
    const btn = regForm.querySelector('.btn-primary');
    btn.classList.add('loading');
    setTimeout(() => {
      btn.classList.remove('loading');
      showToast('Account created successfully!', 'success');
      regForm.reset();
      pwStrengthEl.classList.remove('visible');
      pwStrengthEl.removeAttribute('data-level');
      switchTo('login');
    }, 1400);
  });

  /* ---------- Real-time error clearing ---------- */
  const fieldMap = {
    'login-identifier': 'err-login-identifier',
    'login-password':   'err-login-password',
    'reg-username':     'err-reg-username',
    'reg-email':        'err-reg-email',
    'reg-mobile':       'err-reg-mobile',
    'reg-password':     'err-reg-password',
    'reg-confirm':      'err-reg-confirm'
  };

  Object.entries(fieldMap).forEach(([inputId, errId]) => {
    const input = document.getElementById(inputId);
    if (input) {
      input.addEventListener('input', () => clearError(errId));
    }
  });

  /* ---------- Forgot Password ---------- */
  $('#forgot-pw').addEventListener('click', (e) => {
    e.preventDefault();
    showToast('Password reset link sent to your email.', 'success');
  });

  /* ---------- Mobile: only allow digits ---------- */
  $('#reg-mobile').addEventListener('input', function () {
    this.value = this.value.replace(/[^\d]/g, '');
  });

})();
