package com.musketeers.porttrack.service;

import com.musketeers.porttrack.dto.request.CreateRoomRequest;
import com.musketeers.porttrack.dto.request.JoinRoomRequest;
import com.musketeers.porttrack.dto.response.JoinedRoomResponse;
import com.musketeers.porttrack.dto.response.RoomResponse;

import java.util.List;

public interface RoomService {
    RoomResponse createRoom(CreateRoomRequest request);
    RoomResponse joinRoom(JoinRoomRequest request);
    List<RoomResponse> getOwnedRooms(); // Mới
    List<JoinedRoomResponse> getJoinedRooms(); // Mới
}