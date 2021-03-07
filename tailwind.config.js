module.exports = {
  purge: {
    mode: "all",
    enabled: process.env.NODE_ENV == "development" ? false : true,
    content: [
      "./src/**/*.html",
      "./src/**/*.vue",
      "./src/**/*.jsx",
      "./src/**/*.js",
    ],
  },
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {},
    fontFamily: {
      Love: "Love Ya Like A Sister, cursive",
    },
  },
  variants: {
    extend: {
      fontSize: ["hover", "group-hover"],
      fontWeight: ["hover", "group-hover"],
    },
  },
  plugins: [require("@tailwindcss/line-clamp")],
};
