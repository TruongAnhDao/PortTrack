package com.musketeers.porttrack.dto.request;

import com.musketeers.porttrack.entity.enums.TradeAction;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TradeRequest {
    @NotBlank(message = "Mã cổ phiếu không được để trống")
    private String stockSymbol;

    @NotNull(message = "Hành động giao dịch không hợp lệ")
    private TradeAction action;

    @NotNull(message = "Số lượng không được để trống")
    @Min(value = 1, message = "Số lượng giao dịch tối thiểu là 1")
    private Integer quantity;
}