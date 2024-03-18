import { Card, CardBody, Heading, Spinner, Stack, useToast } from "@chakra-ui/react"
import { removeTask } from "@/api"
import { Task } from "@/types"
import { useTasks } from "@/hooks/useTasks"
import { useDelay } from "@/hooks/useDelay"

type onDeleteHandler = (id: string) => void
type TaskCardProps = Task & {
    onDelete: onDeleteHandler
}
const TaskCard: React.FC<TaskCardProps> = ({ id, name, onDelete }) => {
    const handleDelete = () => {
        onDelete(id)
    }

    return (
        <Card
            direction={{ base: 'column', sm: 'row' }}
            overflow='hidden'
            variant='outline'
        >
            <CardBody>
                <Heading size='md'>{name}</Heading>
            </CardBody>
            <button onClick={handleDelete}>
                Delete task
            </button>
        </Card>
    )
}

export const TaskList = () => {
    const toast = useToast()
    const { tasks, error, isLoading, refresh } = useTasks()
    const isLoadingDelayed = useDelay(isLoading, {
        initialValue: false,
    })

    const handleDeleteTask = (id: string) => {
        removeTask(id).then(({ id }) => {
            refresh([...tasks.filter((task: Task) => task.id !== id)])
        }).catch(() => {
            toast({
                title: 'Произошла ошибка при создании задачи',
                status: 'error'
            })
        })
    }

    if (error) {
        return <div>
            {error.message}
        </div>
    }

    return isLoadingDelayed ? <Spinner size='xl' /> : (
        <Stack spacing={4}>
            {...tasks.map((task, idx) => (
                <TaskCard key={task.id || `${task.name}_${idx}`} {...task} onDelete={handleDeleteTask} />
            ))}
        </Stack>
    )
}

