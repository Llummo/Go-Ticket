<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import ClientLayout from "../../../shared/presentation/components/client-layout.vue";

// Componentes PrimeVue
import Card from 'primevue/card';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import InputText from 'primevue/inputtext';

const router = useRouter();
const events = ref([]);
const loading = ref(true);

// Variables para el filtro
const searchQuery = ref('');
const selectedCategory = ref('Todos');

const loadCatalog = async () => {
  try {
    const baseApi = import.meta.env.VITE_GO_TICKET_API_URL;
    const res = await axios.get(`${baseApi}/events`);
    events.value = res.data;
  } catch (error) {
    console.error("Error al cargar el catálogo:", error);
  } finally {
    loading.value = false;
  }
};

onMounted(loadCatalog);

// 1. Obtener categorías únicas dinámicamente
const availableCategories = computed(() => {
  const categories = new Set(events.value.map(e => e.category_name));
  return ['Todos', ...Array.from(categories)];
});

// 2. Filtrar eventos según la búsqueda y la categoría seleccionada
const filteredEvents = computed(() => {
  return events.value.filter(event => {
    const matchesSearch = event.event_title.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchesCategory = selectedCategory.value === 'Todos' || event.category_name === selectedCategory.value;
    return matchesSearch && matchesCategory;
  });
});

const irAComprar = (eventId) => {
  const token = localStorage.getItem('token');

  if (!token) {
    router.push('/login');
  } else {
    router.push(`/tickets/buy/${eventId}`);
  }
};
</script>

<template>
  <ClientLayout>
    <div class="catalog-container">

      <div class="hero-section">
        <h1>Tu próximo evento está aquí</h1>
        <p>Asegura tu entrada en segundos.</p>
      </div>

      <div class="filters-bar">

        <span class="p-input-icon-left search-box">
          <i class="pi pi-search" />
          <InputText v-model="searchQuery" placeholder="Buscar por nombre de evento..." />
        </span>

        <div class="category-chips">
          <button
              v-for="cat in availableCategories"
              :key="cat"
              class="chip-btn"
              :class="{ active: selectedCategory === cat }"
              @click="selectedCategory = cat"
          >
            {{ cat }}
          </button>
        </div>

      </div>

      <div v-if="loading" class="loading-state">
        <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
        <p>Cargando cartelera...</p>
      </div>

      <div v-else class="catalog-grid">
        <Card v-for="event in filteredEvents" :key="event.id_event" class="event-card">
          <template #header>
            <div class="image-wrapper">
              <img :src="event.image_url || 'https://picsum.photos/600/300'" alt="Cover del evento" />
              <Tag :value="event.category_name" severity="warning" class="category-badge" />
            </div>
          </template>

          <template #title>
            <h2 class="event-title" :title="event.event_title">{{ event.event_title }}</h2>
          </template>

          <template #content>
            <p class="event-description" :title="event.description">
              {{ event.description }}
            </p>
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

      <div v-if="!loading && filteredEvents.length === 0" class="empty-state">
        <i class="pi pi-search" style="font-size: 3rem; color: #d1d5db; margin-bottom: 1rem;"></i>
        <h2>No encontramos coincidencias</h2>
        <p>Intenta buscando con otras palabras o selecciona otra categoría.</p>
        <Button label="Limpiar Filtros" class="p-button-text" @click="searchQuery = ''; selectedCategory = 'Todos'" />
      </div>

    </div>
  </ClientLayout>
</template>

<style scoped>
.catalog-container { max-width: 1100px; margin: 0 auto; }

