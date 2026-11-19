
    /* ==========================================================================
       ESTADO GLOBAL Y PERSISTENCIA (NotebookAppApi Shim)
       ========================================================================== */
    var appState = {
      cart: [],
      currentSlide: 0,
      currentVideoIndex: 0
    };

    var carouselTimer = null;
    var isCarouselPlaying = true;

    var videoDatabase = [
      {
        title: "Masterclass 01: El Take-Off Fluido de Cody Maverick",
        channel: "Pen Gu Surfers · Video Oficial",
        src: "video/videoplayback.mp4",
        poster: "img/thumb-video-1.webp",
        durationText: "08:30"
      },
      {
        title: "Lección 02: Lectura de Mareas y Corrientes con Big Z",
        channel: "Análisis del Arrecife de Pen Gu",
        src: "video/video-cody.mp4.2.mp4",
        poster: "img/thumb-video-3.webp",
        durationText: "12:15"
      },
      {
        title: "Lección 03: Cómo Trazar el 'Bottom Turn' sin Perder Velocidad",
        channel: "Clave para ganar aceleración",
        src: "video/video-cody.mp4.3.mp4",
        poster: "img/thumb-video-2.webp",
        durationText: "09:40"
      }
    ];

    // Inicialización al cargar el DOM
    document.addEventListener('DOMContentLoaded', function() {
      // Inicializar iconos de Lucide
      if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons();
      }

      // Inicializar Menú Hamburguesa Mobile
      initMobileNav();

      // Inicializar Carrusel de Galería Mobile
      initGalleryMobileCarousel();

      // Inicializar Carrusel de Tienda / Pro Shop Mobile
      initShopMobileCarousel();

      // Cargar estado guardado de notebookAppApi si existe
      loadPersistedState();

      // Inicializar ScrollSpy (indicador de sección activa)
      initScrollSpy();

      // Inicializar Scroll Reveal (animaciones de entrada suave)
      initScrollReveal();

      // Inicializar botón flotante Volver Arriba
      initScrollToTop();
    });

    /* ==========================================================================
       CONTROL DEL MENÚ HAMBURGUESA MOBILE
       ========================================================================== */
    function initMobileNav() {
      var toggleBtn = document.getElementById('hamburger-toggle');
      var navMenu = document.getElementById('primary-navigation');
      var backdrop = document.getElementById('mobile-nav-backdrop');

      if (!toggleBtn || !navMenu) return;

      function toggleMenu() {
        var isOpen = navMenu.classList.contains('is-open');
        if (isOpen) {
          closeMenu();
        } else {
          openMenu();
        }
      }

      function openMenu() {
        navMenu.classList.add('is-open');
        toggleBtn.classList.add('is-active');
        toggleBtn.setAttribute('aria-expanded', 'true');
        if (backdrop) backdrop.classList.add('is-active');
        document.body.style.overflow = 'hidden';
      }

      function closeMenu() {
        navMenu.classList.remove('is-open');
        toggleBtn.classList.remove('is-active');
        toggleBtn.setAttribute('aria-expanded', 'false');
        if (backdrop) backdrop.classList.remove('is-active');
        document.body.style.overflow = '';
      }

      toggleBtn.addEventListener('click', toggleMenu);

      var closeBtn = document.getElementById('mobile-nav-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', closeMenu);
      }

      if (backdrop) {
        backdrop.addEventListener('click', closeMenu);
      }

      // Cerrar menú al hacer clic en cualquier enlace de navegación
      var navLinks = navMenu.querySelectorAll('a');
      navLinks.forEach(function(link) {
        link.addEventListener('click', function() {
          closeMenu();
        });
      });

      // Cerrar al presionar la tecla Escape
      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && navMenu.classList.contains('is-open')) {
          closeMenu();
        }
      });
    }

    async function loadPersistedState() {
      try {
        if (window.notebookAppApi && typeof window.notebookAppApi.getAppState === 'function') {
          var saved = await window.notebookAppApi.getAppState();
          if (saved && typeof saved === 'object') {
            if (Array.isArray(saved.cart)) {
              appState.cart = saved.cart;
              renderCartUI();
            }
          }
        }
      } catch (err) {
        console.warn('Error al cargar estado persistente:', err);
      }
    }

    async function persistState() {
      try {
        if (window.notebookAppApi && typeof window.notebookAppApi.setAppState === 'function') {
          await window.notebookAppApi.setAppState({
            cart: appState.cart
          });
        }
      } catch (err) {
        console.warn('Error al persistir estado:', err);
      }
    }

    /* ==========================================================================
       TUTORIAL TABS
       ========================================================================== */
    function switchTutorialTab(panelId, btnElement) {
      var panels = document.querySelectorAll('.tutorial-content-panel');
      for (var i = 0; i < panels.length; i++) {
        panels[i].classList.remove('active');
      }

      var buttons = document.querySelectorAll('.tab-btn');
      for (var j = 0; j < buttons.length; j++) {
        buttons[j].classList.remove('active');
      }

      var target = document.getElementById(panelId);
      if (target) {
        target.classList.add('active');
      }
      if (btnElement) {
        btnElement.classList.add('active');
      }

      // Re-ejecutar lucide en caso de que haya nuevos iconos visibles
      if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons();
      }
    }

    /* ==========================================================================
       SCROLLSPY (Actualización dinámica de enlaces activos al hacer scroll)
       ========================================================================== */
    function initScrollSpy() {
      var sections = document.querySelectorAll('section[id]');
      var navLinks = document.querySelectorAll('.main-nav a[href^="#"]');

      if (!sections.length || !navLinks.length) return;

      function updateActiveLink() {
        var scrollPos = window.pageYOffset || document.documentElement.scrollTop;
        var header = document.querySelector('.site-header');
        var headerHeight = header ? header.offsetHeight : 100;

        var currentSectionId = '';
        for (var i = 0; i < sections.length; i++) {
          var section = sections[i];
          var top = section.offsetTop - headerHeight - 40;
          var height = section.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            currentSectionId = section.getAttribute('id');
          }
        }

        if (!currentSectionId && sections.length > 0) {
          currentSectionId = sections[0].getAttribute('id');
        }

        navLinks.forEach(function(link) {
          var href = link.getAttribute('href').replace('#', '');
          if (href === currentSectionId) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }

      window.addEventListener('scroll', updateActiveLink, { passive: true });
      updateActiveLink();
    }

    function likePhoto(event, btnElement) {
      if (event) {
        if (event.stopPropagation) event.stopPropagation();
        if (event.preventDefault) event.preventDefault();
      }
      var btn = btnElement || (event ? (event.currentTarget || (event.target && event.target.closest ? event.target.closest('.photo-card-likes') : null)) : null);
      if (!btn) return;

      var span = btn.querySelector('span');
      var icon = btn.querySelector('svg') || btn.querySelector('i');
      var isLiked = btn.classList.contains('is-liked');

      if (isLiked) {
        btn.classList.remove('is-liked');
        if (span) {
          var current = parseInt(span.textContent, 10) || 0;
          span.textContent = Math.max(0, current - 1);
        }
        if (icon) {
          icon.style.setProperty('fill', 'none', 'important');
          icon.style.setProperty('stroke', 'currentColor', 'important');
          icon.style.setProperty('color', '', 'important');
        }
      } else {
        btn.classList.add('is-liked');
        if (span) {
          var current = parseInt(span.textContent, 10) || 0;
          span.textContent = current + 1;
        }
        if (icon) {
          icon.style.setProperty('fill', '#ff334b', 'important');
          icon.style.setProperty('stroke', '#ff334b', 'important');
          icon.style.setProperty('color', '#ff334b', 'important');
        }
      }
    }
    window.likePhoto = likePhoto;

    /* ==========================================================================
       VIDEOS EDUCATIVOS (Reproductor Nativo HTML5)
       ========================================================================== */
    function selectVideo(index) {
      if (index < 0 || index >= videoDatabase.length) return;
      appState.currentVideoIndex = index;
      var vid = videoDatabase[index];

      // Actualizar tarjetas de lista
      var cards = document.querySelectorAll('.video-item-card');
      for (var i = 0; i < cards.length; i++) {
        cards[i].classList.remove('active');
      }
      var activeCard = document.getElementById('vcard-' + index);
      if (activeCard) {
        activeCard.classList.add('active');
      }

      // Actualizar título en el overlay
      var titleEl = document.getElementById('video-now-playing-title');
      if (titleEl) {
        titleEl.textContent = vid.title;
      }

      // Actualizar video HTML5
      var videoEl = document.getElementById('html5-surf-video');
      var sourceEl = document.getElementById('html5-video-source');
      if (videoEl && sourceEl) {
        sourceEl.src = vid.src;
        if (vid.poster) {
          videoEl.poster = vid.poster;
        }
        videoEl.load();
        videoEl.play().catch(function() {
          // El navegador requiere interacción previa del usuario para reproducir audio
        });
      }

      // Desplazamiento suave al reproductor principal (llevando la vista al video en mobile)
      var player = document.getElementById('main-video-player');
      if (player) {
        var header = document.querySelector('.site-header');
        var headerHeight = header ? header.offsetHeight : 60;
        var playerRect = player.getBoundingClientRect();
        var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        var targetY = playerRect.top + scrollTop - headerHeight - 12;

        window.scrollTo({
          top: Math.max(0, targetY),
          behavior: 'smooth'
        });
      }
    }

    /* ==========================================================================
       TIENDA ONLINE Y RESERVA DE EQUIPOS
       ========================================================================== */
    function filterShopCategory(category, btnElement) {
      var buttons = document.querySelectorAll('.filter-btn');
      for (var i = 0; i < buttons.length; i++) {
        buttons[i].classList.remove('active');
      }
      if (btnElement) {
        btnElement.classList.add('active');
      }

      var items = document.querySelectorAll('.shop-item-card');
      for (var j = 0; j < items.length; j++) {
        var itemCat = items[j].getAttribute('data-category');
        if (category === 'all' || itemCat === category) {
          items[j].style.display = 'flex';
        } else {
          items[j].style.display = 'none';
        }
      }
    }

    function addToReservation(itemName, price) {
      appState.cart.push({ name: itemName, price: price });
      renderCartUI();
      persistState();

      // Desplazamiento suave para ver el resumen
      var summarySec = document.getElementById('cart-summary-section');
      if (summarySec) {
        summarySec.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }

    function removeFromReservation(index) {
      if (index >= 0 && index < appState.cart.length) {
        appState.cart.splice(index, 1);
        renderCartUI();
        persistState();
      }
    }

    function clearReservationCart() {
      appState.cart = [];
      renderCartUI();
      persistState();
    }

    function renderCartUI() {
      var itemsContainer = document.getElementById('cart-items-container');
      var totalTag = document.getElementById('cart-total-tag');
      var clearBtn = document.getElementById('btn-clear-cart');

      if (!itemsContainer || !totalTag) return;

      if (appState.cart.length === 0) {
        itemsContainer.innerHTML = '<p id="cart-items-text">Aún no has agregado equipos a tu lista de reserva.</p>';
        totalTag.textContent = "Total estimado: $0 USD";
        if (clearBtn) clearBtn.style.display = 'none';
        return;
      }

      var total = 0;
      var html = '<div class="cart-tags-list">';
      for (var i = 0; i < appState.cart.length; i++) {
        var item = appState.cart[i];
        total += item.price;
        html += '<span class="cart-item-tag">' +
                  '<span class="cart-item-tag-name">' + item.name + ' ($' + item.price + ' USD)</span>' +
                  '<button type="button" class="cart-item-remove-btn" onclick="removeFromReservation(' + i + ')" aria-label="Eliminar ' + item.name + '">&times;</button>' +
                '</span>';
      }
      html += '</div>';

      itemsContainer.innerHTML = html;
      totalTag.textContent = "Total estimado: $" + total + " USD";
      if (clearBtn) clearBtn.style.display = 'inline-flex';
      if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons();
      }
    }

    function transferCartToContactForm() {
      if (appState.cart.length === 0) {
        var itemsContainer = document.getElementById('cart-items-container');
        if (itemsContainer) {
          itemsContainer.innerHTML = '<p id="cart-items-text" style="color: var(--warning); font-weight: 600;">⚠️ Por favor agrega algún equipo o tabla antes de transferirlo al formulario.</p>';
          setTimeout(function() {
            renderCartUI();
          }, 3500);
        }
        return;
      }

      var names = [];
      var total = 0;
      for (var i = 0; i < appState.cart.length; i++) {
        names.push(appState.cart[i].name + ' ($' + appState.cart[i].price + ' USD)');
        total += appState.cart[i].price;
      }

      var msgField = document.getElementById('campo-mensaje');
      if (msgField) {
        msgField.value = "Hola Cody, quisiera reservar los siguientes equipos:\n- " + names.join("\n- ") + "\nTotal estimado de alquiler: $" + total + " USD.\n¡Listo para coordinar fecha!";
      }

      var contactSection = document.getElementById('contacto');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }
    }

    /* ==========================================================================
       VALIDACIÓN DEL FORMULARIO DE CONTACTO Y RESERVAS
       ========================================================================== */
    function handleFormSubmit(event) {
      if (event && event.preventDefault) {
        event.preventDefault();
      }

      var nombreInput = document.getElementById('campo-nombre');
      var apellidoInput = document.getElementById('campo-apellido');
      var emailInput = document.getElementById('campo-email');
      var nivelInput = document.getElementById('campo-nivel');
      var actividadInput = document.getElementById('campo-actividad');
      var fechaInput = document.getElementById('campo-fecha');
      var participantesInput = document.getElementById('campo-participantes');
      var feedbackBox = document.getElementById('form-feedback-box');
      var alertTitle = document.getElementById('alert-title');
      var alertMessage = document.getElementById('alert-message');

      var hasError = false;

      // Limpiar errores previos
      clearFieldError('campo-nombre', 'error-nombre');
      clearFieldError('campo-apellido', 'error-apellido');
      clearFieldError('campo-email', 'error-email');

      // Validar Nombre
      if (!nombreInput || !nombreInput.value.trim()) {
        showFieldError('campo-nombre', 'error-nombre');
        hasError = true;
      }

      // Validar Apellido
      if (!apellidoInput || !apellidoInput.value.trim()) {
        showFieldError('campo-apellido', 'error-apellido');
        hasError = true;
      }

      // Validar Email
      var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailInput || !emailInput.value.trim() || !emailRegex.test(emailInput.value.trim())) {
        showFieldError('campo-email', 'error-email');
        hasError = true;
      }

      if (hasError) {
        if (feedbackBox) {
          feedbackBox.className = 'form-alert-feedback error';
          if (alertTitle) alertTitle.textContent = "Datos incompletos o incorrectos";
          if (alertMessage) alertMessage.textContent = "Por favor completa todos los campos requeridos con un formato válido para enviar tu solicitud.";
        }
        return false;
      }

      // Éxito en validación
      var nombre = nombreInput ? nombreInput.value.trim() : "Surfista";
      var actividad = actividadInput ? actividadInput.value : "Sesión de Surf";
      var email = emailInput ? emailInput.value.trim() : "";
      var fecha = fechaInput ? fechaInput.value : "Próximamente";
      var participantes = participantesInput ? participantesInput.value : "1";

      if (feedbackBox) {
        feedbackBox.className = 'form-alert-feedback success';
        if (alertTitle) alertTitle.textContent = "¡Aloha, " + nombre + "! 🤙 Solicitud Recibida";
        if (alertMessage) {
          alertMessage.innerHTML = "Tu reserva para <strong>" + actividad + "</strong> (" + participantes + " participante/s) el día <strong>" + fecha + "</strong> ha sido registrada con éxito. Cody Maverick y el equipo de Pen Gu Island se pondrán en contacto contigo a <strong>" + email + "</strong> con el informe de olas correspondiente.";
        }
      }

      // Resetear campos principales tras envío exitoso
      if (nombreInput) nombreInput.value = '';
      if (apellidoInput) apellidoInput.value = '';
      if (emailInput) emailInput.value = '';
      var tel = document.getElementById('campo-telefono');
      if (tel) tel.value = '';

      return false;
    }

    function showFieldError(inputId, errorId) {
      var input = document.getElementById(inputId);
      var error = document.getElementById(errorId);
      if (input) input.classList.add('error-field');
      if (error) error.classList.add('show');
    }

    function clearFieldError(inputId, errorId) {
      var input = document.getElementById(inputId);
      var error = document.getElementById(errorId);
      if (input) input.classList.remove('error-field');
      if (error) error.classList.remove('show');
    }

    /* ==========================================================================
       CARRUSEL MOBILE DE INSTANTÁNEAS (GALERÍA)
       ========================================================================== */
    function initGalleryMobileCarousel() {
      var track = document.getElementById('gallery-carousel-track');
      var viewport = document.getElementById('gallery-carousel-viewport');
      var prevBtn = document.getElementById('gallery-prev-btn');
      var nextBtn = document.getElementById('gallery-next-btn');
      var dots = document.querySelectorAll('.gallery-carousel-dot');
      var counter = document.getElementById('gallery-counter');

      if (!track || !viewport) return;

      var currentIdx = 0;
      var slides = document.querySelectorAll('.gallery-carousel-slide');
      var totalSlides = slides.length || 4;

      function updateSlide(newIdx) {
        if (newIdx < 0) {
          currentIdx = totalSlides - 1;
        } else if (newIdx >= totalSlides) {
          currentIdx = 0;
        } else {
          currentIdx = newIdx;
        }

        track.style.transform = 'translate3d(-' + (currentIdx * 100) + '%, 0, 0)';

        dots.forEach(function(dot, i) {
          if (i === currentIdx) {
            dot.classList.add('active');
          } else {
            dot.classList.remove('active');
          }
        });

        if (counter) {
          counter.textContent = (currentIdx + 1) + ' / ' + totalSlides;
        }
      }

      if (prevBtn) {
        prevBtn.addEventListener('click', function(e) {
          e.preventDefault();
          updateSlide(currentIdx - 1);
        });
      }

      if (nextBtn) {
        nextBtn.addEventListener('click', function(e) {
          e.preventDefault();
          updateSlide(currentIdx + 1);
        });
      }

      dots.forEach(function(dot, idx) {
        dot.addEventListener('click', function(e) {
          e.preventDefault();
          updateSlide(idx);
        });
      });

      // Soporte para gestos táctiles (Swipe)
      var touchStartX = 0;
      var touchStartY = 0;
      var touchEndX = 0;
      var touchEndY = 0;

      viewport.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
      }, { passive: true });

      viewport.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        handleGesture();
      }, { passive: true });

      function handleGesture() {
        var diffX = touchEndX - touchStartX;
        var diffY = touchEndY - touchStartY;

        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
          if (diffX < 0) {
            updateSlide(currentIdx + 1);
          } else {
            updateSlide(currentIdx - 1);
          }
        }
      }
    }

    /* ==========================================================================
       CARRUSEL MOBILE DE TIENDA / PRO SHOP
       ========================================================================== */
    function initShopMobileCarousel() {
      var track = document.getElementById('shop-items-track');
      var viewport = document.getElementById('shop-carousel-viewport');
      var prevBtn = document.getElementById('shop-prev-btn');
      var nextBtn = document.getElementById('shop-next-btn');
      var dots = document.querySelectorAll('.shop-carousel-dots .gallery-carousel-dot');
      var counter = document.getElementById('shop-counter');

      if (!track || !viewport) return;

      var currentIdx = 0;
      var cards = track.querySelectorAll('.shop-item-card');
      var totalSlides = cards.length || 6;

      function updateSlide(newIdx) {
        if (window.innerWidth > 868) {
          track.style.transform = '';
          return;
        }

        if (newIdx < 0) {
          currentIdx = totalSlides - 1;
        } else if (newIdx >= totalSlides) {
          currentIdx = 0;
        } else {
          currentIdx = newIdx;
        }

        track.style.transform = 'translate3d(-' + (currentIdx * 100) + '%, 0, 0)';

        dots.forEach(function(dot, i) {
          if (i === currentIdx) {
            dot.classList.add('active');
          } else {
            dot.classList.remove('active');
          }
        });

        if (counter) {
          counter.textContent = (currentIdx + 1) + ' / ' + totalSlides;
        }
      }

      if (prevBtn) {
        prevBtn.addEventListener('click', function(e) {
          e.preventDefault();
          updateSlide(currentIdx - 1);
        });
      }

      if (nextBtn) {
        nextBtn.addEventListener('click', function(e) {
          e.preventDefault();
          updateSlide(currentIdx + 1);
        });
      }

      dots.forEach(function(dot, idx) {
        dot.addEventListener('click', function(e) {
          e.preventDefault();
          updateSlide(idx);
        });
      });

      // Swipe táctil en móvil
      var touchStartX = 0;
      var touchStartY = 0;
      var touchEndX = 0;
      var touchEndY = 0;

      viewport.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
      }, { passive: true });

      viewport.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        handleGesture();
      }, { passive: true });

      function handleGesture() {
        if (window.innerWidth > 868) return;
        var diffX = touchEndX - touchStartX;
        var diffY = touchEndY - touchStartY;

        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
          if (diffX < 0) {
            updateSlide(currentIdx + 1);
          } else {
            updateSlide(currentIdx - 1);
          }
        }
      }

      // Restablecer posición si se redimensiona a pantalla de escritorio
      window.addEventListener('resize', function() {
        if (window.innerWidth > 868) {
          track.style.transform = '';
        } else {
          track.style.transform = 'translate3d(-' + (currentIdx * 100) + '%, 0, 0)';
        }
      });
    }

    /* ==========================================================================
       SCROLL REVEAL (Aparición suave al scrollear con IntersectionObserver)
       ========================================================================== */
    function initScrollReveal() {
      var revealTargets = document.querySelectorAll(
        '.section-header, .philosophy-text-col, .pillar-card, .tutorial-content-panel, .photo-card, .video-hub-card, .shop-item-card, .reservation-calculator-bar, .form-wrapper'
      );

      if (!('IntersectionObserver' in window)) {
        revealTargets.forEach(function(el) {
          el.classList.add('is-revealed');
        });
        return;
      }

      revealTargets.forEach(function(el) {
        el.classList.add('reveal-on-scroll');
      });

      var observer = new IntersectionObserver(function(entries, obs) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            obs.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.1,
        rootMargin: '0px 0px -30px 0px'
      });

      revealTargets.forEach(function(el) {
        observer.observe(el);
      });
    }

    /* ==========================================================================
       BOTÓN FLOTANTE VOLVER ARRIBA (Scroll to Top)
       ========================================================================== */
    function initScrollToTop() {
      var btn = document.getElementById('scroll-to-top');
      if (!btn) return;

      function checkScroll() {
        var scrollY = window.pageYOffset || document.documentElement.scrollTop;
        if (scrollY > 380) {
          btn.classList.add('is-visible');
        } else {
          btn.classList.remove('is-visible');
        }
      }

      window.addEventListener('scroll', checkScroll, { passive: true });
      checkScroll();

      btn.addEventListener('click', function() {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      });
    }
  