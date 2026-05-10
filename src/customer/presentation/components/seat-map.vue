<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import ClientLayout from "../../../shared/presentation/components/client-layout.vue";

// Componentes PrimeVue
import Card from 'primevue/card';
import Button from 'primevue/button';
import { TicketApi } from "../../../tickets/infrastructure/ticket-api.js";

const route = useRoute();
const router = useRouter();
const api = new TicketApi();

const eventId = route.params.id;
const eventDetails = ref({});
const tickets = ref([]);
const loading = ref(true);

// Carrito de compras local
const selectedSeats = ref([]);
const maxSeats = 4; // Límite de compra por usuario

const loadData = async () => {
  try {
    loading.value = true;
    const baseApi = import.meta.env.VITE_GO_TICKET_API_URL;

    // 1. Traer detalles del evento
    const resEvents = await axios.get(`${baseApi}/events`);
    eventDetails.value = resEvents.data.find(e => e.id_event == eventId) || {};

    // 2. Traer todos los asientos
    const resTickets = await api.getEventTickets(eventId);
    tickets.value = resTickets.data;

  } catch (error) {
    console.error("Error cargando mapa de asientos:", error);
  } finally {
    loading.value = false;
  }
};

onMounted(loadData);

// Agrupamos por fila igual que en el admin
const seatMap = computed(() => {
  const map = {};
  tickets.value.forEach(t => {
    if (!map[t.row_str]) map[t.row_str] = [];
    map[t.row_str].push(t);
  });

  for (let row in map) {
    map[row].sort((a, b) => a.seat_number - b.seat_number);
  }
  return map;
});

// Lógica de Selección Interactiva
const toggleSeat = (seat) => {
  if (seat.status !== 'AVAILABLE') return; // No se puede clickear lo vendido/reservado

  const index = selectedSeats.value.findIndex(s => s.id_ticket === seat.id_ticket);

  if (index > -1) {
    // Si ya estaba seleccionado, lo quitamos
    selectedSeats.value.splice(index, 1);
  } else {
    // Si no está, lo agregamos (respetando el límite)
    if (selectedSeats.value.length < maxSeats) {
      selectedSeats.value.push(seat);
    } else {
      alert(`Solo puedes seleccionar un máximo de ${maxSeats} asientos.`);
    }
  }
};

const isSelected = (ticketId) => {
  return selectedSeats.value.some(s => s.id_ticket === ticketId);
};

// Total a pagar
const totalAmount = computed(() => {
  return selectedSeats.value.reduce((sum, seat) => sum + parseFloat(seat.price), 0);
});

const procederAlPago = () => {
  if (selectedSeats.value.length === 0) return;

  sessionStorage.setItem('checkout_seats', JSON.stringify(selectedSeats.value));
  sessionStorage.setItem('checkout_event', JSON.stringify(eventDetails.value));
  sessionStorage.setItem('checkout_total', totalAmount.value);

  router.push('/checkout');
};
</script>

<template>
  <ClientLayout>
    <div class="booking-container">

      <div v-if="loading" class="loading-state">
        <i class="pi pi-spin pi-spinner" style="font-size: 3rem"></i>
        <p>Cargando disponibilidad del local...</p>
      </div>

      <div v-else class="booking-grid">

        <div class="map-section">

          <div class="event-header">
            <Button icon="pi pi-arrow-left" class="p-button-rounded p-button-text p-button-plain" @click="router.push('/catalog')" />
            <div>
              <h1 class="event-title">{{ eventDetails.event_title }}</h1>
              <p class="event-subtitle"><i class="pi pi-map-marker"></i> {{ eventDetails.venue_name }}</p>
            </div>
          </div>

          <Card class="map-card">
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
                        class="seat interactive"
                        :class="[seat.status.toLowerCase(), { 'selected': isSelected(seat.id_ticket) }]"
                        @click="toggleSeat(seat)"
                        :title="`Fila ${row} - Asiento ${seat.seat_number} (S/ ${seat.price})`"
                    >
                      {{ seat.seat_number }}
                    </div>
                  </div>
                  <span class="row-label">{{ row }}</span>
                </div>
              </div>

              <div class="seat-legend">
                <div class="legend-item"><div class="seat available sample"></div> Disponible</div>
                <div class="legend-item"><div class="seat selected sample"></div> Tu Selección</div>
                <div class="legend-item"><div class="seat sold sample"></div> No Disponible</div>
              </div>
            </template>
          </Card>
        </div>

        <div class="cart-section">
          <Card class="cart-card">
            <template #title>Resumen de Compra</template>
            <template #content>

              <div v-if="selectedSeats.length === 0" class="empty-cart">
                <i class="pi pi-ticket"></i>
                <p>Selecciona tus asientos en el mapa para continuar.</p>
              </div>

              <div v-else class="cart-items">
                <div v-for="seat in selectedSeats" :key="seat.id_ticket" class="cart-item">
                  <div class="seat-info">
                    <strong>Fila {{ seat.row_str }}</strong>
                    <span>Asiento {{ seat.seat_number }}</span>
                  </div>
                  <div class="seat-price">
                    S/ {{ parseFloat(seat.price).toFixed(2) }}
                  </div>
                </div>

                <div class="cart-total">
                  <span>Total a pagar:</span>
                  <h2>S/ {{ totalAmount.toFixed(2) }}</h2>
                </div>

                <Button
                    label="Proceder al Pago"
                    icon="pi pi-credit-card"
                    class="w-full p-button-success p-button-lg"
                    @click="procederAlPago"
                />
              </div>

            </template>
          </Card>
        </div>

      </div>

    </div>
  </ClientLayout>
