
module.exports = {
  plugins: [
    {
      plugin: require("craco-plugin-react-hot-reload"),
    },
  ],
  style: {
    postcss: {
      plugins: [require("tailwindcss"), require("autoprefixer")],
    },
  },
};