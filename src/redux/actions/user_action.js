import { CLEAR_USER, SET_USER } from "./types";

export const setUser = (user) => {
  return {
    type: SET_USER,
    payload: user,
  };
};

export const clearUser = (user) => {
  return {
    type: CLEAR_USER,
  };
};
