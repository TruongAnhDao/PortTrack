package com.musketeers.porttrack.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class OwnerRoomDashboardResponse {
    private RoomResponse room;
    private long playerCount;
    private long totalTrades;
    private BigDecimal totalPortfolioValue;
    private BigDecimal averagePortfolioValue;
    private BigDecimal topPortfolioValue;
}
