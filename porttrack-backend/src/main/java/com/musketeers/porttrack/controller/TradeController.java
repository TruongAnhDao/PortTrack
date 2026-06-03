package com.musketeers.porttrack.controller;

import com.musketeers.porttrack.dto.request.TradeRequest;
import com.musketeers.porttrack.dto.response.RoomDashboardResponse;
import com.musketeers.porttrack.service.TradeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/rooms/{roomId}")
@RequiredArgsConstructor
public class TradeController {

    private final TradeService tradeService;

    // TASK 1: Lấy thông tin Dashboard phòng
    @GetMapping("/dashboard")
    public ResponseEntity<RoomDashboardResponse> getRoomDashboard(@PathVariable Long roomId) {
        return ResponseEntity.ok(tradeService.getRoomDashboard(roomId));
    }

    // TASK 2: Thực hiện giao dịch (Khớp lệnh)
    @PostMapping("/trade")
    public ResponseEntity<String> executeTrade(
            @PathVariable Long roomId,
            @Valid @RequestBody TradeRequest request) {
        
        tradeService.executeTrade(roomId, request);
        return ResponseEntity.ok(request.getAction() + " order for " + request.getStockSymbol() + " completed successfully.");
    }
}
