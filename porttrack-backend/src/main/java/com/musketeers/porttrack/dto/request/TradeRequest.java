package com.musketeers.porttrack.dto.request;

import com.musketeers.porttrack.entity.enums.TradeAction;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TradeRequest {
    @NotBlank(message = "Stock symbol is required")
    private String stockSymbol;

    @NotNull(message = "Trade action is required")
    private TradeAction action;

    @NotNull(message = "Quantity is required")
    @Min(value = 100, message = "Trade quantity must be at least 100")
    private Long quantity;
}
