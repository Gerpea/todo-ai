import { createTask } from "@/api"
import { useSpeechCommandContext } from "@/contexts/SpeechCommandContext"
import { useTasks } from "@/hooks/useTasks"
import { AddIcon } from "@chakra-ui/icons"
import { Card, CardBody, IconButton, Input, InputGroup, useToast } from "@chakra-ui/react"
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react"

export const TaskCreator: React.FC<React.HTMLProps<HTMLFormElement>> = (props) => {
    const toast = useToast()
    const { tasks, refresh } = useTasks()
    const [taskName, setTaskName] = useState('')

    const { listen } = useSpeechCommandContext()
    const onEnd = useRef((value: string) => {
        createTask(value).then((task) => {
            refresh([...tasks, task])
        }).catch(() => {
            toast({
                title: 'Error on creating a task',
                status: 'error'
            })
        })
        setTaskName('')
    })
    const onResult = useRef((value: string) => {
        setTaskName(value)
    })
    useEffect(() => {
        const removeEndListener = listen('end', 'add', onEnd.current)
        const removeResultListener = listen('result', 'add', onResult.current)
        
        return () => {
            removeEndListener()
            removeResultListener()
        }
    }, [])

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => setTaskName(event.target.value)
    const handleAddTask = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        createTask(taskName).then((task) => {
            refresh([...tasks, task])
        }).catch(() => {
            toast({
                title: 'Error on creating a task',
                status: 'error'
            })
        })
        setTaskName('')
    }

    return (
        <form onSubmit={handleAddTask} {...props}>
            <Card
                direction={{ base: 'column', sm: 'row' }}
                overflow='hidden'
            >
                <CardBody pt='3' pb='3' pl='3' pr='8'>
                    <InputGroup>
                        <Input variant='outline' placeholder="Input a task" onChange={handleChange} value={taskName} />
                    </InputGroup>
                </CardBody>
                <IconButton
                    type="submit"
                    aria-label='add task'
                    colorScheme="green"
                    height='auto'
                    variant='insideCard'
                    borderTopLeftRadius='0'
                    borderBottomLeftRadius='0'
                    icon={<AddIcon color="white" />} />
            </Card>
        </form>
    )
}

TaskCreator.displayName = "TaskCreator"