// State Management
let tasks = [];
let categories = [];
let selectedTaskId = null;
let currentFilter = 'all';
let theme = 'light';
let deferredPrompt = null;

// Default categories (pastel-themed)
const DEFAULT_CATEGORIES = [
  { id: 'cat-1', name: 'Matemáticas', color: 'pastel-pink' },
  { id: 'cat-2', name: 'Ciencias', color: 'pastel-blue' },
  { id: 'cat-3', name: 'Idiomas', color: 'pastel-lavender' },
  { id: 'cat-4', name: 'Personal', color: 'pastel-mint' },
  { id: 'cat-5', name: 'Otros', color: 'pastel-peach' }
];

// Pastel color mapping for CSS classes
const PASTEL_COLOR_MAP = {
  'pastel-pink': { bg: 'bg-pastel-pink-100 dark:bg-pastel-pink-500/20', text: 'text-pastel-pink-500 dark:text-pastel-pink-300', border: 'border-pastel-pink-300' },
  'pastel-blue': { bg: 'bg-pastel-blue dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-300', border: 'border-blue-300' },
  'pastel-lavender': { bg: 'bg-pastel-lavender dark:bg-purple-900/20', text: 'text-purple-600 dark:text-purple-300', border: 'border-purple-300' },
  'pastel-mint': { bg: 'bg-pastel-mint dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-300', border: 'border-emerald-300' },
  'pastel-peach': { bg: 'bg-pastel-peach dark:bg-amber-900/20', text: 'text-amber-600 dark:text-amber-300', border: 'border-amber-300' }
};

// Default sample tasks for a rich first-use experience
const DEFAULT_TASKS = [
  { id: 'task-1', title: 'Completar guía de álgebra', description: 'Ejercicios de la página 45 a la 50.', categoryId: 'cat-1', completed: false, priority: true, order: 1 },
  { id: 'task-2', title: 'Lectura de artículo científico', description: 'Efectos del cambio climático en arrecifes de coral.', categoryId: 'cat-2', completed: false, priority: false, order: 2 },
  { id: 'task-3', title: 'Vocabulario de inglés', description: 'Estudiar las 30 palabras nuevas para el test.', categoryId: 'cat-3', completed: false, priority: true, order: 3 },
  { id: 'task-4', title: 'Organizar mi habitación 🧹', description: 'Doblar ropa y limpiar el escritorio.', categoryId: 'cat-4', completed: true, priority: false, order: 4 }
];

