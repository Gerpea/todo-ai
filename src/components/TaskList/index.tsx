import { Card, CardBody, Center, Heading, IconButton, Spinner, Stack, Text, useToast } from "@chakra-ui/react"
import { removeTask } from "@/api"
import { Task } from "@/types"
import { useTasks } from "@/hooks/useTasks"
import { useDelay } from "@/hooks/useDelay"
import { DeleteIcon } from '@chakra-ui/icons'

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
        >
            <CardBody>
                <Heading size='md'>{name}</Heading>
            </CardBody>
            <IconButton
                aria-label='remove task'
                colorScheme="red"
                height='auto'
                variant='insideCard'
                borderTopLeftRadius='0'
                borderBottomLeftRadius='0'
                icon={<DeleteIcon color="white" />}
                onClick={handleDelete} />
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
        return (
            <Center>
                <Text color='red' fontSize={'xl'}>
                    {'Network Error'}
                </Text>
            </Center>
        )
    }

    if (isLoadingDelayed) {
        return (
            <Center>
                <Spinner size='xl' />
            </Center>
        )
    }

    return (
        <Stack spacing={4} pr={'8'}>
            {...tasks.map((task, idx) => (
                <TaskCard key={task.id || `${task.name}_${idx}`} {...task} onDelete={handleDeleteTask} />
            ))}
        </Stack>
    )
}

