package com.musketeers.porttrack.service.impl;

import com.musketeers.porttrack.dto.request.TradeRequest;
import com.musketeers.porttrack.dto.response.RoomDashboardResponse;
import com.musketeers.porttrack.dto.response.StockPriceResponse;
import com.musketeers.porttrack.entity.*;
import com.musketeers.porttrack.entity.enums.TradeAction;
import com.musketeers.porttrack.repository.*;
import com.musketeers.porttrack.service.StockPriceService;
import com.musketeers.porttrack.service.TradeService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TradeServiceImpl implements TradeService {

    private final RoomRepository roomRepository;
    private final PortfolioRepository portfolioRepository;
    private final PortfolioItemRepository portfolioItemRepository;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final StockPriceService stockPriceService;

    private static final BigDecimal TRADING_FEE_RATE = new BigDecimal("0.0015");
    private static final BigDecimal SELLING_TAX_RATE = new BigDecimal("0.0010");
    private static final int SETTLEMENT_DAYS = 2;

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found."));
    }

    @Override
    public RoomDashboardResponse getRoomDashboard(Long roomId) {
        User currentUser = getCurrentUser();
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Room does not exist."));
        Portfolio portfolio = portfolioRepository.findByUserIdAndRoomId(currentUser.getId(), roomId)
                .orElseThrow(() -> new RuntimeException("You have not joined this room."));

        return RoomDashboardResponse.builder()
                .name(room.getName())
                .initialBalance(room.getInitialBalance())
                .startTime(room.getStartTime())
                .endTime(room.getEndTime())
                .guideText("1. T+2 settlement.\n2. Trading fee: 0.15%.\n3. Sell tax: 0.1%.\n4. Newly bought shares can be sold after T+2.")
                .submissionUrl(portfolio.getSubmissionUrl())
                .submissionUpdatedAt(portfolio.getSubmissionUpdatedAt())
                .build();
    }

    @Override
    @Transactional
    public void executeTrade(Long roomId, TradeRequest request) {
        User currentUser = getCurrentUser();

        Portfolio portfolio = portfolioRepository.findByUserIdAndRoomId(currentUser.getId(), roomId)
                .orElseThrow(() -> new RuntimeException("You have not joined this room."));

        StockPriceResponse quote = stockPriceService.getLatestQuote(request.getStockSymbol());
        if (!quote.isMarketOpen()) {
            throw new RuntimeException("Orders cannot be placed because the market is closed.");
        }

        BigDecimal currentPrice = quote.getPrice();
        BigDecimal quantity = new BigDecimal(request.getQuantity());
        BigDecimal tradeValue = currentPrice.multiply(quantity);
        String symbol = request.getStockSymbol().trim().toUpperCase();

        if (request.getAction() == TradeAction.BUY) {
            handleBuyOrder(portfolio, symbol, currentPrice, quantity, tradeValue);
        } else {
            handleSellOrder(portfolio, symbol, currentPrice, quantity, tradeValue);
        }
    }

    private void handleBuyOrder(Portfolio portfolio, String symbol, BigDecimal price, BigDecimal quantity, BigDecimal tradeValue) {
        BigDecimal fee = tradeValue.multiply(TRADING_FEE_RATE);
        BigDecimal totalRequired = tradeValue.add(fee);

        if (portfolio.getCashBalance().compareTo(totalRequired) < 0) {
            throw new RuntimeException("Insufficient balance. Required amount: " + totalRequired + ", buying power: " + portfolio.getCashBalance());
        }

        portfolio.setCashBalance(portfolio.getCashBalance().subtract(totalRequired));
        portfolioRepository.save(portfolio);

        Optional<PortfolioItem> optItem = portfolioItemRepository.findByPortfolioIdAndSymbol(portfolio.getId(), symbol);
        if (optItem.isPresent()) {
            PortfolioItem item = optItem.get();
            BigDecimal oldQuantity = new BigDecimal(item.getQuantity());
            BigDecimal oldAvgPrice = item.getAvgPrice();

            // FIX: Giá vốn mới phải gánh cả phí giao dịch
            BigDecimal totalOldValue = oldQuantity.multiply(oldAvgPrice);
            BigDecimal newQuantity = oldQuantity.add(quantity);
            BigDecimal newAvgPrice = totalOldValue.add(totalRequired).divide(newQuantity, 2, RoundingMode.HALF_UP);

            item.setQuantity(newQuantity.longValue());
            item.setAvgPrice(newAvgPrice);
            portfolioItemRepository.save(item);
        } else {
            // Cổ phiếu mới: Giá vốn = Tổng tiền (Gồm phí) / Số lượng
            BigDecimal newAvgPrice = totalRequired.divide(quantity, 2, RoundingMode.HALF_UP);
            PortfolioItem newItem = PortfolioItem.builder()
                    .portfolio(portfolio)
                    .symbol(symbol)
                    .quantity(quantity.longValue())
                    .avgPrice(newAvgPrice)
                    .build();
            portfolioItemRepository.save(newItem);
        }

        recordTransaction(portfolio, symbol, TradeAction.BUY, quantity.longValue(), price, fee, BigDecimal.ZERO, totalRequired.negate());
    }

    private void handleSellOrder(Portfolio portfolio, String symbol, BigDecimal price, BigDecimal quantity, BigDecimal tradeValue) {
        PortfolioItem item = portfolioItemRepository.findByPortfolioIdAndSymbol(portfolio.getId(), symbol)
                .orElseThrow(() -> new RuntimeException("You do not own stock symbol " + symbol));

        // FIX: So sánh chuẩn Long
        long unsettledQuantity = getUnsettledBuyQuantity(portfolio.getId(), symbol);
        long availableQuantity = item.getQuantity() - unsettledQuantity;

        if (availableQuantity < quantity.longValue()) {
            throw new RuntimeException("Not enough settled shares to sell. Available after T+2: " + Math.max(availableQuantity, 0));
        }

        BigDecimal fee = tradeValue.multiply(TRADING_FEE_RATE);
        BigDecimal tax = tradeValue.multiply(SELLING_TAX_RATE);
        BigDecimal totalReceive = tradeValue.subtract(fee).subtract(tax);

        portfolio.setCashBalance(portfolio.getCashBalance().add(totalReceive));
        portfolioRepository.save(portfolio);

        long remainingQuantity = item.getQuantity() - quantity.longValue();
        if (remainingQuantity == 0L) {
            portfolioItemRepository.delete(item);
        } else {
            item.setQuantity(remainingQuantity);
            portfolioItemRepository.save(item);
        }

        recordTransaction(portfolio, symbol, TradeAction.SELL, quantity.longValue(), price, fee, tax, totalReceive);
    }

    private long getUnsettledBuyQuantity(Long portfolioId, String symbol) {
        LocalDateTime settlementCutoff = LocalDateTime.now().minusDays(SETTLEMENT_DAYS);
        Long unsettledQuantity = transactionRepository.sumQuantityByPortfolioSymbolTypeAfter(
                portfolioId,
                symbol,
                TradeAction.BUY,
                settlementCutoff
        );
        return unsettledQuantity == null ? 0L : unsettledQuantity;
    }

    private void recordTransaction(Portfolio portfolio, String symbol, TradeAction action, Long quantity, BigDecimal price, BigDecimal fee, BigDecimal tax, BigDecimal totalAmount) {
        Transaction tx = Transaction.builder()
                .portfolio(portfolio)
                .symbol(symbol)
                .type(action)
                .quantity(quantity) // Bắt kiểu dữ liệu Long
                .price(price)
                .fee(fee)
                .tax(tax)
                .totalAmount(totalAmount)
                .build();
        transactionRepository.save(tx);
    }
}
