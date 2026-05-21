package com.musketeers.porttrack.controller;

import com.musketeers.porttrack.dto.response.StockPriceResponse;
import com.musketeers.porttrack.service.StockPriceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/stocks")
@RequiredArgsConstructor
public class StockController {

    private final StockPriceService stockPriceService;

    @GetMapping("/{symbol}/price")
    public ResponseEntity<StockPriceResponse> getPrice(@PathVariable String symbol) {
        return ResponseEntity.ok(stockPriceService.getLatestQuote(symbol));
    }
}
