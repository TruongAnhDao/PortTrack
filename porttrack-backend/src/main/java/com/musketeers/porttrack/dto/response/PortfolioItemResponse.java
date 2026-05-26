package com.musketeers.porttrack.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class PortfolioItemResponse {
    private String symbol;
    private Long quantity;
    private BigDecimal avgPrice;
    private BigDecimal marketPrice;
    private BigDecimal marketValue;
    private BigDecimal costValue;
    private BigDecimal unrealizedProfitLoss;
    private BigDecimal returnPercentage;
    private boolean priceAvailable;
}
