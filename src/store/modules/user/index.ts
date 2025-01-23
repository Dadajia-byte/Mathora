import { createSlice } from "@reduxjs/toolkit";

const userStore = createSlice({
  name: "user",
  initialState: {
    username: "user",
  },
  reducers: {
    setUserInfo(state, action) {
      state.username = action.payload;
    },
  },
}); 

export const { setUserInfo } = userStore.actions;
export default userStore.reducer;