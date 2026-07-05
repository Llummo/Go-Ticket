import { createRouter, createWebHistory } from 'vue-router';

// Vistas Auth
import LoginForm from '../auth/presentation/components/login-form.vue';

// Vistas Admin
import AdminPage from "../auth/presentation/components/admin-page.vue";
import EventPage from "../event/presentation/components/event-page.vue";
import TicketItem from "../tickets/presentation/components/ticket-item.vue";
import SalesPage from "../sales/presentation/components/sales-page.vue";

// Vistas Cliente
import HomePage from "../customer/presentation/components/home-page.vue";
import CatalogPage from "../customer/presentation/components/catalog-page.vue";
import SeatMapPage from '../customer/presentation/components/seat-map.vue';
import CheckoutPage from '../customer/presentation/components/checkout-page.vue'; 
import MyTicketsPage from '../customer/presentation/components/my-tickets.vue';
import UserProfile from '../customer/presentation/components/user-profile.vue';
import EventDetail from '../customer/presentation/components/event-detail.vue'; // <-- NUEVO IMPORT

const routes = [
    // RUTAS PÚBLICAS
    { path: '/', component: HomePage },         // Home abierto a todos
    { path: '/catalog', component: CatalogPage }, // Cartelera abierta a todos
    { path: '/login', component: LoginForm },   // Vista de Login

    // RUTAS DEL CLIENTE (Protegidas)
    { path: '/tickets', component: MyTicketsPage, meta: { role: 'cliente' }},
    { path: '/tickets/buy/:id', component: SeatMapPage, meta: { role: 'cliente' }},
    { path: '/checkout', component: CheckoutPage, meta: { role: 'cliente' }}, 
    { path: '/profile/:id', component: UserProfile, meta: { role: 'cliente' }},
    { path: '/event/:id', component: EventDetail, meta: { role: 'cliente' }}, // <-- NUEVA RUTA

    { path: '/admin', component: AdminPage, meta: { role: 'admin' }},
    { path: '/events', component: EventPage, meta: { role: 'admin' }},
    { path: '/admin/events/:id/tickets', component: TicketItem, meta: { role: 'admin' }},
    { path: '/sales', component: SalesPage, meta: { role: 'admin' }}
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

router.beforeEach((to, from) => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (to.path === '/' || to.path === '/login') {
        if (to.path === '/login' && token) {
            return role === 'admin' ? '/admin' : '/';
        }
        return true;
    }

    if (!token) {
        return '/login';
    }

    if (to.meta.role && to.meta.role !== role) {
        return role === 'admin' ? '/admin' : '/';
    }

    return true;
});

export { router };