package com.musketeers.porttrack.service.impl;

import com.musketeers.porttrack.dto.request.CreateRoomRequest;
import com.musketeers.porttrack.dto.request.JoinRoomRequest;
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
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin người dùng xác thực"));
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

    private RoomResponse mapToResponse(Room room) {
        return RoomResponse.builder()
                .id(room.getId())
                .name(room.getName())
                .code(room.getCode())
                .type(room.getType())
                .ownerId(room.getOwnerId())
                .initialBalance(room.getInitialBalance())
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
            throw new RuntimeException("Phòng PRIVATE yêu cầu phải có mật khẩu");
        }

        // 1. Tạo phòng với owner_id là User hiện tại
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
        
        Room savedRoom = roomRepository.save(room);

        // 2. Tạo Portfolio (Danh mục) ngay cho Chủ phòng với mức vốn quy định
        Portfolio portfolio = Portfolio.builder()
                .user(currentUser)
                .room(savedRoom)
                .cashBalance(savedRoom.getInitialBalance())
                .build();
        
        portfolioRepository.save(portfolio);

        return mapToResponse(savedRoom);
    }

    @Override
    @Transactional
    public RoomResponse joinRoom(JoinRoomRequest request) {
        User currentUser = getCurrentUser();

        Room room = roomRepository.findByCode(request.getCode())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phòng với mã này"));

        if (room.getType() == RoomType.PRIVATE) {
            if (request.getPassword() == null || !request.getPassword().equals(room.getPassword())) {
                throw new RuntimeException("Mật khẩu phòng không chính xác");
            }
        }

        // 1. Check xem User đã được cấp Portfolio ở phòng này chưa
        if (portfolioRepository.existsByUserIdAndRoomId(currentUser.getId(), room.getId())) {
            throw new RuntimeException("Bạn đã tham gia phòng này rồi");
        }

        // 2. Tạo Portfolio cho User tham gia với mức vốn của phòng
        Portfolio portfolio = Portfolio.builder()
                .user(currentUser)
                .room(room)
                .cashBalance(room.getInitialBalance())
                .build();

        portfolioRepository.save(portfolio);

        return mapToResponse(room);
    }

    @Override
    public List<RoomResponse> getMyRooms() {
        User currentUser = getCurrentUser();

        // Lấy tất cả các Danh mục (Portfolio) của User này, sau đó trích xuất ra Room tương ứng
        List<Portfolio> portfolios = portfolioRepository.findByUserId(currentUser.getId());

        return portfolios.stream()
                .map(Portfolio::getRoom) // Trích xuất Entity Room từ Portfolio
                .map(this::mapToResponse) // Map sang DTO Response
                .collect(Collectors.toList());
    }
}