import axios from "axios";

const BASE_URL = "http://localhost:3000/api/schedule";

export const getSchedulesAPI = async () => {
  const res = await axios.get(`${BASE_URL}/teaching-schedule`);
  return res.data;
};
