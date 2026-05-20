package com.musketeers.porttrack.service;

import java.math.BigDecimal;

public interface StockPriceService {
    
    /**
     * Lấy giá khớp lệnh hiện tại (Current Price) của một mã cổ phiếu.
     * @param symbol Mã cổ phiếu (VD: "VND", "FPT", "HPG")
     * @return Giá trị hiện tại
     */
    BigDecimal getCurrentPrice(String symbol);
}