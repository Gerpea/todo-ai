import { createTask } from "@/api"
import { useTasks } from "@/hooks/useTasks"
import { Button, FormControl, Input, InputGroup, InputRightElement, useToast } from "@chakra-ui/react"
import { ChangeEvent, ChangeEventHandler, FormEvent, FormEventHandler, ReactEventHandler, useState } from "react"

export const TaskCreator = () => {
    const toast = useToast()
    const { tasks, refresh } = useTasks()

    const [taskName, setTaskName] = useState('')
    const handleChange = (event: ChangeEvent<HTMLInputElement>) => setTaskName(event.target.value)

    const handleAddTask = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        createTask(taskName).then((task) => {
            refresh([...tasks, task])
        }).catch(() => {
            toast({
                title: 'Произошла ошибка при создании задачи',
                status: 'error'
            })
        })
    }

    return (
        <form onSubmit={handleAddTask}>
            <InputGroup>
                <Input variant='outline' placeholder="Input a task" onChange={handleChange} />
                <InputRightElement>
                    <Button type='submit'>
                        Add
                    </Button>
                </InputRightElement>
            </InputGroup>
        </form>
    )
}