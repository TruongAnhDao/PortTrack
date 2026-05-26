package com.musketeers.porttrack.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class PortfolioResponse {
    private BigDecimal initialBalance;
    private BigDecimal cashBalance;
    private BigDecimal holdingsValue;
    private BigDecimal totalPortfolioValue;
    private BigDecimal totalCostValue;
    private BigDecimal totalProfitLoss;
    private BigDecimal returnPercentage;
    private List<PortfolioItemResponse> holdings;
}