// Custom SVG star using logo.svg paths
function getStarSVG(isActive, isDarkTheme) {
  // If active, fill with yellow (#F7BA00) and show face
  // If inactive, fill is transparent and stroke is brand color depending on theme
  const fillColor = isActive ? '#F7BA00' : 'transparent';
  const strokeColor = isActive ? '#F7BA00' : (isDarkTheme ? '#FFEBB8' : '#601D49');
  const strokeWidth = isActive ? 6 : 14;
  
  let faceContent = '';
  if (isActive) {
    faceContent = `
      <!-- Ojos > < -->
      <path d="M200.193 126.88L216.693 133.38L203.693 145.88M240.193 126.88L232.193 134.38L251.693 140.88" stroke="#113646" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
      <!-- Sonrisa -->
      <path d="M209.693 172.38L210.193 179.88C210.193 179.88 210.535 182.411 211.193 183.88C212.777 187.418 217.193 189.88 218.693 190.38C220.193 190.88 224.193 191.38 226.193 190.38C228.193 189.38 228.693 188.38 230.193 186.38C231.693 184.38 232.153 181.92 232.693 178.88C233.342 175.228 232.693 169.38 232.693 169.38" stroke="#113646" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
      <!-- Mejillas rosadas -->
      <path d="M185.193 152.38L176.693 164.88L174.193 155.88L163.193 170.38L170.693 172.88L167.693 185.38L175.193 177.38L178.193 187.38L192.193 155.88L186.193 158.88L185.193 152.38Z" fill="#D82167" stroke="#D82167" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" class="star-blush"/>
      <path d="M259.193 156.38L267.693 168.88L270.193 159.88L281.193 174.38L273.693 176.88L276.693 189.38L269.193 181.38L266.193 191.38L252.193 159.88L258.193 162.88L259.193 156.38Z" fill="#D82167" stroke="#D82167" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" class="star-blush"/>
    `;
  }

  return `
    <svg viewBox="0 0 429 370" class="w-8 h-8 select-none transition-transform duration-300 hover:scale-110 active:scale-95 cursor-pointer">
      <!-- Star Shape -->
      <path d="M179.193 111.38L185.455 54.062C185.613 52.6119 185.93 51.1835 186.399 49.8023L193.87 27.8033C194.416 26.1946 195.165 24.662 196.099 23.2426L203.502 11.9908C205.897 8.35039 209.415 5.59179 213.522 4.13457L217.702 2.6513C220.973 1.49068 224.489 1.20119 227.906 1.8113L230.509 2.27604C234.535 2.99495 238.243 4.93072 241.135 7.82246L246.044 12.7317C247.14 13.8271 248.104 15.046 248.918 16.364L256.773 29.0816C257.715 30.6072 258.448 32.2526 258.952 33.9735L264.193 51.8804L282.193 116.38H336.677C338.017 116.38 339.355 116.515 340.669 116.783L363.964 121.528C365.114 121.763 366.242 122.098 367.333 122.53L389.693 131.38L401.386 136.809C402.918 137.52 404.353 138.423 405.658 139.495L415.65 147.702C417.006 148.816 418.21 150.104 419.23 151.532L422.469 156.067C424.261 158.575 425.448 161.464 425.939 164.507L426.834 170.053C427.396 173.542 427.024 177.118 425.756 180.417L424.438 183.842C423.291 186.824 421.447 189.488 419.059 191.611L416.174 194.175C414.531 195.635 412.659 196.815 410.632 197.666L390.484 206.128C389.293 206.629 388.056 207.012 386.791 207.274L359.693 212.88L300.693 223.88L302.693 278.38L299.78 329.834C299.722 330.863 299.584 331.887 299.368 332.895L297.289 342.596C296.894 344.443 296.238 346.224 295.343 347.888L291.916 354.252C290.454 356.967 288.383 359.308 285.867 361.091L281.909 363.894C279.144 365.853 275.926 367.077 272.558 367.451L266.061 368.173C264.818 368.311 263.565 368.332 262.319 368.236L255.967 367.748C252.829 367.506 249.791 366.527 247.102 364.891L241.741 361.627C240.38 360.799 239.124 359.811 237.998 358.685L223.063 343.751C221.822 342.509 220.749 341.11 219.873 339.588L211.693 325.38L204.193 306.88L193.693 269.88L153.193 286.38L111.193 296.88L88.1929 299.38L67.3614 298.494C65.5902 298.419 63.837 298.108 62.1476 297.571L55.9172 295.588C54.4393 295.118 53.0212 294.477 51.6913 293.679L46.3862 290.496C44.6016 289.426 42.995 288.083 41.6246 286.517L39.2226 283.771C37.5514 281.862 36.259 279.651 35.4143 277.258L33.6929 272.38L31.8514 265.383C31.4142 263.721 31.1929 262.011 31.1929 260.293V255.607C31.1929 253.797 31.4383 251.997 31.9225 250.254L32.8954 246.751C33.4241 244.848 34.2319 243.033 35.2925 241.367L38.6427 236.102C39.9973 233.973 41.7423 232.12 43.7858 230.641L52.6299 224.236C54.328 223.007 56.2089 222.052 58.2037 221.406L72.1929 216.88L45.2499 205.267C43.8828 204.678 42.5858 203.938 41.383 203.061L20.6832 187.967C19.6918 187.244 18.7689 186.431 17.9264 185.539L12.8338 180.147C11.4151 178.645 10.2377 176.932 9.3436 175.069L5.53434 167.133C4.97468 165.967 4.52944 164.75 4.20486 163.498L2.14023 155.534C1.51419 153.12 1.34542 150.609 1.64263 148.132L2.69287 139.38L5.42662 127.762C6.25525 124.24 8.02361 121.009 10.5433 118.413L20.0174 108.652C22.1076 106.499 24.6556 104.843 27.4726 103.808L44.6924 97.4826C46.6801 96.7524 48.7712 96.3425 50.8874 96.2683L76.1929 95.3804H103.693L131.693 100.88L179.193 111.38Z" 
            fill="${fillColor}" 
            stroke="${strokeColor}" 
            stroke-width="${strokeWidth}" 
            stroke-linejoin="round" />
      ${faceContent}
    </svg>
  `;
}

