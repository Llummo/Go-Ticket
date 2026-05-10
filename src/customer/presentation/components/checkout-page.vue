<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import ClientLayout from "../../../shared/presentation/components/client-layout.vue";

// Componentes PrimeVue
import Card from 'primevue/card';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';

const router = useRouter();
const loading = ref(false);

// Datos de la compra
const eventDetails = ref({});
const selectedSeats = ref([]);
const totalAmount = ref(0);

// Formulario de Pago (Simulado)
const paymentData = ref({
  cardNumber: '',
  cardName: '',
  expiry: '',
  cvv: ''
});

onMounted(() => {
  // Recuperar los datos del carrito desde la memoria temporal
  const savedSeats = sessionStorage.getItem('checkout_seats');
  const savedEvent = sessionStorage.getItem('checkout_event');
  const savedTotal = sessionStorage.getItem('checkout_total');

  if (!savedSeats || !savedEvent) {
    alert("No hay una compra en proceso.");
    router.push('/catalog');
    return;
  }

  selectedSeats.value = JSON.parse(savedSeats);
  eventDetails.value = JSON.parse(savedEvent);
  totalAmount.value = parseFloat(savedTotal);
});

const procesarCompra = async () => {
  if (!paymentData.value.cardNumber || !paymentData.value.cardName) {
    alert("Por favor, completa los datos de la tarjeta.");
    return;
  }

  loading.value = true;
  try {
    const baseApi = import.meta.env.VITE_GO_TICKET_API_URL;

    // Código de operación simulado del banco
    const opCode = 'TX-' + Math.random().toString(36).substring(2, 10).toUpperCase();

    const promesasDeCompra = selectedSeats.value.map(seat => {
      return axios.post(`${baseApi}/purchase`, {
        id_customer: 1,
        id_ticket: seat.id_ticket,
        total_amount: parseFloat(seat.price),
        method: 'Tarjeta de Crédito / VISA',
        operation_code: opCode
      });
    });

    // Ejecutamos todas las compras en paralelo
    await Promise.all(promesasDeCompra);

    // Limpiamos el carrito
    sessionStorage.removeItem('checkout_seats');
    sessionStorage.removeItem('checkout_event');
    sessionStorage.removeItem('checkout_total');

    alert(`¡Compra Exitosa! Código de operación: ${opCode}`);

    router.push('/catalog');

  } catch (error) {
    console.error("Error al procesar el pago:", error);
    alert("Ocurrió un error al procesar la tarjeta. Inténtalo de nuevo.");
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <ClientLayout>
    <div class="checkout-container">

      <div class="checkout-header">
        <h1>Finalizar Compra</h1>
        <p>Estás a un paso de asegurar tu lugar de forma segura.</p>
      </div>

      <div class="checkout-grid">

        <div class="payment-section">
          <Card class="payment-card">
            <template #title>
              <div class="card-title-with-icon">
                <i class="pi pi-credit-card"></i> Datos de Pago
              </div>
            </template>
            <template #content>
              <div class="form-grid">

                <div class="field full-width">
                  <label>Nombre en la Tarjeta</label>
                  <InputText v-model="paymentData.cardName" placeholder="Ej: Juan Pérez" />
                </div>

                <div class="field full-width">
                  <label>Número de Tarjeta</label>
                  <InputText v-model="paymentData.cardNumber" placeholder="0000 0000 0000 0000" />
                </div>

                <div class="field half-width">
                  <label>Vencimiento (MM/AA)</label>
                  <InputText v-model="paymentData.expiry" placeholder="12/28" />
                </div>

                <div class="field half-width">
                  <label>CVV</label>
                  <InputText v-model="paymentData.cvv" type="password" placeholder="***" />
                </div>

              </div>
            </template>
          </Card>
        </div>

        <div class="summary-section">
          <Card class="summary-card">
            <template #title>Resumen de tu Orden</template>
            <template #content>

              <div class="event-summary">
                <img :src="eventDetails.image_url || 'https://picsum.photos/400/200'" alt="Evento" class="summary-img" />
                <div class="summary-info">
                  <h3>{{ eventDetails.event_title }}</h3>
                  <p><i class="pi pi-map-marker"></i> {{ eventDetails.venue_name }}</p>
                </div>
              </div>

              <div class="divider"></div>

              <div class="tickets-list">
                <div v-for="seat in selectedSeats" :key="seat.id_ticket" class="ticket-row">
                  <span>Fila {{ seat.row_str }} - As. {{ seat.seat_number }}</span>
                  <strong>S/ {{ parseFloat(seat.price).toFixed(2) }}</strong>
                </div>
              </div>

              <div class="divider"></div>

              <div class="total-row">
                <span>Total a Pagar</span>
                <h2>S/ {{ totalAmount.toFixed(2) }}</h2>
              </div>

              <Button
                  :label="loading ? 'Procesando pago...' : 'Pagar S/ ' + totalAmount.toFixed(2)"
                  icon="pi pi-check-circle"
                  class="w-full p-button-primary p-button-lg pay-btn"
                  :loading="loading"
                  @click="procesarCompra"
              />

              <p class="secure-text"><i class="pi pi-lock"></i> Pago procesado de forma segura.</p>

            </template>
          </Card>
        </div>

      </div>

    </div>
  </ClientLayout>
</template>

<style scoped>
.checkout-container {
  max-width: 1000px;
  margin: 0 auto;
}

.checkout-header {
  margin-bottom: 2rem;
  text-align: center;
}

.checkout-header h1 {
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--gt-text-main);
  margin: 0 0 8px 0;
}

.checkout-header p {
  color: var(--gt-text-muted);
  font-size: 1.1rem;
  margin: 0;
}

.checkout-grid {
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: 30px;
}

@media (max-width: 800px) {
  .checkout-grid {
    grid-template-columns: 1fr;
  }
}

.payment-card,
.summary-card {
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.06);
  border: 1px solid #E5E7EB;
  background: #ffffff;
}

