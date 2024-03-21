import { MoonIcon, SunIcon, } from "@chakra-ui/icons"
import { HStack, IconButton, StackProps, useColorMode } from "@chakra-ui/react"

export const Menu: React.FC<StackProps> = (props) => {
    const { colorMode, toggleColorMode } = useColorMode()

    return (
        <HStack justify='end' {...props}>
            <IconButton variant='ghost' aria-label="change theme"
                onClick={toggleColorMode}
                icon={colorMode === 'light' ? <SunIcon color='yellow.500' /> : <MoonIcon />} />
        </HStack>
    )
}