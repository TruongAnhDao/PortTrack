package com.musketeers.porttrack.service;

import com.musketeers.porttrack.dto.request.TradeRequest;
import com.musketeers.porttrack.dto.response.RoomDashboardResponse;

public interface TradeService {
    
    /**
     * Lấy thông tin Dashboard của phòng chơi (Tên, thời gian, vốn, luật chơi)
     */
    RoomDashboardResponse getRoomDashboard(Long roomId);

    /**
     * Xử lý khớp lệnh Mua / Bán chứng khoán
     */
    void executeTrade(Long roomId, TradeRequest request);
}