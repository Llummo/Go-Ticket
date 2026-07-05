<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import ClientLayout from "../../../shared/presentation/components/client-layout.vue";

import Card from 'primevue/card';
import Button from 'primevue/button';
import Tag from 'primevue/tag';

const router = useRouter();
const events = ref([]);
const loading = ref(true);

const searchQuery = ref('');
const selectedCategory = ref('Todos');
// Carrusel
const currentSlide = ref(0);
let autoplayInterval = null;

const heroEvents = computed(() => events.value.slice(0, 5));
const gridEvents = computed(() => events.value.slice(5));

const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % heroEvents.value.length;
};
const prevSlide = () => {
  currentSlide.value = (currentSlide.value - 1 + heroEvents.value.length) % heroEvents.value.length;
};
const goToSlide = (i) => {
  currentSlide.value = i;
};

const startAutoplay = () => {
  autoplayInterval = setInterval(nextSlide, 5000);
};
const stopAutoplay = () => {
  clearInterval(autoplayInterval);
};

// Data
const loadEvents = async () => {
  try {
    const baseApi = import.meta.env.VITE_GO_TICKET_API_URL || 'http://localhost:3000/api';
    const res = await axios.get(`${baseApi}/events`);
    events.value = res.data;
  } catch (error) {
    console.error("Error al cargar eventos:", error);
  } finally {
    loading.value = false;
  }
};

const irAComprar = (eventId) => {
  if (!localStorage.getItem('token')) {
    router.push('/login');
  } else {
    router.push(`/event/${eventId}`);
  }
};

onMounted(async () => {
  await loadEvents();
  startAutoplay();
});

onUnmounted(() => {
  stopAutoplay();
});
</script>

