package com.musketeers.porttrack.controller;

import com.musketeers.porttrack.dto.request.UpdateOwnerRoomRequest;
import com.musketeers.porttrack.dto.response.OwnerLeaderboardEntryResponse;
import com.musketeers.porttrack.dto.response.OwnerPlayerResponse;
import com.musketeers.porttrack.dto.response.OwnerRoomDashboardResponse;
import com.musketeers.porttrack.dto.response.OwnerTransactionResponse;
import com.musketeers.porttrack.dto.response.RoomResponse;
import com.musketeers.porttrack.service.OwnerRoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/owner/rooms/{roomId}")
@RequiredArgsConstructor
public class OwnerRoomController {

    private final OwnerRoomService ownerRoomService;

    @GetMapping("/dashboard")
    public ResponseEntity<OwnerRoomDashboardResponse> getDashboard(@PathVariable Long roomId) {
        return ResponseEntity.ok(ownerRoomService.getDashboard(roomId));
    }

    @GetMapping("/players")
    public ResponseEntity<List<OwnerPlayerResponse>> getPlayers(@PathVariable Long roomId) {
        return ResponseEntity.ok(ownerRoomService.getPlayers(roomId));
    }

    @GetMapping("/transactions")
    public ResponseEntity<List<OwnerTransactionResponse>> getTransactions(@PathVariable Long roomId) {
        return ResponseEntity.ok(ownerRoomService.getTransactions(roomId));
    }

    @GetMapping("/leaderboard")
    public ResponseEntity<List<OwnerLeaderboardEntryResponse>> getLeaderboard(@PathVariable Long roomId) {
        return ResponseEntity.ok(ownerRoomService.getLeaderboard(roomId));
    }

    @PatchMapping
    public ResponseEntity<RoomResponse> updateRoom(
            @PathVariable Long roomId,
            @RequestBody UpdateOwnerRoomRequest request) {
        return ResponseEntity.ok(ownerRoomService.updateRoom(roomId, request));
    }
}
