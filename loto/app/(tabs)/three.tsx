import { StyleSheet } from 'react-native'

import { View } from '@/components/Themed'
import { Text } from '@/components/StyledText'
import { useDatabase } from '@/context/DatabaseContext'
import { useEffect, useState } from 'react'
import DatabaseController, { Row, Table } from '@/controllers/database'
import { Picker } from '@/components/StyledPicker'
import { Button } from '@/components/StyledButton'
import { TextField } from '@/components/StyledTextField'

import {Table as TableComponent} from '@/components/StyledTable'

export default function TabThreeScreen() {
  const { database, setDatabase, clearDatabase } = useDatabase()
  const [tables, setTables] = useState<Table[]>([])
  const [selectedTable, setSelectedTable] = useState<string>('')
  const [selectedColumn, setSelectedColumn] = useState<string>('')
  const [value, setValue] = useState<string>('')
  const [result, setResult] = useState<Row[]>()

  useEffect(() => {
    database && DatabaseController.getTables(database.dbType, database.user, database.password, database.host, database.port, database.name).then(tables => setTables(tables)).catch(AxiosError => clearDatabase())
  }, [database])

  const handleTableChange = (itemValue: string) => {
    setSelectedTable(itemValue)
    setSelectedColumn('')
  }

  const handleColumnChange = (itemValue: string) => {
    setSelectedColumn(itemValue)
  }

  const identifyExceptions = async (dbType: string, user: string, password: string, host: string, port: string, name: string, table: string, column: string, value: string) => {
    DatabaseController.fieldIntegrity(dbType, user, password, host, port, name, table, column, value).then(result => setResult(result)).catch(AxiosError => alert('Error al analizar'))
  }

  return (
    <View style={styles.container}>
      <Text textStyle='Title1' colorStyle='Primary'>Integridad de campos</Text>
      { database ? (
        <>
          <Text textStyle='Body' colorStyle='Secondary'>Verifica si los datos se encuentran dentro de los valores permitidos. Los datos que no se encuentran se marcarán en rojo.</Text>
          <Text textStyle='Body' colorStyle='Primary'>Seleccionar tabla</Text>
          { tables && <Picker items={tables} label='table' value='table' selectedValue={selectedTable} onValueChange={handleTableChange} /> }
          { selectedTable && 
            <>
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
          { selectedColumn && <TextField title='Valores' value='Inserte valores' change={text => setValue(text)}  /> }
          { value.length > 0 && <Button label='Ejecutar' action={() => identifyExceptions(database.dbType, database.user, database.password, database.host, database.port, database.name, selectedTable, selectedColumn, value)} /> }
        </>
      ) : <Text textStyle='Body' colorStyle='Secondary'>Para iniciar, conecte una base de datos.</Text> }
      { result && <TableComponent data={result} table={selectedTable} column={selectedColumn}  value={value} /> }
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8
  }
})