.summary-card {
  position: sticky;
  top: 100px;
}

/* FIX GENERAL DE TEXTOS */
:deep(.p-card-content),
:deep(.p-card-title),
:deep(.p-card-body) {
  color: #111827 !important;
}

/* TITULO */
.card-title-with-icon {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--gt-text-main);
  font-weight: 800;
  font-size: 1.2rem;
}

.card-title-with-icon i {
  color: var(--gt-red);
}

/* FORM */
.form-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field label {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--gt-text-main);
  text-transform: uppercase;
}

.full-width {
  width: 100%;
}

.half-width {
  width: calc(50% - 7.5px);
}

:deep(.p-inputtext) {
  width: 100%;
  border-radius: 8px;
  padding: 12px;
  border: 1px solid #D1D5DB;
  background: #ffffff;
  color: #111827 !important;
}

:deep(.p-inputtext::placeholder) {
  color: #94a3b8;
}

:deep(.p-inputtext:focus) {
  border-color: var(--gt-red);
  box-shadow: 0 0 0 2px rgba(227, 24, 55, 0.2);
}

/* EVENTO */
.event-summary {
  display: flex;
  gap: 15px;
  align-items: center;
  margin-bottom: 15px;
}

.summary-img {
  width: 90px;
  height: 65px;
  border-radius: 8px;
  object-fit: cover;
  border: 1px solid #E5E7EB;
}

.summary-info h3 {
  margin: 0 0 5px 0;
  font-size: 1.1rem;
  color: var(--gt-text-main);
  font-weight: 800;
}

.summary-info p {
  margin: 0;
  font-size: 0.85rem;
  color: var(--gt-text-muted);
}

.summary-info i {
  color: var(--gt-yellow);
}

/* DIVIDER */
.divider {
  height: 1px;
  background-color: #E5E7EB;
  margin: 20px 0;
}

/* LISTA DE TICKETS */
.tickets-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ticket-row {
  display: flex;
  justify-content: space-between;
  align-items: center;

  color: #1e293b !important;
  font-size: 1rem;
  font-weight: 600;
}

.ticket-row strong {
  color: #111827 !important;
  font-weight: 800;
}

/* TOTAL */
.total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;

  margin-top: 10px;
  margin-bottom: 20px;

  padding: 18px 20px;

  background: linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%);
  border: 1px solid #fecdd3;
  border-radius: 16px;

  box-shadow: 0 4px 12px rgba(190, 24, 93, 0.08);
}

/* ESTE ERA EL PROBLEMA */
.total-row span {
  color: #475569 !important;
  opacity: 1 !important;

  font-size: 0.9rem;
  font-weight: 800;

  text-transform: uppercase;
  letter-spacing: 1px;
}

.total-row h2 {
  margin: 0 !important;

  color: #be123c !important;
  opacity: 1 !important;

  font-size: 2rem;
  font-weight: 900;
  line-height: 1;
}

/* BOTON */
:deep(.pay-btn) {
  background: var(--gt-red) !important;
  border: none !important;

  font-weight: 800;
  font-size: 1.1rem;
  text-transform: uppercase;

  height: 58px;
  border-radius: 14px !important;

  transition: all 0.25s ease;
}

:deep(.pay-btn:hover) {
  background: var(--gt-red-hover) !important;
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(227, 24, 55, 0.3);
}

/* TEXTO SEGURO */
.secure-text {
  text-align: center;
  font-size: 0.85rem;
  color: var(--gt-text-muted);
  margin-top: 15px;
  font-weight: 600;
}
</style>