import { SignJWT, jwtVerify } from "jose"

const secretKey = process.env.SECRET_KEY
const key = new TextEncoder().encode(secretKey)

interface Session {
    userId: String
    expires: Date
}

export const encrypt = async (payload: Session) => {
    return new SignJWT(payload as any).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime(payload.expires).sign(key)
}
export const decrypt = async (input: string) => {
    return jwtVerify<Session>(input, key, {
        algorithms: ['HS256']
    })
}
export const createSession = (userId: string): Session => {
    const expires = new Date(new Date().setDate(new Date().getDate() + 1));

    return {
        userId,
        expires
    }
}
export const updateSession = async (enryptedSession: string): Promise<Session> => {
    const parsed = await decrypt(enryptedSession)

    return {
        ...parsed.payload,
        expires: new Date(new Date().setDate(new Date().getDate() + 1))
    }
}