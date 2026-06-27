import { Room, IRoom, IRoomPlayer } from "../models/Room";
import { generateRoomCode } from "../utils/cardUtils";

export class RoomManager {
  async createRoom(
    socketId: string,
    userId: string,
    username: string,
    gameMode: "normal" | "lightning" | "daily" = "normal",
    maxRounds: number = 20
  ): Promise<IRoom> {
    let roomCode = generateRoomCode();
    let exists = await Room.findOne({ roomCode });
    while (exists) {
      roomCode = generateRoomCode();
      exists = await Room.findOne({ roomCode });
    }

    const timerDuration = gameMode === "lightning" ? 10 : 15;

    const room = new Room({
      roomCode,
      hostId: userId,
      timerDuration,
      gameMode,
      maxRounds,
      players: [
        {
          socketId,
          userId,
          username,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random&color=fff&size=128&bold=true`,
          score: 0,
          status: "connected",
          isHost: true,
          winStreak: 0,
        },
      ],
    });

    return room.save();
  }

  async joinRoom(
    roomCode: string,
    socketId: string,
    userId: string,
    username: string
  ): Promise<IRoom | null> {
    const room = await Room.findOne({ roomCode: roomCode.toUpperCase() });
    if (!room) return null;
    if (room.gameStatus !== "waiting") return null;
    if (room.players.length >= 4) return null;

    const existing = room.players.find((p) => p.userId === userId);
    if (existing) {
      existing.socketId = socketId;
      existing.status = "connected";
      return room.save();
    }

    room.players.push({
      socketId,
      userId,
      username,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random&color=fff&size=128&bold=true`,
      score: 0,
      status: "connected",
      isHost: false,
      winStreak: 0,
    } as IRoomPlayer);

    return room.save();
  }

  async leaveRoom(roomCode: string, userId: string): Promise<IRoom | null> {
    const room = await Room.findOne({ roomCode });
    if (!room) return null;

    room.players = room.players.filter((p) => p.userId !== userId);

    if (room.players.length === 0) {
      await Room.deleteOne({ roomCode });
      return null;
    }

    if (room.hostId === userId && room.players.length > 0) {
      const newHost = room.players[0];
      room.hostId = newHost.userId;
      newHost.isHost = true;
    }

    return room.save();
  }

  async markDisconnected(socketId: string): Promise<IRoom | null> {
    const room = await Room.findOne({ "players.socketId": socketId });
    if (!room) return null;

    const player = room.players.find((p) => p.socketId === socketId);
    if (player) player.status = "disconnected";

    return room.save();
  }

  async reconnectPlayer(
    roomCode: string,
    userId: string,
    newSocketId: string
  ): Promise<IRoom | null> {
    const room = await Room.findOne({ roomCode });
    if (!room) return null;

    const player = room.players.find((p) => p.userId === userId);
    if (player) {
      player.socketId = newSocketId;
      player.status = "connected";
    }

    return room.save();
  }

  async getRoomByCode(roomCode: string): Promise<IRoom | null> {
    return Room.findOne({ roomCode: roomCode.toUpperCase() });
  }

  async getRoomBySocketId(socketId: string): Promise<IRoom | null> {
    return Room.findOne({ "players.socketId": socketId });
  }
}

export const roomManager = new RoomManager();
