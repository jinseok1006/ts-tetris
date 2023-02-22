import { createSlice } from '@reduxjs/toolkit';

interface Cell {
  block: boolean;
}

const boardSlice = createSlice({
  name: 'board',
  initialState: [] as Cell[][],
  reducers: {
    set: (state, action) => {
      return state;
    },
  },
});

export default boardSlice;
