<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import ClientLayout from "../../../shared/presentation/components/client-layout.vue";

// Componentes PrimeVue
import Button from 'primevue/button';
import Tag from 'primevue/tag';

const router = useRouter();
const myTickets = ref([]);
const loading = ref(true);

const loadMyTickets = async () => {
  try {
    const baseApi = import.meta.env.VITE_GO_TICKET_API_URL;
    const customerId = 1;

    const res = await axios.get(`${baseApi}/customer/${customerId}/tickets`);
    myTickets.value = res.data;
  } catch (error) {
    console.error("Error al cargar mis entradas:", error);
  } finally {
    loading.value = false;
  }
};

onMounted(loadMyTickets);
</script>

<template>
  <ClientLayout>
    <div class="my-tickets-container">

      <div class="header-section">
        <h1>Mis Entradas</h1>
        <p>Presenta el código QR o código de barras el día del evento.</p>
      </div>

      <div v-if="loading" class="loading-state">
        <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
        <p>Cargando tu billetera digital...</p>
      </div>

      <div v-else-if="myTickets.length === 0" class="empty-state">
        <i class="pi pi-ticket" style="font-size: 4rem; color: #d1d5db; margin-bottom: 1rem;"></i>
        <h2>Aún no tienes entradas</h2>
        <p>Explora nuestra cartelera y no te pierdas de los mejores eventos.</p>
        <Button label="Ver Cartelera" class="p-button-primary mt-3" @click="router.push('/catalog')" />
      </div>

      <div v-else class="tickets-grid">

        <div v-for="ticket in myTickets" :key="ticket.id_ticket" class="digital-ticket">

          <div class="ticket-image">
            <img :src="ticket.image_url || 'https://picsum.photos/400/400'" alt="Evento">
            <div class="ticket-date-badge">
              <strong>{{ String(ticket.start_date).substring(8, 10) }}</strong>
              <span>{{ String(ticket.start_date).substring(5, 7) }}</span>
            </div>
          </div>

          <div class="ticket-info">
            <h2 class="event-title" :title="ticket.event_title">{{ ticket.event_title }}</h2>
            <div class="info-row">
              <i class="pi pi-map-marker"></i>
              <span>{{ ticket.venue_name }}</span>
            </div>

            <div class="seat-details">
              <div class="seat-block">
                <span>FILA</span>
                <strong>{{ ticket.row_str }}</strong>
              </div>
              <div class="seat-block">
                <span>ASIENTO</span>
                <strong>{{ ticket.seat_number }}</strong>
              </div>
              <div class="seat-block">
                <span>TICKET ID</span>
                <strong>#00{{ ticket.id_ticket }}</strong>
              </div>
            </div>
            <Tag value="COMPRA CONFIRMADA" class="status-tag" />
          </div>

          <div class="ticket-barcode">
            <div class="tear-line"></div>
            <div class="barcode-content">
              <i class="pi pi-qrcode" style="font-size: 4rem; color: #111827;"></i>
              <span class="barcode-text">ESCANEAR ACCESO</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  </ClientLayout>
</template>

<style scoped>
.my-tickets-container { max-width: 900px; margin: 0 auto; }
.header-section { margin-bottom: 2rem; }
.header-section h1 { font-size: 2.5rem; font-weight: 800; color: var(--gt-text-main); margin: 0 0 8px 0; }
.header-section p { color: var(--gt-text-muted); font-size: 1.1rem; margin: 0; }

.tickets-grid { display: flex; flex-direction: column; gap: 1.5rem; }

.digital-ticket {
  display: flex; background: var(--gt-white); border-radius: 16px; overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.08); position: relative; height: 200px;
  border: 1px solid #E5E7EB; border-left: 6px solid var(--gt-red); /* Detalle GoTicket */
}

.ticket-image { width: 200px; position: relative; }
.ticket-image img { width: 100%; height: 100%; object-fit: cover; }
.ticket-date-badge {
  position: absolute; top: 15px; left: 15px; background: var(--gt-yellow); color: var(--gt-dark);
  padding: 8px 12px; border-radius: 8px; text-align: center; display: flex; flex-direction: column;
  box-shadow: 0 4px 6px rgba(0,0,0,0.2); font-family: sans-serif;
}
.ticket-date-badge strong { font-size: 1.5rem; line-height: 1; font-weight: 900;}
.ticket-date-badge span { font-size: 0.8rem; font-weight: 800; text-transform: uppercase;}

.ticket-info { flex: 1; padding: 24px; display: flex; flex-direction: column; justify-content: center; }
.event-title { font-size: 1.6rem; font-weight: 800; color: var(--gt-text-main); margin: 0 0 10px 0; }
.info-row { display: flex; align-items: center; gap: 8px; color: var(--gt-text-muted); margin-bottom: 20px; font-weight: 600;}
.info-row i { color: var(--gt-red); }

.seat-details { display: flex; gap: 40px; margin-bottom: 15px; }
.seat-block { display: flex; flex-direction: column; }
.seat-block span { font-size: 0.75rem; color: var(--gt-text-muted); font-weight: 800; letter-spacing: 1px; }
.seat-block strong { font-size: 1.3rem; color: var(--gt-text-main); font-weight: 900;}

.status-tag {
  background: #16A34A !important;
  color: #FFFFFF !important;
  font-weight: 800 !important;
  letter-spacing: 1px;
  border: none !important;
  padding: 0.5rem 0.9rem;
  border-radius: 999px;
}

:deep(.status-tag.p-tag) {
  background: #50c17c !important;
  color: #FFFFFF !important;
}
.ticket-barcode { width: 160px; background: #F3F4F6; display: flex; position: relative; }
.tear-line { width: 2px; height: 100%; border-left: 3px dashed #D1D5DB; position: absolute; left: 0; }
.tear-line::before, .tear-line::after {
  content: ''; position: absolute; width: 30px; height: 30px; background: var(--gt-light);
  border-radius: 50%; left: -16.5px; box-shadow: inset 0 0 5px rgba(0,0,0,0.1);
}
.tear-line::before { top: -15px; } .tear-line::after { bottom: -15px; }

.barcode-content { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; }
.barcode-text { font-size: 0.75rem; font-weight: 800; color: var(--gt-text-muted); letter-spacing: 1.5px; }

@media (max-width: 768px) {
  .digital-ticket { flex-direction: column; height: auto; border-left: none; border-top: 6px solid var(--gt-red);}
  .ticket-image { width: 100%; height: 150px; }
  .ticket-barcode { width: 100%; height: 120px; border-top: 3px dashed #D1D5DB;}
  .tear-line { display: none; }
}
</style>