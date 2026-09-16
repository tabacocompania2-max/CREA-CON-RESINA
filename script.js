// ===== ACCORDION =====
class Accordion {
  constructor(container) {
    this.container = container;
    this.items = container.querySelectorAll('.accordion-item');
    this.init();
  }

  init() {
    this.items.forEach(item => {
      const header = item.querySelector('.accordion-header');
      header.addEventListener('click', () => this.toggle(item));
      header.addEventListener('keydown', (e) => this.handleKeydown(e, item));
    });
  }

  toggle(item) {
    const isOpen = item.hasAttribute('open');
    
    // Close all other items
    this.items.forEach(other => {
      if (other !== item) other.removeAttribute('open');
    });
    
    // Toggle current
    if (isOpen) {
      item.removeAttribute('open');
    } else {
      item.setAttribute('open', '');
    }
  }

  handleKeydown(e, item) {
    const headers = Array.from(this.container.querySelectorAll('.accordion-header'));
    const currentIndex = headers.indexOf(e.currentTarget);
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        const next = headers[(currentIndex + 1) % headers.length];
        next.focus();
        break;
      case 'ArrowUp':
        e.preventDefault();
        const prev = headers[(currentIndex - 1 + headers.length) % headers.length];
        prev.focus();
        break;
      case 'Home':
        e.preventDefault();
        headers[0].focus();
        break;
      case 'End':
        e.preventDefault();
        headers[headers.length - 1].focus();
        break;
    }
  }
}

// ===== TESTIMONIALS CAROUSEL =====
class TestimonialsCarousel {
  constructor(track, prevBtn, nextBtn, dotsContainer) {
    this.track = track;
    this.prevBtn = prevBtn;
    this.nextBtn = nextBtn;
    this.dotsContainer = dotsContainer;
    this.cards = track.querySelectorAll('.testimonial-card');
    this.currentIndex = 0;
    this.cardWidth = 0;
    this.gap = 16;
    this.isDragging = false;
    this.startX = 0;
    this.scrollLeft = 0;
    this.autoScrollInterval = null;
    
    this.init();
  }

  init() {
    this.calculateCardWidth();
    this.createDots();
    this.bindEvents();
    this.updateDots();
    this.startAutoScroll();
    
    window.addEventListener('resize', () => this.handleResize());
  }

  calculateCardWidth() {
    const firstCard = this.cards[0];
    if (firstCard) {
      const style = getComputedStyle(firstCard);
      this.cardWidth = firstCard.offsetWidth + this.gap;
    }
  }

