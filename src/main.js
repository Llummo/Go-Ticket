import { createApp } from 'vue'
import App from './App.vue'
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';
import 'primeflex/primeflex.css'
import 'primeicons/primeicons.css';
import './style.css'
import axios from 'axios';

import Card from 'primevue/card';
import { router } from './router'
import Password from "primevue/password";
import InputText from "primevue/inputtext";
import Button from "primevue/button";

// Configurar Interceptor de Axios para inyectar JWT globalmente
axios.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

const app = createApp(App);
app.use(router);
app.use(PrimeVue, {theme: {preset: Aura}});
app.component('Password', Password)
app.component('InputText', InputText)
app.component('pv-button', Button)
app.component('pv-card', Card);
app.mount('#app');