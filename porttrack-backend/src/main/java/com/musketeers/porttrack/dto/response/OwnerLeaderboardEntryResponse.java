package com.musketeers.porttrack.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class OwnerLeaderboardEntryResponse {
    private int rank;
    private Long userId;
    private String username;
    private Long portfolioId;
    private BigDecimal cashBalance;
    private BigDecimal holdingsValue;
    private BigDecimal totalPortfolioValue;
    private BigDecimal totalProfitLoss;
    private BigDecimal returnPercentage;
    private long totalTrades;
}
