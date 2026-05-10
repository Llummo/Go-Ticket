<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import AdminLayout from "../../../shared/presentation/components/admin-layout.vue";

// Componentes PrimeVue
import Card from 'primevue/card';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';
import InputText from 'primevue/inputtext';

const transactions = ref([]);
const loading = ref(true);
const filters = ref({
  global: { value: null, matchMode: 'contains' }
});

const loadSales = async () => {
  try {
    const baseApi = import.meta.env.VITE_GO_TICKET_API_URL;
    const res = await axios.get(`${baseApi}/admin/transactions`);

    // Formatear fechas para que se vean bien en la tabla
    transactions.value = res.data.map(tx => ({
      ...tx,
      formatted_date: new Date(tx.action_date).toLocaleString(),
      seat_info: `Fila ${tx.row_str} - As. ${tx.seat_number}`
    }));
  } catch (error) {
    console.error("Error al cargar ventas:", error);
  } finally {
    loading.value = false;
  }
};

onMounted(loadSales);

const getMethodSeverity = (method) => {
  if (method && method.includes('VISA')) return 'info';
  if (method && method.includes('Yape')) return 'help';
  return 'success';
};
</script>

<template>
  <AdminLayout>
    <div class="sales-container">

      <div class="header">
        <div>
          <h1>Historial de Ventas</h1>
          <p>Auditoría completa de transacciones y pagos procesados.</p>
        </div>
      </div>

      <Card class="table-card">
        <template #title>
          <div class="table-toolbar">
            <span>Todas las Transacciones</span>
            <span class="p-input-icon-left">
                <i class="pi pi-search" />
                <InputText v-model="filters['global'].value" placeholder="Buscar cliente, evento..." />
            </span>
          </div>
        </template>

        <template #content>
          <DataTable
              :value="transactions"
              :loading="loading"
              :filters="filters"
              paginator
              :rows="10"
              responsiveLayout="scroll"
              stripedRows
              emptyMessage="No se encontraron transacciones."
              class="custom-table"
          >
            <Column field="id_history" header="Cod. Op." sortable></Column>
            <Column field="formatted_date" header="Fecha y Hora" sortable></Column>
            <Column field="event_title" header="Evento" sortable></Column>
            <Column field="customer_name" header="Cliente" sortable></Column>
            <Column field="seat_info" header="Ubicación"></Column>

            <Column header="Método Pago" sortable field="method">
              <template #body="slotProps">
                <Tag :value="slotProps.data.method || 'Transferencia'" :severity="getMethodSeverity(slotProps.data.method)"/>
              </template>
            </Column>

            <Column header="Monto" sortable field="price">
              <template #body="slotProps">
                <strong>S/ {{ slotProps.data.price }}</strong>
              </template>
            </Column>
          </DataTable>
        </template>
      </Card>

    </div>
  </AdminLayout>
</template>

<style scoped>
.sales-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.header { margin-bottom: 10px; }
.header h1 { font-size: 2rem; font-weight: 700; color: #111827; margin: 0 0 8px 0; }
.header p { color: #6b7280; margin: 0; }

.table-card {
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.06);
  border: 1px solid #e5e7eb;
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

:deep(.p-input-icon-left i) {
  margin-top: -0.5rem;
}

:deep(.p-inputtext) {
  border-radius: 8px;
  padding-left: 2.5rem;
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
  background-color: #f9fafb;
  color: #374151;
  font-weight: 600;
}
</style>