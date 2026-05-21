package com.musketeers.porttrack.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
public class StockPriceResponse {
    private String symbol;
    private BigDecimal price;
    private BigDecimal openPrice;
    private Long volume;
    private LocalDate tradeDate;
    private boolean marketOpen;
}
