import { Server as HttpServer } from 'node:http';
import { Server } from 'socket.io';
import { registerCollabHandlers } from './handlers/collabHandlers';
import { registerRoomHandlers } from './handlers/roomHandlers';
import { registerVersusHandlers } from './handlers/versusHandlers';

export function createSocketServer(
  httpServer: HttpServer,
  isAllowedOrigin: (origin?: string) => boolean,
): Server {
  const io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (isAllowedOrigin(origin)) {
          callback(null, true);
          return;
        }
        callback(new Error(`Socket CORS blocked for origin: ${origin ?? "unknown"}`));
      },
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    registerRoomHandlers(io, socket);
    registerVersusHandlers(io, socket);
    registerCollabHandlers(io, socket);
  });

  return io;
}
