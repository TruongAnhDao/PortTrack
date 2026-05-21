import api from './api';

export interface RoomData {
  id: number;
  name: string;
  code: string;
  type: 'PUBLIC' | 'PRIVATE';
  ownerId: number;
  status: 'WAITING' | 'RUNNING' | 'FINISHED';
  initialBalance: number;
  startTime?: string;
  endTime?: string;
}

export interface JoinedRoomData {
  roomInfo: RoomData;
  currentCashBalance: number;
}

export interface RoomCardData extends RoomData {
  currentCashBalance?: number;
}

export interface CreateRoomData {
  name: string;
  type: 'PUBLIC' | 'PRIVATE';
  password?: string;
  initialBalance: number;
  startTime: string;
  endTime: string;
}

export interface RoomDashboardData {
  name: string;
  initialBalance: number;
  startTime?: string;
  endTime?: string;
  guideText?: string;
}

export interface TradeData {
  stockSymbol: string;
  action: 'BUY' | 'SELL';
  quantity: number;
}

export interface StockPriceData {
  symbol: string;
  price: number;
  openPrice?: number | null;
  volume?: number | null;
  tradeDate?: string;
  marketOpen: boolean;
}

export const roomService = {
  getOwnedRooms: async (): Promise<RoomData[]> => {
    const response = await api.get<RoomData[]>('/api/rooms/owned');
    return response.data;
  },
  getJoinedRooms: async (): Promise<JoinedRoomData[]> => {
    const response = await api.get<JoinedRoomData[]>('/api/rooms/joined');
    return response.data;
  },
  createRoom: async (data: CreateRoomData): Promise<RoomData> => {
    const response = await api.post<RoomData>('/api/rooms', data);
    return response.data;
  },
  joinRoom: async (data: { code: string; password?: string }): Promise<RoomData> => {
    const response = await api.post<RoomData>('/api/rooms/join', data);
    return response.data;
  },
  getRoomDashboard: async (roomId: number): Promise<RoomDashboardData> => {
    const response = await api.get<RoomDashboardData>(`/api/rooms/${roomId}/dashboard`);
    return response.data;
  },
  executeTrade: async (roomId: number, data: TradeData): Promise<string> => {
    const response = await api.post<string>(`/api/rooms/${roomId}/trade`, data);
    return response.data;
  },
  getStockPrice: async (symbol: string): Promise<StockPriceData> => {
    const normalizedSymbol = symbol.trim().toUpperCase();
    const toDate = Math.floor(Date.now() / 1000);
    const fromDate = toDate - (3 * 24 * 60 * 60);
    const url = `https://services.entrade.com.vn/chart-api/v2/ohlcs/stock?from=${fromDate}&to=${toDate}&symbol=${encodeURIComponent(normalizedSymbol)}&resolution=1`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const result: { t?: number[]; c?: number[]; o?: number[]; v?: number[] } = await response.json();
    if (!result.t?.length || !result.c?.length) {
      throw new Error(`No price data found for ${normalizedSymbol}.`);
    }

    const lastIndex = result.t.length - 1;
    return {
      symbol: normalizedSymbol,
      price: result.c[lastIndex] * 1000,
      openPrice: result.o?.[lastIndex] === undefined ? null : result.o[lastIndex] * 1000,
      volume: result.v?.[lastIndex] ?? null,
      tradeDate: new Date(result.t[lastIndex] * 1000).toISOString(),
      marketOpen: isVietnamMarketOpen(),
    };
  },
};

function isVietnamMarketOpen() {
  const now = new Date();
  const vietnamTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
  const day = vietnamTime.getDay();
  if (day === 0 || day === 6) return false;

  const minutes = vietnamTime.getHours() * 60 + vietnamTime.getMinutes();
  const morningOpen = 9 * 60;
  const morningClose = 11 * 60 + 30;
  const afternoonOpen = 13 * 60;
  const afternoonClose = 15 * 60;

  return (minutes >= morningOpen && minutes < morningClose)
    || (minutes >= afternoonOpen && minutes < afternoonClose);
}