// Initial Load and Setup
window.addEventListener('DOMContentLoaded', () => {
  initTheme();
  loadData();
  renderCategories();
  renderTasks();
  setupEventListeners();
  setupPWA();
});

// Load from LocalStorage
function loadData() {
  const savedTasks = localStorage.getItem('start_tasks');
  const savedCategories = localStorage.getItem('start_categories');

  if (savedTasks) {
    tasks = JSON.parse(savedTasks);
  } else {
    tasks = [...DEFAULT_TASKS];
    saveTasks();
  }

  if (savedCategories) {
    categories = JSON.parse(savedCategories);
  } else {
    categories = [...DEFAULT_CATEGORIES];
    saveCategories();
  }
}

function saveTasks() {
  localStorage.setItem('start_tasks', JSON.stringify(tasks));
}

function saveCategories() {
  localStorage.setItem('start_categories', JSON.stringify(categories));
}

// Theme Configuration
function initTheme() {
  const savedTheme = localStorage.getItem('start_theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme) {
    theme = savedTheme;
  } else {
    theme = systemPrefersDark ? 'dark' : 'light';
  }
  
  applyTheme();
}

function applyTheme() {
  const htmlEl = document.documentElement;
  if (theme === 'dark') {
    htmlEl.classList.add('dark');
  } else {
    htmlEl.classList.remove('dark');
  }
  localStorage.setItem('start_theme', theme);
  
  // Update icons if rendered
  const themeToggleIcon = document.getElementById('theme-toggle-icon');
  if (themeToggleIcon) {
    themeToggleIcon.innerHTML = theme === 'dark' 
      ? `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-pastel-pink-200"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" /></svg>` 
      : `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-slate-700"><path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" /></svg>`;
  }
}

// Render Categories
function renderCategories() {
  const categoryFiltersContainer = document.getElementById('category-filters');
  const taskCategorySelect = document.getElementById('task-category');
  
  if (!categoryFiltersContainer || !taskCategorySelect) return;

  // Render filter tabs
  let filterHTML = `
    <button onclick="setFilter('all')" class="px-4 py-2 rounded-full font-title text-sm transition-all duration-200 shadow-sm cursor-pointer ${
      currentFilter === 'all' 
        ? 'bg-pastel-pink-300 text-white dark:bg-pastel-pink-500 shadow-pastel-pink-300/40' 
        : 'bg-white dark:bg-dark-card text-slate-600 dark:text-slate-300 hover:bg-pastel-pink-50 dark:hover:bg-dark-hover'
    }">
      Todas
    </button>
  `;

  categories.forEach(cat => {
    const isSelected = currentFilter === cat.id;
    const colorStyles = PASTEL_COLOR_MAP[cat.color] || PASTEL_COLOR_MAP['pastel-pink'];
    
    filterHTML += `
      <button onclick="setFilter('${cat.id}')" class="px-4 py-2 rounded-full font-title text-sm transition-all duration-200 shadow-sm cursor-pointer ${
        isSelected 
          ? 'bg-pastel-pink-300 text-white dark:bg-pastel-pink-500 shadow-pastel-pink-300/40' 
          : `bg-white dark:bg-dark-card ${colorStyles.text} hover:bg-pastel-pink-50 dark:hover:bg-dark-hover`
      }">
        ${cat.name}
      </button>
    `;
  });

  categoryFiltersContainer.innerHTML = filterHTML;

  // Render select dropdown options
  let selectHTML = '';
  categories.forEach(cat => {
    selectHTML += `<option value="${cat.id}">${cat.name}</option>`;
  });
  taskCategorySelect.innerHTML = selectHTML;

  // Render category manage list
  renderManageCategories();
}

