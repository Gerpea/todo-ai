import { extendTheme, type StyleFunctionProps, type ThemeConfig } from '@chakra-ui/react'

const config: ThemeConfig = {
    initialColorMode: 'dark',
    useSystemColorMode: false,
}

const theme = extendTheme({
    config,
    components: {
        Button: {
            variants: {
                insideCard: (props: StyleFunctionProps) => {
                    const c = props.theme.colors[props.colorScheme]
                    return {
                        ...props.theme.components.Button.variants.solid(props),
                        background: c['500'],
                    }
                }
            }
        }
    },
})

export default theme