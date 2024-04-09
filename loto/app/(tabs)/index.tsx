import { StyleSheet } from 'react-native'

import { View } from '@/components/Themed'
import { Text } from '@/components/StyledText'
import { useDatabase } from '@/context/DatabaseContext'
import { useEffect, useState } from 'react'
import DatabaseController, { Table } from '@/controllers/database'

export default function TabOneScreen() {
  const { database, setDatabase } = useDatabase()
  const [tables, setTables] = useState<Table[]>()

  useEffect(() => {
    // database && DatabaseController.getTables(database?.dbType).then(tables => setTables(tables))
  }, [database])

  return (
    <View style={styles.container}>
      { database ? <Text textStyle='XLTitle1' colorStyle='Primary'>{database.name}</Text> : <Text textStyle='Body' colorStyle='Secondary'>Para iniciar, conecte una base de datos.</Text> }
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
