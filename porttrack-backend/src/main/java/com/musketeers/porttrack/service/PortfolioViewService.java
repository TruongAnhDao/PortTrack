package com.musketeers.porttrack.service;

import com.musketeers.porttrack.dto.request.SubmissionLinkRequest;
import com.musketeers.porttrack.dto.response.PortfolioResponse;
import com.musketeers.porttrack.dto.response.SubmissionLinkResponse;
import com.musketeers.porttrack.dto.response.SummaryResponse;
import com.musketeers.porttrack.dto.response.TransactionResponse;

import java.util.List;

public interface PortfolioViewService {
    PortfolioResponse getPortfolio(Long roomId);

    List<TransactionResponse> getTransactions(Long roomId);

    SummaryResponse getSummary(Long roomId);

    SubmissionLinkResponse updateSubmissionLink(Long roomId, SubmissionLinkRequest request);
}
