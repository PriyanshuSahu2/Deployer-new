import axios from "axios"

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL

export const publicRequest = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
})

export const privateRequest = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
})

let isRefreshing = false
type QueueItem = { resolve: (value?: unknown) => void; reject: (err: unknown) => void };
let failedQueue: QueueItem[] = []

const processFailedQueue = (error: unknown = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error)
        } else {
            prom.resolve()
        }
    })
    failedQueue = []
}

privateRequest.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        if (error.response?.status === 401) {

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject })
                }).then(() => {
                    return privateRequest(originalRequest)
                })
            }

            isRefreshing = true

            try {
                await publicRequest.post("/auth/refresh-token", {}, { withCredentials: true })

                processFailedQueue()
                isRefreshing = false

                return privateRequest(originalRequest)

            } catch (err) {
                processFailedQueue(err)
                isRefreshing = false

                window.location.href = "/auth/login"
                return Promise.reject(err)
            }
        }

        return Promise.reject(error)
    }
)