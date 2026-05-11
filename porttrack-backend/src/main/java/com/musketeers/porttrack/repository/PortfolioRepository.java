package com.musketeers.porttrack.repository;

import com.musketeers.porttrack.entity.Portfolio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PortfolioRepository extends JpaRepository<Portfolio, Long> {
    // Kiểm tra xem user đã có danh mục (đã vào phòng) chưa
    boolean existsByUserIdAndRoomId(Long userId, Long roomId);
    
    // Lấy tất cả danh mục của một user (để truy ra các phòng đang chơi)
    List<Portfolio> findByUserId(Long userId);
}