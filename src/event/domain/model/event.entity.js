export class Event {
    constructor({
                    id_event = null,
                    id_venue = null,
                    id_organizer = null,
                    id_category = null,
                    event_title = '',
                    description = '',
                    image_url = '',
                    start_date = '',
                    price_base = 0
                } = {}) {
        this.id_event = id_event;
        this.id_venue = id_venue;
        this.id_organizer = id_organizer;
        this.id_category = id_category;
        this.event_title = event_title;
        this.description = description;
        this.image_url = image_url;
        this.start_date = start_date;
        this.price_base = price_base;
    }
}