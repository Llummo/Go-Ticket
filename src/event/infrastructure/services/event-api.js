import axios from 'axios';

const baseApi = import.meta.env.VITE_GO_TICKET_API_URL;

const http = axios.create({
    baseURL: baseApi
});

export class EventApi {
    getEvents() {
        return http.get('/events');
    }

    // Este endpoint usará la lógica de creación + generación de tickets
    createEvent(event) {
        return http.post('/admin/events-with-tickets', event);
    }
}