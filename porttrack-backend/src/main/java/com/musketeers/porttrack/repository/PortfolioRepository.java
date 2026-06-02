package com.musketeers.porttrack.repository;

import com.musketeers.porttrack.entity.Portfolio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PortfolioRepository extends JpaRepository<Portfolio, Long> {
    
    // Dùng để kiểm tra xem user đã tham gia phòng chưa (RoomServiceImpl dùng)
    boolean existsByUserIdAndRoomId(Long userId, Long roomId);
    
    // Dùng để lấy danh sách các phòng đang chơi của user (RoomServiceImpl dùng)
    List<Portfolio> findByUserId(Long userId);

    // Dùng để lấy ví tiền/danh mục của user trong 1 phòng cụ thể khi giao dịch (TradeServiceImpl dùng)
    Optional<Portfolio> findByUserIdAndRoomId(Long userId, Long roomId);

    List<Portfolio> findByRoomIdOrderByJoinedAtAsc(Long roomId);

    long countByRoomId(Long roomId);
}
