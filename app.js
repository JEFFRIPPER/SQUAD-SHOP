(function () {
  'use strict';

  // Products and settings live in shop.json next to this page. The owner
  // edits them in the "Товары" panel; on claude.ai the page saves them back
  // through the artifact capability. Elsewhere the panel stays hidden.
  var DEFAULT_SHOP = { settings: { receiver: '', support: '' }, products: [] };

  var FAQ = [
    ['Это безопасно?', 'Мы не просим пароль, код из SMS и вход в аккаунт. Нужен только @username, на который придут звёзды. Карта вводится на странице ЮMoney, сайт её не видит.'],
    ['Когда придут звёзды?', 'После проверки оплаты, обычно в течение дня. Номер заказа покажем сразу после оплаты, по нему можно спросить о статусе.'],
    ['Можно подарить другу?', 'Да. Просто укажи @username друга вместо своего.'],
    ['Как оплатить?', 'Банковской картой или из кошелька ЮMoney. Оплата проходит на странице ЮMoney.'],
    ['Что если ошибся в @username?', 'Напиши нам до выдачи, поправим. Если звёзды уже отправлены, вернуть их нельзя, поэтому проверь имя перед оплатой.']
  ];

  var SVG = 'http://www.w3.org/2000/svg';
  var PATHS = {
    star: 'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z',
    gift: 'M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z',
    add: 'M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z',
    remove: 'M19 13H5v-2h14v2z',
    del: 'M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z',
    cart: 'M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1.003 1.003 0 0 0 20 4H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z',
    card: 'M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z',
    wallet: 'M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z',
    lock: 'M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM9 8V6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9z',
    expand: 'M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z',
    up: 'M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z',
    down: 'M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z',
    edit: 'M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a.996.996 0 0 0 0-1.41l-2.34-2.34a.996.996 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z',
    eye: 'M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z',
    eyeOff: 'M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z',
    back: 'M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z',
    photo: 'M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z',
    save: 'M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z'
  };

  var $ = function (id) { return document.getElementById(id); };
  var rub = new Intl.NumberFormat('ru-RU');
  function money(n) { return rub.format(n) + ' ₽'; }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  function icon(name, cls) {
    var s = document.createElementNS(SVG, 'svg');
    s.setAttribute('class', 'icon' + (cls ? ' ' + cls : ''));
    s.setAttribute('viewBox', '0 0 24 24');
    s.setAttribute('aria-hidden', 'true');
    var p = document.createElementNS(SVG, 'path');
    p.setAttribute('d', PATHS[name]);
    s.appendChild(p);
    return s;
  }

  function h(tag, attrs) {
    var el = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (v == null || v === false) return;
      if (k === 'text') el.textContent = v;
      else if (k.indexOf('on') === 0) el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? '' : v);
    });
    for (var i = 2; i < arguments.length; i++) {
      var c = arguments[i];
      if (c == null || c === false) continue;
      el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    }
    return el;
  }

  function plural(n, one, few, many) {
    var m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return one;
    if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
    return many;
  }
  function starsWord(n) { return plural(n, 'звезда', 'звезды', 'звёзд'); }
  function title(p) { return p.stars ? rub.format(p.stars) + ' ' + starsWord(p.stars) : p.name; }
  function rid(n) {
    var a = 'abcdefghjkmnpqrstuvwxyz23456789', s = '';
    var r = new Uint32Array(n);
    crypto.getRandomValues(r);
    for (var i = 0; i < n; i++) s += a[r[i] % a.length];
    return s;
  }

  // ---- shop data -------------------------------------------------------------
  var shop = clone(DEFAULT_SHOP);
  var localImg = {}; // image path -> object URL, for images saved in this view

  function normalize(data) {
    var out = clone(DEFAULT_SHOP);
    if (!data || typeof data !== 'object') return out;
    var s = data.settings || {};
    out.settings.receiver = String(s.receiver || '').replace(/\D/g, '');
    out.settings.support = cleanUser(s.support);
    (Array.isArray(data.products) ? data.products : []).forEach(function (p) {
      if (!p || !p.id) return;
      out.products.push({
        id: String(p.id),
        name: String(p.name || ''),
        stars: Math.max(0, parseInt(p.stars, 10) || 0),
        price: Math.max(0, parseInt(p.price, 10) || 0),
        desc: String(p.desc || ''),
        tag: String(p.tag || ''),
        gold: !!p.gold,
        image: String(p.image || ''),
        hidden: !!p.hidden
      });
    });
    return out;
  }
  function imgUrl(path) { return localImg[path] || path; }
  function visible() { return shop.products.filter(function (p) { return !p.hidden && p.price > 0; }); }
  function byId(id) { for (var i = 0; i < shop.products.length; i++) if (shop.products[i].id === id) return shop.products[i]; return null; }

  // ---- cart state (kept in this browser only) -------------------------------
  var KEY = 'squadshop.cart';
  var cart = {};
  var state = { user: '', method: 'AC' };
  try {
    var saved = JSON.parse(localStorage.getItem(KEY) || '{}');
    if (saved && saved.cart) cart = saved.cart;
    if (saved && saved.user) state.user = saved.user;
    if (saved && saved.method === 'PC') state.method = 'PC';
  } catch (e) { /* storage unavailable: start empty */ }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify({ cart: cart, user: state.user, method: state.method })); } catch (e) { /* ignore */ }
  }
  function lines() {
    return visible().filter(function (p) { return cart[p.id] > 0; }).map(function (p) { return { p: p, q: cart[p.id] }; });
  }
  function totals() {
    var sum = 0, count = 0, stars = 0, other = 0;
    lines().forEach(function (l) {
      sum += l.p.price * l.q;
      count += l.q;
      if (l.p.stars) stars += l.p.stars * l.q; else other += l.q;
    });
    return { sum: sum, count: count, stars: stars, other: other };
  }
  function totalLabel(t) {
    if (!t.other) return rub.format(t.stars) + ' ' + starsWord(t.stars);
    return t.count + ' ' + plural(t.count, 'товар', 'товара', 'товаров');
  }
  // One line of the cart holds at most this many packs, so an order stays
  // within what a single YooMoney payment can take.
  var MAX_QTY = 10;
  function setQty(id, q) {
    q = Math.max(0, Math.min(MAX_QTY, q));
    if (q) cart[id] = q; else delete cart[id];
    save();
    renderProducts();
    renderBar(true);
    if (!$('sheet').hidden && mode === 'cart') renderCart();
  }

  // ---- catalog ---------------------------------------------------------------
  function stepper(id, q) {
    return h('div', { class: 'stepper' },
      h('button', { type: 'button', class: 'ripple', 'aria-label': 'Убрать один', onclick: function () { setQty(id, q - 1); } }, icon(q > 1 ? 'remove' : 'del')),
      h('b', { 'aria-live': 'polite', text: String(q) }),
      h('button', { type: 'button', class: 'ripple', 'aria-label': 'Добавить ещё', disabled: q >= MAX_QTY, onclick: function () { setQty(id, q + 1); } }, icon('add')));
  }

  function media(p) {
    if (p.image) return h('div', { class: 'media' }, h('img', { src: imgUrl(p.image), alt: '', loading: 'lazy' }));
    var name = p.stars ? 'star' : 'gift';
    return h('div', { class: 'stars' + (p.stars ? '' : ' gifts'), 'aria-hidden': 'true' }, icon(name), icon('star'), icon('star'), icon('star'));
  }

  // Cards on screen get .live, which runs their star animation.
  var liveObs = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { e.target.classList.toggle('live', e.isIntersecting); });
  }) : null;

  var firstRender = true;
  function renderProducts() {
    var root = $('products');
    if (liveObs) liveObs.disconnect();
    root.textContent = '';
    var list = visible();
    if (!list.length) {
      root.appendChild(h('p', { class: 'grid-empty', text: loaded ? 'Товаров пока нет. Загляни позже.' : 'Загружаю товары…' }));
      return;
    }
    list.forEach(function (p, i) {
      var q = cart[p.id] || 0;
      var head = p.stars
        ? h('div', { class: 'amount' }, rub.format(p.stars), h('small', { text: starsWord(p.stars) }))
        : h('div', { class: 'pname', text: p.name });
      var note = p.desc || (p.stars ? (p.price / p.stars).toFixed(2).replace('.', ',') + ' ₽ за звезду' : '');
      root.appendChild(h('article', { class: 'product press' + (p.tag ? ' hot' : '') + (q ? ' in-cart' : '') + (firstRender ? ' enter' : ''), style: '--i:' + i },
        p.tag ? h('span', { class: 'tag' + (p.gold ? ' gold' : ''), text: p.tag }) : null,
        media(p),
        head,
        h('div', { class: 'price', text: money(p.price) }),
        note ? h('div', { class: 'per', text: note }) : null,
        h('div', { class: 'act' }, q ? stepper(p.id, q) :
          h('button', { type: 'button', class: 'btn-tonal ripple', onclick: function () { setQty(p.id, 1); toast(title(p) + ': в корзине'); } }, icon('add'), 'В корзину'))));
    });
    Array.prototype.forEach.call(root.children, function (el) { if (liveObs) liveObs.observe(el); else el.classList.add('live'); });
    firstRender = false;
  }

  function renderFaq() {
    var root = $('faq');
    root.textContent = '';
    FAQ.forEach(function (f, i) {
      var qa = h('div', { class: 'qa enter', style: '--i:' + i });
      var btn = h('button', { type: 'button', class: 'ripple', 'aria-expanded': 'false', onclick: function () {
        var open = qa.classList.toggle('open');
        btn.setAttribute('aria-expanded', String(open));
      } }, h('span', { text: f[0] }), icon('expand'));
      qa.appendChild(btn);
      qa.appendChild(h('div', { class: 'ans' }, h('div', null, h('p', { text: f[1] }))));
      root.appendChild(qa);
    });
    if (shop.settings.support) {
      // support is a username, optionally with a link suffix: THKC_SQUAD?direct
      // opens the channel's direct messages.
      root.appendChild(h('a', { class: 'btn-tonal ripple support', href: 'https://t.me/' + shop.settings.support, target: '_blank', rel: 'noopener', text: 'Написать в поддержку @' + shop.settings.support.split('?')[0] }));
    }
  }

  // ---- cart bar and badge ------------------------------------------------------
  function renderBar(bump) {
    var t = totals();
    var badge = $('cartBadge');
    badge.hidden = !t.count;
    badge.textContent = String(t.count);
    if (bump && t.count) { badge.classList.remove('pop'); void badge.offsetWidth; badge.classList.add('pop'); }
    $('cartBar').hidden = !t.count || !$('sheet').hidden;
    $('cartBarCount').textContent = String(t.count);
    $('cartBarSum').textContent = money(t.sum);
  }

  // ---- sheet -----------------------------------------------------------------
  var mode = 'cart';
  var USER_RE = /^[A-Za-z][A-Za-z0-9_]{4,31}$/;
  function cleanUser(v) { return String(v || '').trim().replace(/^(https?:\/\/)?t\.me\//i, '').replace(/^@+/, ''); }

  function field(id, label, control, hint) {
    return h('div', { class: 'field' }, h('label', { for: id, text: label }), control, hint || null);
  }

  function renderCart() {
    $('sheetTitle').textContent = 'Корзина';
    var body = $('sheetBody');
    body.textContent = '';
    var ls = lines();
    if (!ls.length) {
      body.appendChild(h('div', { class: 'empty' }, icon('cart'), h('p', { text: 'Корзина пустая' }),
        h('button', { type: 'button', class: 'btn-filled ripple', onclick: closeSheet }, 'К товарам')));
      return;
    }
    ls.forEach(function (l) {
      body.appendChild(h('div', { class: 'line' },
        l.p.image ? h('span', { class: 'lead img' }, h('img', { src: imgUrl(l.p.image), alt: '' })) : h('span', { class: 'lead' }, icon(l.p.stars ? 'star' : 'gift')),
        h('div', { class: 'body' },
          h('b', { text: title(l.p) }),
          h('span', { text: money(l.p.price) + (l.q > 1 ? ' × ' + l.q : '') })),
        stepper(l.p.id, l.q)));
    });

    var input = h('input', { id: 'user', type: 'text', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', placeholder: 'username', maxlength: '40' });
    input.value = state.user;
    var box = h('div', { class: 'input' }, h('span', { text: '@' }), input);
    var HINT = 'Твой или друга, если это подарок';
    var hint = h('p', { class: 'hint', text: HINT });
    input.addEventListener('input', function () {
      state.user = cleanUser(input.value);
      save();
      box.classList.remove('bad');
      hint.classList.remove('bad');
      hint.textContent = HINT;
    });
    body.appendChild(field('user', 'Telegram-аккаунт получателя', box, hint));

    function segBtn(code, label, ic) {
      return h('button', { type: 'button', class: 'ripple', 'aria-pressed': String(state.method === code), onclick: function () {
        state.method = code;
        save();
        renderCart();
      } }, icon(ic), label);
    }
    body.appendChild(h('div', { class: 'field' }, h('label', { text: 'Способ оплаты' }),
      h('div', { class: 'seg' }, segBtn('AC', 'Картой', 'card'), segBtn('PC', 'ЮMoney', 'wallet'))));

    var t = totals();
    body.appendChild(h('div', { class: 'total' }, h('span', { text: totalLabel(t) }), h('b', { text: money(t.sum) })));
    body.appendChild(h('button', { type: 'button', class: 'btn-filled wide ripple', onclick: function () { pay(input, box, hint); } }, icon('lock'), 'Оплатить ' + money(t.sum)));
    body.appendChild(h('p', { class: 'secure' }, icon('lock'), 'Оплата на защищённой странице ЮMoney'));
  }

  var lastFocus = null;
  function openSheet(m) {
    mode = m;
    lastFocus = document.activeElement;
    $('sheet').classList.toggle('wide-sheet', m === 'admin');
    if (m === 'admin') renderAdmin(); else renderCart();
    $('scrim').hidden = false;
    $('sheet').hidden = false;
    $('scrim').classList.remove('leave');
    $('sheet').classList.remove('leave');
    document.body.classList.add('locked');
    renderBar();
    var f = $('sheet').querySelector('[data-close]');
    if (f) f.focus({ preventScroll: true });
  }
  function closeSheet() {
    if ($('sheet').hidden) return;
    $('sheet').classList.add('leave');
    $('scrim').classList.add('leave');
    setTimeout(function () {
      $('sheet').hidden = true;
      $('scrim').hidden = true;
      document.body.classList.remove('locked');
      renderBar();
      if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
    }, 240);
  }

  // ---- payment -----------------------------------------------------------------
  function pay(input, box, hint) {
    var user = cleanUser(input.value);
    if (!USER_RE.test(user)) {
      box.classList.add('bad');
      hint.classList.add('bad');
      hint.textContent = user ? 'Такого @username быть не может: от 5 до 32 символов, латиница, цифры и _' : 'Укажи @username получателя';
      input.focus();
      return;
    }
    if (!shop.settings.receiver) {
      toast('Оплата скоро заработает: подключаем кошелёк ЮMoney');
      return;
    }
    var t = totals();
    var id = 'SQ-' + rid(6).toUpperCase();
    // The wallet's history shows the label: order, recipient and what to hand out.
    // Stars go as one total so the label fits 64 characters with any cart.
    var items = (t.stars ? [t.stars + '*'] : []).concat(lines().filter(function (l) { return !l.p.stars; })
      .map(function (l) { return l.p.id + (l.q > 1 ? 'x' + l.q : ''); })).join(',');
    try { localStorage.setItem('squadshop.last', JSON.stringify({ id: id, user: user, what: totalLabel(t), sum: t.sum })); } catch (e) { /* ignore */ }
    var fields = {
      receiver: shop.settings.receiver,
      'quickpay-form': 'button',
      paymentType: state.method,
      sum: String(t.sum),
      label: (id + ' @' + user + ' ' + items).slice(0, 64),
      successURL: location.origin + location.pathname + '?paid=' + encodeURIComponent(id)
    };
    var form = h('form', { method: 'POST', action: 'https://yoomoney.ru/quickpay/confirm', hidden: true });
    Object.keys(fields).forEach(function (k) { form.appendChild(h('input', { type: 'hidden', name: k, value: fields[k] })); });
    document.body.appendChild(form);
    form.submit();
  }

  function checkReturn() {
    var m = /[?&]paid=([^&]+)/.exec(location.search);
    if (!m) return;
    var id = decodeURIComponent(m[1]);
    var last = null;
    try { last = JSON.parse(localStorage.getItem('squadshop.last') || 'null'); } catch (e) { /* ignore */ }
    var text = $('doneText');
    text.textContent = '';
    text.appendChild(document.createTextNode('Заказ '));
    text.appendChild(h('b', { text: id }));
    if (last && last.id === id) {
      text.appendChild(document.createTextNode(': ' + last.what + ' для '));
      text.appendChild(h('b', { text: '@' + last.user }));
      cart = {};
      save();
    }
    text.appendChild(document.createTextNode('. Выдадим после проверки оплаты. Сохрани номер заказа.'));
    $('done').hidden = false;
    history.replaceState(null, '', location.pathname + location.hash);
  }

  // ---- owner panel -------------------------------------------------------------
  // Two places can save the shop: claude.ai (artifact capability) and GitHub
  // Pages, where the owner signs in with a GitHub token that may write to the
  // shop's repository. Each store takes {path: string | Blob | null}.
  var GH = { owner: 'JEFFRIPPER', repo: 'SQUAD-SHOP', branch: 'main' };
  var GH_KEY = 'squadshop.ghToken';
  var artifactNs = null;
  var store = null;
  var draft = null;          // working copy of shop while editing
  var pending = {};          // image path -> Blob, not saved yet
  var dropped = [];          // image paths to delete on save
  var editing = null;        // product id open in the form, or 'new'
  var saving = false;
  var adminMsg = '';

  function dirty() { return !!draft && (JSON.stringify(draft) !== JSON.stringify(shop) || Object.keys(pending).length > 0); }
  function markDirty() { $('dirtyDot').hidden = !dirty(); }

  function adminView() {
    if (!store) return renderLogin();
    if (!draft) draft = clone(shop);
    return editing ? renderEditor() : renderAdminList();
  }

  // ---- GitHub store ------------------------------------------------------------
  function ghToken() { try { return localStorage.getItem(GH_KEY) || ''; } catch (e) { return ''; } }
  function gh(method, path, token, body) {
    return fetch('https://api.github.com/repos/' + GH.owner + '/' + GH.repo + path, {
      method: method,
      headers: { Authorization: 'Bearer ' + token, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' },
      body: body ? JSON.stringify(body) : undefined
    }).then(function (r) {
      if (r.status === 404 && method === 'GET') return null;
      if (!r.ok) { var e = new Error('github ' + r.status); e.code = r.status === 401 || r.status === 403 ? 'not_writer' : r.status === 409 ? 'conflict' : 'github_' + r.status; throw e; }
      return r.status === 204 ? {} : r.json();
    });
  }
  function toBase64(content) {
    if (typeof content === 'string') return Promise.resolve(btoa(unescape(encodeURIComponent(content))));
    return new Promise(function (resolve, reject) {
      var fr = new FileReader();
      fr.onload = function () { resolve(String(fr.result).split(',')[1]); };
      fr.onerror = reject;
      fr.readAsDataURL(content);
    });
  }
  function githubStore(token) {
    return {
      kind: 'github',
      save: function (files) {
        // One commit per file, shop.json last so it never points at a missing photo.
        var paths = Object.keys(files).sort(function (a, b) { return (a === 'shop.json') - (b === 'shop.json'); });
        return paths.reduce(function (chain, path) {
          return chain.then(function () {
            var url = '/contents/' + path.split('/').map(encodeURIComponent).join('/');
            return gh('GET', url + '?ref=' + GH.branch, token).then(function (cur) {
              var sha = cur && cur.sha;
              if (files[path] === null) {
                return sha ? gh('DELETE', url, token, { message: 'SQUAD SHOP: убран ' + path, sha: sha, branch: GH.branch }) : null;
              }
              return toBase64(files[path]).then(function (b64) {
                var body = { message: 'SQUAD SHOP: ' + (path === 'shop.json' ? 'товары' : 'фото ' + path), content: b64, branch: GH.branch };
                if (sha) body.sha = sha;
                return gh('PUT', url, token, body);
              });
            });
          });
        }, Promise.resolve());
      }
    };
  }

  function renderLogin() {
    $('sheetTitle').textContent = 'Вход для владельца';
    var body = $('sheetBody');
    var inp = h('input', { id: 'ghToken', type: 'password', autocomplete: 'off', placeholder: 'github_pat_…' });
    var hint = h('p', { class: 'hint' });
    hint.append('Создай ключ на ', h('a', { href: 'https://github.com/settings/personal-access-tokens/new', target: '_blank', rel: 'noopener', class: 'link-inline', text: 'странице GitHub' }),
      ': доступ только к репозиторию ' + GH.repo + ', право Contents: Read and write. Ключ хранится только в этом браузере.');
    body.appendChild(h('p', { class: 'login-text', text: 'Управлять товарами может только владелец магазина. Войди ключом GitHub один раз на этом устройстве.' }));
    body.appendChild(field('ghToken', 'Ключ GitHub', h('div', { class: 'input' }, inp), hint));
    var err = h('p', { class: 'hint bad', hidden: true });
    body.appendChild(err);
    var btn = h('button', { type: 'button', class: 'btn-filled wide ripple', onclick: function () {
      var t = inp.value.trim();
      if (!t) { err.textContent = 'Вставь ключ'; err.hidden = false; return; }
      btn.disabled = true;
      gh('GET', '', t).then(function (repo) {
        if (!repo || !repo.permissions || !repo.permissions.push) throw new Error('no push');
        try { localStorage.setItem(GH_KEY, t); } catch (e) { /* key lives for this visit only */ }
        store = githubStore(t);
        renderAdmin();
      }).catch(function () {
        btn.disabled = false;
        err.textContent = 'Ключ не подошёл: проверь, что у него есть доступ к ' + GH.repo + ' с правом записи.';
        err.hidden = false;
      });
    } }, icon('lock'), 'Войти');
    body.appendChild(btn);
  }
  function renderAdmin() {
    var body = $('sheetBody');
    body.textContent = '';
    adminView();
    markDirty();
  }

  function saveBar() {
    var d = dirty();
    return h('div', { class: 'save-bar' },
      adminMsg ? h('p', { class: 'save-msg', text: adminMsg }) : null,
      h('button', { type: 'button', class: 'btn-filled wide ripple', disabled: !d || saving, onclick: publishShop },
        icon('save'), saving ? 'Сохраняю…' : d ? 'Сохранить на сайте' : 'Всё сохранено'));
  }

  function renderAdminList() {
    $('sheetTitle').textContent = 'Товары';
    var body = $('sheetBody');
    body.appendChild(h('button', { type: 'button', class: 'btn-tonal ripple add-btn', onclick: function () { editing = 'new'; adminMsg = ''; renderAdmin(); } }, icon('add'), 'Добавить товар'));
    var list = h('div', { class: 'admin-list' });
    if (!draft.products.length) list.appendChild(h('p', { class: 'hint', text: 'Товаров нет. Добавь первый.' }));
    draft.products.forEach(function (p, i) {
      function move(dir) {
        var j = i + dir;
        if (j < 0 || j >= draft.products.length) return;
        var a = draft.products;
        var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
        adminMsg = '';
        renderAdmin();
      }
      list.appendChild(h('div', { class: 'arow' + (p.hidden ? ' off' : '') },
        p.image ? h('span', { class: 'lead img' }, h('img', { src: imgUrl(p.image), alt: '' })) : h('span', { class: 'lead' }, icon(p.stars ? 'star' : 'gift')),
        h('div', { class: 'body' },
          h('b', { text: title(p) || 'Без названия' }),
          h('span', { text: money(p.price) + (p.hidden ? ' · скрыт' : '') + (p.tag ? ' · ' + p.tag : '') })),
        h('div', { class: 'arow-acts' },
          h('button', { type: 'button', class: 'mini ripple', 'aria-label': 'Выше', disabled: i === 0, onclick: function () { move(-1); } }, icon('up')),
          h('button', { type: 'button', class: 'mini ripple', 'aria-label': 'Ниже', disabled: i === draft.products.length - 1, onclick: function () { move(1); } }, icon('down')),
          h('button', { type: 'button', class: 'mini ripple', 'aria-label': p.hidden ? 'Показать' : 'Скрыть', onclick: function () { p.hidden = !p.hidden; adminMsg = ''; renderAdmin(); } }, icon(p.hidden ? 'eyeOff' : 'eye')),
          h('button', { type: 'button', class: 'mini ripple', 'aria-label': 'Изменить', onclick: function () { editing = p.id; adminMsg = ''; renderAdmin(); } }, icon('edit')))));
    });
    body.appendChild(list);

    var wallet = h('input', { id: 'setReceiver', type: 'text', inputmode: 'numeric', autocomplete: 'off', placeholder: '4100…', maxlength: '20' });
    wallet.value = draft.settings.receiver;
    wallet.addEventListener('input', function () { draft.settings.receiver = wallet.value.replace(/\D/g, ''); markDirty(); refreshSave(); });
    var sup = h('input', { id: 'setSupport', type: 'text', autocomplete: 'off', autocapitalize: 'off', placeholder: 'username', maxlength: '32' });
    sup.value = draft.settings.support;
    sup.addEventListener('input', function () { draft.settings.support = cleanUser(sup.value); markDirty(); refreshSave(); });
    body.appendChild(h('h3', { class: 'admin-sub', text: 'Настройки' }));
    body.appendChild(field('setReceiver', 'Номер кошелька ЮMoney', h('div', { class: 'input' }, wallet),
      h('p', { class: 'hint', text: 'Пока пусто, кнопка «Оплатить» не работает' })));
    body.appendChild(field('setSupport', 'Поддержка в Telegram', h('div', { class: 'input' }, h('span', { text: '@' }), sup),
      h('p', { class: 'hint', text: 'Появится кнопкой под вопросами. Для лички канала: канал?direct' })));
    if (store.kind === 'github') {
      body.appendChild(h('button', { type: 'button', class: 'text-btn ripple logout', onclick: function () {
        try { localStorage.removeItem(GH_KEY); } catch (e) { /* ignore */ }
        store = null;
        draft = null;
        renderAdmin();
      } }, icon('lock'), 'Выйти на этом устройстве'));
    }
    body.appendChild(saveBar());
  }
  function refreshSave() {
    var bar = $('sheetBody').querySelector('.save-bar');
    if (bar) bar.replaceWith(saveBar());
  }

  function renderEditor() {
    var isNew = editing === 'new';
    var src = isNew ? { id: rid(6), name: '', stars: 0, price: 0, desc: '', tag: '', gold: false, image: '', hidden: false } : null;
    if (!isNew) for (var i = 0; i < draft.products.length; i++) if (draft.products[i].id === editing) src = draft.products[i];
    if (!src) { editing = null; return renderAdminList(); }
    var p = clone(src);
    $('sheetTitle').textContent = isNew ? 'Новый товар' : 'Товар';
    var body = $('sheetBody');

    body.appendChild(h('button', { type: 'button', class: 'text-btn ripple', onclick: function () { editing = null; renderAdmin(); } }, icon('back'), 'Все товары'));

    // photo
    var preview = h('div', { class: 'photo' });
    function drawPhoto() {
      preview.textContent = '';
      if (p.image) preview.appendChild(h('img', { src: imgUrl(p.image), alt: '' }));
      else preview.appendChild(h('div', { class: 'photo-ph' }, icon('photo'), h('span', { text: 'Без фото: покажем звёзды или подарок' })));
    }
    drawPhoto();
    var file = h('input', { id: 'pPhoto', type: 'file', accept: 'image/*', class: 'visually-hidden' });
    file.addEventListener('change', function () {
      var f = file.files && file.files[0];
      if (!f) return;
      shrink(f).then(function (blob) {
        if (p.image && pending[p.image]) delete pending[p.image];
        var path = 'img/p-' + p.id + '-' + rid(4) + (blob.type === 'image/webp' ? '.webp' : '.jpg');
        pending[path] = blob;
        localImg[path] = URL.createObjectURL(blob);
        p.image = path;
        drawPhoto();
        removePhoto.hidden = false;
      }).catch(function () { toast('Не получилось открыть картинку. Попробуй JPG или PNG.'); });
    });
    var removePhoto = h('button', { type: 'button', class: 'btn-tonal ripple', hidden: !p.image, onclick: function () { p.image = ''; drawPhoto(); removePhoto.hidden = true; } }, icon('del'), 'Убрать');
    body.appendChild(h('div', { class: 'field' }, h('label', { for: 'pPhoto', text: 'Фото' }), preview,
      h('div', { class: 'photo-acts' }, h('label', { for: 'pPhoto', class: 'btn-tonal ripple' }, icon('photo'), 'Выбрать фото'), removePhoto), file));

    function textInput(id, key, ph, max, extra) {
      var inp = h('input', Object.assign({ id: id, type: 'text', autocomplete: 'off', placeholder: ph, maxlength: String(max) }, extra || {}));
      inp.value = p[key] ? String(p[key]) : '';
      return inp;
    }
    var stars = textInput('pStars', 'stars', '0', 7, { inputmode: 'numeric' });
    var name = textInput('pName', 'name', 'Например, Telegram Premium на 3 месяца', 60);
    var price = textInput('pPrice', 'price', '0', 7, { inputmode: 'numeric' });
    var desc = textInput('pDesc', 'desc', 'Строка под ценой, необязательно', 80);
    var tag = textInput('pTag', 'tag', 'Хит, Выгодно, Новинка…', 14);
    var err = h('p', { class: 'hint bad', hidden: true });

    body.appendChild(field('pStars', 'Сколько звёзд', h('div', { class: 'input' }, stars),
      h('p', { class: 'hint', text: 'Для пакета звёзд. Название и цена за звезду посчитаются сами. Для другого товара оставь 0.' })));
    body.appendChild(field('pName', 'Название', h('div', { class: 'input' }, name), h('p', { class: 'hint', text: 'Нужно, если это не звёзды' })));
    body.appendChild(field('pPrice', 'Цена, ₽', h('div', { class: 'input' }, price, h('span', { text: '₽' }))));
    body.appendChild(field('pDesc', 'Подпись', h('div', { class: 'input' }, desc)));
    body.appendChild(field('pTag', 'Бейдж', h('div', { class: 'input' }, tag)));

    function sw(id, label, key) {
      var inp = h('input', { id: id, type: 'checkbox', role: 'switch' });
      inp.checked = !!p[key];
      inp.addEventListener('change', function () { p[key] = inp.checked; });
      return h('label', { class: 'switch-row', for: id }, h('span', { text: label }), h('span', { class: 'switch' }, inp, h('i')));
    }
    body.appendChild(sw('pGold', 'Золотой бейдж', 'gold'));
    body.appendChild(sw('pHidden', 'Скрыть с витрины', 'hidden'));
    body.appendChild(err);

    var confirmDel = false;
    var delBtn = h('button', { type: 'button', class: 'btn-danger ripple', hidden: isNew, onclick: function () {
      if (!confirmDel) { confirmDel = true; delBtn.lastChild.nodeValue = 'Точно удалить? Нажми ещё раз'; return; }
      if (src.image) dropped.push(src.image);
      draft.products = draft.products.filter(function (x) { return x.id !== src.id; });
      editing = null;
      adminMsg = 'Товар удалён. Нажми «Сохранить на сайте», чтобы покупатели это увидели.';
      renderAdmin();
    } }, icon('del'), 'Удалить товар');

    body.appendChild(h('div', { class: 'editor-acts' },
      h('button', { type: 'button', class: 'btn-filled ripple', onclick: function () {
        p.stars = parseInt(stars.value.replace(/\D/g, ''), 10) || 0;
        p.price = parseInt(price.value.replace(/\D/g, ''), 10) || 0;
        p.name = name.value.trim();
        p.desc = desc.value.trim();
        p.tag = tag.value.trim();
        var problem = !p.stars && !p.name ? 'Укажи количество звёзд или название товара' : !p.price ? 'Укажи цену больше нуля' : '';
        if (problem) { err.textContent = problem; err.hidden = false; return; }
        if (src.image && src.image !== p.image) dropped.push(src.image);
        if (isNew) draft.products.push(p);
        else draft.products = draft.products.map(function (x) { return x.id === p.id ? p : x; });
        editing = null;
        adminMsg = 'Изменения готовы. Нажми «Сохранить на сайте», чтобы покупатели их увидели.';
        renderAdmin();
      } }, icon('save'), isNew ? 'Добавить' : 'Готово'),
      delBtn));
  }

  // Product photos are scaled down to 640px so the shop stays fast.
  function shrink(file) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () {
        var k = Math.min(1, 640 / Math.max(img.width, img.height));
        var c = document.createElement('canvas');
        c.width = Math.round(img.width * k);
        c.height = Math.round(img.height * k);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        c.toBlob(function (b) {
          if (b && b.type === 'image/webp') return resolve(b);
          c.toBlob(function (j) { j ? resolve(j) : reject(new Error('encode')); }, 'image/jpeg', 0.85);
        }, 'image/webp', 0.85);
      };
      img.onerror = function () { URL.revokeObjectURL(url); reject(new Error('decode')); };
      img.src = url;
    });
  }

  function publishShop() {
    if (!store || saving || !dirty()) return;
    var next = clone(draft);
    var used = {};
    next.products.forEach(function (p) { if (p.image) used[p.image] = true; });
    var files = { 'shop.json': JSON.stringify(next, null, 2) + '\n' };
    Object.keys(pending).forEach(function (path) { if (used[path]) files[path] = pending[path]; });
    dropped.forEach(function (path) { if (!used[path] && !pending[path] && path.indexOf('img/p-') === 0) files[path] = null; });
    saving = true;
    adminMsg = '';
    refreshSave();
    store.save(files).then(function () {
      shop = next;
      draft = clone(shop);
      pending = {};
      dropped = [];
      saving = false;
      adminMsg = store.kind === 'github' ? 'Сохранено. На сайте обновится примерно через минуту.' : 'Сохранено. Покупатели видят новую витрину.';
      renderProducts();
      renderFaq();
      renderBar();
      if (!$('sheet').hidden && mode === 'admin') renderAdmin(); else markDirty();
    }).catch(function (e) {
      saving = false;
      var code = e && e.code;
      adminMsg = code === 'not_writer' || code === 'not_granted' ? 'Сохранять может только владелец сайта.'
        : code === 'capability_disabled' ? 'Отсюда сохранить нельзя. Открой магазин из своего аккаунта Claude, а не по публичной ссылке.'
        : code === 'conflict' ? 'Магазин изменили в другой вкладке. Обнови страницу и внеси правку ещё раз.'
        : code === 'too_large' ? 'Слишком большая картинка. Выбери другую.'
        : 'Не сохранилось (' + (code || 'ошибка') + '). Попробуй ещё раз.';
      if (!$('sheet').hidden && mode === 'admin') renderAdmin();
    });
  }

  function setupOwner() {
    var api = window.claude;
    if (!api || typeof api.use !== 'function') {
      // GitHub Pages: the panel opens from /#admin or once a key is saved here.
      var t = ghToken();
      if (t) store = githubStore(t);
      if (t || location.hash === '#admin') $('adminBtn').hidden = false;
      return;
    }
    Promise.all([api.use('user'), api.use('artifact')]).then(function (r) {
      var user = r[0];
      artifactNs = r[1];
      if (!user || !artifactNs) return null;
      store = { kind: 'claude', save: function (files) { return artifactNs.publish(files); } };
      return user.canEdit().then(function (ok) { return ok; });
    }).then(function (ok) {
      if (ok) $('adminBtn').hidden = false;
    }).catch(function () { /* panel stays hidden */ });
  }

  // ---- snackbar ----------------------------------------------------------------
  var toastTimer;
  function toast(msg) {
    var s = $('snackbar');
    s.textContent = msg;
    s.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { s.classList.remove('show'); }, 2600);
  }

  // ---- Material 3 ripple and pressed glow -----------------------------------
  function press(e) {
    if (e.button > 0 || !e.target.closest) return;
    var card = e.target.closest('.press');
    if (!card) return;
    card.classList.add('pressed');
    function release() {
      window.removeEventListener('pointerup', release);
      window.removeEventListener('pointercancel', release);
      setTimeout(function () { card.classList.remove('pressed'); }, 120);
    }
    window.addEventListener('pointerup', release);
    window.addEventListener('pointercancel', release);
  }
  function ripple(e) {
    if (e.button > 0 || !e.target.closest) return;
    var host = e.target.closest('.ripple');
    if (!host || host.disabled) return;
    var r = host.getBoundingClientRect();
    var x = e.clientX - r.left, y = e.clientY - r.top;
    var size = 2 * Math.sqrt(Math.pow(Math.max(x, r.width - x), 2) + Math.pow(Math.max(y, r.height - y), 2));
    var wave = h('span', { class: 'wave', 'aria-hidden': 'true' });
    wave.style.width = wave.style.height = size + 'px';
    wave.style.left = (x - size / 2) + 'px';
    wave.style.top = (y - size / 2) + 'px';
    host.appendChild(wave);
    function release() {
      window.removeEventListener('pointerup', release);
      window.removeEventListener('pointercancel', release);
      wave.classList.add('release');
      setTimeout(function () { wave.remove(); }, 400);
    }
    window.addEventListener('pointerup', release);
    window.addEventListener('pointercancel', release);
  }

  // ---- wire up -------------------------------------------------------------------
  document.addEventListener('pointerdown', press);
  document.addEventListener('pointerdown', ripple);
  $('cartBtn').addEventListener('click', function () { openSheet('cart'); });
  $('cartBarBtn').addEventListener('click', function () { openSheet('cart'); });
  $('adminBtn').addEventListener('click', function () { adminMsg = ''; openSheet('admin'); });
  $('scrim').addEventListener('click', closeSheet);
  document.querySelector('[data-close]').addEventListener('click', closeSheet);
  document.querySelector('[data-close-done]').addEventListener('click', function () { $('done').hidden = true; renderProducts(); renderBar(); });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (!$('done').hidden) { $('done').hidden = true; return; }
    closeSheet();
  });

  var loaded = false;
  renderProducts();
  renderFaq();
  renderBar();
  fetch('shop.json?t=' + Date.now(), { cache: 'no-store' })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (data) { shop = normalize(data); })
    .catch(function () { toast('Не удалось загрузить товары. Обнови страницу.'); })
    .then(function () {
      loaded = true;
      Object.keys(cart).forEach(function (id) { var p = byId(id); if (!p || p.hidden) delete cart[id]; else if (cart[id] > MAX_QTY) cart[id] = MAX_QTY; });
      save();
      renderProducts();
      renderFaq();
      renderBar();
      checkReturn();
    });
  setupOwner();
})();
