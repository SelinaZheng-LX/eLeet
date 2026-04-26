import { Router } from 'express';
import { Room } from '../../../shared/types';
import { rooms } from '../state/rooms';
import { generateUniqueRoomCode } from '../socket/helpers';

const router = Router();

/**
 * POST /rooms
 * Request body: {}
 * Response 201: { roomCode: string }
 */
router.post('/', (_req, res) => {
  const roomCode = generateUniqueRoomCode();
  const room: Room = {
    code: roomCode,
    players: [],
    hostSocketId: '',
    mode: null,
    problemId: null,
    status: 'LOBBY',
  };

  rooms.set(roomCode, room);

  res.status(201).json({ roomCode });
});

/**
 * GET /rooms/:code
 * Request params: { code: string }
 * Response 200: Room
 * Response 404: { error: 'Room not found' }
 */
router.get('/:code', (req, res) => {
  const roomCode = req.params.code.toUpperCase();
  const room = rooms.get(roomCode);

  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  return res.status(200).json(room);
});

export default router;
