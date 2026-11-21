import { button, empty, esc, fmtTime, icon, options, safeURL } from './ui.js';
import { syncChip, syncNotice } from './sync-ui.js';

export const regions = ['香港', '新加坡', '英国', '澳大利亚'];
const english = ['Hong Kong', 'Singapore', 'United Kingdom', 'Australia'];
export const initialCatalogView = (region = regions[0]) => ({
  region, school: '', faculty: '', program: '', query: '', category: '', degree: '', caseLimit: 20,
});
export function decodeCatalogPath(path) {
  const [, region, school, item, group] = path.split('/');
  try {
    const decoded = decodeURIComponent(region || '');
    if (!regions.includes(decoded)) return initialCatalogView();
    const view = initialCatalogView(decoded);
    return { ...view, school: decodeURIComponent(school || ''),
      faculty: item === 'faculty' ? decodeURIComponent(group || '') : '',
      program: item === 'faculty' ? '' : decodeURIComponent(item || '') };
  } catch {
    return initialCatalogView();
  }
}
export function catalogPath(view) {
  const parts = ['library', view.region, view.school].filter(Boolean);
  if (view.program) parts.push(view.program);
  else if (view.school && view.faculty) parts.push('faculty', view.faculty);
  return parts.map(encodeURIComponent).join('/');
}
const label = row => row.zh || row.name;
const normalized = value => (value ?? '').normalize('NFKC').toLocaleLowerCase().replace(/[’‘]/g, "'");
const lookup = (row, query) => [row.zh, row.name, row.city, row.region, row.category, row.id].some(value => normalized(value).includes(query));
const noFaculty = 'unclassified';
const unitsAt = (data, school) => (data.faculties ?? []).filter(row => row.school === school.id);
const programUnits = program => [...new Set([program.faculty, ...(program.other_faculties || '').split(';')
  .map(id => id.trim())].filter(Boolean))];
const majorCategories = ['理科', '工科', '商科', '社科'];
const categoryAliases = {
  '泛商科': '商科', '工程': '工科', '数学与统计': '理科', '物理': '理科', '生命科学': '理科',
  '计算机': '理科', '环境': '理科', '数据科学': '理科', '传播': '社科',
};
const majorCategory = category => categoryAliases[category] || category;
function facultyGroups(data, school) {
  const units = unitsAt(data, school).map(row => ({
    id: row.id, title: label(row), name: row.name, zh: row.zh, kind: row.kind, programs: [],
  }));
  const missing = { id: noFaculty, title: '未分类', kind: '', programs: [] };
  const map = new Map(units.map(unit => [unit.id, unit]));
  for (const program of data.programs) {
    if (program.school !== school.id) continue;
    const affiliations = programUnits(program).map(id => map.get(id)).filter(Boolean);
    for (const group of affiliations.length ? affiliations : [missing]) group.programs.push(program);
  }
  return missing.programs.length ? [...units, missing] : units;
}
const facultyFor = (groups, view) => groups.find(group => group.id === view.faculty) ??
  groups.find(group => group.programs.length) ?? groups[0];
function facultyTabs(groups, view) {
  if (!groups.length) return '';
  const active = facultyFor(groups, view);
  return `<details class="panel faculty-selector" open>
    <summary><strong>学院与学科</strong><span class="muted">${groups.filter(group => group.id !== noFaculty).length} 个院系或分类</span></summary>
    <nav class="faculty-tabs" aria-label="选择院系或学科">${groups.map(group =>
      `<button type="button" class="faculty-tab" aria-pressed="${active?.id === group.id}"
        data-action="catalog-faculty" data-id="${esc(group.id)}"><span>${esc(group.title)}</span><small>${group.programs.length}</small></button>`
    ).join('')}</nav></details>`;
}
const missing = value => value ? esc(value) : '<span class="missing-value">待补充</span>';
const rank = school => school.rank ? (school.rank.startsWith('=') ? '并列 #' + school.rank.slice(1) : '#' + school.rank) : '';
const rankNumber = value => Number(value.replace(/^=/, '')) || Infinity;
const sortSchool = (a, b) => rankNumber(a.rank) - rankNumber(b.rank) || a.name.localeCompare(b.name);
const knownInitials = {
  'hk-hku': 'HKU', 'hk-cuhk': 'CUHK', 'hk-hkust': 'HKUST', 'hk-polyu': 'PolyU', 'hk-cityu': 'CityUHK',
  'sg-nus': 'NUS', 'sg-ntu': 'NTU', 'sg-sutd': 'SUTD', 'uk-ucl': 'UCL', 'uk-lse': 'LSE',
  'uk-imperial': 'Imperial', 'uk-kcl': 'KCL', 'au-anu': 'ANU', 'au-unsw': 'UNSW', 'au-uq': 'UQ',
  'au-uwa': 'UWA', 'au-unimelb': 'UniMelb', 'au-sydney': 'USYD',
};
const monogram = school => knownInitials[school.id] || school.name.replace(/^The /i, '').split(/[\s,–-]+/).filter(word => !/^(of|at|and|in|the)$/i.test(word))
  .slice(0, 3).map(word => word[0]).join('').toUpperCase();
