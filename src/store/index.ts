import { configureStore } from "@reduxjs/toolkit";
import userStore from "./modules/user";
const store = configureStore({
  reducer: {
    user:userStore
  },
});

export default store;
