import { StyleSheet, TextInput, View } from 'react-native'
import { Text } from './StyledText'
import Colors from '@/constants/Colors'
import { useColorScheme } from '@/components/useColorScheme'

const colorScheme = useColorScheme()

interface TextFieldProps {
    title: string
    value: string
    change: (text: string) => void
}

export function TextField({ title, value, change }: TextFieldProps) {
    const color = Colors[colorScheme ?? 'light'].textPrimary
    const placeholderColor = Colors[colorScheme ?? 'light'].textTertiary

    return (
        <View style={styles.container}>
            <View style={styles.title}>
                <Text textStyle='Body' colorStyle='Primary'>{ title }</Text>
            </View>
            <TextInput style={[{ color }, styles.value]} placeholder={ value } placeholderTextColor={placeholderColor} onChangeText={change} />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        height: 44,
        flexDirection: 'row',
    },
    title: {
        justifyContent: 'center',
        paddingHorizontal: 16,
        width: '27%'
    },
    value: {
        paddingHorizontal: 16,
        fontSize: 17,
        flexGrow: 1
    }
})