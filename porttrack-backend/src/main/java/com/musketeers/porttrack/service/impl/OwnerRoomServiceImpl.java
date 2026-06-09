package com.musketeers.porttrack.service.impl;

import com.musketeers.porttrack.dto.request.UpdateOwnerRoomRequest;
import com.musketeers.porttrack.dto.response.OwnerLeaderboardEntryResponse;
import com.musketeers.porttrack.dto.response.OwnerPlayerResponse;
import com.musketeers.porttrack.dto.response.OwnerRoomDashboardResponse;
import com.musketeers.porttrack.dto.response.OwnerTransactionResponse;
import com.musketeers.porttrack.dto.response.RoomResponse;
import com.musketeers.porttrack.entity.Portfolio;
import com.musketeers.porttrack.entity.PortfolioItem;
import com.musketeers.porttrack.entity.Room;
import com.musketeers.porttrack.entity.Transaction;
import com.musketeers.porttrack.entity.User;
import com.musketeers.porttrack.entity.enums.RoomType;
import com.musketeers.porttrack.repository.PortfolioItemRepository;
import com.musketeers.porttrack.repository.PortfolioRepository;
import com.musketeers.porttrack.repository.RoomRepository;
import com.musketeers.porttrack.repository.TransactionRepository;
import com.musketeers.porttrack.repository.UserRepository;
import com.musketeers.porttrack.service.OwnerRoomService;
import com.musketeers.porttrack.service.StockPriceService;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OwnerRoomServiceImpl implements OwnerRoomService {

    private static final BigDecimal ONE_HUNDRED = new BigDecimal("100");

    private final RoomRepository roomRepository;
    private final PortfolioRepository portfolioRepository;
    private final PortfolioItemRepository portfolioItemRepository;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final StockPriceService stockPriceService;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public OwnerRoomDashboardResponse getDashboard(Long roomId) {
        Room room = getOwnedRoom(roomId);
        List<PlayerStats> stats = getPlayerStats(roomId);

        BigDecimal totalPortfolioValue = stats.stream()
                .map(PlayerStats::getTotalPortfolioValue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal averagePortfolioValue = stats.isEmpty()
                ? BigDecimal.ZERO
                : totalPortfolioValue.divide(new BigDecimal(stats.size()), 2, RoundingMode.HALF_UP);
        BigDecimal topPortfolioValue = stats.stream()
                .map(PlayerStats::getTotalPortfolioValue)
                .max(BigDecimal::compareTo)
                .orElse(BigDecimal.ZERO);

        return OwnerRoomDashboardResponse.builder()
                .room(mapToRoomResponse(room))
                .playerCount(stats.size())
                .totalTrades(transactionRepository.countByPortfolioRoomId(roomId))
                .totalPortfolioValue(totalPortfolioValue)
                .averagePortfolioValue(averagePortfolioValue)
                .topPortfolioValue(topPortfolioValue)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<OwnerPlayerResponse> getPlayers(Long roomId) {
        getOwnedRoom(roomId);
        return getPlayerStats(roomId).stream()
                .map(stats -> OwnerPlayerResponse.builder()
                        .userId(stats.getUserId())
                        .username(stats.getUsername())
                        .portfolioId(stats.getPortfolioId())
                        .cashBalance(stats.getCashBalance())
                        .holdingsValue(stats.getHoldingsValue())
                        .totalPortfolioValue(stats.getTotalPortfolioValue())
                        .totalProfitLoss(stats.getTotalProfitLoss())
                        .returnPercentage(stats.getReturnPercentage())
                        .holdingCount(stats.getHoldingCount())
                        .totalTrades(stats.getTotalTrades())
                        .submissionUrl(stats.getSubmissionUrl())
                        .build())
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<OwnerTransactionResponse> getTransactions(Long roomId) {
        getOwnedRoom(roomId);
        return transactionRepository.findByPortfolioRoomIdOrderByExecutedAtDesc(roomId).stream()
                .map(this::mapTransaction)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<OwnerLeaderboardEntryResponse> getLeaderboard(Long roomId) {
        getOwnedRoom(roomId);
        List<PlayerStats> rankedStats = getPlayerStats(roomId).stream()
                .sorted(Comparator.comparing(PlayerStats::getTotalPortfolioValue).reversed()
                        .thenComparing(PlayerStats::getReturnPercentage, Comparator.reverseOrder())
                        .thenComparing(PlayerStats::getUsername))
                .toList();

        for (int i = 0; i < rankedStats.size(); i++) {
            rankedStats.get(i).setRank(i + 1);
        }

        return rankedStats.stream()
                .map(stats -> OwnerLeaderboardEntryResponse.builder()
                        .rank(stats.getRank())
                        .userId(stats.getUserId())
                        .username(stats.getUsername())
                        .portfolioId(stats.getPortfolioId())
                        .cashBalance(stats.getCashBalance())
                        .holdingsValue(stats.getHoldingsValue())
                        .totalPortfolioValue(stats.getTotalPortfolioValue())
                        .totalProfitLoss(stats.getTotalProfitLoss())
                        .returnPercentage(stats.getReturnPercentage())
                        .totalTrades(stats.getTotalTrades())
                        .build())
                .toList();
    }

    @Override
    @Transactional
    public RoomResponse updateRoom(Long roomId, UpdateOwnerRoomRequest request) {
        Room room = getOwnedRoom(roomId);

        if (request.getName() != null && !request.getName().isBlank()) {
            room.setName(request.getName().trim());
        }
        if (request.getType() != null) {
            room.setType(request.getType());
        }
        if (request.getInitialBalance() != null) {
            room.setInitialBalance(request.getInitialBalance());
        }
        if (request.getStatus() != null) {
            room.setStatus(request.getStatus());
        }
        if (request.getStartTime() != null) {
            room.setStartTime(request.getStartTime());
        }
        if (request.getEndTime() != null) {
            room.setEndTime(request.getEndTime());
        }

        if (room.getType() == RoomType.PRIVATE) {
            if (request.getPassword() != null && !request.getPassword().isBlank()) {
                room.setPassword(passwordEncoder.encode(request.getPassword()));
            }
            if (room.getPassword() == null || room.getPassword().isBlank()) {
                throw new RuntimeException("Private room requires a password.");
            }
        } else {
            room.setPassword(null);
        }

        return mapToRoomResponse(roomRepository.save(room));
    }

    private List<PlayerStats> getPlayerStats(Long roomId) {
        return portfolioRepository.findByRoomIdOrderByJoinedAtAsc(roomId).stream()
                .map(this::calculatePlayerStats)
                .toList();
    }

    private PlayerStats calculatePlayerStats(Portfolio portfolio) {
        List<PortfolioItem> holdings = portfolioItemRepository.findByPortfolioIdOrderBySymbolAsc(portfolio.getId());
        BigDecimal holdingsValue = holdings.stream()
                .map(this::marketValue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalPortfolioValue = portfolio.getCashBalance().add(holdingsValue);
        BigDecimal initialBalance = portfolio.getRoom().getInitialBalance();
        BigDecimal totalProfitLoss = totalPortfolioValue.subtract(initialBalance);

        return PlayerStats.builder()
                .rank(0)
                .userId(portfolio.getUser().getId())
                .username(portfolio.getUser().getUsername())
                .portfolioId(portfolio.getId())
                .cashBalance(portfolio.getCashBalance())
                .holdingsValue(holdingsValue)
                .totalPortfolioValue(totalPortfolioValue)
                .totalProfitLoss(totalProfitLoss)
                .returnPercentage(percent(totalProfitLoss, initialBalance))
                .holdingCount(holdings.size())
                .totalTrades(transactionRepository.countByPortfolioId(portfolio.getId()))
                .submissionUrl(portfolio.getSubmissionUrl())
                .build();
    }

    private BigDecimal marketValue(PortfolioItem item) {
        BigDecimal marketPrice = item.getAvgPrice();
        try {
            marketPrice = stockPriceService.getCurrentPrice(item.getSymbol());
        } catch (RuntimeException ignored) {
            // Keep owner views usable even when an external price is unavailable.
        }
        return marketPrice.multiply(new BigDecimal(item.getQuantity()));
    }

    private OwnerTransactionResponse mapTransaction(Transaction tx) {
        Portfolio portfolio = tx.getPortfolio();
        User user = portfolio.getUser();

        return OwnerTransactionResponse.builder()
                .id(tx.getId())
                .portfolioId(portfolio.getId())
                .userId(user.getId())
                .username(user.getUsername())
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

    private Room getOwnedRoom(Long roomId) {
        User currentUser = getCurrentUser();
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Room does not exist."));

        if (!room.getOwnerId().equals(currentUser.getId())) {
            throw new RuntimeException("You are not the owner of this room.");
        }

        return room;
    }

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Authenticated user was not found."));
    }

    private RoomResponse mapToRoomResponse(Room room) {
        return RoomResponse.builder()
                .id(room.getId())
                .name(room.getName())
                .code(room.getCode())
                .type(room.getType())
                .ownerId(room.getOwnerId())
                .initialBalance(room.getInitialBalance())
                .playerCount(portfolioRepository.countByRoomId(room.getId()))
                .status(room.getStatus())
                .startTime(room.getStartTime())
                .endTime(room.getEndTime())
                .build();
    }

    private BigDecimal percent(BigDecimal numerator, BigDecimal denominator) {
        if (denominator == null || denominator.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        return numerator.multiply(ONE_HUNDRED).divide(denominator, 2, RoundingMode.HALF_UP);
    }

    @Data
    @Builder
    private static class PlayerStats {
        Long userId;
        String username;
        Long portfolioId;
        BigDecimal cashBalance;
        BigDecimal holdingsValue;
        BigDecimal totalPortfolioValue;
        BigDecimal totalProfitLoss;
        BigDecimal returnPercentage;
        long holdingCount;
        long totalTrades;
        String submissionUrl;
        int rank;
    }
}
