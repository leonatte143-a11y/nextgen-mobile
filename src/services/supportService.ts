import { apiService } from './apiService';

type CreateTicketInput = {
  bookingId?: string;
  subject: string;
  description?: string;
};

export const supportService = {
  createTicket(input: CreateTicketInput) {
    return apiService.post('/api/v1/users/support/tickets', input, 'user');
  },

  listTickets() {
    return apiService.get('/api/v1/users/support/tickets', 'user');
  },
};
