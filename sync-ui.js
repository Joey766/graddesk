import { esc, fmtTime, icon } from './ui.js';

export function syncChip(sync) {
  const states = { synced: ['已同步', 'green'], waiting: ['等待 Excel', 'amber'], working: ['正在同步', 'blue'], error: ['同步失败', 'red'] };
  const [label, tone] = states[sync.state] || states.waiting;
  return `<span class="sync-chip tone-${tone} ${sync.state === 'working' ? 'pulsing' : ''}" title="${esc(sync.error || fmtTime(sync.synced))}">
    <span></span>${label}</span>`;
}
export function syncNotice(sync) {
  if (!sync.error) return '';
  return `<div class="notice ${sync.state === 'error' ? 'notice-error' : ''}" role="status">${icon('alert', 17)}
    <div><strong>${sync.state === 'error' ? '暂时无法同步工作簿' : '等待 Excel 保存完成'}</strong><p>${esc(sync.error)}${sync.synced ? ' · 仍显示 ' + fmtTime(sync.synced) + ' 的数据' : ''}</p></div></div>`;
}

