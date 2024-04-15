import { Database } from '@/controllers/database'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { ReactNode, createContext, useContext, useEffect, useState } from 'react'

interface DatabaseContextProps {
    database: Database | null
    setDatabase: (database: Database) => void
    clearDatabase: () => void
}

interface DatabaseProviderProps {
    children: ReactNode
}

const DatabaseContext = createContext<DatabaseContextProps | undefined>(undefined)

export const DatabaseProvider = ({ children }: DatabaseProviderProps) => {
    const [database, setDatabase] = useState<Database | null>(null)

    const loadDatabase = async () => {
        try {
            const storedDatabase = await AsyncStorage.getItem('database')
            setDatabase(storedDatabase ? JSON.parse(storedDatabase) : null)
        } catch (error) {
            console.error('AsycStorage perdido', error)
        }
    }

    const saveDatabase = async () => {
        try {
            if (database) {
                await AsyncStorage.setItem('database', JSON.stringify(database))
            } else {
                await AsyncStorage.removeItem('database')
            }
        } catch (error) {
            console.error('Sin base de datos')
        }
    }

    const clearDatabase = async () => {
        try {
            await AsyncStorage.removeItem('database')
            setDatabase(null)
        } catch (error) {
            console.error('Error al limpiar la base de datos', error)
        }
    }

    useEffect(() => {
        loadDatabase()
    }, [])

    useEffect(() => {
        saveDatabase()
    }, [database])

    return (
        <DatabaseContext.Provider value={{ database, setDatabase, clearDatabase }}>
            {children}
        </DatabaseContext.Provider>
    )
}

export const useDatabase = () => {
    const context = useContext(DatabaseContext)
    if (!context) {
        throw new Error('Sin proveedor de base de datos')
    }
    return context
}