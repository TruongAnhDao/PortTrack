package com.musketeers.porttrack.dto.response;

import com.musketeers.porttrack.entity.enums.RoomStatus;
import com.musketeers.porttrack.entity.enums.RoomType;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class RoomResponse {
    private Long id;
    private String name;
    private String code;
    private RoomType type;
    private Long ownerId;
    private BigDecimal initialBalance;
    private Long playerCount;
    private RoomStatus status;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
}
