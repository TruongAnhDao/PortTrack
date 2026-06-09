package com.musketeers.porttrack.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class SubmissionLinkResponse {
    private String submissionUrl;
    private LocalDateTime submissionUpdatedAt;
}
