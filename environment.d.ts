declare global {
    namespace NodeJS {
        interface ProcessEnv {
            MONGO_URI: string
            PORT: number
            JWT_SECRET: string
            JWT_EXPIRE: number
            JWT_COOKIE_EXPIRE: number
            SMTP_HOST: string
            SMTP_PORT: number
            SMTP_EMAIL: string
            SMTP_PASSWORD: string
            CLIENT_URL:string
        }
    }
}

export {}
