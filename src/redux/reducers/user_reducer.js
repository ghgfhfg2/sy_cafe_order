import { SET_USER } from "../actions/types";
import { CLEAR_USER } from "../actions/types";

const initState = {
  currentUser: null,
  isLoading: true,
};

const user = (state = initState, action) => {
  switch (action.type) {
    case SET_USER:
      return {
        ...state,
        currentUser: action.payload,
        isLoading: false,
      };
    case CLEAR_USER:
      return {
        ...state,
        currentUser: null,
        isLoading: false,
      };
    default:
      return state;
  }
};

export default user;