const external = (url, title, small = false) => safeURL(url)
  ? `<a class="btn ${small ? 'small' : ''}" href="${esc(safeURL(url))}" target="_blank" rel="noopener noreferrer">${icon('link', 16)}${esc(title)}</a>`
  : '<span class="missing-value">官网待补充</span>';

export function catalogStatus(status) {
  return `<div class="catalog-status">${syncChip(status)}<span>最近同步 ${fmtTime(status.synced)}</span>
  ${status.error && status.revision ? '<a href="/api/catalog/backup">下载最近有效备份</a>' : ''}</div>`;
}

export function catalogView(data, view) {
  const school = data.schools.find(row => row.id === view.school);
  const program = data.programs.find(row => row.id === view.program && row.school === school?.id);
  const programUnit = program && unitsAt(data, school).find(row => row.id === program.faculty);
  const title = program ? program.name : school ? label(school) : '学校与专业';
  const region = school?.region || view.region;
  const controls = school
    ? `<nav class="catalog-crumb" aria-label="学校专业目录路径">
      ${button('catalog-region', region, '', 'subtle small', `data-id="${esc(region)}"`)}${icon('chevron', 13)}
      ${program ? button('catalog-school', label(school), '', 'subtle small', `data-id="${esc(school.id)}"`) +
        icon('chevron', 13) + (programUnit ? button('catalog-faculty', label(programUnit), '', 'subtle small',
          `data-id="${esc(programUnit.id)}"`) + icon('chevron', 13) : '') + '<strong>专业详情</strong>' : '<strong>学校详情</strong>'}</nav>` : '';
  return `<div class="page catalog-page animate-in">
    ${controls}
    <header class="catalog-hero${school ? ' catalog-detail-hero' : ''}">
      ${school ? `<span class="school-emblem tone-cat-${regions.indexOf(region)}">${icon(program ? 'book' : 'logo', 27)}</span>` : ''}
      <div class="catalog-hero-copy">
        ${school ? `<p class="catalog-eyebrow">${esc(region)}${school.city && school.city !== region ? ' · ' + esc(school.city) : ''}${program ? ' · ' + esc(programUnit ? label(programUnit) : program.category) : ''}</p>` : ''}
        <h1>${esc(title)}</h1>
        <p>${program ? esc(program.zh || '中文名称待补充') : school ? esc(school.name) : (data.publicEdition ? '按地区浏览大学和硕士专业。' : '按地区浏览大学、硕士专业和历史录取案例。')}</p>
      </div>
      <div class="catalog-hero-action">
        ${program ? external(program.url, '官方来源') : school ? external(school.url, '学校官网') : data.publicEdition ? '' : button('catalog-workbook', '打开专业库 Excel', 'grid', 'primary')}
        ${data.publicEdition ? `<span class="muted">数据更新 ${esc(data.updated)}</span>` : `<div id="catalog-sync">${catalogStatus(data.status)}</div>`}
      </div>
    </header>
    ${data.publicEdition ? '' : `<div id="catalog-notice">${syncNotice(data.status)}</div>`}
    ${!school ? directoryControls(data, view) : !program ? schoolControls(data, school, view) : ''}
    <div id="catalog-results">${catalogResults(data, view)}</div>
  </div>`;
}

