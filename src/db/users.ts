import prisma from "./prisma"

export const createUser = () => {
    return prisma.user.create({ data: {} })
}

export const getUser = (id: string) => {
    return prisma.user.findUnique({
        where: {
            id: id
        }
    })
}