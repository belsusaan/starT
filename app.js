// ==========================================
// starT APP - State & Configurations
// ==========================================

let tasks = [];
let categories = [];
let selectedTaskId = null;
let currentFilter = 'all';
let theme = 'light';
let deferredPrompt = null;

// Firebase & User Authentication State
let currentUser = null;
let isCloudSyncing = false;
let lastSyncTime = null;
let firestoreUnsubscribe = null;
let authMode = 'login'; // 'login' | 'register'

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

// Custom SVG star using logo.svg paths with safe padding viewBox
function getStarSVG(isActive, isDarkTheme) {
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
    <svg viewBox="-15 -15 460 400" class="w-8 h-8 select-none transition-transform duration-300 hover:scale-110 active:scale-95 cursor-pointer">
      <path d="M179.193 111.38L185.455 54.062C185.613 52.6119 185.93 51.1835 186.399 49.8023L193.87 27.8033C194.416 26.1946 195.165 24.662 196.099 23.2426L203.502 11.9908C205.897 8.35039 209.415 5.59179 213.522 4.13457L217.702 2.6513C220.973 1.49068 224.489 1.20119 227.906 1.8113L230.509 2.27604C234.535 2.99495 238.243 4.93072 241.135 7.82246L246.044 12.7317C247.14 13.8271 248.104 15.046 248.918 16.364L256.773 29.0816C257.715 30.6072 258.448 32.2526 258.952 33.9735L264.193 51.8804L282.193 116.38H336.677C338.017 116.38 339.355 116.515 340.669 116.783L363.964 121.528C365.114 121.763 366.242 122.098 367.333 122.53L389.693 131.38L401.386 136.809C402.918 137.52 404.353 138.423 405.658 139.495L415.65 147.702C417.006 148.816 418.21 150.104 419.23 151.532L422.469 156.067C424.261 158.575 425.448 161.464 425.939 164.507L426.834 170.053C427.396 173.542 427.024 177.118 425.756 180.417L424.438 183.842C423.291 186.824 421.447 189.488 419.059 191.611L416.174 194.175C414.531 195.635 412.659 196.815 410.632 197.666L390.484 206.128C389.293 206.629 388.056 207.012 386.791 207.274L359.693 212.88L300.693 223.88L302.693 278.38L299.78 329.834C299.722 330.863 299.584 331.887 299.368 332.895L297.289 342.596C296.894 344.443 296.238 346.224 295.343 347.888L291.916 354.252C290.454 356.967 288.383 359.308 285.867 361.091L281.909 363.894C279.144 365.853 275.926 367.077 272.558 367.451L266.061 368.173C264.818 368.311 263.565 368.332 262.319 368.236L255.967 367.748C252.829 367.506 249.791 366.527 247.102 364.891L241.741 361.627C240.38 360.799 239.124 359.811 237.998 358.685L223.063 343.751C221.822 342.509 220.749 341.11 219.873 339.588L211.693 325.38L204.193 306.88L193.693 269.88L153.193 286.38L111.193 296.88L88.1929 299.38L67.3614 298.494C65.5902 298.419 63.837 298.108 62.1476 297.571L55.9172 295.588C54.4393 295.118 53.0212 294.477 51.6913 293.679L46.3862 290.496C44.6016 289.426 42.995 288.083 41.6246 286.517L39.2226 283.771C37.5514 281.862 36.259 279.651 35.4143 277.258L33.6929 272.38L31.8514 265.383C31.4142 263.721 31.1929 262.011 31.1929 260.293V255.607C31.1929 253.797 31.4383 251.997 31.9225 250.254L32.8954 246.751C33.4241 244.848 34.2319 243.033 35.2925 241.367L38.6427 236.102C39.9973 233.973 41.7423 232.12 43.7858 230.641L52.6299 224.236C54.328 223.007 56.2089 222.052 58.2037 221.406L72.1929 216.88L45.2499 205.267C43.8828 204.678 42.5858 203.938 41.383 203.061L20.6832 187.967C19.6918 187.244 18.7689 186.431 17.9264 185.539L12.8338 180.147C11.4151 178.645 10.2377 176.932 9.3436 175.069L5.53434 167.133C4.97468 165.967 4.52944 164.75 4.20486 163.498L2.14023 155.534C1.51419 153.12 1.34542 150.609 1.64263 148.132L2.69287 139.38L5.42662 127.762C6.25525 124.24 8.02361 121.009 10.5433 118.413L20.0174 108.652C22.1076 106.499 24.6556 104.843 27.4726 103.808L44.6924 97.4826C46.6801 96.7524 48.7712 96.3425 50.8874 96.2683L76.1929 95.3804H103.693L131.693 100.88L179.193 111.38Z" 
      fill="${fillColor}" 
      stroke="${strokeColor}" 
      stroke-width="${strokeWidth}" 
      stroke-linejoin="round" />
    ${faceContent}
  </svg>
  `;
}

// Custom SVG for Empty State (Asleep star with dynamic ZZZ color: white in dark mode, original in light mode)
function getAsleepSVG(isDarkTheme) {
  const zzzColor = isDarkTheme ? '#FFFFFF' : '#123644';
  return `
    <svg width="629" height="627" viewBox="0 0 629 627" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full object-contain select-none">
      <g clip-path="url(#clip0_asleep_dynamic)">
        <!-- Star Body -->
        <path d="M253.356 277.043C251.812 249.038 254.775 214.1 262.68 186.781C267.325 170.726 277.694 145.018 293.501 137.239C322.218 123.107 343.852 147.342 353.484 172.296C356.776 178.211 357.722 184.12 359.881 190.316C364.534 203.67 366.626 216.852 371.469 230.221C373.708 236.401 376.681 245.907 378.109 252.081C380.76 263.553 381.414 273.711 386.675 284.657C392.812 283.52 397.563 283.982 403.466 283.366C436 279.973 466.873 281.544 498.359 291.521L501.24 292.505C507.948 294.706 518.504 297.518 524.478 300.968C531.45 304.997 541.858 309.783 548.142 314.068C555.968 319.404 564.923 329.772 569.662 337.876C574.183 346.106 573.652 359.116 571.029 367.924C568.204 377.404 558.538 385.318 550.178 390.058C542.54 394.389 534.048 395.827 525.626 397.747L495.196 404.416C483.666 407.04 471.989 410.118 460.435 412.45C450.776 414.397 440.272 414.748 430.527 416.333C425.551 417.156 412.965 420.336 408.226 421.752C410.075 430.172 410.622 436.553 410.521 445.234C410.465 450.024 411.537 455.566 411.577 460.432C411.626 466.634 411.549 472.846 411.728 479.051C411.777 480.729 412.265 481.46 412.102 483.355C411.755 488.811 412.314 502.282 411.583 506.294C412.121 526.646 411.086 560.982 404.215 579.894C402.428 584.778 399.903 589.362 396.724 593.481C390.001 602.255 378.505 608.878 367.553 610.23C354.537 611.836 342.098 607.201 331.932 599.253C323.772 592.873 316.969 586.434 310.618 578.219C308.228 575.19 305.197 572.017 303.228 568.702C291.037 548.184 282.428 525.682 277.138 502.42C275.489 495.17 273.438 487.668 272.496 480.222C267.156 483.712 260.305 485.3 254.54 487.963C246.041 491.889 237.703 496.353 228.909 499.625C228.241 499.873 225.909 499.45 224.87 499.465C222.216 502.522 219.301 502.497 215.604 503.932C208.272 506.779 200.525 508.355 193.032 510.515C183.792 513.175 174.795 515.35 165.29 516.908C163.627 517.301 161.789 516.892 160.145 517.08C152.269 517.965 143.296 520.726 135.446 520.161C131.001 519.842 127.582 520.361 123.209 520.385C111.172 520.508 99.2571 517.971 88.3168 512.948C59.0822 499.625 50.743 460.545 72.1757 436.531C84.5155 422.707 95.925 418.293 112.811 412.124C108.259 409.375 99.4076 406.969 93.5454 404.377C68.4864 393.33 44.644 379.558 30.9166 354.883C21.8801 338.638 21.1739 321.103 25.4324 303.242C28.5999 289.957 43.7638 272.952 55.9743 266.774C80.9863 254.609 110.255 254.447 137.484 255.19C152.726 255.606 168.68 258.415 183.52 261.237C202.616 264.727 221.539 269.104 240.227 274.353C244.491 275.507 248.958 275.763 253.356 277.043Z" fill="#F8BB0E"/>
        <path d="M498.36 291.521L501.241 292.505C500.765 294.02 501.026 293.854 499.954 294.567C498.851 294.592 499.327 294.759 498.483 294.046C497.961 292.977 498.126 292.689 498.36 291.521Z" fill="#FFCC4B"/>
        <!-- Face Features -->
        <path d="M296.714 320.154C300.283 320.329 304.098 323.41 302.112 326.94C294.368 340.706 278.948 342.721 264.671 341.762C249.511 340.746 238.9 338.881 224.85 333.342C222.949 332.509 221.505 331.748 220.236 330.126C218.984 328.528 218.201 325.081 220.622 324.135C226.972 321.647 236.044 327.643 242.544 329.017C253.869 331.407 265.206 332.626 276.742 331.972C280.046 331.603 283.55 330.682 286.461 329.1C290.759 326.768 292.401 322.406 296.714 320.154Z" fill="#123644"/>
        <path d="M389.51 315.184C392.542 315.31 395.346 316.882 394.94 320.317C394.461 324.384 389.968 329.358 387.121 332.055C378.251 340.463 367.511 340.119 356.144 339.391C345.529 338.983 333.364 335.456 326.094 327.327C324.574 325.469 324.255 324.212 323.563 321.979C326.119 314.621 328.481 315.408 335.563 316.793C338.693 319.457 338.819 320.612 337.479 324.295C345.164 328.095 348.948 328.989 357.437 329.871C366.442 331.063 374.894 330.584 381.602 323.69C384.47 320.741 385.524 316.677 389.51 315.184Z" fill="#123644"/>
        <path d="M311.41 359.178C315.458 358.717 316.954 360.846 318.407 364.219C318.192 366.406 317.989 368.007 317.593 370.166C315.956 372.16 315.336 372.486 313.007 373.5C311.358 372.775 310.345 372.412 308.87 371.352L304.593 373.343C303.494 373.536 301.841 373.496 300.682 373.512L300.46 373.334C296.679 370.366 295.358 366.928 298.966 362.668C300.874 360.416 303.737 360.136 306.469 360.244C308.324 360.321 309.632 359.789 311.41 359.178Z" fill="#123644"/>
        <!-- ZZZ Sleeping Letters (White in Dark Mode, Dark Blue in Light Mode) -->
        <path d="M497.595 36.653C503.329 36.108 514.588 35.865 519.721 38.4419C521.643 39.4068 523.21 40.9861 523.79 43.0984C526.345 52.3735 499.223 64.5301 494.631 72.8848C494.671 73.3858 494.567 73.6552 494.957 73.818C499.659 75.7768 508.145 74.4773 512.488 71.9429C514.109 71.0701 515.184 68.2832 517.165 68.1296C520.799 67.8574 522.537 70.2778 522.789 73.6531C523.308 80.6364 512.786 82.6369 507.632 83.8765C504.886 84.5369 500.878 84.4949 497.856 84.4466C491.188 83.5143 488.851 82.193 484.603 76.9174C484.413 75.5249 484.146 73.4872 484.416 72.1635C486.32 62.8583 503.381 52.0325 510.983 46.5544C499.769 45.5941 494.671 46.0178 485.344 52.1047C485.258 55.0154 484.333 57.262 481.13 57.8196C479.714 58.0549 478.261 57.7228 477.088 56.8952C473.968 54.6932 473.931 50.432 476.296 47.649C481.397 41.6423 489.858 37.5814 497.595 36.653Z" fill="${zzzColor}"/>
        <path d="M473.676 105.516C478.172 105.473 485.46 104.49 488.965 107.726C489.993 108.676 490.497 109.939 490.534 111.325C490.783 120.553 467.168 138.123 460.629 145.441C459.95 146.203 458.728 147.389 458.789 148.423C461.09 149.317 467.358 149.899 470.021 149.442C472.496 149.162 478.129 146.251 480.393 147.428C485.878 150.278 483.172 156.166 478.178 157.746C470.629 160.133 461.418 160.314 454.167 157.037C453.608 156.743 453.067 156.415 452.548 156.055C440.054 147.507 458.749 133.502 465.021 128.09C469.047 124.617 474.112 119.563 477.352 115.395C469.695 116.36 462.576 115.3 455.429 118.874C455.116 121.05 454.913 123.477 452.336 124.004C448.307 124.827 445.457 121.311 445.017 117.647C444.83 116.096 445.288 113.435 446.516 112.445C452.834 107.36 465.819 105.784 473.676 105.516Z" fill="${zzzColor}"/>
        <path d="M444.861 186.267C448.817 185.751 452.929 186.791 456.169 188.886C471.603 198.82 457.109 205.389 449.185 213.164C447.06 215.25 439.302 224.071 439.928 226.872C446.268 228.532 459.926 217.256 462.321 227.851C462.653 229.328 460.862 231.336 459.965 232.412C450.236 234.108 446.916 238.357 436.356 236.03C431.694 234.814 427.496 231.959 429.164 226.435C432.603 215.035 442.591 204.364 452.349 197.91C439.142 190.817 435.429 206.876 429.575 208.129C428.62 208.334 427.751 208.122 426.977 207.526C425.757 206.589 424.799 205.062 424.606 203.527C424.305 201.113 425.721 198.808 427.158 197C431.415 191.648 437.957 187.076 444.861 186.267Z" fill="${zzzColor}"/>
      </g>
      <defs>
        <clipPath id="clip0_asleep_dynamic">
          <rect width="629" height="627" fill="white"/>
        </clipPath>
      </defs>
    </svg>
  `;
}

// ==========================================
// Initialization
// ==========================================

window.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initFirebase();
  loadData();
  renderCategories();
  renderTasks();
  setupEventListeners();
  setupPWA();
});

// ==========================================
// Firebase Integration & Real-time Sync
// ==========================================

const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyDummyKeyReplaceIfUsingLiveCloud123",
  authDomain: "start-tasks.firebaseapp.com",
  projectId: "start-tasks",
  storageBucket: "start-tasks.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456"
};

let firebaseInitialized = false;

function initFirebase() {
  // Check for saved local active user
  const savedActiveUser = localStorage.getItem('start_active_user');
  if (savedActiveUser) {
    try {
      currentUser = JSON.parse(savedActiveUser);
      console.log('Sesión activa restaurada:', currentUser.email || currentUser.displayName);
    } catch (e) {}
  }

  const savedConfig = localStorage.getItem('start_firebase_config');
  if (!savedConfig || typeof firebase === 'undefined') {
    updateAuthUI();
    return;
  }

  try {
    const config = JSON.parse(savedConfig);
    if (!firebase.apps.length) {
      firebase.initializeApp(config);
    }
    firebaseInitialized = true;

    // Listen for auth state changes from live Firebase
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        currentUser = user;
        localStorage.setItem('start_active_user', JSON.stringify({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName
        }));
        onUserLoggedIn(user);
      } else {
        if (savedConfig) {
          currentUser = null;
          localStorage.removeItem('start_active_user');
          onUserLoggedOut();
        }
      }
      updateAuthUI();
    });

  } catch (err) {
    console.warn('Firebase en modo local:', err.message);
    updateAuthUI();
  }
}

function getStorageKey(type) {
  const userId = currentUser ? currentUser.uid : 'guest';
  return `start_${type}_${userId}`;
}

function onUserLoggedIn(user) {
  loadData();
  renderCategories();
  renderTasks();
  setupFirestoreSync(user.uid);
}

function onUserLoggedOut() {
  if (firestoreUnsubscribe) {
    firestoreUnsubscribe();
    firestoreUnsubscribe = null;
  }
  loadData();
  renderCategories();
  renderTasks();
}

function setupFirestoreSync(userId) {
  if (!firebaseInitialized || typeof firebase === 'undefined' || !firebase.firestore) return;

  try {
    const db = firebase.firestore();
    const userDocRef = db.collection('users').doc(userId);

    if (firestoreUnsubscribe) {
      firestoreUnsubscribe();
    }

    firestoreUnsubscribe = userDocRef.onSnapshot((docSnapshot) => {
      if (docSnapshot.exists) {
        const cloudData = docSnapshot.data();
        if (cloudData && cloudData.tasks) {
          tasks = cloudData.tasks;
          localStorage.setItem(getStorageKey('tasks'), JSON.stringify(tasks));
        }
        if (cloudData && cloudData.categories) {
          categories = cloudData.categories;
          localStorage.setItem(getStorageKey('categories'), JSON.stringify(categories));
        }
        lastSyncTime = new Date();
        updateSyncStatus('synced');
        renderCategories();
        renderTasks();
      } else {
        syncDataWithCloud();
      }
    }, (error) => {
      console.warn('Aviso de Firestore Sync:', error.message);
      updateSyncStatus('local');
    });

  } catch (e) {
    console.warn('Error configurando Firestore Snapshot:', e);
    updateSyncStatus('local');
  }
}

function syncDataWithCloud(showFeedback = false) {
  if (!currentUser || !firebaseInitialized || typeof firebase === 'undefined' || !firebase.firestore) {
    if (showFeedback) {
      alert('Tus datos están guardados localmente. Inicia sesión para sincronizar en la nube con otros dispositivos.');
    }
    return;
  }

  updateSyncStatus('syncing');

  try {
    const db = firebase.firestore();
    db.collection('users').doc(currentUser.uid).set({
      tasks: tasks,
      categories: categories,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      userEmail: currentUser.email || ''
    }, { merge: true })
      .then(() => {
        lastSyncTime = new Date();
        updateSyncStatus('synced');
        if (showFeedback) {
          alert('¡Datos sincronizados exitosamente con la nube!');
        }
      })
      .catch((err) => {
        console.warn('Error al sincronizar con Firestore:', err);
        updateSyncStatus('local');
        if (showFeedback) {
          alert('Sincronizado localmente. Conexión a la nube no disponible temporalmente.');
        }
      });
  } catch (err) {
    console.warn('Sync error:', err);
    updateSyncStatus('local');
  }
}

function updateSyncStatus(status) {
  const dot = document.getElementById('sync-status-dot');
  const badge = document.getElementById('profile-sync-badge');
  const lastSyncEl = document.getElementById('profile-last-sync');
  const taskCountEl = document.getElementById('profile-task-count');

  if (taskCountEl) taskCountEl.textContent = tasks.length.toString();
  if (lastSyncEl && lastSyncTime) {
    lastSyncEl.textContent = lastSyncTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  if (status === 'synced') {
    if (dot) {
      dot.className = 'w-2 h-2 rounded-full bg-emerald-400 animate-pulse';
      dot.title = 'Sincronizado con la nube';
    }
    if (badge) {
      badge.className = 'inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 mt-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300';
      badge.textContent = '☁️ Conectado a la nube';
    }
  } else if (status === 'syncing') {
    if (dot) {
      dot.className = 'w-2 h-2 rounded-full bg-amber-400 animate-spin';
      dot.title = 'Sincronizando...';
    }
  } else {
    if (dot) {
      dot.className = 'w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600';
      dot.title = 'Modo local';
    }
    if (badge) {
      badge.className = 'inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 mt-1 rounded-full bg-slate-100 text-slate-600 dark:bg-dark-hover dark:text-slate-400';
      badge.textContent = '⚡ Modo local';
    }
  }
}

// ==========================================
// LocalStorage & State Loading
// ==========================================

function loadData() {
  const tasksKey = getStorageKey('tasks');
  const catKey = getStorageKey('categories');

  const savedTasks = localStorage.getItem(tasksKey) || localStorage.getItem('start_tasks');
  const savedCategories = localStorage.getItem(catKey) || localStorage.getItem('start_categories');

  if (savedTasks) {
    try {
      tasks = JSON.parse(savedTasks);
    } catch (e) {
      tasks = [...DEFAULT_TASKS];
    }
  } else {
    tasks = [...DEFAULT_TASKS];
    saveTasks();
  }

  if (savedCategories) {
    try {
      categories = JSON.parse(savedCategories);
    } catch (e) {
      categories = [...DEFAULT_CATEGORIES];
    }
  } else {
    categories = [...DEFAULT_CATEGORIES];
    saveCategories();
  }
}

function saveTasks() {
  localStorage.setItem(getStorageKey('tasks'), JSON.stringify(tasks));
  localStorage.setItem('start_tasks', JSON.stringify(tasks));
  syncDataWithCloud();
}

function saveCategories() {
  localStorage.setItem(getStorageKey('categories'), JSON.stringify(categories));
  localStorage.setItem('start_categories', JSON.stringify(categories));
  syncDataWithCloud();
}

// ==========================================
// Theme Management
// ==========================================

function initTheme() {
  const savedTheme = localStorage.getItem('start_theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  theme = savedTheme ? savedTheme : (systemPrefersDark ? 'dark' : 'light');
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

  const themeToggleIcon = document.getElementById('theme-toggle-icon');
  if (themeToggleIcon) {
    themeToggleIcon.innerHTML = theme === 'dark'
      ? `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-pastel-pink-200"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" /></svg>`
      : `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-slate-700"><path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" /></svg>`;
  }

  // Refresh tasks if needed (e.g. empty state asleep star and star outlines)
  renderTasks();
}

// ==========================================
// Rendering: Categories & Tasks
// ==========================================

function renderCategories() {
  const categoryFiltersContainer = document.getElementById('category-filters');
  const taskCategorySelect = document.getElementById('task-category');
  if (!categoryFiltersContainer || !taskCategorySelect) return;

  let filterHTML = `
    <button onclick="setFilter('all')" class="px-4 py-2 rounded-full font-title font-bold text-sm transition-all duration-200 shadow-sm cursor-pointer shrink-0 ${currentFilter === 'all'
      ? 'bg-pastel-pink-300 text-white dark:bg-pastel-pink-500 shadow-pastel-pink-300/40'
      : 'bg-white dark:bg-dark-card text-slate-700 dark:text-slate-200 hover:bg-pastel-pink-50 dark:hover:bg-dark-hover'
    }">
      Todas
    </button>
  `;

  categories.forEach(cat => {
    const isSelected = currentFilter === cat.id;
    const colorStyles = PASTEL_COLOR_MAP[cat.color] || PASTEL_COLOR_MAP['pastel-pink'];

    filterHTML += `
      <button onclick="setFilter('${cat.id}')" class="px-4 py-2 rounded-full font-title font-bold text-sm transition-all duration-200 shadow-sm cursor-pointer shrink-0 ${isSelected
        ? 'bg-pastel-pink-300 text-white dark:bg-pastel-pink-500 shadow-pastel-pink-300/40'
        : `bg-white dark:bg-dark-card ${colorStyles.text} hover:bg-pastel-pink-50 dark:hover:bg-dark-hover`
      }">
        ${cat.name}
      </button>
    `;
  });

  categoryFiltersContainer.innerHTML = filterHTML;

  let selectHTML = '';
  categories.forEach(cat => {
    selectHTML += `<option value="${cat.id}">${cat.name}</option>`;
  });
  taskCategorySelect.innerHTML = selectHTML;

  renderManageCategories();
}

function renderManageCategories() {
  const listContainer = document.getElementById('manage-categories-list');
  if (!listContainer) return;

  let html = '';
  categories.forEach(cat => {
    const colorStyles = PASTEL_COLOR_MAP[cat.color] || PASTEL_COLOR_MAP['pastel-pink'];
    html += `
      <div class="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-dark-border bg-slate-50/70 dark:bg-dark-card/50">
        <div class="flex items-center gap-2">
          <span class="w-3.5 h-3.5 rounded-full ${colorStyles.bg}"></span>
          <span class="text-sm font-medium text-slate-700 dark:text-slate-200">${cat.name}</span>
        </div>
        ${categories.length > 1 ? `
          <button onclick="deleteCategory('${cat.id}')" class="text-red-400 hover:text-red-600 transition-colors p-1 cursor-pointer" title="Eliminar Categoría">
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

function renderTasks() {
  const taskListContainer = document.getElementById('task-list');
  if (!taskListContainer) return;

  let filtered = tasks;
  if (currentFilter !== 'all') {
    filtered = tasks.filter(t => t.categoryId === currentFilter);
  }

  const activeTasks = filtered.filter(t => !t.completed).sort((a, b) => {
    // 1. Tareas con prioridad siempre al inicio
    if (Boolean(a.priority) !== Boolean(b.priority)) {
      return a.priority ? -1 : 1;
    }
    // 2. Orden personalizado
    return (a.order || 0) - (b.order || 0);
  });
  const completedTasks = filtered.filter(t => t.completed).sort((a, b) => (a.order || 0) - (b.order || 0));

  if (filtered.length === 0) {
    taskListContainer.innerHTML = `
      <div class="flex flex-col items-center justify-center py-12 text-center animate-task-appear">
        <div class="w-28 h-28 sm:w-32 sm:h-32 mb-3 animate-float flex items-center justify-center">
          ${getAsleepSVG(theme === 'dark')}
        </div>
        <p class="text-slate-400 dark:text-slate-500 font-title text-sm max-w-xs">No hay tareas aquí. ¡Crea una nueva para empezar!</p>
      </div>
    `;
    return;
  }

  let html = '';

  if (activeTasks.length > 0) {
    html += `<div class="space-y-3 task-group" id="active-tasks-container" data-status="active">`;
    activeTasks.forEach(task => {
      html += renderTaskCard(task);
    });
    html += `</div>`;
  }

  if (completedTasks.length > 0) {
    if (activeTasks.length > 0) {
      html += `<div class="h-px bg-slate-100 dark:bg-dark-border my-6"></div>`;
    }
    html += `
      <div class="mb-3 flex items-center gap-2">
        <span class="font-title text-sm text-slate-400 dark:text-slate-500">Completadas (${completedTasks.length})</span>
        <span class="h-0.5 flex-1 bg-slate-100/70 dark:bg-dark-border/40"></span>
      </div>
      <div class="space-y-3 opacity-80 task-group" id="completed-tasks-container" data-status="completed">
    `;
    completedTasks.forEach(task => {
      html += renderTaskCard(task);
    });
    html += `</div>`;
  }

  taskListContainer.innerHTML = html;
  attachDragAndDropListeners();
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
      data-task-id="${task.id}"
      tabindex="0"
      onclick="selectTask(event, '${task.id}')"
      class="task-card p-4 rounded-2xl border-2 bg-white dark:bg-dark-card flex items-center justify-between gap-3.5 cursor-grab active:cursor-grabbing outline-none ${cardBorderClass} custom-focus select-none"
      role="listitem"
      aria-selected="${isSelected}"
      draggable="true"
    >
      <!-- Drag Handle Indicator (Desktop & Mobile visual cue) -->
      <div class="drag-handle text-slate-300 dark:text-slate-600 hover:text-pastel-pink-400 cursor-grab shrink-0 p-1 -ml-1">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </div>

      <div class="flex items-center gap-3.5 flex-1 min-w-0 pointer-events-auto">
        <!-- Custom Checkbox -->
        <button 
          onclick="toggleTaskComplete(event, '${task.id}')" 
          class="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer select-none shrink-0 ${task.completed
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
              ${escapeHTML(task.title)}
            </h3>
            <span class="text-xs px-2.5 py-0.5 rounded-full font-medium ${colorStyles.bg} ${colorStyles.text}">
              ${escapeHTML(category.name)}
            </span>
          </div>
          ${task.description ? `<p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">${escapeHTML(task.description)}</p>` : ''}
        </div>
      </div>

      <div class="flex items-center gap-1.5 shrink-0 pointer-events-auto">
        <!-- Priority Star Button -->
        <button 
          onclick="toggleTaskPriority(event, '${task.id}')" 
          title="Prioridad"
          class="focus:outline-none cursor-pointer"
        >
          ${getStarSVG(task.priority, theme === 'dark')}
        </button>

        <!-- Edit Button -->
        <button 
          onclick="openEditModal(event, '${task.id}')"
          class="p-1.5 text-slate-400 hover:text-pastel-pink-400 dark:hover:text-pastel-pink-300 rounded-lg hover:bg-slate-50 dark:hover:bg-dark-hover transition-colors cursor-pointer"
          title="Editar Tarea"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4.5 h-4.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
          </svg>
        </button>

        <!-- Delete Button -->
        <button 
          onclick="deleteTask(event, '${task.id}')"
          class="p-1.5 text-slate-400 hover:text-red-400 dark:hover:text-red-300 rounded-lg hover:bg-slate-50 dark:hover:bg-dark-hover transition-colors cursor-pointer"
          title="Eliminar Tarea"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4.5 h-4.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
          </svg>
        </button>
      </div>
    </div>
  `;
}

function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g,
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

// ==========================================
// Touch & Mouse Drag and Drop (Long Press & Move)
// ==========================================

let draggedTaskId = null;
let longPressTimer = null;
let touchStartY = 0;
let touchStartX = 0;
let isTouchDragging = false;
let draggedElement = null;
let placeholderElement = null;

function attachDragAndDropListeners() {
  const cards = document.querySelectorAll('.task-card');
  cards.forEach(card => {
    const taskId = card.getAttribute('data-task-id');
    if (!taskId) return;

    // --- Touch Events (Mobile Long Press & Move) ---
    card.addEventListener('touchstart', (e) => {
      if (e.target.closest('button') || e.target.closest('svg') || e.target.closest('input') || e.target.closest('select')) {
        return;
      }

      const touch = e.touches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      isTouchDragging = false;

      clearTimeout(longPressTimer);
      longPressTimer = setTimeout(() => {
        startTouchDrag(card, taskId);
      }, 300);
    }, { passive: true });

    card.addEventListener('touchmove', (e) => {
      const touch = e.touches[0];
      const moveX = Math.abs(touch.clientX - touchStartX);
      const moveY = Math.abs(touch.clientY - touchStartY);

      if (!isTouchDragging) {
        if (moveX > 10 || moveY > 10) {
          clearTimeout(longPressTimer);
        }
      } else {
        if (e.cancelable) e.preventDefault();
        handleTouchMoveDrag(touch.clientY);
      }
    }, { passive: false });

    card.addEventListener('touchend', () => {
      clearTimeout(longPressTimer);
      if (isTouchDragging) {
        endTouchDrag();
      }
    });

    card.addEventListener('touchcancel', () => {
      clearTimeout(longPressTimer);
      if (isTouchDragging) {
        endTouchDrag();
      }
    });

    // --- HTML5 Drag Events (Desktop Mouse) ---
    card.addEventListener('dragstart', (e) => {
      draggedTaskId = taskId;
      card.classList.add('is-dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', taskId);
    });

    card.addEventListener('dragend', () => {
      card.classList.remove('is-dragging');
      draggedTaskId = null;
      removePlaceholder();
    });

    card.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';

      if (!draggedTaskId || draggedTaskId === taskId) return;
      const targetRect = card.getBoundingClientRect();
      const next = (e.clientY - targetRect.top) / targetRect.height > 0.5;

      const parent = card.parentNode;
      if (parent) {
        const draggedCard = document.getElementById(`card-${draggedTaskId}`);
        if (draggedCard && draggedCard !== card) {
          parent.insertBefore(draggedCard, next ? card.nextSibling : card);
        }
      }
    });

    card.addEventListener('drop', (e) => {
      e.preventDefault();
      persistDomTaskOrder();
    });
  });
}

function startTouchDrag(card, taskId) {
  isTouchDragging = true;
  draggedTaskId = taskId;
  draggedElement = card;

  if (navigator.vibrate) {
    try { navigator.vibrate([40]); } catch (e) { }
  }

  card.classList.add('is-dragging');
  document.body.classList.add('touch-reorder-active');
}

function handleTouchMoveDrag(clientY) {
  if (!draggedElement || !isTouchDragging) return;

  const groupContainer = draggedElement.closest('.task-group');
  if (!groupContainer) return;

  const siblingCards = [...groupContainer.querySelectorAll('.task-card:not(.is-dragging)')];

  for (const sibling of siblingCards) {
    const rect = sibling.getBoundingClientRect();
    if (clientY >= rect.top && clientY <= rect.bottom) {
      const isAfter = clientY > rect.top + rect.height / 2;
      groupContainer.insertBefore(draggedElement, isAfter ? sibling.nextSibling : sibling);
      break;
    }
  }
}

function endTouchDrag() {
  if (draggedElement) {
    draggedElement.classList.remove('is-dragging');
  }
  document.body.classList.remove('touch-reorder-active');
  isTouchDragging = false;
  draggedTaskId = null;
  draggedElement = null;

  persistDomTaskOrder();
}

function removePlaceholder() {
  // No-op for placeholder cleanup
}

function persistDomTaskOrder() {
  const allCardElements = document.querySelectorAll('.task-card');
  if (!allCardElements.length) return;

  let newOrderCounter = 1;
  allCardElements.forEach(cardEl => {
    const id = cardEl.getAttribute('data-task-id');
    const task = tasks.find(t => t.id === id);
    if (task) {
      task.order = newOrderCounter++;
    }
  });

  saveTasks();
  renderTasks();
}

// ==========================================
// Task Selection & Actions
// ==========================================

function selectTask(event, taskId) {
  if (event.target.closest('button') || event.target.closest('svg') || event.target.closest('.drag-handle')) {
    return;
  }

  selectedTaskId = taskId;
  renderTasks();

  setTimeout(() => {
    const el = document.getElementById(`card-${taskId}`);
    if (el) el.focus();
  }, 10);
}

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
  if (event) event.stopPropagation();
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

function saveTaskAction() {
  const title = document.getElementById('task-title').value.trim();
  const desc = document.getElementById('task-desc').value.trim();
  const categoryId = document.getElementById('task-category').value;
  const isPriority = document.getElementById('task-priority-toggle').dataset.priority === 'true';

  if (!title) {
    alert('Por favor, introduce el título de la tarea.');
    return;
  }

  if (editingTaskId) {
    const taskIndex = tasks.findIndex(t => t.id === editingTaskId);
    if (taskIndex !== -1) {
      tasks[taskIndex].title = title;
      tasks[taskIndex].description = desc;
      tasks[taskIndex].categoryId = categoryId;
      tasks[taskIndex].priority = isPriority;
    }
  } else {
    let newOrder;
    if (isPriority) {
      const activeTasks = tasks.filter(t => !t.completed);
      newOrder = activeTasks.length > 0 ? Math.min(...activeTasks.map(t => t.order || 0)) - 1 : 0;
    } else {
      newOrder = tasks.length > 0 ? Math.max(...tasks.map(t => t.order || 0)) + 1 : 1;
    }
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
    selectedTaskId = newTask.id;
  }

  saveTasks();
  closeModal();
  renderTasks();
}

function toggleTaskComplete(event, id) {
  if (event) event.stopPropagation();
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  task.completed = !task.completed;

  const sameStatusTasks = tasks.filter(t => t.completed === task.completed);
  const newOrder = sameStatusTasks.length > 0 ? Math.max(...sameStatusTasks.map(t => t.order)) + 1 : 1;
  task.order = newOrder;

  saveTasks();
  renderTasks();
}

function toggleTaskPriority(event, id) {
  if (event) event.stopPropagation();
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  task.priority = !task.priority;
  if (task.priority) {
    const activeTasks = tasks.filter(t => !t.completed && t.id !== id);
    const minOrder = activeTasks.length > 0 ? Math.min(...activeTasks.map(t => t.order || 0)) - 1 : 0;
    task.order = minOrder;
  }
  saveTasks();
  renderTasks();
}

function deleteTask(event, id) {
  if (event) event.stopPropagation();
  if (confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
    tasks = tasks.filter(t => t.id !== id);
    if (selectedTaskId === id) selectedTaskId = null;
    saveTasks();
    renderTasks();
  }
}

function setFilter(filterId) {
  currentFilter = filterId;
  renderCategories();
  renderTasks();
}

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

// ==========================================
// Authentication & User Profile UI
// ==========================================

function updateAuthUI() {
  const displayNameEl = document.getElementById('user-display-name');
  const avatarIconEl = document.getElementById('user-avatar-icon');
  const welcomeSubtitleEl = document.getElementById('welcome-user-subtitle');

  const profileNameEl = document.getElementById('profile-name-text');
  const profileEmailEl = document.getElementById('profile-email-text');
  const profileAvatarEl = document.getElementById('profile-avatar');

  if (currentUser) {
    const name = currentUser.displayName || (currentUser.email ? currentUser.email.split('@')[0] : 'Usuario');
    const initial = name.charAt(0).toUpperCase();

    if (displayNameEl) displayNameEl.textContent = name;
    if (avatarIconEl) {
      avatarIconEl.innerHTML = `<span class="w-5 h-5 rounded-full bg-pastel-pink-300 text-white text-[10px] font-bold flex items-center justify-center">${initial}</span>`;
    }
    if (welcomeSubtitleEl) {
      welcomeSubtitleEl.textContent = `¡Hola de nuevo, ${name}! Tus tareas están sincronizadas.`;
    }

    if (profileNameEl) profileNameEl.textContent = name;
    if (profileEmailEl) profileEmailEl.textContent = currentUser.email || 'Conectado a la nube';
    if (profileAvatarEl) profileAvatarEl.textContent = initial;

    updateSyncStatus('synced');
  } else {
    if (displayNameEl) displayNameEl.textContent = 'Iniciar Sesión';
    if (avatarIconEl) {
      avatarIconEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg>`;
    }
    if (welcomeSubtitleEl) {
      welcomeSubtitleEl.textContent = 'Write like you are running out of time.';
    }

    updateSyncStatus('local');
  }
}

