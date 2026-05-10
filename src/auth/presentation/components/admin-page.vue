<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import AdminLayout from "../../../shared/presentation/components/admin-layout.vue";

const router = useRouter();

// Variables reactivas para los KPIs
const totalEvents = ref(0);
const totalRevenue = ref(0);
const totalTicketsSold = ref(0);
const recentActivity = ref([]);
const loading = ref(true);

const loadDashboardData = async () => {
  try {
    const baseApi = import.meta.env.VITE_GO_TICKET_API_URL;

    // Cargar eventos y transacciones en paralelo desde el backend
    const [resEvents, resTx] = await Promise.all([
      axios.get(`${baseApi}/events`),
      axios.get(`${baseApi}/admin/transactions`)
    ]);

    const events = resEvents.data;
    const transactions = resTx.data;

    // 1. Calcular KPIs Reales
    totalEvents.value = events.length;
    totalTicketsSold.value = transactions.length;

    // Sumar el precio de todos los tickets vendidos
    totalRevenue.value = transactions.reduce((sum, tx) => sum + parseFloat(tx.price), 0);

    // 2. Poblar Actividad Reciente (Últimas 5)
    if (transactions.length > 0) {
      recentActivity.value = transactions.slice(0, 5).map(tx => ({
        user: tx.customer_name || 'Cliente Web',
        action: `${tx.event_title} (Asiento ${tx.row_str}-${tx.seat_number})`,
        time: new Date(tx.action_date).toLocaleDateString(),
        amount: `S/ ${tx.price}` // Agregamos el monto
      }));
    } else {
      recentActivity.value = [];
    }

  } catch (error) {
    console.error("Error cargando dashboard:", error);
  } finally {
    loading.value = false;
  }
};

onMounted(loadDashboardData);

// Configuración de los accesos rápidos
const quickActions = [
  { label: 'Eventos', icon: 'pi pi-calendar', route: '/events', class: 'bg-indigo' },
  { label: 'Ventas', icon: 'pi pi-wallet', route: '/sales', class: 'bg-green' }
];

const navigateTo = (route) => {
  router.push(route);
};
</script>

<template>
  <AdminLayout>

    <div class="header">
      <div>
        <h1>Dashboard General</h1>
        <p>Resumen de operaciones y rendimiento de GoTicket</p>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
      <p>Cargando métricas...</p>
    </div>

    <div v-else>
      <div class="stats-grid">
        <div class="stat-card">
          <div>
            <p class="stat-title">Eventos Activos</p>
            <h2>{{ totalEvents }}</h2>
          </div>
          <i class="pi pi-calendar text-indigo"></i>
        </div>

        <div class="stat-card">
          <div>
            <p class="stat-title">Tickets Vendidos</p>
            <h2>{{ totalTicketsSold }}</h2>
          </div>
          <i class="pi pi-ticket text-green"></i>
        </div>

        <div class="stat-card">
          <div>
            <p class="stat-title">Ingresos Totales</p>
            <h2>S/ {{ totalRevenue.toFixed(2) }}</h2>
          </div>
          <i class="pi pi-wallet text-blue"></i>
        </div>
      </div>

      <div class="dashboard-columns">

        <div class="section">
          <h2>Accesos Rápidos</h2>
          <div class="actions-grid">
            <button
                v-for="action in quickActions"
                :key="action.label"
                class="action-btn"
                @click="navigateTo(action.route)"
            >
              <div class="icon-wrapper" :class="action.class">
                <i :class="action.icon"></i>
              </div>
              <span>Gestionar {{ action.label }}</span>
            </button>
          </div>
        </div>

        <div class="section">
          <h2>Últimas Ventas</h2>
          <div class="activity-card">
            <div class="activity-item" v-for="(item, index) in recentActivity" :key="index">
              <div class="activity-info">
                <div class="avatar"><i class="pi pi-shopping-bag"></i></div>
                <div>
                  <strong>{{ item.user }}</strong>
                  <p>{{ item.action }}</p>
                </div>
              </div>
              <div style="text-align: right;">
                <strong class="text-green">{{ item.amount }}</strong><br>
                <span class="time-badge">{{ item.time }}</span>
              </div>
            </div>

            <div v-if="recentActivity.length === 0" class="empty-state">
              <p>No hay ventas registradas aún.</p>
            </div>
          </div>
        </div>

      </div>
    </div>

  </AdminLayout>
</template>

<style scoped>
/* HEADER */
.header { margin-bottom: 30px; }
.header h1 { font-size: 32px; margin-bottom: 6px; color: #111827; }
.header p { color: #6b7280; }

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #6b7280;
}

/* STATS */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 35px;
}

.stat-card {
  background: white;
  border-radius: 18px;
  padding: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
  border: 1px solid #e5e7eb;
  transition: 0.3s;
}

.stat-card:hover { transform: translateY(-4px); box-shadow: 0 10px 25px rgba(0,0,0,0.06); }
.stat-title { color: #6b7280; margin-bottom: 8px; font-weight: 600; font-size: 0.9rem;}
.stat-card h2 { font-size: 28px; color: #111827; margin: 0;}
.stat-card i { font-size: 34px; opacity: 0.8;}

.text-indigo { color: #6366f1; }
.text-green { color: #10b981; }
.text-blue { color: #3b82f6; }

/* LAYOUT COLUMNAS */
.dashboard-columns {
  display: grid;
  grid-template-columns: 1fr 2fr; /* Accesos más pequeños, actividad más grande */
  gap: 30px;
}

@media (max-width: 768px) {
  .dashboard-columns { grid-template-columns: 1fr; }
}

.section h2 { margin-bottom: 18px; color: #111827; font-size: 1.25rem;}

/* QUICK ACTIONS */
.actions-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 15px;
}

.action-btn {
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 16px;
  background: white;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: 0.3s;
  font-size: 15px;
  font-weight: 600;
  color: #374151;
  text-align: left;
}

.action-btn:hover {
  border-color: #6366f1;
  background: #f8fafc;
}

.icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
}

.bg-indigo { background: #6366f1; }
.bg-green { background: #10b981; }

/* ACTIVITY */
.activity-card {
  background: white;
  border-radius: 18px;
  padding: 20px;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
  border: 1px solid #e5e7eb;
}

.activity-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #f3f4f6;
}

.activity-item:last-child { border-bottom: none; }

.activity-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e0e7ff;
  color: #4f46e5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.1rem;
}

.activity-info strong { color: #111827; }
.activity-info p { color: #6b7280; font-size: 0.9rem; margin-top: 4px;}

.time-badge {
  background: #f3f4f6;
  color: #6b7280;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.empty-state {
  text-align: center;
  padding: 20px;
  color: #9ca3af;
}
</style>