import { StyleSheet } from 'react-native'

import { View } from '@/components/Themed'
import { Text } from '@/components/StyledText'
import { useDatabase } from '@/context/DatabaseContext'
import { useEffect, useState } from 'react'
import DatabaseController, { Table } from '@/controllers/database'
import { Picker } from '@/components/StyledPicker'
import { Button } from '@/components/StyledButton'
import { TextField } from '@/components/StyledTextField'

export default function TabThreeScreen() {
  const { database, setDatabase } = useDatabase()
  const [tables, setTables] = useState<Table[]>([])
  const [selectedTable, setSelectedTable] = useState<string>('')
  const [selectedColumn, setSelectedColumn] = useState<string>('')
  const [value, setValue] = useState<string>('')

  useEffect(() => {
    database && DatabaseController.getTables(database.dbType).then(tables => setTables(tables))
  }, [database])

  const handleTableChange = (itemValue: string) => {
    setSelectedTable(itemValue)
    console.log(itemValue)
    setSelectedColumn('')
  }

  const handleColumnChange = (itemValue: string) => {
    setSelectedColumn(itemValue)
    console.log(itemValue)
  }

  const identifyExceptions = async (dbType: string, table: string, column: string, value: string) => {
    DatabaseController.fieldIntegrity(dbType, table, column, value)
  }

  return (
    <View style={styles.container}>
      <Text textStyle='Title1' colorStyle='Primary'>Integridad de campos</Text>
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
            
          </>
          }
          { selectedColumn && <> <TextField title='Valores' value='Inserte valores' change={text => setValue(text)}  />
          <Button label='Ejecutar' action={() => identifyExceptions(database.dbType, selectedTable, selectedColumn, value)} /> </> }
        </>
      ) : <Text textStyle='Body' colorStyle='Secondary'>Para iniciar, conecte una base de datos.</Text> }
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