import axios, { AxiosError } from 'axios';


const BASE_URL = 'http://localhost:8080';


export const publicRequest = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const privateRequest = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

let isRefreshing = false
const failedQueue: any[] = []
privateRequest.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config
        if (error.response.status === 401) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject })
                }).then(_ => {
                    return axios(originalRequest)
                })
            }
            isRefreshing = true;


            try {
                await publicRequest.post(`${BASE_URL}/auth/refresh`)
            } catch (error) {
                console.log(error)
                window.location.href = '/auth/login'
            }

        }
    })