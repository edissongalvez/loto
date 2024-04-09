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
    columns: string[]
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

    static async sequentialRecords(dbType: string, table: string, idColumn: string): Promise<string[]> {
        const response = await axios.get<string[]>(`${process.env.EXPO_PUBLIC_API_URL}/database/table/sequentialRecords`, { params: { dbType, table, idColumn } })
        return response.data
    }

    static async fieldIntegrity(dbType: string, table: string, column: string, value: string): Promise<string[]> {
        const response = await axios.get<string[]>(`${process.env.EXPO_PUBLIC_API_URL}/database/table/fieldIntegrity`, { params: { dbType, table, column, value } })
        return response.data
    }
}