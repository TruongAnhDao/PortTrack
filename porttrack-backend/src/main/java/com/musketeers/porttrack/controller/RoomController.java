package com.musketeers.porttrack.controller;

import com.musketeers.porttrack.dto.request.CreateRoomRequest;
import com.musketeers.porttrack.dto.request.JoinRoomRequest;
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
        RoomResponse response = roomService.createRoom(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/join")
    public ResponseEntity<RoomResponse> joinRoom(@Valid @RequestBody JoinRoomRequest request) {
        RoomResponse response = roomService.joinRoom(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/my-rooms")
    public ResponseEntity<List<RoomResponse>> getMyRooms() {
        return ResponseEntity.ok(roomService.getMyRooms());
    }
}