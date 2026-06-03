package com.musketeers.porttrack.repository;

import com.musketeers.porttrack.entity.Transaction;
import com.musketeers.porttrack.entity.enums.TradeAction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByPortfolioIdOrderByExecutedAtDesc(Long portfolioId);

    List<Transaction> findByPortfolioRoomIdOrderByExecutedAtDesc(Long roomId);

    long countByPortfolioId(Long portfolioId);

    long countByPortfolioRoomId(Long roomId);

    @Query("""
            select coalesce(sum(t.quantity), 0)
            from Transaction t
            where t.portfolio.id = :portfolioId
              and t.symbol = :symbol
              and t.type = :type
              and t.executedAt > :cutoff
            """)
    Long sumQuantityByPortfolioSymbolTypeAfter(
            @Param("portfolioId") Long portfolioId,
            @Param("symbol") String symbol,
            @Param("type") TradeAction type,
            @Param("cutoff") LocalDateTime cutoff
    );
}
