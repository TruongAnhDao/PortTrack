package com.musketeers.porttrack.service.impl;

import com.musketeers.porttrack.dto.request.TradeRequest;
import com.musketeers.porttrack.dto.response.RoomDashboardResponse;
import com.musketeers.porttrack.entity.*;
import com.musketeers.porttrack.entity.enums.TradeAction;
import com.musketeers.porttrack.repository.*;
import com.musketeers.porttrack.service.TradeService;
// Giả định bạn có một Service nội bộ lấy giá chứng khoán
import com.musketeers.porttrack.service.StockPriceService; 
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TradeServiceImpl implements TradeService {

    private final RoomRepository roomRepository;
    private final PortfolioRepository portfolioRepository;
    private final PortfolioItemRepository portfolioItemRepository;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    
    // Internal service dùng để fetch giá từ hệ thống MQTT/Mock API của bạn
    private final StockPriceService stockPriceService;

    // Hằng số Phí và Thuế
    private static final BigDecimal TRADING_FEE_RATE = new BigDecimal("0.0015"); // 0.15%
    private static final BigDecimal SELLING_TAX_RATE = new BigDecimal("0.0010"); // 0.1%

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng xác thực"));
    }

    @Override
    public RoomDashboardResponse getRoomDashboard(Long roomId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Phòng chơi không tồn tại"));

        // Trả về DTO thông tin phòng (Không có Leaderboard)
        return RoomDashboardResponse.builder()
                .name(room.getName())
                .initialBalance(room.getInitialBalance())
                .startTime(room.getStartTime())
                .endTime(room.getEndTime())
                .guideText("1. Giao dịch T+0. \n2. Phí giao dịch 0.15%. \n3. Thuế bán 0.1%. \n4. Thanh khoản ngay lập tức.")
                .build();
    }

    @Override
    @Transactional // RẤT QUAN TRỌNG: Đảm bảo dữ liệu tiền và cổ phiếu không bị lệch
    public void executeTrade(Long roomId, TradeRequest request) {
        User currentUser = getCurrentUser();

        // 1. Lấy Portfolio của User trong phòng này
        Portfolio portfolio = portfolioRepository.findByUserIdAndRoomId(currentUser.getId(), roomId)
                .orElseThrow(() -> new RuntimeException("Bạn chưa tham gia phòng chơi này"));

        // 2. Fetch giá thị trường hiện tại của mã cổ phiếu
        BigDecimal currentPrice = stockPriceService.getCurrentPrice(request.getStockSymbol());
        BigDecimal quantity = new BigDecimal(request.getQuantity());
        BigDecimal tradeValue = currentPrice.multiply(quantity);

        if (request.getAction() == TradeAction.BUY) {
            handleBuyOrder(portfolio, request.getStockSymbol(), currentPrice, quantity, tradeValue);
        } else {
            handleSellOrder(portfolio, request.getStockSymbol(), currentPrice, quantity, tradeValue);
        }
    }

    private void handleBuyOrder(Portfolio portfolio, String symbol, BigDecimal price, BigDecimal quantity, BigDecimal tradeValue) {
        // Tính phí mua
        BigDecimal fee = tradeValue.multiply(TRADING_FEE_RATE);
        BigDecimal totalRequired = tradeValue.add(fee);

        // Check sức mua (No Margin)
        if (portfolio.getCashBalance().compareTo(totalRequired) < 0) {
            throw new RuntimeException("Số dư không đủ. Tổng tiền cần: " + totalRequired + ", Sức mua: " + portfolio.getCashBalance());
        }

        // Trừ tiền trong Portfolio
        portfolio.setCashBalance(portfolio.getCashBalance().subtract(totalRequired));
        portfolioRepository.save(portfolio);

        // Cập nhật hoặc Thêm mới PortfolioItem (Danh mục cổ phiếu)
        Optional<PortfolioItem> optItem = portfolioItemRepository.findByPortfolioIdAndSymbol(portfolio.getId(), symbol);
        if (optItem.isPresent()) {
            PortfolioItem item = optItem.get();
            BigDecimal oldQuantity = new BigDecimal(item.getQuantity());
            BigDecimal oldAvgPrice = item.getAvgPrice();

            // Tính trung bình giá vốn mới: (Q_old * P_old + Q_new * P_new) / (Q_old + Q_new)
            BigDecimal totalOldValue = oldQuantity.multiply(oldAvgPrice);
            BigDecimal newQuantity = oldQuantity.add(quantity);
            BigDecimal newAvgPrice = totalOldValue.add(tradeValue).divide(newQuantity, 2, RoundingMode.HALF_UP);

            item.setQuantity(newQuantity.intValue());
            item.setAvgPrice(newAvgPrice);
            portfolioItemRepository.save(item);
        } else {
            PortfolioItem newItem = PortfolioItem.builder()
                    .portfolio(portfolio)
                    .symbol(symbol)
                    .quantity(quantity.intValue())
                    .avgPrice(price)
                    .build();
            portfolioItemRepository.save(newItem);
        }

        // Ghi lại lịch sử giao dịch
        recordTransaction(portfolio, symbol, TradeAction.BUY, quantity.intValue(), price, fee, BigDecimal.ZERO, totalRequired.negate());
    }

    private void handleSellOrder(Portfolio portfolio, String symbol, BigDecimal price, BigDecimal quantity, BigDecimal tradeValue) {
        // Check số lượng cổ phiếu có đủ để bán không
        PortfolioItem item = portfolioItemRepository.findByPortfolioIdAndSymbol(portfolio.getId(), symbol)
                .orElseThrow(() -> new RuntimeException("Bạn không sở hữu mã cổ phiếu " + symbol));

        if (item.getQuantity() < quantity.intValue()) {
            throw new RuntimeException("Số lượng cổ phiếu không đủ để bán. Đang có: " + item.getQuantity());
        }

        // Tính phí và thuế bán
        BigDecimal fee = tradeValue.multiply(TRADING_FEE_RATE);
        BigDecimal tax = tradeValue.multiply(SELLING_TAX_RATE);
        BigDecimal totalReceive = tradeValue.subtract(fee).subtract(tax);

        // Cộng tiền vào Portfolio
        portfolio.setCashBalance(portfolio.getCashBalance().add(totalReceive));
        portfolioRepository.save(portfolio);

        // Trừ số lượng cổ phiếu
        int remainingQuantity = item.getQuantity() - quantity.intValue();
        if (remainingQuantity == 0) {
            portfolioItemRepository.delete(item); // Bán hết thì xóa khỏi danh mục
        } else {
            item.setQuantity(remainingQuantity);
            portfolioItemRepository.save(item);
        }

        // Ghi lại lịch sử giao dịch
        recordTransaction(portfolio, symbol, TradeAction.SELL, quantity.intValue(), price, fee, tax, totalReceive);
    }

    private void recordTransaction(Portfolio portfolio, String symbol, TradeAction action, Integer quantity, BigDecimal price, BigDecimal fee, BigDecimal tax, BigDecimal totalAmount) {
        Transaction tx = Transaction.builder()
                .portfolio(portfolio)
                .symbol(symbol)
                .type(action)
                .quantity(quantity)
                .price(price)
                .fee(fee)
                .tax(tax)
                .totalAmount(totalAmount)
                .build();
        transactionRepository.save(tx);
    }
}