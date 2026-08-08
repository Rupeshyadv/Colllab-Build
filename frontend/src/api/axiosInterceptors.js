import { API, server_url } from "./axiosInstance.js"
import axios from "axios";

API.interceptors.response.use(
    response => response,

    async error => {

        const originalRequest = error.config;

        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url.includes("/refresh-access-token")
        ) {

            originalRequest._retry = true;

            try {

                await axios.post(
                    `${server_url}/users/refresh-access-token`,
                    {},
                    {
                        withCredentials: true,
                    }
                );

                return API(originalRequest);

            } catch (err) {
                // logout user
                console.log(err);
                window.location.href = "/login";
            }
        }

        return Promise.reject(error);
    }
);