package com.musketeers.porttrack.repository;

import com.musketeers.porttrack.entity.RoomMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoomMemberRepository extends JpaRepository<RoomMember, Long> {
    List<RoomMember> findByUserId(Long userId);
    boolean existsByUserIdAndRoomId(Long userId, Long roomId);
}