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
import SeatMapPage from '../customer/presentation/components/seat-map.vue';
import CheckoutPage from '../customer/presentation/components/checkout-page.vue'; // <-- IMPORTACIÓN RECUPERADA
import MyTicketsPage from '../customer/presentation/components/my-tickets.vue';

const routes = [
    // RUTAS PÚBLICAS
    { path: '/', component: HomePage },         // Cartelera abierta a todos
    { path: '/login', component: LoginForm },   // Vista de Login

    // RUTAS DEL CLIENTE (Protegidas)
    { path: '/tickets', component: MyTicketsPage, meta: { role: 'cliente' }},
    { path: '/tickets/buy/:id', component: SeatMapPage, meta: { role: 'cliente' }},
    { path: '/checkout', component: CheckoutPage, meta: { role: 'cliente' }}, // <-- RUTA RECUPERADA

    // RUTAS DEL ADMIN (Protegidas)
    { path: '/admin', component: AdminPage, meta: { role: 'admin' }},
    { path: '/events', component: EventPage, meta: { role: 'admin' }},
    { path: '/admin/events/:id/tickets', component: TicketItem, meta: { role: 'admin' }},
    { path: '/sales', component: SalesPage, meta: { role: 'admin' }}
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

// GUARDIA DE NAVEGACIÓN
router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    // 1. Si la ruta es pública (Catálogo o Login), dejar pasar
    if (to.path === '/' || to.path === '/login') {
        // Si ya está logueado y va al login, lo redirigimos a su panel
        if (to.path === '/login' && token) {
            return role === 'admin' ? next('/admin') : next('/');
        }
        return next();
    }

    // 2. Si va a una ruta protegida y NO tiene token -> Al Login
    if (!token) {
        return next('/login');
    }

    // 3. Si tiene token pero el rol no coincide con la ruta -> A su inicio respectivo
    if (to.meta.role && to.meta.role !== role) {
        return role === 'admin' ? next('/admin') : next('/');
    }

    next();
});

export { router };