/* HERO OSCURO */
.hero-section {
  text-align: center; margin-bottom: 2rem; padding: 5rem 2rem;
  background: var(--gt-dark);
  background-image: linear-gradient(135deg, var(--gt-dark) 0%, var(--gt-dark-surface) 100%);
  border-radius: 20px; color: var(--gt-white);
  border-bottom: 4px solid var(--gt-yellow);
}
.hero-section h1 { font-size: 2.8rem; font-weight: 800; margin: 0 0 10px 0; letter-spacing: -0.5px;}
.hero-section p { font-size: 1.2rem; color: #D1D5DB; margin: 0; }

/* FILTROS BLANCOS */
.filters-bar {
  display: flex; flex-direction: column; gap: 1rem; margin-bottom: 2.5rem;
  background: var(--gt-white); padding: 1.5rem; border-radius: 16px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.03); border: 1px solid #E5E7EB;
}
@media (min-width: 768px) { .filters-bar { flex-direction: row; align-items: center; justify-content: space-between; } }

.search-box {
  width: 100%;
  max-width: 420px;
  position: relative;
}

:deep(.search-box .p-inputtext) {
  width: 100%;
  height: 52px;

  padding-left: 44px !important;
  padding-right: 16px;

  border-radius: 14px;
  border: 1px solid #d1d5db;

  background: white;
  color: #111827;

  font-size: 15px;

  transition: 0.2s ease;
}

:deep(.search-box .p-inputtext:focus) {
  border-color: var(--gt-red);
  box-shadow: 0 0 0 3px rgba(225, 29, 72, 0.12);
}

:deep(.search-box .pi) {
  position: absolute;

  left: 16px;
  top: 50%;

  transform: translateY(-50%);

  color: #64748b;
  font-size: 0.95rem;

  z-index: 2;
}

.category-chips { display: flex; gap: 10px; flex-wrap: wrap; }
.chip-btn {
  background: var(--gt-light); border: 1px solid #D1D5DB; padding: 8px 16px;
  border-radius: 20px; color: var(--gt-text-main); font-weight: 600; cursor: pointer; transition: 0.2s;
}
.chip-btn:hover { background: #E5E7EB; }
.chip-btn.active { background: var(--gt-red); color: white; border-color: var(--gt-red); }

/* TARJETAS BLANCAS CON ALTO CONTRASTE */
.catalog-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 2rem; }
.event-card {
  border-radius: 16px; overflow: hidden; border: 1px solid #E5E7EB;
  box-shadow: 0 4px 15px rgba(0,0,0,0.04); transition: 0.3s; background: var(--gt-white);
  position: relative;
}
.event-card:hover .image-wrapper img {
  transform: scale(1.06);
}
.image-wrapper { position: relative; height: 190px; transition: transform 0.4s ease;}
.image-wrapper img { width: 100%; height: 100%; object-fit: cover; }
.category-badge {
  position: absolute; top: 15px; right: 15px; font-weight: 800;
  background: var(--gt-yellow) !important; color: var(--gt-dark) !important; border: none; padding: 6px 12px;
}

.event-title { font-size: 1.3rem; font-weight: 800; color: var(--gt-text-main); margin: 0; line-height: 1.3; }
.event-description {
  font-size: 0.92rem;
  color: var(--gt-text-muted);
  margin: 8px 0 16px 0;
  line-height: 1.5;

  /* Magia CSS para limitar a 2 líneas y evitar que las tarjetas pierdan simetría */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.event-info { display: flex; flex-direction: column; gap: 15px; margin-top: 5px; }
.info-row { display: flex; align-items: center; gap: 12px; }
.icon-box {
  width: 36px; height: 36px; background: #FEF2F2; border-radius: 10px;
  display: flex; align-items: center; justify-content: center; color: var(--gt-red); font-size: 1.1rem;
}
.info-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.info-text span {
  font-size: 0.72rem;
  color: var(--gt-text-muted);

  text-transform: uppercase;
  font-weight: 800;

  letter-spacing: 1px;
}
.info-text strong {
  font-size: 0.96rem;
  color: var(--gt-text-main);

  line-height: 1.35;
  font-weight: 700;
}
:deep(.p-button-primary) {
  background: var(--gt-red) !important; border: none !important;
  font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;
}
:deep(.p-button-primary:hover) { background: var(--gt-red-hover) !important; }
.empty-state { text-align: center; padding: 4rem; color: var(--gt-text-muted); }
</style>