function renderManageCategories() {
  const listContainer = document.getElementById('manage-categories-list');
  if (!listContainer) return;

  let html = '';
  categories.forEach(cat => {
    const colorStyles = PASTEL_COLOR_MAP[cat.color] || PASTEL_COLOR_MAP['pastel-pink'];
    html += `
      <div class="flex items-center justify-between p-2 rounded-lg border border-slate-100 dark:border-dark-border bg-slate-50/50 dark:bg-dark-card/50">
        <div class="flex items-center gap-2">
          <span class="w-3 h-3 rounded-full ${colorStyles.bg}"></span>
          <span class="text-sm font-medium text-slate-700 dark:text-slate-200">${cat.name}</span>
        </div>
        ${categories.length > 1 ? `
          <button onclick="deleteCategory('${cat.id}')" class="text-red-400 hover:text-red-600 transition-colors p-1" title="Eliminar Categoría">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
            </svg>
          </button>
        ` : ''}
      </div>
    `;
  });
  listContainer.innerHTML = html;
}

// Render Tasks
function renderTasks() {
  const taskListContainer = document.getElementById('task-list');
  if (!taskListContainer) return;

  // Filter tasks based on current filter
  let filtered = tasks;
  if (currentFilter !== 'all') {
    filtered = tasks.filter(t => t.categoryId === currentFilter);
  }

  // Sort: 
  // 1. Uncompleted tasks first, sorted by order
  // 2. Completed tasks last, sorted by order
  const activeTasks = filtered.filter(t => !t.completed).sort((a, b) => a.order - b.order);
  const completedTasks = filtered.filter(t => t.completed).sort((a, b) => a.order - b.order);

  if (filtered.length === 0) {
    taskListContainer.innerHTML = `
      <div class="flex flex-col items-center justify-center py-16 text-center">
        <div class="animate-float mb-4 text-6xl">✨</div>
        <p class="text-slate-400 dark:text-slate-500 font-title">No hay tareas aquí. ¡Crea una nueva para empezar!</p>
      </div>
    `;
    return;
  }

  let html = '';

  // Render active tasks
  if (activeTasks.length > 0) {
    html += `<div class="space-y-3" id="active-tasks-container">`;
    activeTasks.forEach(task => {
      html += renderTaskCard(task);
    });
    html += `</div>`;
  }

  // Render completed tasks separator and header
  if (completedTasks.length > 0) {
    if (activeTasks.length > 0) {
      html += `<div class="h-px bg-slate-100 dark:bg-dark-border my-6"></div>`;
    }
    html += `
      <div class="mb-3 flex items-center gap-2">
        <span class="font-title text-sm text-slate-400 dark:text-slate-500">Completadas (${completedTasks.length})</span>
        <span class="h-0.5 flex-1 bg-slate-100/70 dark:bg-dark-border/40"></span>
      </div>
      <div class="space-y-3 opacity-75" id="completed-tasks-container">
    `;
    completedTasks.forEach(task => {
      html += renderTaskCard(task);
    });
    html += `</div>`;
  }

  taskListContainer.innerHTML = html;
}