function directoryControls(data, view) {
  const counts = new Map(regions.map(region => [region, { schools: 0, programs: 0 }]));
  const locations = new Map();
  for (const school of data.schools) {
    counts.get(school.region).schools++;
    locations.set(school.id, school.region);
  }
  for (const program of data.programs) counts.get(locations.get(program.school)).programs++;
  return `<nav class="catalog-regions" aria-label="国家或地区">${regions.map((name, index) => {
    const count = counts.get(name);
    const selected = name === view.region;
    return `<button class="region-tab ${selected ? 'selected' : ''}" type="button" data-action="catalog-region" data-id="${name}" aria-pressed="${selected}">
      <span><strong>${english[index]}</strong><small>${name}</small></span>
      <span class="region-count">${count.schools} 所 · ${count.programs} 个专业</span></button>`;
  }).join('')}</nav>
    ${filters(view, data.programs.filter(program => locations.get(program.school) === view.region), '搜索本地区学校或专业')}`;
}
function filters(view, programs, placeholder) {
  const degrees = [...new Set(programs.map(program => program.degree).filter(Boolean))].sort();
  return `<div class="catalog-filters">
    <label class="search catalog-search">${icon('search', 18)}<input id="catalog-search" type="search" placeholder="${placeholder}" aria-label="${placeholder}" value="${esc(view.query)}"></label>
    <select id="catalog-category" aria-label="按专业分类筛选"><option value="">所有专业分类</option>${options(majorCategories, view.category)}</select>
    <select id="catalog-degree" aria-label="按学位类型筛选"><option value="">所有学位</option>${options(degrees, view.degree)}</select>
  </div>`;
}
function schoolControls(data, school, view) {
  const groups = facultyGroups(data, school);
  return `${facultyTabs(groups, view)}
    ${filters(view, data.programs.filter(program => program.school === school.id), '搜索本校专业')}`;
}
function schoolCard(school, count, units) {
  return `<button class="school-card" type="button" data-action="catalog-school" data-id="${esc(school.id)}" aria-label="${esc(label(school))}">
    <span class="school-card-top"><span class="school-emblem tone-cat-${regions.indexOf(school.region)}">${esc(monogram(school))}</span>
      ${rank(school) ? `<span class="school-rank">${esc(rank(school))}</span>` : ''}</span>
    <strong>${esc(school.name)}</strong>
    ${school.zh ? `<span class="school-en">${esc(school.zh)}</span>` : ''}
    <span class="school-card-bottom"><span>${esc(school.region)}</span><span>${units} 个院系或分类 · ${count} 个专业 ${icon('chevron', 15)}</span></span>
  </button>`;
}
function programCard(program, school, group) {
  const url = safeURL(program.url);
  return `<div class="catalog-program-row">
    <button class="catalog-program" type="button" data-action="catalog-program" data-id="${esc(program.id)}">
      <span class="program-titles"><strong>${esc(program.name)}</strong>
        ${program.zh ? `<small>${esc(program.zh)}</small>` : ''}
        <small>${esc(school.name)} · ${esc(group || '未分类')}</small></span>
      <span class="program-tags"><span class="status-chip tone-blue">${esc(majorCategory(program.category))}</span>
        ${program.degree ? `<small>${esc(program.degree)}</small>` : ''}</span>
      ${icon('chevron', 18)}</button>
    ${url ? `<a class="program-source" href="${esc(url)}" target="_blank" rel="noopener noreferrer"
      title="官方来源" aria-label="${esc(program.name)} 官方来源">${icon('link', 16)}</a>` : ''}
  </div>`;
}
export function catalogResults(data, view) {
  const school = data.schools.find(row => row.id === view.school);
  const program = data.programs.find(row => row.id === view.program && row.school === school?.id);
  if (school && program) return programDetail(data, program, school, view.caseLimit);
  const q = normalized(view.query.trim());
  const { category, degree } = view;
  const hasFilters = Boolean(q || category || degree);
  const matchesFilters = row => (!category || majorCategory(row.category) === category) &&
    (!degree || row.degree === degree);
  if (school) {
    const groups = facultyGroups(data, school);
    const active = facultyFor(groups, view);
    const results = (!view.faculty && hasFilters ? groups : [active]).filter(Boolean).map(group => ({
      ...group, matches: group.programs.filter(p => matchesFilters(p) &&
        (lookup(p, q) || lookup(group, q))),
    }));
    if (!results.some(group => group.matches.length)) return empty('book',
      hasFilters ? '没有匹配的专业' : '该院系的项目待补充',
      hasFilters ? '试试其他关键词或分类。' : (data.publicEdition ? '该院系暂无已发布的专业。' : '可在专业库 Excel 的 Programs 中添加项目。'));
    return results.filter(group => group.matches.length).map(group => `<section class="faculty-results">
      <div class="catalog-section-heading"><div><h2>${esc(group.title)}</h2>${group.zh && group.name ? `<p class="muted">${esc(group.name)}</p>` : ''}
      </div><span>${group.matches.length} 个专业 ${group.kind === 'Subject category' ? '· 学科分类' : ''}</span></div>
      <div class="catalog-programs">${group.matches.map(row => programCard(row, school, group.title)).join('')}</div>
      </section>`).join('');
  }
  const schoolsById = new Map(data.schools.filter(row => row.region === view.region).map(row => [row.id, row]));
  const unitsById = new Map((data.faculties ?? []).map(row => [row.id, row]));
  const matchingPrograms = data.programs.filter(p => schoolsById.has(p.school) && matchesFilters(p) &&
    (lookup(p, q) || programUnits(p).some(id => lookup(unitsById.get(id) ?? {}, q))));
  const allCounts = new Map();
  for (const p of data.programs) allCounts.set(p.school, (allCounts.get(p.school) || 0) + 1);
  const byProgram = new Set(matchingPrograms.map(p => p.school));
  const schools = [...schoolsById.values()].filter(s => byProgram.has(s.id) ||
    (!category && !degree && lookup(s, q))).sort(sortSchool);
  if (!schools.length) return empty('search', '没有匹配的学校或专业', '试试其他关键词、地区或专业分类。');
  const first = schools[0];
  const allSameSource = schools.every(s => s.edition === first.edition && s.source === first.source);
  return `<div class="catalog-section-heading"><h2>${q ? '搜索结果' : esc(view.region + '院校')}</h2><span>${schools.length} 所学校</span>
    ${!q && allSameSource && first.source ? external(first.source, first.edition, true) : ''}</div>
    ${q && matchingPrograms.length ? `<div class="catalog-programs catalog-matches">${matchingPrograms.map(p => programCard(p, schoolsById.get(p.school),
      programUnits(p).map(id => unitsById.get(id)).filter(Boolean).map(label).join(' / '))).join('')}</div>` : ''}
    <div class="school-grid">${schools.map(row => schoolCard(row, allCounts.get(row.id) || 0, unitsAt(data, row).length)).join('')}</div>`;
}
function programDetail(data, program, school, limit) {
  const cases = (data.cases ?? []).filter(row => row.program === program.id);
  const units = unitsAt(data, school).filter(row => programUnits(program).includes(row.id));
  const tone = { Admit: 'green', Reject: 'red', Waitlist: 'amber' };
  return `<div class="catalog-program-detail">
    <section class="panel catalog-facts" aria-label="专业基本信息">
      <dl><div><dt>所属学校</dt><dd>${esc(label(school))}</dd></div>
      <div><dt>院系或学科</dt><dd>${units.length ? esc(units.map(label).join(' / ')) : '未分类'}</dd></div>
      <div><dt>学位</dt><dd>${missing(program.degree)}</dd></div>
      <div><dt>分类</dt><dd>${esc(majorCategory(program.category))}</dd></div></dl>
      ${program.verification ? `<p class="catalog-provenance muted">${esc(program.verification)}</p>` : ''}
    </section>
    ${data.publicEdition ? '' : `<section class="panel catalog-cases">
      <div class="catalog-section-heading"><div><h2>历史录取案例</h2><p>Admission Cases</p></div><span>${cases.length} 条案例</span></div>
      ${cases.length ? `<div class="table-scroll" tabindex="0" aria-label="历史录取案例">
        <table class="recommenders-grid">
          <thead><tr>${['本科院校', '本科专业', 'GPA / Average', '申请季', '录取结果'].map(text => `<th scope="col">${text}</th>`).join('')}</tr></thead>
          <tbody>${cases.slice(0, limit).map(row => `<tr data-catalog-case="${esc(row.id)}">
            <td>${esc(row.university)}</td><td>${esc(row.major)}</td><td class="catalog-gpa">${esc(row.gpa)}</td>
            <td>${esc(row.intake)}</td><td><span class="status-chip tone-${tone[row.result] ?? 'muted'}">${esc(row.result)}</span></td>
            </tr>`).join('')}</tbody>
        </table></div>
        ${cases.length > limit ? `<div class="catalog-case-more">${button('catalog-more', '显示更多案例', 'down', 'small')}</div>` : ''}` :
        empty('file', '暂无历史录取案例', '获授权的去标识化案例可在 Excel 的 Admission Cases 表添加。')}
    </section>`}</div>`;
}