<template>
  <ClientLayout>

    <!-- ===== LOADING ===== -->
    <div v-if="loading" class="loading-state">
      <i class="pi pi-spin pi-spinner" style="font-size: 2rem; color: var(--gt-red)"></i>
      <p>Cargando eventos...</p>
    </div>

    <template v-else>

      <!-- ===== HERO CARRUSEL ===== -->
      <section
          class="hero-carousel"
          @mouseenter="stopAutoplay"
          @mouseleave="startAutoplay"
      >
        <div class="slides-wrapper">
          <div
              v-for="(event, index) in heroEvents"
              :key="event.id_event"
              class="slide"
              :class="{ active: index === currentSlide }"
          >
            <!-- Imagen de fondo -->
            <img
                :src="event.image_url || 'https://picsum.photos/1200/500?random=' + index"
                class="slide-bg"
                alt=""
            />
            <div class="slide-overlay"></div>

            <!-- Contenido del slide -->
            <div class="slide-content">
              <Tag :value="event.category_name" class="hero-tag" />
              <h1 class="hero-title">{{ event.event_title }}</h1>
              <p class="hero-meta">
                <i class="pi pi-calendar"></i>
                {{ String(event.start_date).substring(0, 10) }}
                &nbsp;&nbsp;
                <i class="pi pi-map-marker"></i>
                {{ event.venue_name }}
              </p>
              <Button
                  label="Ver más"
                  icon="pi pi-arrow-right"
                  iconPos="right"
                  class="hero-btn"
                  @click="irAComprar(event.id_event)"
              />
            </div>
          </div>
        </div>

        <!-- Flechas -->
        <button class="carousel-arrow left" @click="prevSlide">
          <i class="pi pi-chevron-left"></i>
        </button>
        <button class="carousel-arrow right" @click="nextSlide">
          <i class="pi pi-chevron-right"></i>
        </button>

        <!-- Dots -->
        <div class="carousel-dots">
          <span
              v-for="(event, i) in heroEvents"
              :key="i"
              class="dot"
              :class="{ active: i === currentSlide }"
              @click="goToSlide(i)"
          ></span>
        </div>
      </section>

      <!-- ===== LAYOUT ===== -->
      <div class="main-layout">

        <!-- Columna izquierda: eventos -->
        <div class="col-events">
          <h2 class="section-title">Próximos Eventos</h2>

          <div class="catalog-grid">
            <Card
                v-for="event in (gridEvents.length > 0 ? gridEvents : heroEvents)"
                :key="event.id_event"
                class="event-card"
            >
              <template #header>
                <div class="image-wrapper">
                  <img :src="event.image_url || 'https://picsum.photos/400/250'" alt="Cover del evento" />
                  <Tag :value="event.category_name" severity="warning" class="category-badge" />
                </div>
              </template>
              <template #title>
                <h2 class="event-title" :title="event.event_title">{{ event.event_title }}</h2>
              </template>
              <template #content>
                <p class="event-description" :title="event.description">{{ event.description }}</p>
                <div class="event-info">
                  <div class="info-row">
                    <div class="icon-box"><i class="pi pi-calendar"></i></div>
                    <div class="info-text">
                      <span>Fecha</span>
                      <strong>{{ String(event.start_date).substring(0, 10) }}</strong>
                    </div>
                  </div>
                  <div class="info-row">
                    <div class="icon-box"><i class="pi pi-map-marker"></i></div>
                    <div class="info-text">
                      <span>Lugar</span>
                      <strong>{{ event.venue_name }}</strong>
                    </div>
                  </div>
                </div>
              </template>
              <template #footer>
                <Button
                    label="Ver Asientos"
                    icon="pi pi-arrow-right"
                    iconPos="right"
                    class="w-full p-button-primary"
                    @click="irAComprar(event.id_event)"
                />
              </template>
            </Card>
          </div>
        </div>

        <!-- Columna derecha: sidebar destacados -->
        <aside class="col-sidebar">
          <h2 class="section-title">Destacados</h2>

          <!-- Banner promo 1 -->
          <div class="promo-banner">
            <img src="https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=500&q=80" alt="Promo conciertos" />
            <div class="promo-overlay">
              <span class="promo-tag">Oferta</span>
              <p class="promo-text">2x1 en entradas generales este fin de semana</p>
            </div>
          </div>

          <!-- Banner promo 2 -->
          <div class="promo-banner">
            <img src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&q=80" alt="Promo festivales" />
            <div class="promo-overlay">
              <span class="promo-tag">Nuevo</span>
              <p class="promo-text">Festival de verano — fechas confirmadas</p>
            </div>
          </div>

          <!-- Banner promo 3 -->
          <div class="promo-banner">
            <img src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&q=80" alt="Promo teatro" />
            <div class="promo-overlay">
              <span class="promo-tag">Exclusivo</span>
              <p class="promo-text">Teatro y cultura — entradas desde S/. 40</p>
            </div>
          </div>

          <!-- Banner promo 4 -->
          <div class="promo-banner">
            <img src="https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=500&q=80" alt="Promo deportes" />
            <div class="promo-overlay">
              <span class="promo-tag">Temporada</span>
              <p class="promo-text">Deportes en vivo — no te pierdas ningún partido</p>
            </div>
          </div>
        </aside>

      </div>

      <!-- ===== ¿POR QUÉ GOTICKET? ===== -->
      <section class="why-section">
        <h2 class="section-title">¿Por qué GoTicket?</h2>
        <div class="why-grid">

          <div class="why-card">
            <div class="why-icon-box"><i class="pi pi-shield"></i></div>
            <h3>Compra Segura</h3>
            <p>Tus datos y pagos están protegidos con encriptación de nivel bancario.</p>
          </div>

          <div class="why-card">
            <div class="why-icon-box"><i class="pi pi-bolt"></i></div>
            <h3>Acceso Inmediato</h3>
            <p>Recibe tu entrada al instante. Sin colas, sin esperas, sin complicaciones.</p>
          </div>

          <div class="why-card">
            <div class="why-icon-box"><i class="pi pi-map"></i></div>
            <h3>Elige tu Asiento</h3>
            <p>Selecciona exactamente dónde quieres estar con nuestro mapa interactivo.</p>
          </div>

          <div class="why-card">
            <div class="why-icon-box"><i class="pi pi-headphones"></i></div>
            <h3>Soporte 24/7</h3>
            <p>Nuestro equipo está disponible para ayudarte en cualquier momento.</p>
          </div>

        </div>
      </section>

    </template>
  </ClientLayout>
