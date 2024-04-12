import SpeechCommands, { CommandEvent } from '@/libs/SpeechCommands';
import { createContext, useCallback, useContext, useEffect, useRef } from 'react';

type SpeechCommandListener = (value: string) => void
type SpeechEvents = 'result' | 'end'

const initialValue = {
    listen: (type: SpeechEvents, command: string, listener: SpeechCommandListener) => () => { },
}

const SpeechCommandContext = createContext(initialValue);
const SpeechCommandProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const commander = useRef<SpeechCommands>()
    const listeners = useRef<Record<SpeechEvents, Record<string, SpeechCommandListener[]>>>({
        result: {},
        end: {}
    })

    const listen = useRef((type: SpeechEvents, command: string, listener: SpeechCommandListener) => {
        if (listeners.current[type][command]) {
            listeners.current[type][command].push(listener)
        } else {
            listeners.current[type][command] = [listener]
        }

        if (!commander.current?.recording) {
            commander.current?.start('en-EN')
        }
        commander.current?.addCommand?.(command)

        return () => {
            if (listeners.current[type][command]) {
                const idx = listeners.current[type][command].findIndex((l) => l === listener)
                if (idx !== -1) {
                    listeners.current[type][command].splice(idx, 1)
                }
            }

            if (listeners.current[type][command].length == 0) {
                commander.current?.removeCommand?.(command)
            }
        }
    })

    const onEndHandler = useCallback(({ command, value }: CommandEvent) => {
        if (!listeners.current['end'][command]) {
            return
        }
        listeners.current['end'][command].forEach((listener) => {
            listener(value)
        })
    }, [])
    const onResultHandler = useCallback(({ command, value }: CommandEvent) => {
        if (!listeners.current['result'][command]) {
            return
        }
        listeners.current['result'][command].forEach((listener) => {
            listener(value)
        })
    }, [])

    useEffect(() => {
        if (!commander.current) {
            commander.current = new SpeechCommands(true, 3000)
        }
    }, [])

    useEffect(() => {
        if (commander.current) {
            commander.current.onEnd = onEndHandler
        }
    }, [onEndHandler])

    useEffect(() => {
        if (commander.current) {
            commander.current.onResult = onResultHandler
        }
    }, [onResultHandler])

    return (
        <SpeechCommandContext.Provider value={{ listen: listen.current }}>
            {children}
        </SpeechCommandContext.Provider>
    )
}

const useSpeechCommandContext = () => useContext(SpeechCommandContext)
export { SpeechCommandContext, SpeechCommandProvider, useSpeechCommandContext }