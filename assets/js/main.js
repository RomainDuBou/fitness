// Smooth scroll for same-page anchors
const enableSmoothScroll = () => {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href.length > 1) {
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });
};

// Navbar scroll effect
const enableNavbarScrollEffect = () => {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  const onScroll = () => {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', onScroll);
  onScroll();
};

// Enhanced animations observer
const enableAnimationsObserver = () => {
  const animatedElements = document.querySelectorAll('.fade-in-up, .slide-in-left, .slide-in-right, .scale-in');
  if (!animatedElements.length) return;
  
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // For counter animation
          if (entry.target.querySelector('.counter')) {
            animateCounter(entry.target.querySelector('.counter'));
          }
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
  );
  
  animatedElements.forEach((el) => observer.observe(el));
};

// Counter animation
const animateCounter = (counter) => {
  const target = parseInt(counter.getAttribute('data-target'));
  if (!target) return;
  
  const duration = 2000;
  const increment = target / (duration / 16);
  let current = 0;
  
  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      counter.textContent = target.toLocaleString() + (counter.textContent.includes('%') ? '%' : '+');
      clearInterval(timer);
    } else {
      counter.textContent = Math.floor(current).toLocaleString() + (counter.textContent.includes('%') ? '%' : '+');
    }
  }, 16);
};

// Mobile menu handling  
const enableMobileMenu = () => {
  const menuBtn = document.getElementById('menu-toggle');
  const navbarLinks = document.getElementById('navbar-links');
  if (!menuBtn || !navbarLinks) return;

  const mobileMenu = document.createElement('div');
  mobileMenu.className = 'mobile-menu fixed top-0 left-0 w-full h-screen bg-black z-40 flex flex-col items-center justify-center space-y-8 transform translate-x-full transition-transform duration-500';
  
  // Clone navbar links content
  const links = navbarLinks.cloneNode(true);
  links.className = 'flex flex-col items-center space-y-8';
  links.querySelectorAll('a').forEach(link => {
    link.className = 'text-2xl font-bold text-white hover:text-red-500 transition uppercase tracking-wider';
  });
  
  mobileMenu.appendChild(links);
  document.body.appendChild(mobileMenu);

  let menuOpen = false;
  menuBtn.addEventListener('click', () => {
    menuOpen = !menuOpen;
    if (menuOpen) {
      mobileMenu.style.transform = 'translateX(0)';
      menuBtn.innerHTML = '<i class="fas fa-times"></i>';
    } else {
      mobileMenu.style.transform = 'translateX(100%)';
      menuBtn.innerHTML = '<i class="fas fa-bars"></i>';
    }
  });

  mobileMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      mobileMenu.style.transform = 'translateX(100%)';
      menuBtn.innerHTML = '<i class="fas fa-bars"></i>';
      menuOpen = false;
    });
  });
};

// Enhanced workout cards render
const renderWorkouts = (workouts, container) => {
  container.innerHTML = '';
  if (!workouts.length) {
    container.innerHTML = '<p class="text-gray-500 col-span-full text-center">Aucun workout trouvé.</p>';
    return;
  }

  workouts.forEach((workout, index) => {
    const card = document.createElement('div');
    card.className = 'card-dark rounded-xl overflow-hidden fade-in-up';
    card.style.animationDelay = `${index * 0.1}s`;
    
    const typeColors = {
      'force': 'bg-red-500',
      'cardio': 'bg-orange-500',
      'musculation': 'bg-purple-500',
      'core': 'bg-blue-500',
      'fonctionnel': 'bg-green-500'
    };
    
    const typeColor = typeColors[workout.type] || 'bg-gray-500';
    
    card.innerHTML = `
      <div class="image-overlay-dark h-56">
        <img src="${workout.thumbnail}" alt="${workout.title}" class="w-full h-full object-cover" />
        <div class="absolute top-4 left-4 z-10">
          <span class="${typeColor} text-black px-3 py-1 rounded font-bold text-xs uppercase">${workout.type}</span>
        </div>
      </div>
      <div class="p-6 space-y-4">
        <h3 class="text-xl font-black uppercase">${workout.title}</h3>
        <p class="text-gray-400 text-sm">${workout.description}</p>
        <div class="flex items-center justify-between text-sm">
          <span class="text-gray-500"><i class="far fa-clock mr-1 text-red-500"></i>${workout.duration} min</span>
          <span class="text-gray-500"><i class="fas fa-fire mr-1 text-red-500"></i>${workout.calories || '---'} kcal</span>
          <span class="text-gray-500"><i class="fas fa-signal mr-1 text-red-500"></i>${workout.level}</span>
        </div>
        <div class="flex flex-wrap gap-2 text-xs">
          ${workout.muscles.map(muscle => 
            `<span class="px-2 py-1 bg-red-500/20 text-red-400 rounded">${muscle}</span>`
          ).join('')}
        </div>
        <a href="/pages/workouts/detail.html?id=${workout.id}" 
           class="btn-primary w-full text-center py-3 rounded inline-block">
          START WORKOUT
        </a>
      </div>
    `;
    container.appendChild(card);
  });
};

