export type ServerToClientEvents = {
  playerNumber: (playerNumber: number) => void;
  turn: (turn: number) => void;
  board: (board: string[][]) => void;
  message: (message: string) => void;
};

export type ClientToServerEvents = {
  play: (data: { row: number; cell: number }) => void;
  restart: () => void;
};

export type InterServerEvents = {};

export type SocketData = {};
