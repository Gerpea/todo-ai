import { createTask } from "@/api"
import { useTasks } from "@/hooks/useTasks"
import { AddIcon } from "@chakra-ui/icons"
import { Card, CardBody, IconButton, Input, InputGroup, useToast } from "@chakra-ui/react"
import { ChangeEvent, FormEvent, useState } from "react"

export const TaskCreator: React.FC<React.HTMLProps<HTMLFormElement>> = (props) => {
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
                title: 'Error on creating a task',
                status: 'error'
            })
        })
    }

    return (
        <form onSubmit={handleAddTask} {...props}>
            <Card
                direction={{ base: 'column', sm: 'row' }}
                overflow='hidden'
            >
                <CardBody pt='3' pb='3' pl='3' pr='8'>
                    <InputGroup>
                        <Input variant='outline' placeholder="Input a task" onChange={handleChange} />
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