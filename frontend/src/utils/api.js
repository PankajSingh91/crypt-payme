import axios from 'axios';
const API = process.env.REACT_APP_API_BASE || 'http://localhost:5000';
const instance = axios.create({
  baseURL: API,
  withCredentials: true, // allow cookies
});
export default instance;
