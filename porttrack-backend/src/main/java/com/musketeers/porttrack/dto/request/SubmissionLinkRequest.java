package com.musketeers.porttrack.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class SubmissionLinkRequest {

    @NotBlank(message = "Submission link is required.")
    @Size(max = 2048, message = "Submission link must not exceed 2048 characters.")
    private String submissionUrl;
}
