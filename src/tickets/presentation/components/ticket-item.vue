<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import AdminLayout from "../../../shared/presentation/components/admin-layout.vue";
import { TicketApi } from "../../infrastructure/ticket-api.js";

// Componentes PrimeVue
import Card from 'primevue/card';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';
import Button from 'primevue/button';

const api = new TicketApi();
const route = useRoute();
const router = useRouter();

const tickets = ref([]);
const loading = ref(true);
const eventTitle = ref('Cargando...');
const viewMode = ref('map'); // 'list' o 'map'

const eventId = route.params.id;

const loadData = async () => {
  try {
    loading.value = true;
    if (eventId) {
      // 1. Cargar tickets
      const resTickets = await api.getEventTickets(eventId);
      tickets.value = resTickets.data;

      // 2. Cargar el nombre del evento (buscándolo en la lista general)
      const baseApi = import.meta.env.VITE_GO_TICKET_API_URL;
      const resEvents = await axios.get(`${baseApi}/events`);
      const currentEvent = resEvents.data.find(e => e.id_event == eventId);

      eventTitle.value = currentEvent ? currentEvent.event_title : `Evento Desconocido (ID: ${eventId})`;
    }
  } catch (err) {
    console.error("Error al cargar datos:", err);
    eventTitle.value = "Error al cargar";
  } finally {
    loading.value = false;
  }
};

onMounted(loadData);

const stats = computed(() => {
  const total = tickets.value.length;
  const sold = tickets.value.filter(t => t.status === 'SOLD').length;
  const available = tickets.value.filter(t => t.status === 'AVAILABLE').length;

  // Sumamos el precio solo de los tickets vendidos
  const revenue = tickets.value
      .filter(t => t.status === 'SOLD')
      .reduce((sum, t) => sum + parseFloat(t.price), 0);

  return { total, sold, available, revenue };
});

const seatMap = computed(() => {
  const map = {};
  tickets.value.forEach(t => {
    if (!map[t.row_str]) map[t.row_str] = [];
    map[t.row_str].push(t);
  });

  // Ordenar asientos por número dentro de cada fila
  for (let row in map) {
    map[row].sort((a, b) => a.seat_number - b.seat_number);
  }
  return map;
});

const getSeverity = (status) => {
  if (status === 'SOLD') return 'danger';
  if (status === 'AVAILABLE') return 'success';
  if (status === 'RESERVED') return 'warning';
  return 'info';
};

const volverAEventos = () => router.push('/events');
</script>

<template>
  <AdminLayout>
    <div class="dashboard">

      <div class="header-actions">
        <div>
          <h1 class="page-title">{{ eventTitle }}</h1>
          <p class="page-subtitle">Auditoría y Gestión de Inventario</p>
        </div>
        <Button
            label="Volver a Eventos"
            icon="pi pi-arrow-left"
            class="p-button-secondary p-button-outlined"
            @click="volverAEventos"
        />
      </div>

      <div class="kpi-grid">
        <div class="kpi-card">
          <p>Total Asientos</p>
          <h3>{{ stats.total }}</h3>
          <i class="pi pi-th-large icon-total"></i>
        </div>
        <div class="kpi-card">
          <p>Disponibles</p>
          <h3 class="text-green">{{ stats.available }}</h3>
          <i class="pi pi-check-circle icon-available"></i>
        </div>
        <div class="kpi-card">
          <p>Vendidos</p>
          <h3 class="text-red">{{ stats.sold }}</h3>
          <i class="pi pi-ticket icon-sold"></i>
        </div>
        <div class="kpi-card">
          <p>Recaudación</p>
          <h3 class="text-blue">S/ {{ stats.revenue.toFixed(2) }}</h3>
          <i class="pi pi-wallet icon-revenue"></i>
        </div>
      </div>

      <div class="view-controls">
        <Button
            label="Mapa Visual"
            icon="pi pi-map"
            :class="viewMode === 'map' ? 'p-button-primary' : 'p-button-outlined p-button-secondary'"
            @click="viewMode = 'map'"
        />
        <Button
            label="Lista Detallada"
            icon="pi pi-list"
            :class="viewMode === 'list' ? 'p-button-primary' : 'p-button-outlined p-button-secondary'"
            @click="viewMode = 'list'"
        />
      </div>

      <Card v-if="viewMode === 'map'" class="content-card">
        <template #title>Distribución del Local</template>
        <template #content>

          <div class="stage-container">
            <div class="stage">ESCENARIO</div>
          </div>

          <div class="seat-map-container">
            <div v-for="(seats, row) in seatMap" :key="row" class="seat-row-wrapper">
              <span class="row-label">{{ row }}</span>
              <div class="seat-row">
                <div
                    v-for="seat in seats"
                    :key="seat.id_ticket"
                    class="seat"
                    :class="seat.status.toLowerCase()"
                    :title="`Fila ${row} - Asiento ${seat.seat_number} (S/ ${seat.price})`"
                >
                  {{ seat.seat_number }}
                </div>
              </div>
              <span class="row-label">{{ row }}</span>
            </div>
          </div>

          <div class="seat-legend">
            <div class="legend-item"><div class="seat available"></div> Disponible</div>
            <div class="legend-item"><div class="seat sold"></div> Vendido</div>
          </div>

        </template>
      </Card>

      <Card v-if="viewMode === 'list'" class="content-card">
        <template #content>
          <DataTable
              :value="tickets"
              :loading="loading"
              paginator
              :rows="10"
              responsiveLayout="scroll"
              stripedRows
              emptyMessage="No hay asientos generados para este evento."
          >
            <Column field="id_ticket" header="ID Ticket" sortable></Column>
            <Column field="row_str" header="Fila" sortable></Column>
            <Column field="seat_number" header="Asiento" sortable></Column>
            <Column header="Precio">
              <template #body="slotProps">S/ {{ slotProps.data.price }}</template>
            </Column>
            <Column header="Estado" field="status" sortable>
              <template #body="slotProps">
                <Tag :value="slotProps.data.status" :severity="getSeverity(slotProps.data.status)"/>
              </template>
            </Column>
          </DataTable>
        </template>
      </Card>

    </div>
  </AdminLayout>
