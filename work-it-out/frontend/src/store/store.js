import { createStore } from "redux";
import { DESTROY_USER, LOGIN_USER, LOGOUT_USER, UPDATE_USER } from "./types";
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage' // defaults to localStorage for web

const intitialState = {
  authenticated: false,
  user : null
};

const persistConfig = {
  key: 'root',
  storage,
}

const reducer = (state = intitialState, action) => {
  const { user } = (action.payload) ? action.payload : {user : null};
  switch (action.type) {
    case LOGIN_USER:
      return { ...state, authenticated: true, user : user };
    case LOGOUT_USER:
      return {...state, authenticated : false};
    case UPDATE_USER:
      return { ...state, user : user };
    case DESTROY_USER:
      return { ...state, user : null, authenticated : false};
    default:
      return state;
  }
};

const persistedReducer = persistReducer(persistConfig, reducer)

const store = createStore(persistedReducer);
let persistor = persistStore(store)

export default store;
