package com.musketeers.porttrack.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class RoomDashboardResponse {
    private String name;
    private BigDecimal initialBalance;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String guideText;
    private String submissionUrl;
    private LocalDateTime submissionUpdatedAt;
}
