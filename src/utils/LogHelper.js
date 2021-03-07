const LogHelper = (key = "", msg) => {
  if (process.env.NODE_ENV == "development") {
    console.log(key, JSON.stringify(msg));
  }
};

export default LogHelper;
