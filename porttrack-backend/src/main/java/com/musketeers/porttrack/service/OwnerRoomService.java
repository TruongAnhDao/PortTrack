package com.musketeers.porttrack.service;

import com.musketeers.porttrack.dto.request.UpdateOwnerRoomRequest;
import com.musketeers.porttrack.dto.response.OwnerLeaderboardEntryResponse;
import com.musketeers.porttrack.dto.response.OwnerPlayerResponse;
import com.musketeers.porttrack.dto.response.OwnerRoomDashboardResponse;
import com.musketeers.porttrack.dto.response.OwnerTransactionResponse;
import com.musketeers.porttrack.dto.response.RoomResponse;

import java.util.List;

public interface OwnerRoomService {
    OwnerRoomDashboardResponse getDashboard(Long roomId);

    List<OwnerPlayerResponse> getPlayers(Long roomId);

    List<OwnerTransactionResponse> getTransactions(Long roomId);

    List<OwnerLeaderboardEntryResponse> getLeaderboard(Long roomId);

    RoomResponse updateRoom(Long roomId, UpdateOwnerRoomRequest request);
}