</template>

<style scoped>

/* ===== LOADING ===== */
.loading-state {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: 1rem; padding: 6rem 0;
  color: var(--gt-text-muted);
}

/* ===== HERO CARRUSEL ===== */
.hero-carousel {
  position: relative;
  width: 100%;
  height: 480px;
  overflow: hidden;
  border-radius: 20px;
  margin-bottom: 3rem;
  background: var(--gt-dark);
}

.slides-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.slide {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 0.7s ease;
  pointer-events: none;
}
.slide.active {
  opacity: 1;
  pointer-events: all;
}

.slide-bg {
  width: 100%; height: 100%;
  object-fit: cover;
  display: block;
}

.slide-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(
      to right,
      rgba(15, 23, 42, 0.88) 0%,
      rgba(15, 23, 42, 0.55) 50%,
      rgba(15, 23, 42, 0.15) 100%
  );
}

.slide-content {
  position: absolute;
  bottom: 60px;
  left: 60px;
  max-width: 520px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.hero-tag {
  width: fit-content;
  background: var(--gt-red) !important;
  color: white !important;
  font-weight: 700;
  font-size: 0.78rem;
  letter-spacing: 1px;
  text-transform: uppercase;
  border: none;
}

.hero-title {
  font-size: 2.6rem;
  font-weight: 900;
  color: var(--gt-white);
  line-height: 1.15;
  text-shadow: 0 2px 12px rgba(0,0,0,0.4);
}

.hero-meta {
  font-size: 0.95rem;
  color: #cbd5e1;
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.hero-meta i { color: var(--gt-yellow); }

.hero-btn {
  width: fit-content;
  background: var(--gt-red) !important;
  border: none !important;
  font-weight: 700 !important;
  padding: 12px 28px !important;
  font-size: 0.95rem !important;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 6px;
}
.hero-btn:hover {
  background: var(--gt-red-hover) !important;
  transform: translateY(-2px);
}

/* Flechas */
.carousel-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255,255,255,0.12);
  border: 1px solid rgba(255,255,255,0.2);
  color: white;
  width: 48px; height: 48px;
  border-radius: 50%;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.1rem;
  transition: 0.25s;
  backdrop-filter: blur(4px);
  z-index: 10;
}
.carousel-arrow:hover {
  background: var(--gt-red);
  border-color: var(--gt-red);
}
.carousel-arrow.left  { left: 20px; }
.carousel-arrow.right { right: 20px; }

/* Dots */
.carousel-dots {
  position: absolute;
  bottom: 20px;
  right: 30px;
  display: flex;
  gap: 8px;
  z-index: 10;
}
.dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: rgba(255,255,255,0.35);
  cursor: pointer;
  transition: 0.3s;
}
.dot.active {
  background: var(--gt-red);
  width: 24px;
  border-radius: 4px;
}

/* ===== LAYOUT PRINCIPAL: DOS COLUMNAS ===== */
.main-layout {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 2rem;
  max-width: 1100px;
  margin: 0 auto 3rem auto;
  align-items: start;
}

/* ===== COLUMNA EVENTOS ===== */
.col-events { min-width: 0; } /* evita overflow en grid */

.section-title {
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--gt-text-main);
  margin-bottom: 1.25rem;
  border-left: 4px solid var(--gt-red);
  padding-left: 14px;
}

.catalog-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1.5rem;
}

.event-card {
  border-radius: 16px; overflow: hidden;
  border: 1px solid #E5E7EB;
  box-shadow: 0 4px 15px rgba(0,0,0,0.04);
  transition: 0.3s; background: var(--gt-white);
}
.event-card:hover .image-wrapper img { transform: scale(1.06); }

.image-wrapper { position: relative; height: 170px; overflow: hidden; }
.image-wrapper img {
  width: 100%; height: 100%; object-fit: cover;
  transition: transform 0.4s ease;
}

