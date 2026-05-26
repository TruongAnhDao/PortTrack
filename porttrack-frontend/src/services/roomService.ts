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

export interface PortfolioHoldingData {
  symbol: string;
  quantity: number;
  avgPrice: number;
  marketPrice: number;
  marketValue: number;
  costValue: number;
  unrealizedProfitLoss: number;
  returnPercentage: number;
  priceAvailable: boolean;
}

export interface PortfolioData {
  initialBalance: number;
  cashBalance: number;
  holdingsValue: number;
  totalPortfolioValue: number;
  totalCostValue: number;
  totalProfitLoss: number;
  returnPercentage: number;
  holdings: PortfolioHoldingData[];
}

export interface TransactionData {
  id: number;
  symbol: string;
  type: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  fee: number;
  tax: number;
  totalAmount: number;
  executedAt: string;
}

export interface SummaryData {
  portfolio: PortfolioData;
  totalTrades: number;
  buyOrders: number;
  sellOrders: number;
  totalBuyValue: number;
  totalSellValue: number;
  recentTransactions: TransactionData[];
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
    const response = await api.get<StockPriceData>(`/api/stocks/${encodeURIComponent(normalizedSymbol)}/price`);
    return response.data;
  },
  getPortfolio: async (roomId: number): Promise<PortfolioData> => {
    const response = await api.get<PortfolioData>(`/api/rooms/${roomId}/portfolio`);
    return response.data;
  },
  getTransactions: async (roomId: number): Promise<TransactionData[]> => {
    const response = await api.get<TransactionData[]>(`/api/rooms/${roomId}/transactions`);
    return response.data;
  },
  getSummary: async (roomId: number): Promise<SummaryData> => {
    const response = await api.get<SummaryData>(`/api/rooms/${roomId}/summary`);
    return response.data;
  },
};
