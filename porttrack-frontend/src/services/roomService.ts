import api from './api';

export interface RoomData {
  id?: number;
  name: string;
  code: string;
  type: 'PUBLIC' | 'PRIVATE';
  status?: string;
  initialBalance?: number;
  balance?: number; // Dành cho joined room
  startTime?: string;
  endTime?: string;
}

export const roomService = {
  getOwnedRooms: async () => {
    const response = await api.get('/api/rooms/owned');
    return response.data;
  },
  getJoinedRooms: async () => {
    const response = await api.get('/api/rooms/joined');
    return response.data;
  },
  createRoom: async (data: any) => {
    const response = await api.post('/api/rooms', data);
    return response.data;
  },
  joinRoom: async (data: { code: string; password?: string }) => {
    const response = await api.post('/api/rooms/join', data);
    return response.data;
  }
};