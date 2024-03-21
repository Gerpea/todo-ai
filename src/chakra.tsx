import {
    ChakraProvider,
    cookieStorageManagerSSR,
    localStorageManager,
} from '@chakra-ui/react'
import { GetServerSideProps } from 'next'
import { PropsWithChildren } from 'react'
import theme from './theme'

interface ChakraProps {
    cookies: string
}

export const Chakra: React.FC<PropsWithChildren<ChakraProps>> = ({ cookies, children }) => {
    const colorModeManager =
        typeof cookies === 'string'
            ? cookieStorageManagerSSR(cookies)
            : localStorageManager

    return (
        <ChakraProvider colorModeManager={colorModeManager} theme={theme}>
            {children}
        </ChakraProvider>
    )
}

export const getServerSideProps = (async ({ req }) => {
    return {
        props: {
            cookies: req.headers.cookie ?? '',
        },
    }
}) satisfies GetServerSideProps<ChakraProps>