</template>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title { font-size: 2rem; font-weight: 700; color: #111827; margin: 0 0 8px 0; }
.page-subtitle { color: #6b7280; margin: 0; }

/* ==============================
   KPI CARDS
   ============================== */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
}

.kpi-card {
  background: white;
  padding: 20px;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
  border: 1px solid #e5e7eb;
  position: relative;
}

.kpi-card p { margin: 0 0 10px 0; color: #6b7280; font-size: 0.9rem; font-weight: 600; }
.kpi-card h3 { margin: 0; font-size: 2rem; color: #111827; }
.kpi-card i {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 2.5rem;
  opacity: 0.15;
}

.text-green { color: #10b981 !important; }
.text-red { color: #ef4444 !important; }
.text-blue { color: #3b82f6 !important; }

/* ==============================
   CONTROLES Y TARJETAS
   ============================== */
.view-controls {
  display: flex;
  gap: 10px;
}

.content-card {
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.06);
  border: 1px solid #e5e7eb;
}

/* ==============================
   MAPA DE ASIENTOS
   ============================== */
.stage-container {
  display: flex;
  justify-content: center;
  margin-bottom: 40px;
}

.stage {
  width: 60%;
  height: 40px;
  background: #e5e7eb;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  border-radius: 0 0 50px 50px; /* Forma de curva */
  letter-spacing: 2px;
}

.seat-map-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
  align-items: center;
  overflow-x: auto; /* Por si hay muchos asientos */
  padding-bottom: 20px;
}

.seat-row-wrapper {
  display: flex;
  align-items: center;
  gap: 15px;
}

.row-label {
  font-weight: 700;
  color: #374151;
  width: 30px;
  text-align: center;
}

.seat-row {
  display: flex;
  gap: 8px;
}

.seat {
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px 8px 4px 4px; /* Forma de silla */
  font-size: 0.8rem;
  font-weight: 600;
  color: white;
  transition: transform 0.2s ease;
  cursor: default;
}

.seat:hover {
  transform: scale(1.1);
}

.seat.available {
  background-color: #10b981; /* Verde */
  box-shadow: 0 4px 0 #059669; /* Efecto 3D */
}

.seat.sold {
  background-color: #ef4444; /* Rojo */
  box-shadow: 0 4px 0 #b91c1c;
  opacity: 0.7;
}

.seat.reserved {
  background-color: #f59e0b; /* Amarillo */
  box-shadow: 0 4px 0 #d97706;
}

.seat-legend {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #374151;
  font-weight: 600;
}
</style>