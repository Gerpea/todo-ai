import { useEffect, useState } from "react";

interface UseDelayParams<T> {
    initialValue: T
    delay?: number
}
export const useDelay = <T>(value: T, { initialValue, delay = 300 }: UseDelayParams<T>) => {
    const [currentValue, setCurrentValue] = useState(initialValue)

    useEffect(() => {
        let timer: NodeJS.Timeout;

        timer = setTimeout(() => {
            setCurrentValue(value)
        }, delay)

        return () => {
            timer && clearTimeout(timer)
        }
    }, [value, delay])

    return currentValue
}