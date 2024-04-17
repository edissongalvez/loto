import { useState } from 'react'
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { Text } from './StyledText'
import * as XLSX from 'xlsx'

import Colors from '@/constants/Colors'
import { useColorScheme } from '@/components/useColorScheme'
import { Button } from './StyledButton'

const colorScheme = useColorScheme()

interface TableRow {
    [key: string]: any
}

interface TableProps {
    data: TableRow[],
    table: string,
    column: string,
    value?: string
}

export function Table({ data, table, column, value }: TableProps) {
    if (!data || data.length === 0) {
        return <Text textStyle='Body' colorStyle='Secondary'>Sin datos.</Text>
    }

    const backgroundColorHeader = Colors[colorScheme ?? 'light'].gray6
    const borderColor = Colors[colorScheme ?? 'light'].separatorNonOpaque
    const backgroundColor = Colors[colorScheme ?? 'light'].backgroundSecondary

    const [sortedColumn, setSortedColumn] = useState<string | null>(null)
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

    const toggleSortOrder = () => {
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    }

    const sortData = (column: string) => {
        if (sortedColumn === column) {
            toggleSortOrder()
        } else {
            setSortedColumn(column)
            setSortOrder('asc')
        }
    }

    const sortedData = sortedColumn ? [...data].sort((a, b) => {
        if (a[sortedColumn] < b[sortedColumn]) return sortOrder === 'asc' ? -1 : 1
        if (a[sortedColumn] > b[sortedColumn]) return sortOrder === 'asc' ? 1 : -1
        return 0
    }) : data

    const columns = Object.keys(sortedData[0])

    const exceptionCount = sortedData.filter(row => row.exception === true).length
    const exceptionPercentage = parseInt((exceptionCount / sortedData.length * 100).toFixed(2), 10)

    const impactColor = exceptionPercentage < 1 ? 'Tint' : exceptionPercentage < 5 ? 'Yellow' : exceptionPercentage < 10 ? 'Orange' : 'Red'
    const impactText = exceptionPercentage < 1 ? 'Bajo' : exceptionPercentage < 5 ? 'Moderado' : exceptionPercentage < 10 ? 'Alto' : 'Muy Alto'

    const exportTable = () => {
        try {
            const dataArray = sortedData.map(item => columns.map(column => item[column]))
            dataArray.unshift(columns)

            const worksheet = XLSX.utils.aoa_to_sheet(dataArray, {origin: 'A4'})
            worksheet['A1'] = {v: 'Tabla', t: 's'}
            worksheet['A2'] = {v: table, t: 's'}
            worksheet['B1'] = {v: 'Columna', t: 's'}
            worksheet['B2'] = {v: column, t: 's'}
            worksheet['C1'] = {v: 'Valor (opcional)', t: 's'}
            worksheet['C2'] = {v: value, t: 's'}
            worksheet['D1'] = {v: 'Excepciones', t: 's'}
            worksheet['D2'] = {v: exceptionCount, t: 's'}
            worksheet['E1'] = {v: 'Porcentaje (%)', t: 's'}
            worksheet['E2'] = {v: exceptionPercentage, t: 's'}
            worksheet['F1'] = {v: 'Impacto', t: 's'}
            worksheet['F2'] = {v: impactText, t: 's'}
            const workbook = XLSX.utils.book_new()
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte')
            const wbout = XLSX.write(workbook, { type: 'base64', bookType: 'xlsx' })
            const uri = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${wbout}`
            const fileName = 'table.xlsx'
            const link = document.createElement('a')
            link.href = uri
            link.download = fileName
            link.click()
        } catch (error) {
            Alert.alert('Error al exportar')
            alert('Error al exportar')
            console.log(error)
        }
    }

    return (
        <>
            <Text textStyle='Body' colorStyle={impactColor}>Impacto {impactText} ({exceptionPercentage}%) - Se encontraron {exceptionCount} excepciones</Text>
            <Button label='Exportar' action={() => exportTable()} />
            <ScrollView>
                <View style={[{ backgroundColor }, styles.table]}>
                    <View style={[{ backgroundColor: backgroundColorHeader }, styles.tableHeader]}>
                        {columns.map((column, index) => (

                            <Pressable key={index} style={styles.columnHeader} onPress={() => sortData(column)}>
                                <Text textStyle='Subheadline' colorStyle='Tint'>{column}</Text>
                                { sortedColumn === column && <Text textStyle='Subheadline' colorStyle='Secondary'>{sortOrder === 'asc' ? '↑' : '↓'}</Text> }
                            </Pressable>

                        ))}
                    </View>
                    {sortedData.map((row, rowIndex) => (
                        <View key={rowIndex} style={[{ borderColor }, styles.tableRow]}>
                            {columns.map((column, colIndex) => (
                                <View key={colIndex} style={styles.tableCell}>
                                    <Text textStyle='Footnote' colorStyle={row[column] === true ? 'Red' : 'Primary'}>{typeof row[column] === 'boolean' ? row[column].toString() : row[column]}</Text>
                                </View>
                            ))}
                        </View>
                    ))}
                </View>
            </ScrollView>
        </>
    )
}

const styles = StyleSheet.create({
    table: {
        flex: 1,
        flexDirection: 'column'
    },
    tableHeader: {
        flexDirection: 'row',
    },
    columnHeader: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 10,
        textAlign: 'center'
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1
    },
    tableCell: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 10,
        textAlign: 'center'
    }
})