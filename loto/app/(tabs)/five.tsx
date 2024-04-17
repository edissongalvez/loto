import { StyleSheet } from 'react-native'

import { View } from '@/components/Themed'
import { Text } from '@/components/StyledText'
import { useDatabase } from '@/context/DatabaseContext'
import { useEffect, useState } from 'react'
import DatabaseController, { Row, Table } from '@/controllers/database'
import { AxiosError } from 'axios'
import { Picker } from '@/components/StyledPicker'
import { Button } from '@/components/StyledButton'
import {Table as TableComponent} from '@/components/StyledTable'

export default function TabFiveScreen() {
  const { database, setDatabase, clearDatabase } = useDatabase()
  const [tables, setTables] = useState<Table[]>([])
  const [selectedTable, setSelectedTable] = useState<string>('')
  const [selectedColumn, setSelectedColumn] = useState<string>('')
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

  const identifyExceptions = async (dbType: string, user: string, password: string, host: string, port: string, name: string, table: string, column: string) => {
    DatabaseController.anotherException(dbType, user, password, host, port, name, table, column).then(result => setResult(result)).catch(AxiosError => alert('Error al analizar'))
  }

  return (
    <View style={styles.container}>
      <Text textStyle='Title1' colorStyle='Primary'>Violaciones de unicidad</Text>
      { database ? (
        <>
          <Text textStyle='Body' colorStyle='Secondary'>Verifica si existen datos repetidos. Los datos que se repiten se marcarán en rojo.</Text>
          <Text textStyle='Body' colorStyle='Primary'>Seleccionar tabla</Text>
          { tables && <Picker items={tables} label='table' value='table' selectedValue={selectedTable} onValueChange={handleTableChange} /> }
          { selectedTable && <>
            <Text textStyle='Body' colorStyle='Primary'>Seleccionar columna</Text>
            <Picker items={tables.find(table => table.table == selectedTable)?.columns ?? []} label='Field' value='Field' selectedValue={selectedColumn} onValueChange={handleColumnChange} />
            { selectedColumn && <Button label='Ejecutar' action={() => identifyExceptions(database.dbType, database.user, database.password, database.host, database.port, database.name, selectedTable, selectedColumn)} /> }
          </> }
        </>
      ) : <Text textStyle='Body' colorStyle='Secondary'>Para iniciar, conecte una base de datos.</Text> }
      { result && <TableComponent data={result} table={selectedTable} column={selectedColumn} /> }
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