// Load and filter workouts
const initWorkoutsListing = async () => {
  const grid = document.getElementById('workouts-grid');
  if (!grid) return;

  const typeSelect = document.getElementById('filter-type');
  const levelSelect = document.getElementById('filter-level');
  const durationSelect = document.getElementById('filter-duration');
  const searchInput = document.getElementById('filter-search');

  let workouts = [];
  try {
    const res = await fetch('/assets/data/workouts.json');
    workouts = await res.json();
  } catch (err) {
    console.error('Error loading workouts', err);
  }

  const applyFilters = () => {
    const type = typeSelect?.value || 'all';
    const level = levelSelect?.value || 'all';
    const duration = durationSelect?.value || 'all';
    const search = (searchInput?.value || '').toLowerCase();

    const filtered = workouts.filter((w) => {
      const matchType = type === 'all' || w.type.toLowerCase() === type;
      const matchLevel = level === 'all' || w.level.toLowerCase() === level;
      const matchDuration = (() => {
        if (duration === 'all') return true;
        if (duration === '-20') return w.duration < 20;
        if (duration === '20-40') return w.duration >= 20 && w.duration <= 40;
        if (duration === '40+') return w.duration > 40;
        return true;
      })();
      const matchSearch = w.title.toLowerCase().includes(search) || 
                          w.description.toLowerCase().includes(search) ||
                          w.muscles.some(m => m.toLowerCase().includes(search));
      return matchType && matchLevel && matchDuration && matchSearch;
    });

    renderWorkouts(filtered, grid);
    enableAnimationsObserver();
  };

  [typeSelect, levelSelect, durationSelect, searchInput]
    .filter(Boolean)
    .forEach((el) => el.addEventListener('input', applyFilters));

  renderWorkouts(workouts, grid);
  enableAnimationsObserver();
};

