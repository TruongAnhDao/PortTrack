package com.musketeers.porttrack.service.impl;

import com.musketeers.porttrack.dto.request.SubmissionLinkRequest;
import com.musketeers.porttrack.dto.response.PortfolioItemResponse;
import com.musketeers.porttrack.dto.response.PortfolioResponse;
import com.musketeers.porttrack.dto.response.SubmissionLinkResponse;
import com.musketeers.porttrack.dto.response.SummaryResponse;
import com.musketeers.porttrack.dto.response.TransactionResponse;
import com.musketeers.porttrack.entity.Portfolio;
import com.musketeers.porttrack.entity.PortfolioItem;
import com.musketeers.porttrack.entity.Transaction;
import com.musketeers.porttrack.entity.User;
import com.musketeers.porttrack.entity.enums.TradeAction;
import com.musketeers.porttrack.entity.enums.UserRole;
import com.musketeers.porttrack.repository.PortfolioItemRepository;
import com.musketeers.porttrack.repository.PortfolioRepository;
import com.musketeers.porttrack.repository.TransactionRepository;
import com.musketeers.porttrack.repository.UserRepository;
import com.musketeers.porttrack.service.PortfolioViewService;
import com.musketeers.porttrack.service.StockPriceService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URI;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PortfolioViewServiceImpl implements PortfolioViewService {

    private static final BigDecimal ONE_HUNDRED = new BigDecimal("100");

    private final PortfolioRepository portfolioRepository;
    private final PortfolioItemRepository portfolioItemRepository;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final StockPriceService stockPriceService;

    @Override
    @Transactional(readOnly = true)
    public PortfolioResponse getPortfolio(Long roomId) {
        Portfolio portfolio = getCurrentPortfolio(roomId);
        List<PortfolioItemResponse> holdings = portfolioItemRepository.findByPortfolioIdOrderBySymbolAsc(portfolio.getId()).stream()
                .map(this::mapHolding)
                .toList();

        BigDecimal holdingsValue = holdings.stream()
                .map(PortfolioItemResponse::getMarketValue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalCostValue = holdings.stream()
                .map(PortfolioItemResponse::getCostValue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalPortfolioValue = portfolio.getCashBalance().add(holdingsValue);
        BigDecimal totalProfitLoss = totalPortfolioValue.subtract(portfolio.getRoom().getInitialBalance());

        return PortfolioResponse.builder()
                .initialBalance(portfolio.getRoom().getInitialBalance())
                .cashBalance(portfolio.getCashBalance())
                .holdingsValue(holdingsValue)
                .totalPortfolioValue(totalPortfolioValue)
                .totalCostValue(totalCostValue)
                .totalProfitLoss(totalProfitLoss)
                .returnPercentage(percent(totalProfitLoss, portfolio.getRoom().getInitialBalance()))
                .holdings(holdings)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<TransactionResponse> getTransactions(Long roomId) {
        Portfolio portfolio = getCurrentPortfolio(roomId);
        return transactionRepository.findByPortfolioIdOrderByExecutedAtDesc(portfolio.getId()).stream()
                .map(this::mapTransaction)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public SummaryResponse getSummary(Long roomId) {
        Portfolio portfolio = getCurrentPortfolio(roomId);
        List<TransactionResponse> transactions = transactionRepository.findByPortfolioIdOrderByExecutedAtDesc(portfolio.getId()).stream()
                .map(this::mapTransaction)
                .toList();

        BigDecimal totalBuyValue = transactions.stream()
                .filter(tx -> tx.getType() == TradeAction.BUY)
                .map(tx -> tx.getPrice().multiply(new BigDecimal(tx.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalSellValue = transactions.stream()
                .filter(tx -> tx.getType() == TradeAction.SELL)
                .map(tx -> tx.getPrice().multiply(new BigDecimal(tx.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return SummaryResponse.builder()
                .portfolio(getPortfolio(roomId))
                .totalTrades((long) transactions.size())
                .buyOrders(transactions.stream().filter(tx -> tx.getType() == TradeAction.BUY).count())
                .sellOrders(transactions.stream().filter(tx -> tx.getType() == TradeAction.SELL).count())
                .totalBuyValue(totalBuyValue)
                .totalSellValue(totalSellValue)
                .recentTransactions(transactions.stream().limit(5).toList())
                .build();
    }

    @Override
    @Transactional
    public SubmissionLinkResponse updateSubmissionLink(Long roomId, SubmissionLinkRequest request) {
        Portfolio portfolio = getCurrentPortfolio(roomId);
        String submissionUrl = normalizeSubmissionUrl(request.getSubmissionUrl());
        LocalDateTime updatedAt = LocalDateTime.now();

        portfolio.setSubmissionUrl(submissionUrl);
        portfolio.setSubmissionUpdatedAt(updatedAt);
        portfolioRepository.save(portfolio);

        return SubmissionLinkResponse.builder()
                .submissionUrl(submissionUrl)
                .submissionUpdatedAt(updatedAt)
                .build();
    }

    private Portfolio getCurrentPortfolio(Long roomId) {
        User currentUser = getCurrentUser();
        if (currentUser.getRole() != UserRole.STUDENT) {
            throw new RuntimeException("Only students can access player portfolio features.");
        }
        return portfolioRepository.findByUserIdAndRoomId(currentUser.getId(), roomId)
                .orElseThrow(() -> new RuntimeException("You have not joined this room as a player."));
    }

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Authenticated user was not found."));
    }

    private PortfolioItemResponse mapHolding(PortfolioItem item) {
        BigDecimal quantity = new BigDecimal(item.getQuantity());
        BigDecimal marketPrice = item.getAvgPrice();
        boolean priceAvailable = true;

        try {
            marketPrice = stockPriceService.getCurrentPrice(item.getSymbol());
        } catch (RuntimeException ex) {
            priceAvailable = false;
        }

        BigDecimal costValue = item.getAvgPrice().multiply(quantity);
        BigDecimal marketValue = marketPrice.multiply(quantity);
        BigDecimal unrealizedProfitLoss = marketValue.subtract(costValue);

        return PortfolioItemResponse.builder()
                .symbol(item.getSymbol())
                .quantity(item.getQuantity())
                .avgPrice(item.getAvgPrice())
                .marketPrice(marketPrice)
                .marketValue(marketValue)
                .costValue(costValue)
                .unrealizedProfitLoss(unrealizedProfitLoss)
                .returnPercentage(percent(unrealizedProfitLoss, costValue))
                .priceAvailable(priceAvailable)
                .build();
    }

    private TransactionResponse mapTransaction(Transaction tx) {
        return TransactionResponse.builder()
                .id(tx.getId())
                .symbol(tx.getSymbol())
                .type(tx.getType())
                .quantity(tx.getQuantity())
                .price(tx.getPrice())
                .fee(tx.getFee())
                .tax(tx.getTax())
                .totalAmount(tx.getTotalAmount())
                .executedAt(tx.getExecutedAt())
                .build();
    }

    private BigDecimal percent(BigDecimal numerator, BigDecimal denominator) {
        if (denominator == null || denominator.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        return numerator.multiply(ONE_HUNDRED).divide(denominator, 2, RoundingMode.HALF_UP);
    }

    private String normalizeSubmissionUrl(String value) {
        String normalizedUrl = value.trim();

        try {
            URI uri = URI.create(normalizedUrl);
            String scheme = uri.getScheme();
            if (scheme == null
                    || (!scheme.equalsIgnoreCase("http") && !scheme.equalsIgnoreCase("https"))
                    || uri.getHost() == null) {
                throw new RuntimeException("Submission link must be a valid HTTP or HTTPS URL.");
            }
            return uri.toString();
        } catch (IllegalArgumentException ex) {
            throw new RuntimeException("Submission link must be a valid HTTP or HTTPS URL.");
        }
    }
}
