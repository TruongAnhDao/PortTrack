package com.musketeers.porttrack.service.impl;

import com.musketeers.porttrack.dto.request.CreateRoomRequest;
import com.musketeers.porttrack.dto.request.JoinRoomRequest;
import com.musketeers.porttrack.dto.response.RoomResponse;
import com.musketeers.porttrack.entity.Room;
import com.musketeers.porttrack.entity.RoomMember;
import com.musketeers.porttrack.entity.User;
import com.musketeers.porttrack.entity.enums.RoomRole;
import com.musketeers.porttrack.entity.enums.RoomStatus;
import com.musketeers.porttrack.entity.enums.RoomType;
import com.musketeers.porttrack.repository.RoomMemberRepository;
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
    private final RoomMemberRepository roomMemberRepository;
    private final UserRepository userRepository;

    // Helper: Lấy user hiện tại đang đăng nhập từ Security Context
    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin người dùng xác thực"));
    }

    // Helper: Sinh mã code phòng ngẫu nhiên 6 ký tự
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
        } while (roomRepository.existsByCode(code)); // Đảm bảo unique
        return code;
    }

    // Helper: Map Entity -> DTO
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
    @Transactional // Đảm bảo ACID
    public RoomResponse createRoom(CreateRoomRequest request) {
        User currentUser = getCurrentUser();

        // Validate mật khẩu nếu phòng PRIVATE
        if (request.getType() == RoomType.PRIVATE && (request.getPassword() == null || request.getPassword().isBlank())) {
            throw new RuntimeException("Phòng PRIVATE yêu cầu phải có mật khẩu");
        }

        // 1. Tạo Room
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

        // 2. Thêm Owner vào bảng RoomMember
        RoomMember roomMember = RoomMember.builder()
                .roomId(savedRoom.getId())
                .userId(currentUser.getId())
                .role(RoomRole.OWNER)
                .cashBalance(savedRoom.getInitialBalance()) // Cấp vốn khởi tạo
                .build();
        
        roomMemberRepository.save(roomMember);

        return mapToResponse(savedRoom);
    }

    @Override
    @Transactional
    public RoomResponse joinRoom(JoinRoomRequest request) {
        User currentUser = getCurrentUser();

        Room room = roomRepository.findByCode(request.getCode())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phòng với mã này"));

        // Kiểm tra mật khẩu nếu phòng PRIVATE
        if (room.getType() == RoomType.PRIVATE) {
            if (request.getPassword() == null || !request.getPassword().equals(room.getPassword())) {
                throw new RuntimeException("Mật khẩu phòng không chính xác");
            }
        }

        // Kiểm tra xem user đã ở trong phòng chưa
        if (roomMemberRepository.existsByUserIdAndRoomId(currentUser.getId(), room.getId())) {
            throw new RuntimeException("Bạn đã tham gia phòng này rồi");
        }

        // Thêm User vào bảng RoomMember
        RoomMember roomMember = RoomMember.builder()
                .roomId(room.getId())
                .userId(currentUser.getId())
                .role(RoomRole.PLAYER)
                .cashBalance(room.getInitialBalance()) // Cấp vốn khởi tạo giống mức quy định của phòng
                .build();

        roomMemberRepository.save(roomMember);

        return mapToResponse(room);
    }

    @Override
    public List<RoomResponse> getMyRooms() {
        User currentUser = getCurrentUser();

        // Tìm tất cả các record member của user này
        List<RoomMember> participations = roomMemberRepository.findByUserId(currentUser.getId());

        // Lấy ra thông tin Room tương ứng và map ra Response
        return participations.stream()
                .map(participation -> roomRepository.findById(participation.getRoomId())
                        .orElseThrow(() -> new RuntimeException("Lỗi dữ liệu: Không tìm thấy phòng")))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
}