function openAuthOrProfileModal() {
  if (currentUser) {
    openProfileModal();
  } else {
    openAuthModal();
  }
}

function openAuthModal() {
  clearAuthAlert();
  document.getElementById('auth-modal').classList.remove('hidden');
  document.getElementById('auth-modal').classList.add('flex');
}

function closeAuthModal() {
  document.getElementById('auth-modal').classList.add('hidden');
  document.getElementById('auth-modal').classList.remove('flex');
}

function openProfileModal() {
  updateSyncStatus('synced');
  document.getElementById('user-profile-modal').classList.remove('hidden');
  document.getElementById('user-profile-modal').classList.add('flex');
}

function closeProfileModal() {
  document.getElementById('user-profile-modal').classList.add('hidden');
  document.getElementById('user-profile-modal').classList.remove('flex');
}

function switchAuthTab(tab) {
  authMode = tab;
  const loginTab = document.getElementById('auth-tab-login');
  const registerTab = document.getElementById('auth-tab-register');
  const syncTab = document.getElementById('auth-tab-sync');
  const nameGroup = document.getElementById('auth-name-group');
  const emailGroup = document.getElementById('auth-email-group');
  const passwordGroup = document.getElementById('auth-password-group');
  const syncGroup = document.getElementById('auth-sync-group');
  const extraOptions = document.getElementById('auth-extra-options');
  const submitBtn = document.getElementById('auth-submit-btn');

  clearAuthAlert();

  const activeClass = 'flex-1 py-1.5 rounded-lg text-xs font-title font-semibold transition-all duration-200 bg-white dark:bg-dark-card text-pastel-pink-500 dark:text-pastel-pink-300 shadow-sm cursor-pointer';
  const inactiveClass = 'flex-1 py-1.5 rounded-lg text-xs font-title font-semibold transition-all duration-200 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer';

  if (loginTab) loginTab.className = tab === 'login' ? activeClass : inactiveClass;
  if (registerTab) registerTab.className = tab === 'register' ? activeClass : inactiveClass;
  if (syncTab) syncTab.className = tab === 'sync' ? activeClass : inactiveClass;

  if (tab === 'login') {
    if (nameGroup) nameGroup.classList.add('hidden');
    if (syncGroup) syncGroup.classList.add('hidden');
    if (emailGroup) emailGroup.classList.remove('hidden');
    if (passwordGroup) passwordGroup.classList.remove('hidden');
    if (extraOptions) extraOptions.classList.remove('hidden');
    if (submitBtn) submitBtn.innerHTML = '<span>Iniciar Sesión</span>';
  } else if (tab === 'register') {
    if (nameGroup) nameGroup.classList.remove('hidden');
    if (syncGroup) syncGroup.classList.add('hidden');
    if (emailGroup) emailGroup.classList.remove('hidden');
    if (passwordGroup) passwordGroup.classList.remove('hidden');
    if (extraOptions) extraOptions.classList.remove('hidden');
    if (submitBtn) submitBtn.innerHTML = '<span>Crear Cuenta</span>';
  } else if (tab === 'sync') {
    if (nameGroup) nameGroup.classList.add('hidden');
    if (emailGroup) emailGroup.classList.add('hidden');
    if (passwordGroup) passwordGroup.classList.add('hidden');
    if (syncGroup) syncGroup.classList.remove('hidden');
    if (extraOptions) extraOptions.classList.add('hidden');
    if (submitBtn) submitBtn.innerHTML = '<span>📲 Cargar Datos del Celular</span>';
  }
}

