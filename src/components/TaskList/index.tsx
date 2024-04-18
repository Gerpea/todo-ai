import React, { useEffect, useMemo, useRef, useState } from "react"
import { Card, CardBody, Center, Heading, IconButton, Spinner, Text, useToast } from "@chakra-ui/react"
import { removeTask } from "@/api"
import { Task, TaskList as TaskListType } from "@/types"
import { useTasks } from "@/hooks/useTasks"
import { useDelay } from "@/hooks/useDelay"
import { useSpeechCommandContext } from "@/contexts/SpeechCommandContext"
import { DeleteIcon } from '@chakra-ui/icons'
import ScrollContainer from "react-indiana-drag-scroll"
import { Responsive, WidthProvider, Layout } from "react-grid-layout";
import Measure, { ContentRect } from 'react-measure'
import { levenshteinEditDistance } from 'levenshtein-edit-distance'
import 'react-grid-layout/css/styles.css';

const ResponsiveReactGridLayout = WidthProvider(Responsive);

type onDeleteHandler = (id: string) => void
type TaskCardProps = Task & {
    onDelete: onDeleteHandler
} & React.HTMLProps<HTMLDivElement>

const TaskCard: React.FC<TaskCardProps> = React.forwardRef<HTMLDivElement, TaskCardProps>(({ id, name, onDelete }, ref) => {
    const handleDelete = () => {
        onDelete(id)
    }

    return (
        <Card
            direction={{ base: 'column', sm: 'row' }}
            overflow='hidden'
            position='absolute'
            top='0'
            left='0'
            height='fit-content'
            width='100%'
            cursor='pointer'
            ref={ref}
        >
            <CardBody className="draggableCard" cursor="move">
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
})

export const TaskList = () => {
    const [mounted, setMounted] = useState(false);
    const [layout, setLayout] = useState<Layout[]>([])

    const toast = useToast()
    const { tasks, error, isLoading, refresh } = useTasks()
    const isLoadingDelayed = useDelay(isLoading, {
        initialValue: false,
    })

    const tasksRef = useRef<TaskListType>([]);
    const { listen } = useSpeechCommandContext()
    const onEnd = useRef((value: string) => {
        let minDstId
        let minDst
        for(let i = 0; i < tasksRef.current.length; i++) {
            const dst = levenshteinEditDistance(value, tasksRef.current[i].name)
            if(dst === 0) {
                minDstId = tasksRef.current[i].id
                break
            }
            if(!minDst || dst < minDst) {
                minDst = dst
                minDstId = tasksRef.current[i].id
            }
        }

        if(minDstId) {
            handleDeleteTask(minDstId)
        }
    })
    useEffect(() => {
        const removeEndListener = listen('end', 'delete', onEnd.current)

        return () => {
            removeEndListener()
        }
    }, [])
    useEffect(() => {
        tasksRef.current = tasks
    }, [tasks])

    useEffect(() => {
        setMounted(true);
        const layout = localStorage.getItem('rgl')
        if (layout) {
            setLayout(JSON.parse(layout))
        }
    }, []);


    const handleDeleteTask = (id: string) => {
        setLayout((layout) => {
            const _layout = [...layout]
            _layout.splice(_layout.findIndex((l) => l.i === id), 1)
            return _layout
        })
        removeTask(id).then(({ id }) => {
            setLayout((layout) => {
                const _layout = [...layout]
                const deletedIndex = _layout.findIndex((l) => l.i === id)
                if (deletedIndex === -1) {
                    return layout
                }

                _layout.splice(deletedIndex, 1)
                return _layout
            })
            refresh([...tasks.filter((task: Task) => task.id !== id)])
        }).catch(() => {
            toast({
                title: 'Произошла ошибка при создании задачи',
                status: 'error'
            })
        })
    }

    const tasksMap = useMemo(() => {
        const result: { [key in string]: Task } = {}
        tasks.forEach((task) => {
            result[task.id] = {
                ...task
            }
        })
        return result
    }, [tasks])

    useEffect(() => {
        setLayout((layout) => {
            if (Object.keys(tasksMap).length > layout.length) {
                const newTaskId = Object.keys(tasksMap).filter((taskId) => !layout.map((l) => l.i).includes(taskId))[0]
                const newTaskPos = Math.round(Math.random() * 9)
                const _layout = [...layout, {
                    i: newTaskId, x: newTaskPos, y: 0, w: 2, h: 2.7,
                    isDraggable: true, isResizable: false, isBounded: true
                }]
                return _layout
            }
            return layout
        })
    }, [tasksMap])

    const handleLayoutChange = (layout: Layout[]) => {
        localStorage.setItem('rgl', JSON.stringify(layout))
        setLayout(layout)
    }

    const handleCardResize = (id: string) => (contentRect: ContentRect) => {
        if (!contentRect?.bounds) {
            return
        }

        setLayout((layout) => {
            const height = contentRect.bounds!.height
            const _layout = [...layout]
            const taskLayoutIdx = _layout.findIndex((l) => l.i === id)
            if (taskLayoutIdx === -1) {
                return layout
            }
            // From formula pixelHeight = (rowHeight * h) + (marginH * (h - 1))
            // h = (pixelHeight + marginH) / (marginH + rowHeight)
            const newH = (height + 50) / (50 + 10)
            _layout[taskLayoutIdx].h = newH
            _layout[taskLayoutIdx].minH = newH
            _layout[taskLayoutIdx].maxH = newH
            return _layout
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
        <ScrollContainer style={{ overflow: 'scroll', height: '100%' }} ignoreElements=".ignoreScroll" hideScrollbars={true}>
            <ResponsiveReactGridLayout
                rowHeight={10}
                cols={{ lg: 12, md: 9, sm: 6, xs: 4, xxs: 2 }}
                measureBeforeMount={false}
                preventCollision={false}
                compactType='vertical'
                useCSSTransforms={mounted}
                draggableHandle=".draggableCard"
                margin={[50, 50]}
                onLayoutChange={handleLayoutChange}
            >
                {layout.map((item, i) => (
                    <div key={item.i} data-grid={item} className="ignoreScroll">
                        <Measure bounds onResize={handleCardResize(item.i)}>
                            {({ measureRef }) =>
                                <TaskCard {...tasksMap[item.i]} onDelete={handleDeleteTask} ref={measureRef} />
                            }
                        </Measure>
                    </div>
                ))}
            </ResponsiveReactGridLayout>
        </ScrollContainer>
    )
}

TaskList.displayName = "TaskList"
