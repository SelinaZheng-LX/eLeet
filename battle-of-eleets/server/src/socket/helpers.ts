import { randomBytes } from 'node:crypto';
import { Room } from '../../../shared/types';
import { rooms } from '../state/rooms';

const ROOM_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const ROOM_CODE_LENGTH = 6;

function generateRoomCode(): string {
  const bytes = randomBytes(ROOM_CODE_LENGTH);
  let code = '';

  for (let i = 0; i < ROOM_CODE_LENGTH; i += 1) {
    code += ROOM_CODE_CHARS[bytes[i] % ROOM_CODE_CHARS.length];
  }

  return code;
}

export function generateUniqueRoomCode(): string {
  let code = generateRoomCode();
  while (rooms.has(code)) {
    code = generateRoomCode();
  }
  return code;
}

export function getRoomBySocketId(socketId: string): Room | undefined {
  for (const room of rooms.values()) {
    if (room.players.some((player) => player.socketId === socketId)) {
      return room;
    }
  }
  return undefined;
}
