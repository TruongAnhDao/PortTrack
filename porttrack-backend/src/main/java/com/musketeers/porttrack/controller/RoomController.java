package com.musketeers.porttrack.controller;

import com.musketeers.porttrack.dto.request.CreateRoomRequest;
import com.musketeers.porttrack.dto.request.JoinRoomRequest;
import com.musketeers.porttrack.dto.response.JoinedRoomResponse;
import com.musketeers.porttrack.dto.response.RoomResponse;
import com.musketeers.porttrack.service.RoomService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
public class RoomController {

    private final RoomService roomService;

    @PostMapping
    public ResponseEntity<RoomResponse> createRoom(@Valid @RequestBody CreateRoomRequest request) {
        return new ResponseEntity<>(roomService.createRoom(request), HttpStatus.CREATED);
    }

    @PostMapping("/join")
    public ResponseEntity<RoomResponse> joinRoom(@Valid @RequestBody JoinRoomRequest request) {
        return ResponseEntity.ok(roomService.joinRoom(request));
    }

    // API lấy danh sách phòng tự tạo (VAI TRÒ OWNER)
    @GetMapping("/owned")
    public ResponseEntity<List<RoomResponse>> getOwnedRooms() {
        return ResponseEntity.ok(roomService.getOwnedRooms());
    }

    // API lấy danh sách phòng đang chơi (VAI TRÒ PLAYER)
    @GetMapping("/joined")
    public ResponseEntity<List<JoinedRoomResponse>> getJoinedRooms() {
        return ResponseEntity.ok(roomService.getJoinedRooms());
    }
}