import { Alert, StyleSheet } from 'react-native'

import { View } from '@/components/Themed'
import { Text } from '@/components/StyledText'
import { useDatabase } from '@/context/DatabaseContext'
import React, { useState } from 'react'
import DatabaseController, { Row } from '@/controllers/database'
import { TextField } from '@/components/StyledTextField'
import { Button } from '@/components/StyledButton'
import {Table as TableComponent} from '@/components/StyledTable'

export default function TabTwoScreen() {
  const { database, setDatabase, clearDatabase } = useDatabase()

  const [value, setValue] = useState<string>('')
  const [result, setResult] = useState<Row[]>()

  const consultation = async (dbType: string, user: string, password: string, host: string, port: string, name: string, query: string) => {
    
    if (value.toUpperCase().startsWith('SELECT')) {
      DatabaseController.SQLStatements(dbType, user, password, host, port, name, query).then(result => setResult(result)).catch(AxiosError => alert('Error al analizar'))
    } else {
      alert('Consulta no permitida')
      Alert.alert('Consulta no permitida')
    }
  }

  return (
    <View style={styles.container}>
      <Text textStyle='Title1' colorStyle='Primary'>Instrucciones SQL</Text>
      { database ? (
        <>
          <Text textStyle='Body' colorStyle='Secondary'>Solo se permiten sentencias de tipo SELECT. Otras sentencias no están permitidas.</Text>
          <TextField title='Consulta' value='Inserte consulta SELECT' change={text => setValue(text)} />
          { value && <Button label='Ejecutar' action={() => consultation(database.dbType, database.user, database.password, database.host, database.port, database.name, value)} /> } 
        </>
      ) : <Text textStyle='Body' colorStyle='Secondary'>Para iniciar, conecte una base de datos.</Text> }
      { result && <TableComponent data={result} table={'Tabla'} column={'Columna'} /> }
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