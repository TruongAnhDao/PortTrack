package com.musketeers.porttrack.repository;

import com.musketeers.porttrack.entity.PortfolioItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PortfolioItemRepository extends JpaRepository<PortfolioItem, Long> {
    // Hàm này được TradeServiceImpl gọi để check xem User có đang giữ mã cổ phiếu này không
    Optional<PortfolioItem> findByPortfolioIdAndSymbol(Long portfolioId, String symbol);
}