.category-badge {
  position: absolute; top: 12px; right: 12px; font-weight: 800;
  background: var(--gt-yellow) !important; color: var(--gt-dark) !important;
  border: none; padding: 5px 10px; font-size: 0.75rem;
}

.event-title { font-size: 1.1rem; font-weight: 800; color: var(--gt-text-main); margin: 0; line-height: 1.3; }

.event-description {
  font-size: 0.88rem; color: var(--gt-text-muted);
  margin: 6px 0 12px 0; line-height: 1.5;
  display: -webkit-box; -webkit-line-clamp: 2;
  -webkit-box-orient: vertical; overflow: hidden;
}

.event-info { display: flex; flex-direction: column; gap: 12px; }
.info-row { display: flex; align-items: center; gap: 10px; }
.icon-box {
  width: 32px; height: 32px; background: #FEF2F2; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  color: var(--gt-red); font-size: 0.95rem; flex-shrink: 0;
}
.info-text { display: flex; flex-direction: column; gap: 2px; }
.info-text span { font-size: 0.68rem; color: var(--gt-text-muted); text-transform: uppercase; font-weight: 800; letter-spacing: 1px; }
.info-text strong { font-size: 0.9rem; color: var(--gt-text-main); font-weight: 700; }

:deep(.p-button-primary) {
  background: var(--gt-red) !important; border: none !important;
  font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;
}
:deep(.p-button-primary:hover) { background: var(--gt-red-hover) !important; }

/* Sidebar destacados */
.col-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  position: sticky;
  top: 95px;
}

/* Banners promocionales */
.promo-banner {
  position: relative;
  border-radius: 14px;
  overflow: hidden;
  height: 160px;
  cursor: default;
}

.promo-banner img {
  width: 100%; height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.4s ease;
}
.promo-banner:hover img { transform: scale(1.05); }

.promo-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(to top, rgba(15,23,42,0.88) 0%, rgba(15,23,42,0.1) 70%);
  display: flex; flex-direction: column;
  justify-content: flex-end;
  padding: 16px;
  gap: 4px;
}

.promo-tag {
  width: fit-content;
  background: var(--gt-red);
  color: white;
  font-size: 0.68rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: 3px 8px;
  border-radius: 4px;
}

.promo-text {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--gt-white);
  line-height: 1.4;
  margin: 0;
}

/* ===== ¿POR QUÉ GOTICKET? ===== */
.why-section {
  max-width: 1100px;
  margin: 0 auto 3rem auto;
}

.why-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.25rem;
}

.why-card {
  background: var(--gt-white);
  border: 1px solid #E5E7EB;
  border-radius: 16px;
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: box-shadow 0.25s, transform 0.25s;
}
.why-card:hover {
  box-shadow: 0 8px 24px rgba(0,0,0,0.08);
  transform: translateY(-4px);
}

.why-icon-box {
  width: 46px; height: 46px;
  background: #FEF2F2;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  color: var(--gt-red);
  font-size: 1.2rem;
}

.why-card h3 { font-size: 0.95rem; font-weight: 800; color: var(--gt-text-main); margin: 0; }
.why-card p  { font-size: 0.85rem; color: var(--gt-text-muted); line-height: 1.6; margin: 0; }

/* ===== RESPONSIVE ===== */
@media (max-width: 900px) {
  .main-layout {
    grid-template-columns: 1fr;
  }

  .col-sidebar {
    position: static;
  }

  .col-sidebar {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .col-sidebar .section-title {
    grid-column: 1 / -1;
    margin-bottom: 0;
  }

  .promo-banner {
    height: 180px;
  }

  .why-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 768px) {
  .hero-carousel { height: 360px; border-radius: 12px; }
  .slide-content { left: 24px; bottom: 50px; max-width: 90%; }
  .hero-title { font-size: 1.8rem; }
  .why-grid { grid-template-columns: 1fr 1fr; }
}

@media (max-width: 500px) {
  .col-sidebar { grid-template-columns: 1fr; }
  .why-grid { grid-template-columns: 1fr; }
}
</style>