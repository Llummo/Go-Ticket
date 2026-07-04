<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import AdminLayout from "../../../shared/presentation/components/admin-layout.vue";
import { useEvents } from "../../application/event-store.js";

import PvButton from "primevue/button";
import PvCard from "primevue/card";
import PvTag from "primevue/tag";
import Dialog from 'primevue/dialog';

const { events, form, venues, categories, loadEvents } = useEvents();
const router = useRouter();

const imageFile = ref(null);
const imagePreview = ref(null);
const isCreating = ref(false);

const handleFileChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  imageFile.value = file;
  imagePreview.value = URL.createObjectURL(file);
};

const saveEventWithImage = async () => {
  isCreating.value = true;
  try {
    const baseApi = import.meta.env.VITE_GO_TICKET_API_URL || 'http://localhost:3000/api';
    let finalImageUrl = 'https://picsum.photos/400/250';

    if (imageFile.value) {
      const formData = new FormData();
      formData.append('image', imageFile.value);
      const uploadRes = await axios.post(`${baseApi}/upload`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      finalImageUrl = `http://localhost:3000${uploadRes.data.url}`;
    }

    await axios.post(`${baseApi}/admin/events-with-tickets`, {
      ...form.value,
      image_url: finalImageUrl
    });

    alert("¡Evento creado y tickets generados con éxito!");
    imageFile.value = null;
    imagePreview.value = null;
    form.value = { event_title: '', description: '', start_date: '', price_base: 0 };
    loadEvents();
  } catch (error) {
    alert("Hubo un error al crear el evento.");
  } finally {
    isCreating.value = false;
  }
};

const showVenueModal = ref(false);
const venueForm = ref({ name: '', address: '', rows: 4, seats_per_row: 10 });
const creatingVenue = ref(false);

const saveVenue = async () => {
  creatingVenue.value = true;
  try {
    const baseApi = import.meta.env.VITE_GO_TICKET_API_URL || 'http://localhost:3000/api';
    const res = await axios.post(`${baseApi}/admin/venues`, venueForm.value);
    venues.value.push(res.data); // Actualizar lista local
    showVenueModal.value = false;
    venueForm.value = { name: '', address: '', rows: 4, seats_per_row: 10 };
    alert("Lugar (Venue) creado con éxito");
  } catch (error) {
    alert("Error al crear Venue");
  } finally {
    creatingVenue.value = false;
  }
};

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
          <!-- (El template de la tarjeta se mantiene igual) -->
          <template #header>
            <div class="image-container"><img :src="event.image_url" alt="evento" /><PvTag :value="event.category_name" severity="info" class="category-tag" /></div>
          </template>
          <template #title><span class="event-title">{{ event.event_title }}</span></template>
          <template #content>
            <div class="event-details">
              <div class="detail-item"><i class="pi pi-map-marker"></i><span>{{ event.venue_name }}</span></div>
              <div class="detail-item"><i class="pi pi-calendar"></i><span>{{ String(event.start_date).substring(0, 10) }}</span></div>
            </div>
          </template>
          <template #footer>
            <PvButton label="Gestionar Asientos" icon="pi pi-ticket" class="p-button-outlined p-button-sm w-full" @click="verDetallesTickets(event.id_event)" />
          </template>
        </PvCard>
      </div>

      <div class="section-header mt-8">
        <h2>Crear Nuevo Evento</h2>
        <p>Al crear el evento, se generarán automáticamente los tickets basados en la plantilla del Lugar seleccionado.</p>
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
              <option v-for="cat in categories" :key="cat._id || cat.id_category" :value="cat._id || cat.id_category">{{ cat.name }}</option>
            </select>
          </div>

          <div class="field">
            <div class="flex-between">
              <label>Lugar (Venue)</label>
              <span class="text-link" @click="showVenueModal = true">+ Nuevo Lugar</span>
            </div>
            <select v-model="form.id_venue">
              <option :value="null">Seleccionar...</option>
              <option v-for="v in venues" :key="v._id || v.id_venue" :value="v._id || v.id_venue">{{ v.name }} ({{ v.rows || 4 }}x{{ v.seats_per_row || 10 }})</option>
            </select>
          </div>

          <div class="field">
            <label>Fecha</label>
            <input v-model="form.start_date" type="datetime-local" />
          </div>

          <div class="field">
            <label>Precio Base por Asiento (S/)</label>
            <input v-model="form.price_base" type="number" placeholder="0.00" />
          </div>

          <div class="field full-width">
            <label>Descripción</label>
            <input v-model="form.description" type="text" placeholder="Breve detalle..." />
          </div>
          
          <div class="field full-width">
            <label>Imagen del Evento</label>
            <div class="image-upload-wrapper">
              <img v-if="imagePreview" :src="imagePreview" class="event-preview-img" />
              <input type="file" accept="image/*" @change="handleFileChange" class="file-input" />
            </div>
          </div>
        </div>

        <div class="form-footer">
          <PvButton :label="isCreating ? 'Procesando...' : 'Publicar Evento y Generar Stock'" icon="pi pi-plus-circle" class="p-button-lg w-full md:w-auto" @click="saveEventWithImage" :disabled="isCreating" />
        </div>
      </div>

      <!-- MODAL CREAR VENUE -->
      <Dialog v-model:visible="showVenueModal" header="Configurar Nuevo Lugar" :modal="true" :style="{ width: '400px' }">
        <div class="flex flex-column gap-3 mt-2">
          <div class="field">
            <label>Nombre del Lugar</label>
            <input v-model="venueForm.name" type="text" placeholder="Ej: Teatro Nacional" />
          </div>
          <div class="field">
            <label>Dirección</label>
            <input v-model="venueForm.address" type="text" placeholder="Av. Ejemplo 123" />
          </div>
          <div class="field">
            <label>Cantidad de Filas</label>
            <input v-model="venueForm.rows" type="number" min="1" max="26" />
          </div>
          <div class="field">
            <label>Asientos por Fila</label>
            <input v-model="venueForm.seats_per_row" type="number" min="1" />
          </div>
          <small class="text-gray-500">Esto generará automáticamente {{ venueForm.rows * venueForm.seats_per_row }} tickets al crear el evento.</small>
        </div>
        <template #footer>
          <PvButton label="Cancelar" icon="pi pi-times" @click="showVenueModal = false" class="p-button-text" />
          <PvButton :label="creatingVenue ? 'Guardando...' : 'Guardar Plantilla'" icon="pi pi-check" @click="saveVenue" :disabled="creatingVenue" autofocus />
        </template>
      </Dialog>

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

.flex-between { display: flex; justify-content: space-between; align-items: center; }
.text-link { color: #6366f1; font-size: 0.8rem; font-weight: 700; cursor: pointer; transition: 0.2s; }
.text-link:hover { text-decoration: underline; color: #4f46e5; }
.full-width { grid-column: 1 / -1; }
.image-upload-wrapper { display: flex; align-items: center; gap: 15px; }
.event-preview-img { width: 100px; height: 60px; border-radius: 8px; object-fit: cover; border: 1px solid #d1d5db; }
.file-input { padding: 10px; background: #f8fafc; border-radius: 8px; width: 100%; border: 1px dashed #cbd5e1; cursor: pointer; }
.flex-column { display: flex; flex-direction: column; }
.gap-3 { gap: 1rem; }
.mt-2 { margin-top: 0.5rem; }
</style>