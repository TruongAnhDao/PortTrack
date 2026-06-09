const TOKEN_KEY = 'token';
const USERNAME_KEY = 'username';

interface JwtPayload {
  exp?: number;
}

export const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USERNAME_KEY);
};

export const getStoredToken = () => localStorage.getItem(TOKEN_KEY);

export const isTokenValid = (token: string) => {
  try {
    const payloadPart = token.split('.')[1];
    if (!payloadPart) return false;

    const normalizedPayload = payloadPart
      .replace(/-/g, '+')
      .replace(/_/g, '/')
      .padEnd(Math.ceil(payloadPart.length / 4) * 4, '=');
    const payload = JSON.parse(atob(normalizedPayload)) as JwtPayload;

    return typeof payload.exp === 'number' && payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};
