export const API_BASE_URL = 'http://localhost:3000/api';
export const SOCKET_URL = 'http://localhost:3000';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  CALL: '/call/:targetUserId',
  PROFILE: '/profile',
  NOT_FOUND: '*'
};

export const SOCKET_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  REGISTER_USER: 'register-user',
  INITIATE_CALL: 'initiate-call',
  INCOMING_CALL: 'incoming-call',
  CALL_RESPONSE: 'call-response',
  CALLING: 'calling',
  USER_STATUS_CHANGED: 'user-status-changed'
};

export const CALL_STATUS = {
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  FAILED: 'failed'
};