</template>

<style scoped>
.booking-container {
  max-width: 1200px;
  margin: 0 auto;
}

.loading-state {
  text-align: center;
  padding: 5rem;
  color: #6b7280;
}

.booking-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 30px;
}

@media (max-width: 900px) {
  .booking-grid {
    grid-template-columns: 1fr;
  }
}

/* CABECERA EVENTO */
.event-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
}

.event-title {
  font-size: 2rem;
  font-weight: 800;
  color: #111827;
  margin: 0;
}

.event-subtitle {
  color: #6b7280;
  margin: 4px 0 0 0;
  font-size: 1.1rem;
}

.map-card {
  border-radius: 20px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.06);
  border: 1px solid #e5e7eb;
}

/* MAPA DE ASIENTOS */
.stage-container {
  display: flex;
  justify-content: center;
  align-items: center;

  margin-bottom: 50px;
}

.stage {
  width: min(700px, 70%);
  height: 70px;

  margin: 0 auto;

  background:
      linear-gradient(
          to bottom,
          #475569,
          #1e293b
      );

  color: white;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 0 0 60px 60px;

  font-size: 1rem;
  font-weight: 900;
  letter-spacing: 4px;

  text-align: center;

  box-shadow:
      0 10px 30px rgba(0,0,0,0.18);
}

.seat-map-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
  align-items: center;
  overflow-x: auto;
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
  width: 42px;
  height: 42px;

  border-radius: 14px 14px 10px 10px;

  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 0.8rem;
  font-weight: 800;

  transition: 0.2s ease;

  user-select: none;
}

/* COLORES BASE DEL MAPA */
.seat.available {
  background: #22c55e;
  color: white;
  box-shadow: 0 5px 0 #15803d;
}
.seat.sold {
  background: #cbd5e1;
  color: transparent;
  box-shadow: 0 5px 0 #94a3b8;
  cursor: not-allowed;
  opacity: 0.7;
}

.seat.selected {
  background: var(--gt-yellow) !important;
  color: var(--gt-dark);

  box-shadow: 0 5px 0 #ca8a04 !important;

  border: 2px solid var(--gt-dark);

  transform: translateY(2px);
}

/* INTERACTIVIDAD */
.seat.interactive.available { cursor: pointer; }
.seat.interactive.available:hover {
  transform: translateY(-4px);
  filter: brightness(1.08);
}.seat.interactive.selected { transform: translateY(2px); border: 2px solid var(--gt-dark); }

/* LEYENDA */
.seat-legend {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 22px;

  margin-top: 40px;
  padding-top: 24px;

  border-top: 1px solid #e5e7eb;
}.legend-item {
  display: flex;
  align-items: center;
  gap: 10px;

  color: #ffffff;
  font-weight: 700;
  font-size: 0.95rem;
}
.seat.sample { width: 24px; height: 24px; box-shadow: none; border-radius: 4px; }

/* AJUSTES DEL CARRITO DERECHO */
.cart-card { border-radius: 16px; border: 2px solid var(--gt-red); position: sticky; top: 100px; }
.seat-price { font-weight: 800; color: var(--gt-red); font-size: 1.1rem; }
:deep(.p-button-success) { color: white; background: var(--gt-red) !important; border: none !important; font-weight: 700; }
:deep(.p-button-success:hover) { color: white; background: var(--gt-red-hover) !important; }

.empty-cart {
  text-align: center;
  padding: 2rem 1rem;
  color: #9ca3af;
}

.empty-cart i {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #d1d5db;
}

.cart-items {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f8fafc;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
}

.seat-info {
  display: flex;
  flex-direction: column;
}

.seat-info strong {
  color: #111827;
  font-size: 1.1rem;
}

.seat-info span {
  color: #6b7280;
  font-size: 0.9rem;
}

.seat-price {
  font-weight: 800;
  color: #3b82f6;
  font-size: 1.1rem;
}

.cart-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  padding-top: 15px;
  border-top: 2px dashed #e5e7eb;
}

.cart-total span {
  font-size: 1.1rem;
  color: white;
  font-weight: 700;
}

.cart-total h2 {
  margin: 0;

  color: white !important;

  font-size: 2rem;
  font-weight: 900;

  line-height: 1;
}

.w-full {
  width: 100%;
  margin-top: 15px;
}
</style>