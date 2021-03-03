module.exports = {
  purge: [],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {},
  },
  variants: {
    extend: {
      fontSize: ["hover", "group-hover"],
      fontWeight: ["hover", "group-hover"],
    },
  },
  plugins: [require("@tailwindcss/line-clamp")],
};
