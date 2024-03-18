import type { NextApiRequest, NextApiResponse } from 'next'
import { serialize } from 'cookie'
import { createUser, getUser } from '@/db/users'
import { createSession, decrypt, encrypt } from '@/session'
import { addTask, deleteTask, getTask, getTasks } from '@/db/tasks'
import { User } from '@prisma/client'

const taskHandlers = {
    'GET': async (req: NextApiRequest, res: NextApiResponse, userId: string) => {
        const tasks = await getTasks(userId)
        return res.status(200).json(tasks)
    },
    'POST': async (req: NextApiRequest, res: NextApiResponse, userId: string) => {
        const { name } = JSON.parse(req.body)
        if (name) {
            const task = await addTask(userId, name)
            return res.status(200).json(task)
        } else {
            return res.status(406).send({ message: 'Not Acceptable' })
        }
    },
    'DELETE': async (req: NextApiRequest, res: NextApiResponse, userId: string) => {
        const { id } = JSON.parse(req.body)
        if (id) {
            const processedTask = await getTask(id)
            if (processedTask?.ownerId !== userId) {
                return res.status(403).send({ message: 'Forbidden' })
            }
            const task = await deleteTask(id)
            return res.status(200).json(task)
        } else {
            return res.status(406).send({ message: 'Not Acceptable' })
        }
    },
}
type AllowedMethods = keyof typeof taskHandlers

const authorize = async (req: NextApiRequest, res: NextApiResponse) => {
    const initializeNewUser = async (req: NextApiRequest, res: NextApiResponse) => {
        const user = await createUser()
        const sessionData = createSession(user.id)
        const encryptedSessionData = await encrypt(sessionData)
        const cookie = serialize('session', encryptedSessionData, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            expires: sessionData.expires,
            path: '/'
        })
        res.setHeader('Set-Cookie', cookie)
        return user
    }

    const session = req.cookies['session']
    let user!: User | null
    if (!session) {
        user = await initializeNewUser(req, res)
    } else {
        try {
            const userId = (await decrypt(session)).payload.userId as string
            user = await getUser(userId)
        } catch (e) {
            user = await initializeNewUser(req, res)
        }
    }

    return user
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const user = await authorize(req, res)
        if (!user) {
            return res.status(401).send({ message: 'Unauthorized' })
        }
        if (req.method && req.method in taskHandlers) {
            return await taskHandlers[req.method as AllowedMethods](req, res, user.id)
        } else {
            return res.status(501).send({ message: 'Not Implemented' })
        }
    } catch (e) {
        return res.status(500).send({ message: 'Internal Error' })
    }
}

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '1mb',
        },
    },
    maxDuration: 5,
}