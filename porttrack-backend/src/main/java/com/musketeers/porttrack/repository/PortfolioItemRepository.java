package com.musketeers.porttrack.repository;

import com.musketeers.porttrack.entity.PortfolioItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PortfolioItemRepository extends JpaRepository<PortfolioItem, Long> {
    Optional<PortfolioItem> findByPortfolioIdAndSymbol(Long portfolioId, String symbol);

    List<PortfolioItem> findByPortfolioIdOrderBySymbolAsc(Long portfolioId);
}
