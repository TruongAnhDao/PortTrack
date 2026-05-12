package com.musketeers.porttrack.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class JoinedRoomResponse {
    private RoomResponse roomInfo; // Thông tin chung của phòng
    private BigDecimal currentCashBalance; // Sức mua hiện tại của Player
}