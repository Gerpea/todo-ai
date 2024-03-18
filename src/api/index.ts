import { Task, TaskList } from '@/types'

export class FetchError extends Error {
    constructor(message: string, public status: number) {
        super(message);
    }
}

const fetcher = async (url: string, init?: RequestInit | undefined) => {
    const res = await fetch(url, init)

    if (!res.ok) {
        const message = (await res.json())?.message
        const error = new FetchError(message, res.status)
        throw error
    }

    return res.json()
}
export const fetchTasks = async (): Promise<TaskList> => {
    return fetcher('/api/tasks')
}

export const createTask = async (name: string): Promise<Task> => {
    return fetcher('/api/tasks', {
        method: 'POST',
        body: JSON.stringify({
            name
        }, null, 0)
    })
}

export const removeTask = async (id: string): Promise<Task> => {
    return fetcher('/api/tasks', {
        method: 'DELETE',
        body: JSON.stringify({
            id
        }, null, 0)
    })
}
