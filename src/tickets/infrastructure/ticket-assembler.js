import {Ticket} from "../domain/model/ticket.entity.js";

export class TicketAssembler {

    static toEntityFromResource(resource) {
        return new Ticket({...resource});
    }

    static toEntityFromResponse(response) {
        const toEntity = (ticket) => this.toEntityFromResource(ticket);
        return response.data.map(toEntity);
    }

}