function togglePasswordVisibility() {
  const passInput = document.getElementById('auth-password');
  if (!passInput) return;
  passInput.type = passInput.type === 'password' ? 'text' : 'password';
}

function showAuthAlert(message, isError = true) {
  const alertEl = document.getElementById('auth-alert');
  if (!alertEl) return;
  alertEl.className = isError
    ? 'p-3 rounded-xl text-xs font-medium bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-900/30'
    : 'p-3 rounded-xl text-xs font-medium bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/30';
  alertEl.textContent = message;
  alertEl.classList.remove('hidden');
}

function clearAuthAlert() {
  const alertEl = document.getElementById('auth-alert');
  if (alertEl) {
    alertEl.classList.add('hidden');
    alertEl.textContent = '';
  }
}

// ==========================================
// Local User Vault & Fallback Auth
// ==========================================

function getUsersVault() {
  try {
    const raw = localStorage.getItem('start_users_vault');
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function saveUsersVault(vault) {
  localStorage.setItem('start_users_vault', JSON.stringify(vault));
}

function localRegisterUser(name, email, password) {
  const vault = getUsersVault();
  const normalizedEmail = email.toLowerCase().trim();
  
  if (vault[normalizedEmail]) {
    return { success: false, message: 'Este correo ya está registrado. Por favor inicia sesión.' };
  }

  const userId = 'usr_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 5);
  const newUser = {
    uid: userId,
    email: normalizedEmail,
    displayName: name || normalizedEmail.split('@')[0],
    password: password,
    createdAt: new Date().toISOString()
  };

  vault[normalizedEmail] = newUser;
  saveUsersVault(vault);

  return { success: true, user: newUser };
}

function localLoginUser(email, password) {
  const vault = getUsersVault();
  const normalizedEmail = email.toLowerCase().trim();
  const user = vault[normalizedEmail];

  if (!user) {
    return { success: false, message: 'No existe una cuenta con este correo. Por favor regístrate primero.' };
  }

  if (user.password !== password) {
    return { success: false, message: 'Contraseña incorrecta. Por favor inténtalo de nuevo.' };
  }

  return { success: true, user: user };
}

function copySyncCode() {
  const vault = getUsersVault();
  const payload = {
    version: 1,
    user: currentUser,
    tasks: tasks,
    categories: categories,
    vault: vault,
    exportedAt: new Date().toISOString()
  };

  try {
    const jsonStr = JSON.stringify(payload);
    const code = btoa(unescape(encodeURIComponent(jsonStr)));

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(code)
        .then(() => {
          alert('¡Código de sincronización copiado al portapapeles!\n\nAhora abre StarT en tu otro dispositivo (computadora o celular), ve a Iniciar Sesión > "📲 Desde Celular" y pégalo para tener todos tus datos idénticos.');
        })
        .catch(() => {
          prompt('Copia este código de sincronización para pegarlo en tu otro dispositivo:', code);
        });
    } else {
      prompt('Copia este código de sincronización para pegarlo en tu otro dispositivo:', code);
    }
  } catch (err) {
    console.error('Error generando sync code:', err);
    alert('No se pudo generar el código de sincronización.');
  }
}

function promptImportSyncCode() {
  const code = prompt('Pega aquí el código de sincronización que copiaste desde tu celular/otro dispositivo:');
  if (code && code.trim()) {
    const res = importSyncCode(code.trim());
    if (res.success) {
      alert('¡Datos sincronizados exitosamente!\nTu cuenta y todas tus tareas han sido restauradas.');
      closeProfileModal();
    } else {
      alert(res.message || 'Código de sincronización inválido.');
    }
  }
}

function importSyncCode(codeStr) {
  try {
    const jsonStr = decodeURIComponent(escape(atob(codeStr.trim())));
    const payload = JSON.parse(jsonStr);

    if (!payload || (!payload.tasks && !payload.user)) {
      return { success: false, message: 'El código de sincronización no tiene un formato válido.' };
    }

    // 1. Restore Vault
    if (payload.vault && typeof payload.vault === 'object') {
      const currentVault = getUsersVault();
      const mergedVault = { ...currentVault, ...payload.vault };
      saveUsersVault(mergedVault);
    }

    // 2. Restore User Session
    if (payload.user) {
      currentUser = payload.user;
      localStorage.setItem('start_active_user', JSON.stringify(currentUser));
    }

    // 3. Restore Categories & Tasks
    if (Array.isArray(payload.categories) && payload.categories.length > 0) {
      categories = payload.categories;
      saveCategories();
    }

    if (Array.isArray(payload.tasks)) {
      tasks = payload.tasks;
      saveTasks();
    }

    onUserLoggedIn(currentUser || { uid: 'guest', email: '' });
    updateAuthUI();

    return { success: true };
  } catch (err) {
    console.error('Import error:', err);
    return { success: false, message: 'Código no válido o dañado. Por favor vuelve a copiarlo.' };
  }
}

function handleAuthSubmit(event) {
  event.preventDefault();
  clearAuthAlert();

  // Sync Code Tab handling
  if (authMode === 'sync') {
    const syncCode = document.getElementById('auth-sync-input').value.trim();
    if (!syncCode) {
      showAuthAlert('Por favor pega el código de sincronización de tu celular.');
      return;
    }

    const res = importSyncCode(syncCode);
    if (res.success) {
      closeAuthModal();
      alert('¡Sincronización completada!\nTus tareas, materias y cuenta han sido importadas a esta computadora.');
    } else {
      showAuthAlert(res.message || 'Código de sincronización no válido.');
    }
    return;
  }

  const email = document.getElementById('auth-email').value.trim();
  const password = document.getElementById('auth-password').value;
  const name = document.getElementById('auth-name').value.trim();

  if (!email || !password) {
    showAuthAlert('Por favor llena todos los campos.');
    return;
  }

  const submitBtn = document.getElementById('auth-submit-btn');
  submitBtn.disabled = true;
  submitBtn.classList.add('opacity-70');

  // Check if live Firebase project has been configured
  const hasLiveFirebase = localStorage.getItem('start_firebase_config');

  if (hasLiveFirebase && typeof firebase !== 'undefined' && firebase.auth) {
    if (authMode === 'login') {
      firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
          closeAuthModal();
        })
        .catch((error) => {
          console.error('Firebase Login error:', error);
          // Fallback to local vault
          const localResult = localLoginUser(email, password);
          if (localResult.success) {
            currentUser = localResult.user;
            localStorage.setItem('start_active_user', JSON.stringify(currentUser));
            onUserLoggedIn(currentUser);
            updateAuthUI();
            closeAuthModal();
          } else {
            showAuthAlert(localResult.message || 'Correo o contraseña incorrectos.');
          }
        })
        .finally(() => {
          submitBtn.disabled = false;
          submitBtn.classList.remove('opacity-70');
        });
    } else {
      firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
          const user = userCredential.user;
          if (name && user) {
            return user.updateProfile({ displayName: name });
          }
        })
        .then(() => {
          closeAuthModal();
        })
        .catch((error) => {
          console.error('Firebase Register error:', error);
          // Fallback to local vault
          const localResult = localRegisterUser(name, email, password);
          if (localResult.success) {
            currentUser = localResult.user;
            localStorage.setItem('start_active_user', JSON.stringify(currentUser));
            onUserLoggedIn(currentUser);
            updateAuthUI();
            closeAuthModal();
          } else {
            showAuthAlert(localResult.message);
          }
        })
        .finally(() => {
          submitBtn.disabled = false;
          submitBtn.classList.remove('opacity-70');
        });
    }
  } else {
    // Seamless Direct User Vault Authentication
    setTimeout(() => {
      if (authMode === 'login') {
        const result = localLoginUser(email, password);
        if (result.success) {
          currentUser = result.user;
          localStorage.setItem('start_active_user', JSON.stringify(currentUser));
          onUserLoggedIn(currentUser);
          updateAuthUI();
          closeAuthModal();
        } else {
          showAuthAlert(result.message);
        }
      } else {
        const result = localRegisterUser(name, email, password);
        if (result.success) {
          currentUser = result.user;
          localStorage.setItem('start_active_user', JSON.stringify(currentUser));
          onUserLoggedIn(currentUser);
          updateAuthUI();
          closeAuthModal();
        } else {
          showAuthAlert(result.message);
        }
      }
      submitBtn.disabled = false;
      submitBtn.classList.remove('opacity-70');
    }, 150);
  }
}

