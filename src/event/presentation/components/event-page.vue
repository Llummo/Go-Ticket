<script setup>
import { useRouter } from 'vue-router';
import AdminLayout from "../../../shared/presentation/components/admin-layout.vue";
import { useEvents } from "../../application/event-store.js";

// Componentes de PrimeVue
import PvButton from "primevue/button";
import PvCard from "primevue/card";
import PvTag from "primevue/tag";

const {
  events,
  form,
  venues,
  categories,
  saveEvent
} = useEvents();

const router = useRouter();

// Función para ir a ver los asientos de un evento específico
const verDetallesTickets = (id) => {
  router.push(`/admin/events/${id}/tickets`);
};
</script>

<template>
  <AdminLayout>
    <div class="admin-events-container">

      <div class="section-header">
        <h1>Eventos Activos</h1>
        <p>Monitorea y gestiona el stock de entradas en tiempo real.</p>
      </div>

      <div class="events-grid">
        <PvCard v-for="event in events" :key="event.id_event" class="event-card-custom">
          <template #header>
            <div class="image-container">
              <img :src="event.image_url || 'https://picsum.photos/400/250'" alt="evento" />
              <PvTag :value="event.category_name" severity="info" class="category-tag" />
            </div>
          </template>

          <template #title>
            <span class="event-title">{{ event.event_title }}</span>
          </template>

          <template #content>
            <div class="event-details">
              <div class="detail-item">
                <i class="pi pi-map-marker"></i>
                <span>{{ event.venue_name }}</span>
              </div>
              <div class="detail-item">
                <i class="pi pi-calendar"></i>
                <span>{{ String(event.start_date).substring(0, 10) }}</span>
              </div>
            </div>
          </template>

          <template #footer>
            <div class="footer-actions">
              <PvButton
                  label="Gestionar Asientos"
                  icon="pi pi-ticket"
                  class="p-button-outlined p-button-sm w-full"
                  @click="verDetallesTickets(event.id_event)"
              />
            </div>
          </template>
        </PvCard>
      </div>

      <div class="section-header mt-8">
        <h2>Crear Nuevo Evento</h2>
        <p>Al crear el evento, se generarán automáticamente los tickets basados en el Venue seleccionado.</p>
      </div>

      <div class="form-container-card">
        <div class="form-grid">
          <div class="field">
            <label>Título del Evento</label>
            <input v-model="form.event_title" type="text" placeholder="Ej: Hamlet" />
          </div>

          <div class="field">
            <label>Categoría</label>
            <select v-model="form.id_category">
              <option :value="null">Seleccionar...</option>
              <option v-for="cat in categories" :key="cat.id_category" :value="cat.id_category">{{ cat.name }}</option>
            </select>
          </div>

          <div class="field">
            <label>Lugar (Venue)</label>
            <select v-model="form.id_venue">
              <option :value="null">Seleccionar...</option>
              <option v-for="v in venues" :key="v.id_venue" :value="v.id_venue">{{ v.name }}</option>
            </select>
          </div>

          <div class="field">
            <label>Fecha</label>
            <input v-model="form.start_date" type="date" />
          </div>

          <div class="field">
            <label>Precio Base por Asiento (S/)</label>
            <input v-model="form.price_base" type="number" placeholder="0.00" />
          </div>

          <div class="field">
            <label>Descripción</label>
            <input v-model="form.description" type="text" placeholder="Breve detalle..." />
          </div>
        </div>

        <div class="form-footer">
          <PvButton
              label="Publicar Evento y Generar Stock"
              icon="pi pi-plus-circle"
              class="p-button-lg w-full md:w-auto"
              @click="saveEvent"
          />
        </div>
      </div>

    </div>
  </AdminLayout>
</template>

<style scoped>
.admin-events-container {
  max-width: 1200px;
  margin: 0 auto;
}

.section-header {
  margin-bottom: 2rem;
}

.section-header h1, .section-header h2 {
  font-size: 2rem;
  color: #111827;
  font-weight: 700;
  margin: 0;
}

.section-header p {
  color: #6b7280;
  margin-top: 0.5rem;
}

/* GRID DE EVENTOS */
.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.event-card-custom {
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
  transition: transform 0.2s ease;
}

.event-card-custom:hover {
  transform: translateY(-5px);
}

.image-container {
  position: relative;
  height: 180px;
}

.image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.category-tag {
  position: absolute;
  top: 12px;
  right: 12px;
}

.event-title {
  font-weight: 600;
  font-size: 1.1rem;
}

.event-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #4b5563;
  font-size: 0.9rem;
}

.detail-item i {
  color: #6366f1;
}

/* FORMULARIO */
.form-container-card {
  background: white;
  padding: 2.5rem;
  border-radius: 20px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

input, select {
  padding: 0.75rem;
  border-radius: 10px;
  border: 1px solid #d1d5db;
  outline: none;
  font-size: 1rem;
}

input:focus, select:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
}

.form-footer {
  margin-top: 2rem;
  display: flex;
  justify-content: flex-end;
}

.mt-8 { margin-top: 4rem; }
.w-full { width: 100%; }
</style>