function renderTaskCard(task) {
  const category = categories.find(c => c.id === task.categoryId) || { name: 'Otros', color: 'pastel-peach' };
  const colorStyles = PASTEL_COLOR_MAP[category.color] || PASTEL_COLOR_MAP['pastel-peach'];
  const isSelected = selectedTaskId === task.id;
  const cardBorderClass = isSelected 
    ? 'task-card-selected' 
    : 'border-slate-100 dark:border-dark-border hover:border-pastel-pink-200 dark:hover:border-dark-hover shadow-sm';
  const textCompletedClass = task.completed ? 'completed-text text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-200';

  return `
    <div 
      id="card-${task.id}"
      tabindex="0"
      onclick="selectTask(event, '${task.id}')"
      class="task-card p-4 rounded-2xl border-2 bg-white dark:bg-dark-card flex items-center justify-between gap-4 cursor-pointer outline-none ${cardBorderClass} custom-focus"
      role="listitem"
      aria-selected="${isSelected}"
    >
      <div class="flex items-center gap-3.5 flex-1 min-w-0">
        <!-- Custom Checkbox -->
        <button 
          onclick="toggleTaskComplete(event, '${task.id}')" 
          class="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer select-none shrink-0 ${
            task.completed 
              ? 'bg-pastel-pink-300 border-pastel-pink-300 dark:bg-pastel-pink-500 dark:border-pastel-pink-500 text-white' 
              : 'border-slate-300 dark:border-slate-600 hover:border-pastel-pink-300'
          }"
          title="${task.completed ? 'Marcar como pendiente' : 'Marcar como completada'}"
        >
          ${task.completed ? `
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          ` : ''}
        </button>

        <div class="min-w-0 flex-1 ${textCompletedClass}">
          <div class="flex items-center gap-2 mb-1 flex-wrap">
            <h3 class="font-title text-base font-semibold leading-tight strikethrough-line truncate">
              ${task.title}
            </h3>
            <span class="text-xs px-2.5 py-0.5 rounded-full font-medium ${colorStyles.bg} ${colorStyles.text}">
              ${category.name}
            </span>
          </div>
          ${task.description ? `<p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">${task.description}</p>` : ''}
        </div>
      </div>

      <div class="flex items-center gap-2 shrink-0">
        <!-- Priority Star Button -->
        <button 
          onclick="toggleTaskPriority(event, '${task.id}')" 
          title="Prioridad"
          class="focus:outline-none"
        >
          ${getStarSVG(task.priority, theme === 'dark')}
        </button>

        <!-- Delete and Edit Menu -->
        <div class="flex items-center gap-1">
          <button 
            onclick="openEditModal(event, '${task.id}')"
            class="p-1.5 text-slate-400 hover:text-pastel-pink-400 dark:hover:text-pastel-pink-300 rounded-lg hover:bg-slate-50 dark:hover:bg-dark-hover transition-colors"
            title="Editar Tarea"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4.5 h-4.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
            </svg>
          </button>
          <button 
            onclick="deleteTask(event, '${task.id}')"
            class="p-1.5 text-slate-400 hover:text-red-400 dark:hover:text-red-300 rounded-lg hover:bg-slate-50 dark:hover:bg-dark-hover transition-colors"
            title="Eliminar Tarea"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4.5 h-4.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  `;
}

// Select Task for Reordering
function selectTask(event, taskId) {
  // Prevent selection trigger when clicking buttons
  if (event.target.closest('button') || event.target.closest('svg')) {
    return;
  }
  
  selectedTaskId = taskId;
  renderTasks();
  
  // Re-focus the newly rendered card to keep keyboard focus
  setTimeout(() => {
    const el = document.getElementById(`card-${taskId}`);
    if (el) el.focus();
  }, 10);
}

// Add/Edit Task Modals
let editingTaskId = null;

function openAddModal() {
  editingTaskId = null;
  document.getElementById('modal-title').textContent = 'Nueva Tarea';
  document.getElementById('task-title').value = '';
  document.getElementById('task-desc').value = '';
  document.getElementById('task-priority-toggle').dataset.priority = 'false';
  updateModalPriorityStar();
  
  document.getElementById('task-modal').classList.remove('hidden');
  document.getElementById('task-modal').classList.add('flex');
}

function openEditModal(event, id) {
  event.stopPropagation();
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  editingTaskId = id;
  document.getElementById('modal-title').textContent = 'Editar Tarea';
  document.getElementById('task-title').value = task.title;
  document.getElementById('task-desc').value = task.description || '';
  document.getElementById('task-category').value = task.categoryId;
  document.getElementById('task-priority-toggle').dataset.priority = task.priority.toString();
  updateModalPriorityStar();

  document.getElementById('task-modal').classList.remove('hidden');
  document.getElementById('task-modal').classList.add('flex');
}

function closeModal() {
  document.getElementById('task-modal').classList.add('hidden');
  document.getElementById('task-modal').classList.remove('flex');
}

function toggleModalPriority() {
  const toggleBtn = document.getElementById('task-priority-toggle');
  const isPriority = toggleBtn.dataset.priority === 'true';
  toggleBtn.dataset.priority = (!isPriority).toString();
  updateModalPriorityStar();
}

function updateModalPriorityStar() {
  const toggleBtn = document.getElementById('task-priority-toggle');
  const isPriority = toggleBtn.dataset.priority === 'true';
  toggleBtn.innerHTML = getStarSVG(isPriority, theme === 'dark');
}

// Save Task Action
function saveTaskAction() {
  const title = document.getElementById('task-title').value.trim();
  const desc = document.getElementById('task-desc').value.trim();
  const categoryId = document.getElementById('task-category').value;
  const isPriority = document.getElementById('task-priority-toggle').dataset.priority === 'true';

  if (!title) {
    alert('Por favor, introduce el nombre de la tarea.');
    return;
  }

  if (editingTaskId) {
    // Edit existing
    const taskIndex = tasks.findIndex(t => t.id === editingTaskId);
    if (taskIndex !== -1) {
      tasks[taskIndex].title = title;
      tasks[taskIndex].description = desc;
      tasks[taskIndex].categoryId = categoryId;
      tasks[taskIndex].priority = isPriority;
    }
  } else {
    // Create new
    const newOrder = tasks.length > 0 ? Math.max(...tasks.map(t => t.order)) + 1 : 1;
    const newTask = {
      id: 'task-' + Date.now(),
      title: title,
      description: desc,
      categoryId: categoryId,
      completed: false,
      priority: isPriority,
      order: newOrder
    };
    tasks.push(newTask);
    selectedTaskId = newTask.id; // Focus new task automatically
  }

  saveTasks();
  closeModal();
  renderTasks();
  
  if (selectedTaskId) {
    setTimeout(() => {
      const el = document.getElementById(`card-${selectedTaskId}`);
      if (el) el.focus();
    }, 50);
  }
}

// Toggle Complete
function toggleTaskComplete(event, id) {
  event.stopPropagation();
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  task.completed = !task.completed;
  
  // Reorder completed task to the bottom of the completed stack
  const sameStatusTasks = tasks.filter(t => t.completed === task.completed);
  const newOrder = sameStatusTasks.length > 0 ? Math.max(...sameStatusTasks.map(t => t.order)) + 1 : 1;
  task.order = newOrder;
  
  saveTasks();
  renderTasks();
}

// Toggle Priority
function toggleTaskPriority(event, id) {
  event.stopPropagation();
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  task.priority = !task.priority;
  saveTasks();
  renderTasks();
  
  // Keep card focused after priority toggle
  setTimeout(() => {
    const el = document.getElementById(`card-${id}`);
    if (el) el.focus();
  }, 10);
}

// Delete Task
function deleteTask(event, id) {
  event.stopPropagation();
  if (confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
    tasks = tasks.filter(t => t.id !== id);
    if (selectedTaskId === id) selectedTaskId = null;
    saveTasks();
    renderTasks();
  }
}

// Category Filters
function setFilter(filterId) {
  currentFilter = filterId;
  renderCategories();
  renderTasks();
}

// Add/Manage Categories
function openManageCategories() {
  document.getElementById('categories-modal').classList.remove('hidden');
  document.getElementById('categories-modal').classList.add('flex');
}

function closeManageCategories() {
  document.getElementById('categories-modal').classList.add('hidden');
  document.getElementById('categories-modal').classList.remove('flex');
}

function addCategoryAction() {
  const nameInput = document.getElementById('new-cat-name');
  const colorSelect = document.getElementById('new-cat-color');
  const name = nameInput.value.trim();
  const color = colorSelect.value;

  if (!name) {
    alert('Introduce un nombre para la materia/categoría.');
    return;
  }

  const newCat = {
    id: 'cat-' + Date.now(),
    name: name,
    color: color
  };

  categories.push(newCat);
  saveCategories();
  
  nameInput.value = '';
  renderCategories();
}

function deleteCategory(id) {
  if (categories.length <= 1) {
    alert('Debes tener al menos una categoría.');
    return;
  }
  
  if (confirm('Al eliminar esta categoría, las tareas asociadas pasarán a la primera categoría disponible. ¿Proceder?')) {
    categories = categories.filter(c => c.id !== id);
    const fallbackId = categories[0].id;
    
    // Remap tasks in deleted category
    tasks.forEach(t => {
      if (t.categoryId === id) {
        t.categoryId = fallbackId;
      }
    });

    if (currentFilter === id) {
      currentFilter = 'all';
    }

    saveCategories();
    saveTasks();
    renderCategories();
    renderTasks();
  }
}

// Reordering Logic via Keyboard (Ctrl + Up / Down)
function setupEventListeners() {
  // Theme Toggle Click
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      theme = theme === 'light' ? 'dark' : 'light';
      applyTheme();
      renderTasks(); // Re-render to update priority star outline colors
    });
  }

  // Keyboard Navigation
  window.addEventListener('keydown', (e) => {
    // Check if user is typing in a text field
    const activeEl = document.activeElement;
    if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.tagName === 'SELECT')) {
      return;
    }

    // Task Reordering Keyboard Navigation
    if (!selectedTaskId) return;

    const task = tasks.find(t => t.id === selectedTaskId);
    if (!task) return;

    // Get current list of tasks based on matching category filter
    let list = tasks;
    if (currentFilter !== 'all') {
      list = tasks.filter(t => t.categoryId === currentFilter);
    }

    // Split and sort active vs completed tasks
    const activeTasksList = list.filter(t => !t.completed).sort((a, b) => a.order - b.order);
    const completedTasksList = list.filter(t => t.completed).sort((a, b) => a.order - b.order);

    const targetList = task.completed ? completedTasksList : activeTasksList;
    const index = targetList.findIndex(t => t.id === selectedTaskId);

    if (index === -1) return;

    // Reorder: Ctrl + ArrowUp / ArrowDown
    if (e.ctrlKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
      e.preventDefault();
      
      let swapWithIndex = -1;
      if (e.key === 'ArrowUp' && index > 0) {
        swapWithIndex = index - 1;
      } else if (e.key === 'ArrowDown' && index < targetList.length - 1) {
        swapWithIndex = index + 1;
      }

      if (swapWithIndex !== -1) {
        const otherTask = targetList[swapWithIndex];
        
        // Swap their orders
        const tempOrder = task.order;
        task.order = otherTask.order;
        otherTask.order = tempOrder;

        saveTasks();
        renderTasks();

        // Maintain visual selection and focus on the moved card
        setTimeout(() => {
          const cardEl = document.getElementById(`card-${selectedTaskId}`);
          if (cardEl) {
            cardEl.focus();
            cardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }, 30);
      }
    } 
    // Simply Navigate: ArrowUp / ArrowDown without Ctrl to select adjacent tasks
    else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      
      // Combine sorted lists (actives first, then completed) to navigate seamlessly
      const fullList = [...activeTasksList, ...completedTasksList];
      const fullIndex = fullList.findIndex(t => t.id === selectedTaskId);
      
      let newSelectIndex = -1;
      if (e.key === 'ArrowUp' && fullIndex > 0) {
        newSelectIndex = fullIndex - 1;
      } else if (e.key === 'ArrowDown' && fullIndex < fullList.length - 1) {
        newSelectIndex = fullIndex + 1;
      }

      if (newSelectIndex !== -1) {
        selectedTaskId = fullList[newSelectIndex].id;
        renderTasks();
        setTimeout(() => {
          const cardEl = document.getElementById(`card-${selectedTaskId}`);
          if (cardEl) cardEl.focus();
        }, 10);
      }
    }
  });
}

// PWA setup code
function setupPWA() {
  // Service Worker Registration
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
      .then((reg) => console.log('Service worker registrado con éxito:', reg.scope))
      .catch((err) => console.warn('Error al registrar el service worker:', err));
  }

  // Installation Promotion Button
  const installBtn = document.getElementById('install-btn');
  if (!installBtn) return;

  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent default Chrome 67 install promo
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    // Show the install button
    installBtn.classList.remove('hidden');
    installBtn.classList.add('flex');
  });

  installBtn.addEventListener('click', () => {
    if (!deferredPrompt) return;
    // Show the install prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('El usuario aceptó la instalación.');
      } else {
        console.log('El usuario declinó la instalación.');
      }
      deferredPrompt = null;
      installBtn.classList.remove('flex');
      installBtn.classList.add('hidden');
    });
  });

  window.addEventListener('appinstalled', (evt) => {
    console.log('La aplicación fue instalada con éxito!');
    installBtn.classList.remove('flex');
    installBtn.classList.add('hidden');
  });
}
