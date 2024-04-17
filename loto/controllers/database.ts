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

export interface Row {
    [key: string]: any
}

export default class DatabaseController {
    static async getDatabases(): Promise<Database[]> {
        const response = await axios.get<Database[]>(`${process.env.EXPO_PUBLIC_API_URL}/database`)
        return response.data
    }

    static async connectDatabase(user: string, password: string, host: string, port: string, name: string): Promise<Database> {
        const response = await axios.get<Database>(`${process.env.EXPO_PUBLIC_API_URL}/connect`, { params: { user, password, host, port, name } })
        return response.data
    }

    static async getTables(dbType: string, user: string, password: string, host: string, port: string, name: string): Promise<Table[]> {
        const response = await axios.get<Table[]>(`${process.env.EXPO_PUBLIC_API_URL}/table`, { params: { dbType, user, password, host, port, name } })
        return response.data
    }

    static async sequentialRecords(dbType: string, user: string, password: string, host: string, port: string, name: string, table: string, idColumn: string): Promise<Row[]> {
        const response = await axios.get<Row[]>(`${process.env.EXPO_PUBLIC_API_URL}/sequentialRecords`, { params: { dbType, user, password, host, port, name, table, idColumn } })
        return response.data
    }

    static async fieldIntegrity(dbType: string, user: string, password: string, host: string, port: string, name: string, table: string, column: string, value: string): Promise<Row[]> {
        const response = await axios.get<Row[]>(`${process.env.EXPO_PUBLIC_API_URL}/fieldIntegrity`, { params: { dbType, user, password, host, port, name, table, column, value } })
        return response.data
    }

    static async tableIntegrity(dbType: string, user: string, password: string, host: string, port: string, name: string, table: string, column: string, value: string): Promise<Row[]> {
        const response = await axios.get<Row[]>(`${process.env.EXPO_PUBLIC_API_URL}/tableIntegrity`, { params: { dbType, user, password, host, port, name, table, column, value } })
        return response.data
    }

    static async anotherException(dbType: string, user: string, password: string, host: string, port: string, name: string, table: string, column: string): Promise<Row[]> {
        const response = await axios.get<Row[]>(`${process.env.EXPO_PUBLIC_API_URL}/anotherException`, { params: { dbType, user, password, host, port, name, table, column } })
        return response.data
    }

    static async SQLStatements(dbType: string, user: string, password: string, host: string, port: string, name: string, statement: string): Promise<Row[]> {
        const response = await axios.get<Row[]>(`${process.env.EXPO_PUBLIC_API_URL}/SQLStatements`, { params: { dbType, user, password, host, port, name, statement } })
        return response.data
    }
}