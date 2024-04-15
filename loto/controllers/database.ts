import axios from 'axios'

export interface Database {
    dbType: string
    user: string
    password: string
    host: string
    port: string
    name: string
}

export interface Table {
    table: string
    columns: Column[]
}

export interface Column {
    Field: string
    Type: string
    Null: string
    Key: string
    Default: string | null
    Extra: string
}

export default class DatabaseController {
    static async getDatabases(): Promise<Database[]> {
        const response = await axios.get<Database[]>(`${process.env.EXPO_PUBLIC_API_URL}/database`)
        return response.data
    }

    static async connectDatabase(user: string, password: string, host: string, port: string, name: string): Promise<Database> {
        const response = await axios.get<Database>(`${process.env.EXPO_PUBLIC_API_URL}/database/connect`, { params: { user, password, host, port, name } })
        return response.data
    }

    static async getTables(dbType: string): Promise<Table[]> {
        const response = await axios.get<Table[]>(`${process.env.EXPO_PUBLIC_API_URL}/database/table`, { params: { dbType } })
        return response.data
    }

    static async sequentialRecords(dbType: string, user: string, password: string, host: string, port: string, name: string, table: string, idColumn: string): Promise<string[]> {
        const response = await axios.get<string[]>(`${process.env.EXPO_PUBLIC_API_URL}/sequentialRecords`, { params: { dbType, user, password, host, port, name, table, idColumn } })
        return response.data
    }

    static async fieldIntegrity(dbType: string, user: string, password: string, host: string, port: string, name: string, table: string, column: string, value: string): Promise<string[]> {
        const response = await axios.get<string[]>(`${process.env.EXPO_PUBLIC_API_URL}/fieldIntegrity`, { params: { dbType, user, password, host, port, name, table, column, value } })
        return response.data
    }

    static async tableIntegrity(dbType: string, user: string, password: string, host: string, port: string, name: string, table: string, column: string, value: string): Promise<string[]> {
        const response = await axios.get<string[]>(`${process.env.EXPO_PUBLIC_API_URL}/tableIntegrity`, { params: { dbType, user, password, host, port, name, table, column, value } })
        return response.data
    }
}