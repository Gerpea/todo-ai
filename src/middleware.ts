import { NextResponse, type NextRequest } from 'next/server'
import { encrypt, updateSession } from './session'

export async function middleware(req: NextRequest) {
    const res = NextResponse.next()
    const session = req.cookies.get('session')?.value
    if (!session) {
        return res
    }

    try {
        const updatedSession = await updateSession(session)
        res.cookies.set({
            name: 'session',
            value: await encrypt(updatedSession),
            expires: updatedSession.expires,
            httpOnly: true
        })
    } finally {
        return res
    }
}