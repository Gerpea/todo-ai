import prisma from "./prisma"

export const addTask = (userId: string, taskName: string) => {
    return prisma.task.create({
        data: {
            name: taskName,
            ownerId: userId
        }
    })
}

export const deleteTask = (taskId: string) => {
    return prisma.task.delete({
        where: {
            id: taskId
        }
    })
}

export const getTasks = (userId: string) => {
    return prisma.task.findMany({
        where: {
            ownerId: userId
        }
    })
}

export const getTask = (taskId: string) => {
    return prisma.task.findUnique({
        where: {
            id: taskId
        }
    })
}