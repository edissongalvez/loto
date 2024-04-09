import { TextField } from '@/components/StyledTextField'
import { StatusBar } from 'expo-status-bar'
import { Platform, StyleSheet, View } from 'react-native'
import { Text } from '@/components/StyledText'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import Colors from '@/constants/Colors'
import { useColorScheme } from '@/components/useColorScheme'
import { Button } from '@/components/StyledButton'
import DatabaseController from '@/controllers/database'
import { useState } from 'react'
import { useDatabase } from '@/context/DatabaseContext'
import { router } from 'expo-router'

export default function ConnectDatabaseScreen() {
    const { database, setDatabase } = useDatabase()

    const [data, setData] = useState({
        user: '',
        password: '',
        host: '',
        port: '',
        database: ''
    })

    const connectDatabase = async (user: string, password: string, host: string, port: string, name: string) => {
        DatabaseController.connectDatabase(user, password, host, port, name).then(database => setDatabase(database))
        router.replace('/')
    }

    return (
        <View style={styles.container}>
            <View style={{ alignItems: 'center' }}>
                <MaterialCommunityIcons name='database-search-outline' size={96} color={Colors[useColorScheme() ?? 'light'].tint} />
                <Text textStyle='Title1' colorStyle='Primary'>Conectar otra base de datos</Text>
                <Text textStyle='Body' colorStyle='Secondary'>Ingrese la información necesaria para conectarse.</Text>
            </View>
            <View style={[{ backgroundColor: Colors[useColorScheme() ?? 'light'].background }, styles.groupedList]}>
                <TextField title='Usuario' value='Ingrese usuario' change={text => setData({ ...data, user: text })} />
                <TextField title='Contraseña' value='Ingrese contraseña' change={text => setData({ ...data, password: text })} />
                <TextField title='Anfitrión' value='Ingrese anfitrión' change={text => setData({ ...data, host: text })} />
                <TextField title='Puerto' value='Ingrese puerto' change={text => setData({ ...data, port: text })} />
                <TextField title='Base de datos' value='Ingrese base de datos' change={text => setData({ ...data, database: text })} />
            </View>
            <Button label='Conectar' action={() => connectDatabase(data.user, data.password, data.host, data.port, data.database)} /> 
            
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
    groupedList: {
        borderRadius: 10
    }
})