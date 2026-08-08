export const ClientToServerEvents = {
  // Room management
  JOIN_ROOM: 'join_room',
  LEAVE_ROOM: 'leave_room',

  // Collaboration
  CODE_CHANGE: 'code_change',
  LOAD_TEST_CODE_CHANGE: 'load_test_code_change',
  CURSOR_MOVE: 'cursor_move',
  LANGUAGE_CHANGE: 'language_change',
  FILE_SWITCH: 'file_switch',

  // Chat or signals
  TYPING: 'typing',
  STOP_TYPING: 'stop_typing',

  // host actions
  KICK_USER: 'kick_user',
  END_SESSION: 'end_session',

  // Code execution
  START_EXECUTION: 'start_execution',
  TERMINAL_INPUT: 'terminal_input',
  CLEAR_TERMINAL: 'clear_terminal',

};

export const ServerToClientEvents = {
  // Room updates
  ROOM_JOINED: 'room_joined',
  ROOM_LEFT: 'room_left',
  USER_JOINED: 'user_joined',
  USER_LEFT: 'user_left',

  // Code & editor updates
  CODE_UPDATE: 'code_update',
  LOAD_TEST_CODE_UPDATE: 'load_test_code_update',
  CURSOR_UPDATE: 'cursor_update',
  LANGUAGE_UPDATED: 'language_updated',
  FILE_UPDATED: 'file_updated',

  // Chat or typing
  USER_TYPING: 'user_typing',
  USER_STOPPED_TYPING: 'user_stopped_typing',

  // host actions
  USER_KICKED: 'user_kicked',
  SESSION_ENDED: 'session_ended',

  // Code execution
  EXECUTION_STARTED: 'execution_started',
  EXECUTION_ENDED: 'execution_ended',
  TERMINAL_OUTPUT: 'terminal_output',
  CLEAR_TERMINAL: 'clear_terminal',

  // Miscellaneous
  SOCKET_ERROR: 'socket_error',
  INVALID_SESSION: 'invalid_session',
};
