package com.musketeers.porttrack.service.impl;

import com.musketeers.porttrack.dto.request.CreateRoomRequest;
import com.musketeers.porttrack.dto.request.JoinRoomRequest;
import com.musketeers.porttrack.dto.response.JoinedRoomResponse;
import com.musketeers.porttrack.dto.response.RoomResponse;
import com.musketeers.porttrack.entity.Portfolio;
import com.musketeers.porttrack.entity.Room;
import com.musketeers.porttrack.entity.User;
import com.musketeers.porttrack.entity.enums.RoomStatus;
import com.musketeers.porttrack.entity.enums.RoomType;
import com.musketeers.porttrack.repository.PortfolioRepository;
import com.musketeers.porttrack.repository.RoomRepository;
import com.musketeers.porttrack.repository.UserRepository;
import com.musketeers.porttrack.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoomServiceImpl implements RoomService {

    private final RoomRepository roomRepository;
    private final PortfolioRepository portfolioRepository;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found."));
    }

    private String generateUniqueRoomCode() {
        String characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        SecureRandom random = new SecureRandom();
        String code;
        do {
            StringBuilder sb = new StringBuilder(6);
            for (int i = 0; i < 6; i++) {
                sb.append(characters.charAt(random.nextInt(characters.length())));
            }
            code = sb.toString();
        } while (roomRepository.existsByCode(code));
        return code;
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

    @Override
    @Transactional
    public RoomResponse createRoom(CreateRoomRequest request) {
        User currentUser = getCurrentUser();

        if (request.getType() == RoomType.PRIVATE && (request.getPassword() == null || request.getPassword().isBlank())) {
            throw new RuntimeException("Private rooms require a password.");
        }

        // CHỈ LƯU ROOM, KHÔNG TẠO PORTFOLIO CHO OWNER (Theo logic mới)
        Room room = Room.builder()
                .name(request.getName())
                .code(generateUniqueRoomCode())
                .type(request.getType())
                .password(request.getType() == RoomType.PRIVATE ? request.getPassword() : null)
                .ownerId(currentUser.getId())
                .initialBalance(request.getInitialBalance())
                .status(RoomStatus.WAITING)
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .build();
        
        return mapToRoomResponse(roomRepository.save(room));
    }

    @Override
    @Transactional
    public RoomResponse joinRoom(JoinRoomRequest request) {
        User currentUser = getCurrentUser();
        Room room = roomRepository.findByCode(request.getCode())
                .orElseThrow(() -> new RuntimeException("Room not found."));

        // Player không được tham gia vào chính phòng mình tạo để chơi
        if (room.getOwnerId().equals(currentUser.getId())) {
            throw new RuntimeException("You are the owner of this room and cannot join as a player.");
        }

        if (room.getType() == RoomType.PRIVATE && !room.getPassword().equals(request.getPassword())) {
            throw new RuntimeException("Incorrect password.");
        }

        if (portfolioRepository.existsByUserIdAndRoomId(currentUser.getId(), room.getId())) {
            throw new RuntimeException("You have already joined this room.");
        }

        Portfolio portfolio = Portfolio.builder()
                .user(currentUser)
                .room(room)
                .cashBalance(room.getInitialBalance())
                .build();
        portfolioRepository.save(portfolio);

        System.out.println("Current user: " + currentUser.getUsername() + " id=" + currentUser.getId());

        return mapToRoomResponse(room);
    }

    @Override
    public List<RoomResponse> getOwnedRooms() {
        User currentUser = getCurrentUser();
        return roomRepository.findByOwnerId(currentUser.getId()).stream()
                .map(this::mapToRoomResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<JoinedRoomResponse> getJoinedRooms() {
        User currentUser = getCurrentUser();
        return portfolioRepository.findByUserId(currentUser.getId()).stream()
                .map(portfolio -> JoinedRoomResponse.builder()
                        .roomInfo(mapToRoomResponse(portfolio.getRoom()))
                        .currentCashBalance(portfolio.getCashBalance())
                        .build())
                .collect(Collectors.toList());
    }
}
