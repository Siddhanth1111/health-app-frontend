export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://health-app-backend-xuv7.onrender.com/api';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'https://health-app-backend-xuv7.onrender.com';

export const ROUTES = {
  HOME: '/',
  SIGN_IN: '/sign-in',
  SIGN_UP: '/sign-up',
  DASHBOARD: '/dashboard',
  DOCTORS: '/doctors',
  CALL: '/call/:doctorId',
  PROFILE: '/profile',
  CONSULTATIONS: '/consultations',
  NOT_FOUND: '*'
};

export const DOCTOR_SPECIALTIES = [
  'General Physician',
  'Cardiologist',
  'Dermatologist',
  'Pediatrician',
  'Orthopedic',
  'Gastroenterologist',
  'Neurologist',
  'Psychiatrist',
  'Gynecologist',
  'ENT Specialist',
  'Ophthalmologist',
  'Urologist'
];

export const SOCKET_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  REGISTER_USER: 'register-user',
  INITIATE_CALL: 'initiate-call',
  INCOMING_CALL: 'incoming-call',
  CALL_RESPONSE: 'call-response',
  CALLING: 'calling',
  DOCTOR_STATUS_CHANGED: 'doctor-status-changed'
};

export const USER_TYPES = {
  PATIENT: 'patient',
  DOCTOR: 'doctor'
};

export const CALL_STATUS = {
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  FAILED: 'failed'
};
