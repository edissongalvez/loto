import { useEffect, useState } from 'react'
import { StatusBar } from 'expo-status-bar'
import { Alert, FlatList, Image, Platform, Pressable, StyleSheet, useColorScheme, View } from 'react-native'

import { MaterialCommunityIcons } from '@expo/vector-icons'
import { Text } from '@/components/StyledText'
import Colors from '@/constants/Colors'

import DatabaseController, { Database } from '@/controllers/database'
import { router } from 'expo-router'
import { Button } from '@/components/StyledButton'
import { useDatabase } from '@/context/DatabaseContext'
import { AxiosError } from 'axios'

export default function ModalScreen() {
  const { database, setDatabase } = useDatabase()

  const [databases, setDatabases] = useState<Database[]>([])

  useEffect(() => {
    DatabaseController.getDatabases().then(databases => setDatabases(databases)).catch((error: AxiosError) => Alert.alert('Sin conexión'))
  }, [])

  const connectDatabase = async (user: string, password: string, host: string, port: string, name: string) => {
    DatabaseController.connectDatabase(user, password, host, port, name).then(database => setDatabase(database))
    router.replace('/')
  }

  return (
    <View style={styles.container}>
      <View style={{ alignItems: 'center' }}>
        <MaterialCommunityIcons name='database-outline' size={96} color={Colors[useColorScheme() ?? 'light'].tint} />
        <Text textStyle='Title1' colorStyle='Primary'>Conectar base de datos</Text>
        <Text textStyle='Body' colorStyle='Secondary'>Seleccione una base de datos para conectarse o ingrese la cadena de conexión si no está en la lista.</Text>
      </View>

      { databases && databases.length > 0 ? <FlatList data={Object.values(databases)} keyExtractor={(item, index) => index.toString()} renderItem={({ item }) => (
        <Pressable onPress={() => connectDatabase(item.user, item.password, item.host, item.port, item.name)}>
          <View style={styles.item}>
            <Image source={item.dbType === 'MySQL' ? require(`@/assets/images/MySQL.webp`) : require(`@/assets/images/SQL Server.webp`)} style={styles.image} />
            <View style={styles.itemDescription}>
              <Text textStyle='Callout' colorStyle='Primary'>{item.dbType}</Text>
              <Text textStyle='Body' colorStyle='Primary'>{item.name}</Text>
            </View>
          </View>
        </Pressable>
      )} contentContainerStyle={{ gap: 16 }} showsVerticalScrollIndicator={false} /> 
      : <Text textStyle='Body' colorStyle='Primary'>Sin bases de datos</Text>}

      <Button label='Otra base de datos' action={() => router.push('/connectDatabase')} />

      {/* Use a light status bar on iOS to account for the black space above the modal */}
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 16
  },
  image: {
    height: 48,
    width: 48
  },
  list: {
    gap: 16
  },
  item: {
    flexDirection: 'row',
    gap: 16
  },
  itemDescription: {
    justifyContent: 'center'
  }
})
