import { useColorScheme } from '@/components/useColorScheme'
import Colors from '@/constants/Colors'
import { Picker as DefaultPicker } from '@react-native-picker/picker'
import { StyleSheet } from 'react-native'

const colorScheme = useColorScheme()

interface PickerProps<T> {
    items: T[],
    label: keyof T,
    value: keyof T,
    selectedValue: any,
    onValueChange: (itemValue: any, intemIndex: number) => void
}

export function Picker<T>({ items, label, value, selectedValue, onValueChange }: PickerProps<T>) {
    const color = Colors[colorScheme ?? 'light'].tint
    return (
        <DefaultPicker selectedValue={selectedValue} onValueChange={onValueChange} style={styles.container}>
            {items.map((item, index) => (
                <DefaultPicker.Item key={index} label={String(item[label])} value={item[value]} color={color} />
            ))}
        </DefaultPicker>
    )
}

const styles = StyleSheet.create({
    container: {
        height: 44,
        borderRadius: 12,
        paddingHorizontal: 16
    }
})