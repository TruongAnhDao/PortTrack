package com.musketeers.porttrack.dto.request;

import com.musketeers.porttrack.entity.enums.RoomType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class CreateRoomRequest {
    @NotBlank(message = "Tên phòng không được để trống")
    private String name;

    @NotNull(message = "Loại phòng không hợp lệ")
    private RoomType type;

    private String password; // Chỉ dùng khi type = PRIVATE

    @NotNull(message = "Số dư khởi tạo không được để trống")
    @DecimalMin(value = "0.0", inclusive = false, message = "Số dư khởi tạo phải lớn hơn 0")
    private BigDecimal initialBalance;

    private LocalDateTime startTime;
    private LocalDateTime endTime;
}