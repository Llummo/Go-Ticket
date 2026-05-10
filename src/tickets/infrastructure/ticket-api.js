import axios from 'axios';

const baseApi = import.meta.env.VITE_GO_TICKET_API_URL;

const http = axios.create({
    baseURL: baseApi
});

export class TicketApi {

    getTickets() {
        return http.get('/tickets');
    }

    getEventTickets(eventId) {
        return http.get(`/events/${eventId}/tickets`);
    }

    createTicket(data) {
        return http.post('/tickets', data);
    }

}