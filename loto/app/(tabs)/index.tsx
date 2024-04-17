import { Text } from '@/components/StyledText'
import { useDatabase } from '@/context/DatabaseContext'
import { useEffect, useState } from 'react'
import { View, StyleSheet, ScrollView, FlatList } from 'react-native'
import DatabaseController, { Table } from '@/controllers/database'
import { AxiosError } from 'axios'

import Colors from '@/constants/Colors'
import { useColorScheme } from '@/components/useColorScheme'

export default function TabOneScreen() {
  const { database, setDatabase, clearDatabase } = useDatabase()
  const [tables, setTables] = useState<Table[]>()

  const colorScheme = useColorScheme()
  const backgroundColor = Colors[colorScheme ?? 'light'].gray6

  useEffect(() => {
    database && DatabaseController.getTables(database.dbType, database.user, database.password, database.host, database.port, database.name).then(tables => setTables(tables)).catch(AxiosError => clearDatabase())
  }, [database])

  return (
    <View style={styles.container}>
      { database ? <Text textStyle='XLTitle1' colorStyle='Primary'>{database.name}</Text> : <Text textStyle='Body' colorStyle='Secondary'>Para iniciar, conecte una base de datos.</Text> }
      { tables && <FlatList data={tables} renderItem={({ item }) => (
        <View key={item.table} style={[{ backgroundColor }, styles.item]}>
          <Text textStyle='Title1' colorStyle='Primary'>{item.table}</Text>
          { item.columns.map(column => (
            <View key={column.Field}>
              <Text textStyle='Body' colorStyle='Secondary'>{column.Field}</Text>
              <Text textStyle='Caption1' colorStyle='Tertiary'>{column.Type}</Text>
            </View>
          )) }
        </View>
      )} numColumns={3} showsVerticalScrollIndicator={false} /> }
      {/* { tables && <Text textStyle='Body' colorStyle='Tertiary'>{JSON.stringify(tables)}</Text> } */}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  item: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
  }
})
