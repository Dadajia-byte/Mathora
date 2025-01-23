/** @type {import('tailwindcss').Config} */
export const content = ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"];
export const theme = {
  spacing: Array.from({ length: 1000 }).reduce((map, _, index) => {
    map[index] = `${index}px`;
    return map;
  }, {}),
  extend: {
    fontSize:Array.from({ length: 100 }).reduce((map, _, index) => {
      map[index] = `${index}px`;
      return map;
    }, {}),
  },
};
export const plugins = [];