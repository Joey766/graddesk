import { catalogPath, catalogResults, catalogView, decodeCatalogPath } from './catalog.js';
import { empty } from './ui.js';

const main = document.querySelector('#public-catalog');
let dark = localStorage.getItem('graddesk-public-theme') === 'dark' ||
  (!localStorage.getItem('graddesk-public-theme') && matchMedia('(prefers-color-scheme: dark)').matches);
document.documentElement.dataset.theme = dark ? 'dark' : 'light';
document.querySelector('#public-theme').addEventListener('click', () => {
  dark = !dark;
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  localStorage.setItem('graddesk-public-theme', dark ? 'dark' : 'light');
});

async function start() {
  const response = await fetch('./catalog.json', { cache: 'no-cache' });
  if (!response.ok) throw Error('目录暂时无法加载');
  const data = await response.json();
  let view;
  const draw = () => { main.innerHTML = catalogView(data, view); };
  const restore = () => {
    view = decodeCatalogPath(location.hash.slice(1));
    draw();
  };
  window.addEventListener('hashchange', restore);
  restore();
  main.addEventListener('click', event => {
    const item = event.target.closest('button[data-action]');
    if (!item) return;
    const { action, id } = item.dataset;
    const school = data.schools.find(row => row.id === id);
    const program = data.programs.find(row => row.id === id);
    const owner = program && data.schools.find(row => row.id === program.school);
    const route = {
      'catalog-region': { region: id },
      'catalog-school': school && { region: school.region, school: id },
      'catalog-faculty': { region: view.region, school: view.school, faculty: id },
      'catalog-program': owner && { region: owner.region, school: owner.id, program: id },
    }[action];
    if (!route) return;
    const hash = '#' + catalogPath(route);
    if (location.hash !== hash) {
      location.hash = hash;
      window.scrollTo(0, 0);
    }
  });
  const filter = event => {
    const field = { 'catalog-search': 'query', 'catalog-category': 'category', 'catalog-degree': 'degree' }[event.target.id];
    if (!field) return;
    view[field] = event.target.value;
    document.querySelector('#catalog-results').innerHTML = catalogResults(data, view);
  };
  main.addEventListener('input', filter);
  main.addEventListener('change', filter);
}

start().catch(() => {
  main.innerHTML = empty('book', '目录暂时无法加载', '请刷新页面重试。');
});
