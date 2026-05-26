package com.musketeers.porttrack.dto.response;

import com.musketeers.porttrack.entity.enums.TradeAction;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class TransactionResponse {
    private Long id;
    private String symbol;
    private TradeAction type;
    private Long quantity;
    private BigDecimal price;
    private BigDecimal fee;
    private BigDecimal tax;
    private BigDecimal totalAmount;
    private LocalDateTime executedAt;
}
