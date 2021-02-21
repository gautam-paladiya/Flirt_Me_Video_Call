import axios from "axios";

const AxiosInstance = axios.create({
  baseURL: `/api/`,
});

export default AxiosInstance;
