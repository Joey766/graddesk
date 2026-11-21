const icons = {
  logo: 'M4 9l8-4 8 4-8 4-8-4Zm3 2v5c2 2 8 2 10 0v-5m3-2v5',
  home: 'M3.5 10 12 3.5l8.5 6.5V20h-6v-6h-5v6h-6Z',
  users: 'M16 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m20 0v-2a4 4 0 0 0-3-3.9M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0m3-4a4 4 0 0 1 0 8',
  book: 'M12 6v15m0-15C9 4 6 3.5 3 4v14c3-.5 6 0 9 2 3-2 6-2.5 9-2V4c-3-.5-6 0-9 2Z',
  settings: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm8 4h2M2 12h2m8 8v2m0-20v2m5.7 13.7 1.4 1.4M4.9 4.9l1.4 1.4m0 11.4-1.4 1.4M19.1 4.9l-1.4 1.4',
  search: 'M15.5 15.5 21 21m-3.5-10a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z',
  plus: 'M12 5v14M5 12h14',
  chevron: 'm9 5 7 7-7 7',
  down: 'm6 9 6 6 6-6',
  arrow: 'M4 12h15m-5-5 5 5-5 5',
  up: 'm6 14 6-6 6 6',
  cross: 'm6 6 12 12M18 6 6 18',
  file: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Zm0 0v6h6M8 13h8m-8 4h6',
  grid: 'M3 5h18v14H3Zm0 5h18M9 5v14m6-14v14',
  clock: 'M12 8v5l3 2m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  check: 'm5 12 4 4L19 6',
  archive: 'M3 4h18v4H3Zm2 4v12h14V8m-10 4h6',
  trash: 'M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7',
  link: 'M13 5h6v6m0-6-8 8m5 0v6H5V8h6',
  upload: 'M12 16V4m-5 5 5-5 5 5M4 16v4h16v-4',
  download: 'M12 4v12m-5-5 5 5 5-5M4 17v3h16v-3',
  clip: 'm8 12 6-6a3 3 0 0 1 4 4l-8 8a4 4 0 0 1-6-6l9-9',
  menu: 'M4 6h16M4 12h16M4 18h16',
  moon: 'M20 15A8 8 0 0 1 9 4a9 9 0 1 0 11 11Z',
  sun: 'M12 3v2m0 14v2M3 12h2m14 0h2M5 5l1.5 1.5m11 11L19 19M19 5l-1.5 1.5m-11 11L5 19m12-7a5 5 0 1 1-10 0 5 5 0 0 1 10 0Z',
  shield: 'M12 3 4 6v6c0 5 4 8 8 10 4-2 8-5 8-10V6Zm-4 9 3 3 5-6',
  edit: 'm4 15-1 6 6-1L21 8l-5-5Zm9-9 5 5',
  more: 'M5 12h.1m6.9 0h.1m6.9 0h.1',
  logout: 'M10 4H4v16h6m3-12 4 4-4 4m-4-4h12',
  columns: 'M3 5h18v14H3Zm6 0v14m6-14v14',
  alert: 'M12 8v5m0 3h.01M3 20h18L12 4Z',
};
export function icon(name, size = 18) {
  return `<svg aria-hidden="true" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round"><path d="${icons[name] || icons.file}"/></svg>`;
}
export const $ = (selector, root = document) => root.querySelector(selector);
export const esc = (value = '') => String(value ?? '').replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[char]));
export const options = (values, current) => values.map(value =>
  `<option value="${esc(value)}"${value === current ? ' selected' : ''}>${esc(value)}</option>`).join('');
export const button = (action, label, glyph, style = '', attributes = '') =>
  `<button class="btn ${style}" data-action="${action}" type="button" ${attributes}>${glyph ? icon(glyph) : ''}${esc(label)}</button>`;
export const tiny = (action, label, glyph, attributes = '') =>
  `<button class="icon-btn" type="button" data-action="${action}" title="${esc(label)}" aria-label="${esc(label)}" ${attributes}>${icon(glyph, 16)}</button>`;
