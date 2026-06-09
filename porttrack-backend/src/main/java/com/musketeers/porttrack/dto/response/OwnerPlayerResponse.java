package com.musketeers.porttrack.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class OwnerPlayerResponse {
    private Long userId;
    private String username;
    private Long portfolioId;
    private BigDecimal cashBalance;
    private BigDecimal holdingsValue;
    private BigDecimal totalPortfolioValue;
    private BigDecimal totalProfitLoss;
    private BigDecimal returnPercentage;
    private long holdingCount;
    private long totalTrades;
    private String submissionUrl;
}
