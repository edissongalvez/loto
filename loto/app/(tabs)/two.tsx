import { useEffect, useState } from 'react'
import { StyleSheet } from 'react-native'

import { View } from '@/components/Themed'
import { Text } from '@/components/StyledText'
import DatabaseController, { Table } from '@/controllers/database'
import { useDatabase } from '@/context/DatabaseContext'
import { Picker } from '@/components/StyledPicker'
import { Button } from '@/components/StyledButton'

export default function TabTwoScreen() {
  const { database, setDatabase } = useDatabase()
  const [tables, setTables] = useState<Table[]>([])
  const [selectedTable, setSelectedTable] = useState<string>('')
  const [selectedColumn, setSelectedColumn] = useState<string>('')
  const [result, setResult] = useState<string[]>()

  useEffect(() => {
    database && DatabaseController.getTables(database.dbType).then(tables => setTables(tables))
  }, [database])

  const handleTableChange = (itemValue: string) => {
    setSelectedTable(itemValue)
    setSelectedColumn('')
  }

  const handleColumnChange = (itemValue: string) => {
    setSelectedColumn(itemValue)
  }

  const identifyExceptions = async (dbType: string, table: string, column: string) => {
    DatabaseController.sequentialRecords(dbType, table, column).then(result => setResult(result))
  }

  return (
    <View style={styles.container}>
      <Text textStyle='Title1' colorStyle='Primary'>Registros secuenciales</Text>
      { database ? (
        <>
          <Text textStyle='Body' colorStyle='Primary'>Seleccionar tabla</Text>
          { tables && <Picker items={tables} label='table' value='table' selectedValue={selectedTable} onValueChange={handleTableChange} /> }
          { selectedTable && <>
            <Text textStyle='Body' colorStyle='Primary'>Seleccionar columna</Text>
            <Picker 
              items={tables.find(table => table.table === selectedTable)?.columns ?? []} 
              label='Field' 
              value='Field' 
              selectedValue={selectedColumn} 
              onValueChange={handleColumnChange} 
            />
            <Button label='Ejecutar' action={() => identifyExceptions(database.dbType, selectedTable, selectedColumn)} />
          </>
          }
        </>
      ) : <Text textStyle='Body' colorStyle='Secondary'>Para iniciar, conecte una base de datos.</Text> }
      { result && <Text textStyle='Body' colorStyle='Secondary'>{ JSON.stringify(result) }</Text> }
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  }
})
