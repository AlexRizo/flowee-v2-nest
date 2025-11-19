import { parse } from 'cookie';

export const getRefreshToken = (cookie: any): string => {
  return parse(cookie).refreshToken || '';
};