export const link = (url, label, glyph, style = '') =>
  `<a class="btn ${style}" href="${esc(url)}">${icon(glyph)}${esc(label)}</a>`;
export const logo = () => `<div class="brand"><span class="brand-mark">${icon('logo', 23)}</span><span>GradDesk</span></div>`;
export const nameOf = (student) => student.profile.name || student.profile.english || student.sheet || '未命名学生';
export function avatar(student, large = false) {
  const display = nameOf(student);
  const symbol = display === '未命名学生' ? '○' : display.charAt(0).toUpperCase();
  return `<span class="avatar tint-${parseInt(student.id.slice(-2), 16) % 4}${large ? ' large' : ''}">${esc(symbol)}</span>`;
}
export function fmtTime(value) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    .format(new Date(value));
}
export function safeURL(value) {
  try {
    if (!/^https?:\/\//i.test(value)) return '';
    const url = new URL(value);
    return url.username || url.password ? '' : url.href;
  } catch {
    return '';
  }
}
export function empty(glyph, heading, text, action = '') {
  return `<div class="empty"><span class="empty-icon">${icon(glyph, 22)}</span><strong>${esc(heading)}</strong><p>${esc(text)}</p>${action}</div>`;
}
let toastTimer;
export function toast(message, error = false) {
  const node = $('#toast');
  node.className = error ? 'visible error' : 'visible';
  node.innerHTML = icon(error ? 'alert' : 'check') + `<span>${esc(message)}</span>`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { node.className = ''; }, error ? 6500 : 3600);
}
export function dialog(title, body, submit, label = '确认', danger = false) {
  const node = $('#dialog');
  const wasOpen = node.open;
  node.innerHTML = `<form class="dialog-form"><div class="dialog-head"><h2 id="dialog-title">${esc(title)}</h2>
    <button type="button" class="icon-btn dialog-close" aria-label="关闭">${icon('cross')}</button></div>
    <div class="dialog-body">${body}<div class="inline-error" role="alert" hidden></div></div>
    <div class="dialog-footer"><button type="button" class="btn dialog-close">取消</button>
    <button class="btn ${danger ? 'danger' : 'primary'}" type="submit">${esc(label)}</button></div></form>`;
  const form = $('form', node);
  const close = () => { if (!form.dataset.busy) node.close(); };
  node.oncancel = event => { if (form.dataset.busy) event.preventDefault(); };
  node.querySelectorAll('.dialog-close').forEach(btn => btn.onclick = close);
  form.onsubmit = async event => {
    event.preventDefault();
    if (form.dataset.busy) return;
    const err = $('.inline-error', form);
    err.hidden = true;
    const submitter = $('button[type=submit]', form);
    submitter.disabled = true;
    form.dataset.busy = '1';
    try {
      const result = await submit(new FormData(form), form);
      if (result !== false && form.isConnected) node.close();
    } catch (error) {
      err.textContent = error.message;
      err.hidden = false;
    } finally {
      delete form.dataset.busy;
      submitter.disabled = false;
    }
  };
  if (!wasOpen) node.showModal();
  const field = $('input:not([type=hidden]),select,textarea', form);
  if (field) field.focus();
}
export async function api(path, { method = 'GET', data } = {}) {
  const request = { method, headers: { 'X-GradDesk': '1' }, cache: 'no-store' };
  if (data instanceof FormData) request.body = data;
  else if (data !== undefined) {
    request.headers['Content-Type'] = 'application/json';
    request.body = JSON.stringify(data);
  }
  let response;
  try {
    response = await fetch('/api' + path, request);
  } catch {
    throw new Error('无法连接本机服务。请确认 GradDesk 正在运行，再重试。');
  }
  const content = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(content.error || '操作未完成。');
    error.status = response.status;
    throw error;
  }
  return content;
}
