import { ref, onMounted } from 'vue';
import { EventApi } from '../infrastructure/services/event-api.js';
import { Event } from "../domain/model/event.entity.js";
import axios from 'axios';

const api = new EventApi();

export function useEvents() {
    const events = ref([]);
    const form = ref(new Event({}));

    // Variables reactivas para los selectores
    const venues = ref([]);
    const categories = ref([]);

    const loadEvents = async () => {
        try {
            const res = await api.getEvents();
            events.value = res.data;
        } catch (error) {
            console.error(error);
        }
    };

    // Cargar los catálogos desde el backend
    const loadCatalogs = async () => {
        try {
            const baseApi = import.meta.env.VITE_GO_TICKET_API_URL;
            const [resVenues, resCategories] = await Promise.all([
                axios.get(`${baseApi}/venues`),
                axios.get(`${baseApi}/categories`)
            ]);
            venues.value = resVenues.data;
            categories.value = resCategories.data;
        } catch (error) {
            console.error('Error cargando catálogos:', error);
        }
    };

    const saveEvent = async () => {
        const newEvent = new Event({
            ...form.value,
            id_organizer: 1,
            image_url: 'https://picsum.photos/400/250'
        });

        try {
            await api.createEvent(newEvent);
            await loadEvents();
            // Limpiamos el formulario
            form.value = new Event({});
            alert("¡Evento creado y tickets generados con éxito!");
        } catch (error) {
            console.error('Error al guardar el evento:', error);
            alert("Hubo un error al crear el evento.");
        }
    };

    const removeEvent = async (id) => {
        console.log("Eliminar bloqueado por seguridad referencial:", id);
    };

    onMounted(() => {
        loadEvents();
        loadCatalogs(); // Cargamos los datos al entrar a la página
    });

    return {
        events,
        form,
        venues,
        categories,
        loadEvents,
        saveEvent,
        removeEvent
    };
}