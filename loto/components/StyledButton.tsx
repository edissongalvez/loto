import { Pressable, StyleSheet, View } from 'react-native'
import { Text } from './StyledText'

import Colors from '@/constants/Colors'
import { useColorScheme } from '@/components/useColorScheme'

const colorScheme = useColorScheme()

interface ButtonProps {
    label: string
    action: () => void
}

export function Button({ label, action }: ButtonProps) {
    const backgroundColor = Colors[colorScheme ?? 'light'].tint

    return (
        <Pressable onPress={action}>
            <View style={[{ backgroundColor }, style.container]}>
                <Text textStyle='Body' colorStyle='White'>{label}</Text>
            </View>
        </Pressable>
    )
}

const style = StyleSheet.create({
    container: {
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        paddingHorizontal: 20 
    }
})