// Workout detail page
const initWorkoutDetail = async () => {
  const detailContainer = document.getElementById('workout-detail');
  const loadingContainer = document.getElementById('workout-loading');
  if (!detailContainer) return;

  const params = new URLSearchParams(window.location.search);
  const workoutId = params.get('id');
  
  let workouts = [];
  try {
    const res = await fetch('/assets/data/workouts.json');
    if (!res.ok) throw new Error('Failed to fetch');
    workouts = await res.json();
  } catch (err) {
    console.error('Error loading workout', err);
    if (loadingContainer) loadingContainer.classList.add('hidden');
    detailContainer.classList.remove('hidden');
    detailContainer.innerHTML = `
      <div class="text-center py-20">
        <i class="fas fa-exclamation-triangle text-red-500 text-4xl mb-4"></i>
        <p class="text-gray-500">Erreur de chargement. <a href="/pages/workouts/index.html" class="text-red-500 underline">Retour aux workouts</a></p>
      </div>
    `;
    return;
  }
  
  const workout = workouts.find((w) => w.id === workoutId);
  if (!workout) {
    if (loadingContainer) loadingContainer.classList.add('hidden');
    detailContainer.classList.remove('hidden');
    detailContainer.innerHTML = `
      <div class="text-center py-20">
        <i class="fas fa-search text-red-500 text-4xl mb-4"></i>
        <p class="text-gray-500 mb-4">Workout non trouvé.</p>
        <a href="/pages/workouts/index.html" class="btn-primary px-6 py-3 rounded inline-block">VOIR TOUS LES WORKOUTS</a>
      </div>
    `;
    return;
  }

  const typeColors = {
    'force': 'bg-red-500',
    'cardio': 'bg-orange-500', 
    'musculation': 'bg-purple-500',
    'core': 'bg-blue-500',
    'fonctionnel': 'bg-green-500'
  };
  
  const typeColor = typeColors[workout.type] || 'bg-gray-500';

  // Hide loading, show content
  if (loadingContainer) loadingContainer.classList.add('hidden');
  detailContainer.classList.remove('hidden');

  // Update page title
  document.title = `${workout.title} - IRONFORGE`;

  detailContainer.innerHTML = `
    <!-- Hero Banner -->
    <div class="relative rounded-2xl overflow-hidden mb-12">
      <img src="${workout.thumbnail}" alt="${workout.title}" class="w-full h-64 md:h-96 object-cover opacity-40" />
      <div class="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
      <div class="absolute bottom-0 left-0 right-0 p-8">
        <span class="${typeColor} text-black px-4 py-2 rounded font-bold text-sm uppercase">${workout.type}</span>
        <h1 class="text-5xl md:text-7xl font-black uppercase mt-4">${workout.title}</h1>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="grid lg:grid-cols-3 gap-10">
      <!-- Left Column - Info -->
      <div class="lg:col-span-1 space-y-6">
        <div class="card-dark rounded-xl p-6">
          <h3 class="text-lg font-black uppercase mb-4 text-red-500">Infos Workout</h3>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <span class="text-gray-500">Durée</span>
              <span class="font-bold"><i class="far fa-clock text-red-500 mr-2"></i>${workout.duration} min</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-gray-500">Calories</span>
              <span class="font-bold"><i class="fas fa-fire text-red-500 mr-2"></i>${workout.calories || '---'} kcal</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-gray-500">Niveau</span>
              <span class="font-bold text-red-400">${workout.level}</span>
            </div>
          </div>
        </div>

        <div class="card-dark rounded-xl p-6">
          <h3 class="text-lg font-black uppercase mb-4 text-red-500">Muscles ciblés</h3>
          <div class="flex flex-wrap gap-2">
            ${workout.muscles.map(m => 
              `<span class="px-3 py-2 bg-red-500/20 text-red-400 rounded text-sm font-semibold">${m}</span>`
            ).join('')}
          </div>
        </div>

        ${workout.equipment && workout.equipment.length > 0 ? `
        <div class="card-dark rounded-xl p-6">
          <h3 class="text-lg font-black uppercase mb-4 text-red-500">Équipement</h3>
          <div class="flex flex-wrap gap-2">
            ${workout.equipment.map(e => 
              `<span class="px-3 py-2 bg-gray-800 text-gray-300 rounded text-sm">${e}</span>`
            ).join('')}
          </div>
        </div>
        ` : ''}
      </div>

      <!-- Right Column - Video & Description -->
      <div class="lg:col-span-2 space-y-8">
        <!-- Video Player -->
        <div class="rounded-xl overflow-hidden border-2 border-red-500/30 shadow-2xl">
          <div class="aspect-video bg-gray-900">
            <iframe 
              class="w-full h-full" 
              src="${workout.video}" 
              title="${workout.title}" 
              frameborder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowfullscreen>
            </iframe>
          </div>
        </div>

        <!-- Description -->
        <div class="card-dark rounded-xl p-6">
          <h3 class="text-xl font-black uppercase mb-4 text-red-500">À propos de ce workout</h3>
          <p class="text-gray-400 text-lg leading-relaxed">${workout.description}</p>
        </div>

        <!-- Instructions Grid -->
        <div class="grid md:grid-cols-3 gap-6">
          <div class="card-dark rounded-xl p-6">
            <div class="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center mb-4">
              <i class="fas fa-running text-red-500 text-xl"></i>
            </div>
            <h4 class="font-black uppercase mb-3">Échauffement</h4>
            <ul class="space-y-2 text-gray-400 text-sm">
              <li>• 5-10 min cardio léger</li>
              <li>• Mobilité articulaire</li>
              <li>• 2 séries légères</li>
            </ul>
          </div>
          
          <div class="card-dark rounded-xl p-6">
            <div class="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center mb-4">
              <i class="fas fa-dumbbell text-red-500 text-xl"></i>
            </div>
            <h4 class="font-black uppercase mb-3">Programme</h4>
            <ul class="space-y-2 text-gray-400 text-sm">
              <li>• 4-5 séries de travail</li>
              <li>• 8-12 répétitions</li>
              <li>• 90-120 sec repos</li>
            </ul>
          </div>
          
          <div class="card-dark rounded-xl p-6">
            <div class="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center mb-4">
              <i class="fas fa-lightbulb text-red-500 text-xl"></i>
            </div>
            <h4 class="font-black uppercase mb-3">Pro Tips</h4>
            <ul class="space-y-2 text-gray-400 text-sm">
              <li>• Technique > Charge</li>
              <li>• Respiration contrôlée</li>
              <li>• Progression régulière</li>
            </ul>
          </div>
        </div>

        <!-- CTA -->
        <div class="bg-gradient-to-r from-red-500/20 to-transparent rounded-xl p-6 border border-red-500/30">
          <div class="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h4 class="font-black text-xl uppercase">Prêt à transpirer ?</h4>
              <p class="text-gray-400">Lancez la vidéo et donnez tout !</p>
            </div>
            <a href="/pages/programs.html" class="btn-primary px-8 py-4 rounded font-bold">
              <i class="fas fa-rocket mr-2"></i>VOIR LES PROGRAMMES
            </a>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Trigger animations
  enableAnimationsObserver();
};

// Initialize everything
window.addEventListener('DOMContentLoaded', () => {
  enableSmoothScroll();
  enableNavbarScrollEffect();
  enableAnimationsObserver();
  enableMobileMenu();
  initWorkoutsListing();
  initWorkoutDetail();
  
  // Initialize counters
  document.querySelectorAll('.counter').forEach(counter => {
    if (!counter.getAttribute('data-target')) {
      const text = counter.textContent;
      const match = text.match(/\d+/);
      if (match) {
        counter.setAttribute('data-target', match[0]);
        counter.textContent = '0';
      }
    }
  });
  
  console.log('🔥 IRONFORGE loaded');
});