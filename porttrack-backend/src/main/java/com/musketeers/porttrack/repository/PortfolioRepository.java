package com.musketeers.porttrack.repository;

import com.musketeers.porttrack.entity.Portfolio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PortfolioRepository extends JpaRepository<Portfolio, Long> {
    boolean existsByUserIdAndRoomId(Long userId, Long roomId);
    
    // API Joined: Lấy tất cả portfolio để truy xuất ra Room và CashBalance
    List<Portfolio> findByUserId(Long userId);
}