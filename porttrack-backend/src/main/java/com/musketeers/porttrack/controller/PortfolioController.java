package com.musketeers.porttrack.controller;

import com.musketeers.porttrack.dto.response.PortfolioResponse;
import com.musketeers.porttrack.dto.response.SummaryResponse;
import com.musketeers.porttrack.dto.response.TransactionResponse;
import com.musketeers.porttrack.service.PortfolioViewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/rooms/{roomId}")
@RequiredArgsConstructor
public class PortfolioController {

    private final PortfolioViewService portfolioViewService;

    @GetMapping("/portfolio")
    public ResponseEntity<PortfolioResponse> getPortfolio(@PathVariable Long roomId) {
        return ResponseEntity.ok(portfolioViewService.getPortfolio(roomId));
    }

    @GetMapping("/transactions")
    public ResponseEntity<List<TransactionResponse>> getTransactions(@PathVariable Long roomId) {
        return ResponseEntity.ok(portfolioViewService.getTransactions(roomId));
    }

    @GetMapping("/summary")
    public ResponseEntity<SummaryResponse> getSummary(@PathVariable Long roomId) {
        return ResponseEntity.ok(portfolioViewService.getSummary(roomId));
    }
}
