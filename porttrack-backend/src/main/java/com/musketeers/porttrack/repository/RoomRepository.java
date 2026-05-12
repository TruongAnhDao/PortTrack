package com.musketeers.porttrack.repository;

import com.musketeers.porttrack.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {
    Optional<Room> findByCode(String code);
    boolean existsByCode(String code);
    
    // API Owned: Lấy phòng do user tạo
    List<Room> findByOwnerId(Long ownerId);
}