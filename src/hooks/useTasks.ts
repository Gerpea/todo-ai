import { FetchError, fetchTasks } from "@/api"
import useSWR from "swr"

export const useTasks = () => {
    const { data = [], error, isLoading, mutate } = useSWR('/api/tasks', fetchTasks)

    return {
        tasks: data,
        error: error as FetchError,
        isLoading: isLoading,
        refresh: mutate
    }
}