  createDots() {
    this.dotsContainer.innerHTML = '';
    const dotsCount = Math.ceil(this.cards.length / this.getVisibleCards());
    
    for (let i = 0; i < dotsCount; i++) {
      const dot = document.createElement('button');
      dot.className = 'carousel-dot';
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Ir al grupo de testimonios ${i + 1}`);
      dot.addEventListener('click', () => this.goToPage(i));
      this.dotsContainer.appendChild(dot);
    }
    
    this.dots = this.dotsContainer.querySelectorAll('.carousel-dot');
  }

  getVisibleCards() {
    const trackWidth = this.track.offsetWidth;
    return Math.max(1, Math.floor(trackWidth / (this.cardWidth - this.gap)));
  }

  bindEvents() {
    this.prevBtn.addEventListener('click', () => this.prev());
    this.nextBtn.addEventListener('click', () => this.next());
    
    // Touch/drag support
    this.track.addEventListener('mousedown', (e) => this.onDragStart(e));
    this.track.addEventListener('touchstart', (e) => this.onDragStart(e), { passive: true });
    
    window.addEventListener('mousemove', (e) => this.onDragMove(e));
    window.addEventListener('touchmove', (e) => this.onDragMove(e), { passive: true });
    
    window.addEventListener('mouseup', () => this.onDragEnd());
    window.addEventListener('touchend', () => this.onDragEnd());
    
    // Pause auto-scroll on hover
    this.track.addEventListener('mouseenter', () => this.stopAutoScroll());
    this.track.addEventListener('mouseleave', () => this.startAutoScroll());
    
    // Scroll snap detection
    this.track.addEventListener('scroll', () => this.onScroll(), { passive: true });
  }

  onDragStart(e) {
    this.isDragging = true;
    this.startX = e.type === 'mousedown' ? e.pageX : e.touches[0].pageX;
    this.scrollLeft = this.track.scrollLeft;
    this.stopAutoScroll();
    this.track.style.cursor = 'grabbing';
  }

  onDragMove(e) {
    if (!this.isDragging) return;
    e.preventDefault();
    const x = e.type === 'mousemove' ? e.pageX : e.touches[0].pageX;
    const walk = (x - this.startX) * 1.5;
    this.track.scrollLeft = this.scrollLeft - walk;
  }

  onDragEnd() {
    if (!this.isDragging) return;
    this.isDragging = false;
    this.track.style.cursor = 'grab';
    this.snapToCard();
    this.startAutoScroll();
  }

  onScroll() {
    const scrollPosition = this.track.scrollLeft;
    const newIndex = Math.round(scrollPosition / this.cardWidth);
    
    if (newIndex !== this.currentIndex && newIndex >= 0 && newIndex < this.cards.length) {
      this.currentIndex = newIndex;
      this.updateDots();
      this.updateButtons();
    }
  }

  snapToCard() {
    const targetScroll = this.currentIndex * this.cardWidth;
    this.track.scrollTo({ left: targetScroll, behavior: 'smooth' });
  }

  prev() {
    this.currentIndex = Math.max(0, this.currentIndex - 1);
    this.snapToCard();
    this.updateDots();
    this.updateButtons();
  }

  next() {
    const maxIndex = this.cards.length - this.getVisibleCards();
    this.currentIndex = Math.min(maxIndex, this.currentIndex + 1);
    this.snapToCard();
    this.updateDots();
    this.updateButtons();
  }

  goToPage(pageIndex) {
    const visibleCards = this.getVisibleCards();
    this.currentIndex = pageIndex * visibleCards;
    const maxIndex = this.cards.length - visibleCards;
    this.currentIndex = Math.min(this.currentIndex, maxIndex);
    this.snapToCard();
    this.updateDots();
    this.updateButtons();
  }

  updateDots() {
    const visibleCards = this.getVisibleCards();
    const pageIndex = Math.floor(this.currentIndex / visibleCards);
    
    this.dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === pageIndex);
      dot.setAttribute('aria-selected', i === pageIndex);
    });
  }

  updateButtons() {
    const maxIndex = this.cards.length - this.getVisibleCards();
    this.prevBtn.disabled = this.currentIndex === 0;
    this.nextBtn.disabled = this.currentIndex >= maxIndex;
    
    this.prevBtn.style.opacity = this.prevBtn.disabled ? '0.4' : '1';
    this.nextBtn.style.opacity = this.nextBtn.disabled ? '0.4' : '1';
    this.prevBtn.style.pointerEvents = this.prevBtn.disabled ? 'none' : 'auto';
    this.nextBtn.style.pointerEvents = this.nextBtn.disabled ? 'none' : 'auto';
  }

  startAutoScroll() {
    this.stopAutoScroll();
    this.autoScrollInterval = setInterval(() => {
      const maxIndex = this.cards.length - this.getVisibleCards();
      if (this.currentIndex >= maxIndex) {
        this.currentIndex = -1;
      }
      this.next();
    }, 5000);
  }

  stopAutoScroll() {
    if (this.autoScrollInterval) {
      clearInterval(this.autoScrollInterval);
      this.autoScrollInterval = null;
    }
  }

  handleResize() {
    this.calculateCardWidth();
    this.createDots();
    this.updateButtons();
    this.snapToCard();
  }
}

// ===== SMOOTH SCROLL FOR ANCHORS =====
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const headerOffset = 20;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
        
        // Focus for accessibility
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      }
    });
  });
}

// ===== INTERSECTION OBSERVER FOR ANIMATIONS =====
function initScrollAnimations() {
  const animatedElements = document.querySelectorAll(
    '.benefit-card, .accordion-item, .testimonial-card, .cta-form'
  );
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });
  
  animatedElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });
}

// ===== LAZY LOAD IMAGES =====
function initLazyLoading() {
  if ('loading' in HTMLImageElement.prototype) return; // Native lazy loading supported
  
  const lazyImages = document.querySelectorAll('img[loading="lazy"]');
  
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src || img.src;
        img.removeAttribute('loading');
        imageObserver.unobserve(img);
      }
    });
  });
  
  lazyImages.forEach(img => imageObserver.observe(img));
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
  // Accordion
  const accordionContainer = document.querySelector('.accordion');
  if (accordionContainer) new Accordion(accordionContainer);
  
  // Testimonials Carousel
  const track = document.getElementById('carouselTrack');
  const prevBtn = document.querySelector('.carousel-btn.prev');
  const nextBtn = document.querySelector('.carousel-btn.next');
  const dotsContainer = document.getElementById('carouselDots');
  
  if (track && prevBtn && nextBtn && dotsContainer) {
    new TestimonialsCarousel(track, prevBtn, nextBtn, dotsContainer);
  }
  
  // Other features
  initSmoothScroll();
  initScrollAnimations();
  initLazyLoading();
  
  // Form submission tracking (if needed)
  const form = document.getElementById('inscripcionForm');
  if (form) {
    form.addEventListener('submit', () => {
      // Track conversion event
      if (typeof fbq !== 'undefined') {
        fbq('track', 'InitiateCheckout');
      }
      if (typeof gtag !== 'undefined') {
        gtag('event', 'begin_checkout');
      }
    });
  }
});

// ===== EXPORT FOR TESTING =====
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Accordion, TestimonialsCarousel };
}