package com.musketeers.porttrack.service.impl;

import com.musketeers.porttrack.service.StockPriceService;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;

@Service
public class StockPriceServiceImpl implements StockPriceService {
    @Override
    public BigDecimal getCurrentPrice(String symbol) {
        // Mock giá: 25,000 VND cho mọi cổ phiếu
        return new BigDecimal("25000"); 
    }
}