function handleGoogleSignIn() {
  const hasLiveFirebase = localStorage.getItem('start_firebase_config');
  if (hasLiveFirebase && typeof firebase !== 'undefined' && firebase.auth) {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider)
      .then(() => {
        closeAuthModal();
      })
      .catch((error) => {
        console.warn('Google Auth notice:', error);
        showAuthAlert('No se pudo completar el acceso con Google: ' + (error.message || 'Ventana cerrada'));
      });
  } else {
    // Quick Google profile creation
    const emailPrompt = prompt('Introduce tu correo de Google:', 'usuario@gmail.com');
    if (emailPrompt && emailPrompt.trim()) {
      const email = emailPrompt.trim().toLowerCase();
      const name = email.split('@')[0];
      currentUser = {
        uid: 'google_' + btoa(email),
        email: email,
        displayName: name.charAt(0).toUpperCase() + name.slice(1),
        photoURL: null
      };
      localStorage.setItem('start_active_user', JSON.stringify(currentUser));
      onUserLoggedIn(currentUser);
      updateAuthUI();
      closeAuthModal();
    }
  }
}

function continueAsGuest() {
  currentUser = null;
  localStorage.removeItem('start_active_user');
  onUserLoggedOut();
  updateAuthUI();
  closeAuthModal();
}

