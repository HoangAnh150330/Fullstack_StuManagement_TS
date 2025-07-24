import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth-slice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

// Type hỗ trợ cho useSelector, useDispatch
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;