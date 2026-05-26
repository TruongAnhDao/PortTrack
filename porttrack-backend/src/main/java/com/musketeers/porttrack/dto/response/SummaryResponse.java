package com.musketeers.porttrack.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class SummaryResponse {
    private PortfolioResponse portfolio;
    private Long totalTrades;
    private Long buyOrders;
    private Long sellOrders;
    private BigDecimal totalBuyValue;
    private BigDecimal totalSellValue;
    private List<TransactionResponse> recentTransactions;
}
