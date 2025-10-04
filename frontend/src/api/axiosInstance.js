import axios from "axios";

const server_url = import.meta.env.VITE_SOCKET_URL;

export const API = axios.create({
    baseURL: `${server_url}/api`,
    withCredentials: true,
})