function handleSignOut() {
  if (typeof firebase !== 'undefined' && firebase.auth) {
    try { firebase.auth().signOut(); } catch (e) {}
  }
  currentUser = null;
  localStorage.removeItem('start_active_user');
  onUserLoggedOut();
  updateAuthUI();
  closeProfileModal();
}


// ==========================================
// Keyboard Navigation & Shortcuts (Desktop)
// ==========================================

function setupEventListeners() {
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      theme = theme === 'light' ? 'dark' : 'light';
      applyTheme();
      renderTasks();
    });
  }

  window.addEventListener('keydown', (e) => {
    const activeEl = document.activeElement;
    if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.tagName === 'SELECT')) {
      return;
    }

    if (!selectedTaskId) return;
    const task = tasks.find(t => t.id === selectedTaskId);
    if (!task) return;

    let list = tasks;
    if (currentFilter !== 'all') {
      list = tasks.filter(t => t.categoryId === currentFilter);
    }

    const activeTasksList = list.filter(t => !t.completed).sort((a, b) => a.order - b.order);
    const completedTasksList = list.filter(t => t.completed).sort((a, b) => a.order - b.order);

    const targetList = task.completed ? completedTasksList : activeTasksList;
    const index = targetList.findIndex(t => t.id === selectedTaskId);
    if (index === -1) return;

    // Ctrl + Up / Down to reorder via keyboard
    if (e.ctrlKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
      e.preventDefault();
      let swapWithIndex = -1;
      if (e.key === 'ArrowUp' && index > 0) swapWithIndex = index - 1;
      else if (e.key === 'ArrowDown' && index < targetList.length - 1) swapWithIndex = index + 1;

      if (swapWithIndex !== -1) {
        const otherTask = targetList[swapWithIndex];
        const tempOrder = task.order;
        task.order = otherTask.order;
        otherTask.order = tempOrder;

        saveTasks();
        renderTasks();

        setTimeout(() => {
          const cardEl = document.getElementById(`card-${selectedTaskId}`);
          if (cardEl) {
            cardEl.focus();
            cardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }, 30);
      }
    }
    // Arrow Up / Down to navigate
    else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      const fullList = [...activeTasksList, ...completedTasksList];
      const fullIndex = fullList.findIndex(t => t.id === selectedTaskId);

      let newSelectIndex = -1;
      if (e.key === 'ArrowUp' && fullIndex > 0) newSelectIndex = fullIndex - 1;
      else if (e.key === 'ArrowDown' && fullIndex < fullList.length - 1) newSelectIndex = fullIndex + 1;

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

// ==========================================
// PWA Configuration
// ==========================================

function setupPWA() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
      .then((reg) => console.log('Service worker registrado:', reg.scope))
      .catch((err) => console.warn('Aviso de Service worker:', err));
  }

  const installBtn = document.getElementById('install-btn');
  if (!installBtn) return;

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBtn.classList.remove('hidden');
    installBtn.classList.add('flex');
  });

  installBtn.addEventListener('click', () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('App instalada');
      }
      deferredPrompt = null;
      installBtn.classList.remove('flex');
      installBtn.classList.add('hidden');
    });
  });

  window.addEventListener('appinstalled', () => {
    installBtn.classList.remove('flex');
    installBtn.classList.add('hidden');
  });
}
