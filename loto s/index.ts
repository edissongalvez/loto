import dotenv from 'dotenv'
import cors from 'cors'
import express, { Request, Response } from 'express'
import mysql, { Connection, ConnectionConfig, MysqlError } from 'mysql'
import sql, { ConnectionPool, IResult, TYPES } from 'mssql'
import { register } from 'module'
import { resolve } from 'path'

dotenv.config()

const app = express()
app.use(cors())

let mysqlConfig: ConnectionConfig = {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
}

let sqlConfig = {
    server: process.env.SQLSERVER_HOST ?? '',
    authentication: {
        type: 'default',
        options: {
            userName: process.env.SQLSERVER_USERNAME,
            password: process.env.SQLSERVER_PASSWORD
        }
    },
    database: 'master',
    options: {
        encrypt: true,
        trustServerCertificate: true
    }
}

app.get('/', (req: Request, res: Response) => {
    res.send('Loto S')
})

app.get('/database', async (req: Request, res: Response) => {
    mysqlConfig = {
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USERNAME,
        password: process.env.MYSQL_PASSWORD,
    }
    
    sqlConfig = {
        server: process.env.SQLSERVER_HOST ?? '',
        authentication: {
            type: 'default',
            options: {
                userName: process.env.SQLSERVER_USERNAME,
                password: process.env.SQLSERVER_PASSWORD
            }
        },
        database: 'master',
        options: {
            encrypt: true,
            trustServerCertificate: true
        }
    }

    try {
        const mysqlConnection: Connection = mysql.createConnection(mysqlConfig)
        const sqlConnection: ConnectionPool = new sql.ConnectionPool(sqlConfig)

        const [mysqlResults, sqlResults] = await Promise.all([
            new Promise<string[]>((resolve, reject) => {
                mysqlConnection.connect(err => {
                    if (err) {
                        reject(err)
                        return
                    }

                    mysqlConnection.query('SHOW DATABASES', (error, results) => {
                        if (error) {
                            reject(error)
                        } else {
                            resolve(results.map((result: any) => result.Database))
                        }
                    })
                })
            }),
            new Promise<string[]>((resolve, reject) => {
                sqlConnection.connect().then(() => {
                    sqlConnection.query('SELECT name FROM sys.databases').then(result => {
                        resolve(result?.recordset.map((db: any) => db.name) || [])
                    }).catch(err => {
                        reject(err)
                    })
                }).catch(err => {
                    reject(err)
                })
            })
        ])

        res.json([
            ...mysqlResults.map(name => ({ dbType: 'MySQL', user: process.env.MYSQL_USERNAME, password: process.env.MYSQL_PASSWORD, host: process.env.MYSQL_HOST, port: '3306', name })),
            ...sqlResults.map(name => ({ dbType: 'SQL Server', user: process.env.SQLSERVER_USERNAME, password: process.env.SQLSERVER_PASSWORD, host: process.env.SQLSERVER_HOST, port: '1433', name }))
        ])

        mysqlConnection.end()   
        sqlConnection.close()
    } catch (error: any) {
        res.status(500).json({ error: error.message })
    }
})

app.get('/connect', async (req: Request, res: Response) => {
    const { user, password, host, port, name } = req.query as {
        user: string
        password: string
        host: string
        port: string
        name: string
    }

    if (!host || !user || !password || !name || !port) {
        return res.status(400).json({ error: 'Información incompleta', host, user, password, name, port })
    }

    mysqlConfig = {
        host,
        user,
        password,
        database: name,
        port: parseInt(port, 10)
    }

    sqlConfig = {
        server: host,
        authentication: {
            type: 'default',
            options: {
                userName: user,
                password: password
            }
        },
        database: name,
        options: {
            encrypt: true,
            trustServerCertificate: true
        }
    }

    try {
        const mysqlConnection: Connection = mysql.createConnection(mysqlConfig)
        await new Promise<void>((resolve, reject) => {
            mysqlConnection.connect((err) => {
                if (err) {
                    reject(err)
                } else {
                    resolve()
                }
            })
        })

        res.json({
            dbType: 'MySQL',
            user,
            password,
            host,
            port,
            name
        })

        console.log('Conectado a MySQL')

        await mysqlConnection.end()
    } catch (mysqlError: any) {
        console.error('Error al conectar a MySQL', mysqlError.message)

        try {
            const sqlConnection: ConnectionPool = await sql.connect(sqlConfig)

            res.json({
                dbType: 'SQL Server',
                user,
                password,
                host,
                port,
                name
            })

            console.log('Conectado a SQL Server')

            await sqlConnection.close()
        } catch (sqlError: any) {
            console.error('Error al conectar a SQL Server', sqlError.message)
            return res.status(500).json({ error: 'Error al conectar a la base de datos' })
        }
    }
})

app.get('/table', async (req: Request, res: Response) => {
    const { dbType, user, password, host, port, name } = req.query as { 
        dbType: string
        user: string
        password: string
        host: string
        port: string
        name: string
    }

    if (!dbType || !user || !password || !host || !port  || !name) {
        return res.status(400).json({ error: 'Información incompleta' })
    }

    mysqlConfig = {
        host,
        user,
        password,
        database: name,
        port: parseInt(port, 10)
    }

    sqlConfig = {
        server: host,
        authentication: {
            type: 'default',
            options: {
                userName: user,
                password: password
            }
        },
        database: name,
        options: {
            encrypt: true,
           trustServerCertificate: true
        }
    }

    if (dbType === 'MySQL') {
        const mysqlConnection: Connection = mysql.createConnection(mysqlConfig)
        mysqlConnection.connect()

        mysqlConnection.query('SHOW TABLES', async (error: MysqlError | null, results: any) => {
            if (error) {
                console.error('Error al obtener tablas', error.message)
                return res.status(500).json({ error: 'Error al obtener tablas' })
            }

            const tables: string[] = results.map((table: any) => table[`Tables_in_${mysqlConnection.config.database}`])
            const tableInfoPromises: Promise<{ table: string, columns: any[] }>[] = tables.map((table: string) => {
                return new Promise((resolve, reject) => {
                    mysqlConnection.query(`SHOW COLUMNS FROM ${table}`, (error: MysqlError | null, columns: any[]) => {
                        if (error) return reject(error)
                        resolve({ table, columns })
                    })
                })
            })

            try {
                const tableInfo = await Promise.all(tableInfoPromises)
                res.json(tableInfo)
            } catch (error: any) {
                console.error('Error al obtener tablas', error.message)
            } finally {
                mysqlConnection.end()
            }
        })
    } else {
        const sqlConnection: ConnectionPool = new sql.ConnectionPool(sqlConfig)

        try {
            sqlConnection.connect().then(pool => {
                return pool.request().query("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'")
            }).then((result: any) => {
                const tables = result.recordset.map((row: any) => row.TABLE_NAME)
                const tableInfoPromises: Promise<{ table: string, columns: any[] }>[] = tables.map((table: string) => {
                    return new Promise(async (resolve, reject) => {
                        try {
                            const columnsResult = await sqlConnection.connect().then(
                                pool => { return pool.request().input('table', TYPES.NVarChar, table).query("SELECT DISTINCT COL.name AS 'Field', TYP.name AS 'Type', COL.is_nullable AS 'Null', CASE WHEN IND.is_primary_key = 1 THEN 'PRI' ELSE '' END AS 'Key', COL.default_object_id AS 'Default', '' AS 'Extra' FROM sys.columns COL INNER JOIN sys.tables TAB ON COL.object_id = TAB.object_id INNER JOIN sys.types TYP ON COL.user_type_id = TYP.user_type_id LEFT JOIN sys.index_columns IC ON IC.object_id = TAB.object_id AND IC.column_id = COL.column_id LEFT JOIN sys.indexes IND ON IC.object_id = IND.object_id AND IC.index_id = IND.index_id WHERE TAB.name = @table") }
                            )

                            const columns = columnsResult.recordset.map((row: any) => row)
                            resolve({ table, columns })
                        } catch (error) {
                            reject(error)
                        }
                    })
                })

                Promise.all(tableInfoPromises).then(tableInfo => {
                    res.json(tableInfo)
                })
            })            

        } catch (error: any) {
            console.error('Error al obtener tablas SQL Server', error.message)
            res.status(500).json({ error: 'Error al obtener tablas SQL Server' })
        } finally {
            try {
                if (sqlConnection.connected) {
                    await sqlConnection.close()
                }
            } catch (error: any) {
                console.error('Error al cerrar la conexión', error.message);
            }
        }   
    }  
})

app.get('/sequentialRecords', async (req: Request, res: Response) => {
    const { dbType, user, password, host, port, name, table, idColumn } = req.query as {
        dbType: string
        user: string
        password: string
        host: string
        port: string
        name: string
        table: string
        idColumn: string
    }

    if (!dbType || !user || !password || !host || !port  || !name || !table || !idColumn) {
        return res.status(400).json({ error: 'Información incompleta' })
    }

    mysqlConfig = {
        host,
        user,
        password,
        database: name,
        port: parseInt(port, 10)
    }

    sqlConfig = {
        server: host,
        authentication: {
            type: 'default',
            options: {
                userName: user,
                password: password
            }
        },
        database: name,
        options: {
            encrypt: true,
            trustServerCertificate: true
        }
    }


    try {
        let registers: any[] = []
        if (dbType === 'MySQL') {
            const mysqlConnection: Connection = mysql.createConnection(mysqlConfig)
            await mysqlConnection.connect()
            const result = await new Promise<any[]>((resolve, reject) => {
                mysqlConnection.query(`SELECT * FROM ${table} ORDER BY ${idColumn}`, (err, results) => {
                    if (err) {
                    reject(err)
                    return
                    }
                    resolve(results)
                })
            })
            registers = result
            await mysqlConnection.end()
        } else {
            const sqlConnection: ConnectionPool = new sql.ConnectionPool(sqlConfig)
            // await sqlConnection.connect()
            // const result = await sqlConnection.request().query(`SELECT * FROM ${table} ORDER BY ${idColumn}`)
            const result = await sqlConnection.connect().then(
                pool => { return pool.request().query(`SELECT * FROM ${table} ORDER BY ${idColumn}`) }
            )
            registers = await result.recordset.map(
                row => ({
                    ...row
                }))
            await sqlConnection.close()
        }

        const exceptions = []
        let expectedId = 1

        for (const register of registers) {
            const currentId = register[idColumn]
            const isException = currentId !== expectedId
            exceptions.push({ ...register, exception: isException, expectedId })
            expectedId++
        }

        return res.json(exceptions)
    } catch (error: any) {
        return res.status(500).json({ error: 'Error al buscar en la base de datos' , message: error })
    }
})

app.get('/fieldIntegrity', async (req: Request, res: Response) => {
    const { dbType, user, password, host, port, name, table, column, value } = req.query as {
        dbType: string
        user: string
        password: string
        host: string
        port: string
        name: string
        table: string
        column: string
        value: string
    }

    if (!dbType || !user || !password || !host || !port ||!name || !table || !column || !value) {
        return res.status(400).json({ error: 'Información incompleta' })
    }

    mysqlConfig = {
        host,
        user,
        password,
        database: name,
        port: parseInt(port, 10)
    }

    sqlConfig = {
        server: host,
        authentication: {
            type: 'default',
            options: {
                userName: user,
                password: password
            }
        },
        database: name,
        options: {
            encrypt: true,
            trustServerCertificate: true
        }
    }

    let valueArray = value.split(',').map((val: any) => val.trim())

    if (value.indexOf(',') === -1 && value.indexOf('-') !== -1) {
        const [start, end] = value.split('-').map((val: any) => parseInt(val.trim()))
        if (!isNaN(start) && !isNaN(end)) {
            valueArray = Array.from({ length: end - start + 1 }, (_, index) => start + index).map(String)
        }
    }

    // async function getRowsFromQuery(query: any): Promise<any[]> {
    //     const [rows] = await query;
    //     return rows;
    // }

    async function getRowsFromQueryAlt(query: any): Promise<any[]> {
        const result: sql.IResult<any> = await query;
        return result.recordset;
    }

    try {
        let rows: any[] = []
        if (dbType === 'MySQL') {
            const mysqlConnection: Connection = await mysql.createConnection(mysqlConfig)
            await mysqlConnection.connect()
            const result = await new Promise<any[]>((resolve, reject) => {
                mysqlConnection.query(`SELECT *, CASE WHEN ${column} IN (?) THEN false ELSE true END AS exception FROM ${table}`, [valueArray], (err, results) => {
                    if (err) {
                        reject(err)
                        return
                    }
                    resolve(results)
                })
            })
            rows = result.map(row => ({
                ...row,
                exception: Boolean(row.exception)
            }))
            await mysqlConnection.end()
        } else {
            const sqlConnection: ConnectionPool = new sql.ConnectionPool(sqlConfig)
            //await sqlConnection.connect()
            const result = await sqlConnection.connect().then(
                pool => { return pool.request().query(`SELECT * FROM ${table} WHERE ${column} IN (${[valueArray]})`) }
            )
            // const result = await sqlConnection.request().query(`SELECT * FROM ${table} WHERE ${column} IN (${[valueArray]})`)
            // rows = await getRowsFromQueryAlt(result)
            rows = await result.recordset.map(
                row => ({
                    ...row,
                    exception: Boolean(row.exception)
            }))
            await sqlConnection.close()
        }

        return res.json(rows)
    } catch (error) {
        return res.status(500).json({ error: 'Error al buscar en la base de datos' })
    }
})

app.get('/tableIntegrity', async (req: Request, res: Response) => {
    const { dbType, user, password, host, port, name, table, column, value } = req.query as {
        dbType: string
        user: string
        password: string
        host: string
        port: string
        name: string
        table: string
        column: string
        value: string
    }

    if (!dbType || !user || !password || !host || !port ||!name || !table || !column || !value) {
        return res.status(400).json({ error: 'Información incompleta' })
    }

    mysqlConfig = {
        host,
        user,
        password,
        database: name,
        port: parseInt(port, 10)
    }

    sqlConfig = {
        server: host,
        authentication: {
            type: 'default',
            options: {
                userName: user,
                password: password
            }
        },
        database: name,
        options: {
            encrypt: true,
            trustServerCertificate: true
        }
    }

    let regex = ''
    let regexalt = ''
    if (value.startsWith('-')) {
        regex = `^${value.slice(1)}.*$`
        regexalt = `${value.slice(1)}%`
    } else if (value.endsWith('-')) {
        regex = `.*${value.slice(0, -1)}$`
        regexalt = `%${value.slice(0, -1)}`
    } else {
        regex = `.*${value}.*`
        regexalt = `%${value}%`
    }

    async function getRowsFromQueryAlt(query: any): Promise<any[]> {
        const result: sql.IResult<any> = await query;
        return result.recordset;
    }

    try {
        let rows: any[] = []
        if (dbType === 'MySQL') {
            const mysqlConnection: Connection = await mysql.createConnection(mysqlConfig)
            await mysqlConnection.connect()
            const result = await new Promise<any[]>((resolve, reject) => {
                mysqlConnection.query(`SELECT *, ${column} REGEXP '${regex}' AS exception FROM ${table}`, (err, results) => {
                    if (err) {
                        reject(err)
                        return
                    }
                    resolve(results)
                })
            })
            rows = result.map(row => ({
                ...row,
                exception: Boolean(row.exception)
            }))
            await mysqlConnection.end()
        } else {
            const sqlConnection: ConnectionPool = new sql.ConnectionPool(sqlConfig)
            // await sqlConnection.connect()
            // const result = await sqlConnection.request().query(`SELECT *, CASE WHEN ${column} LIKE '${regexalt}' THEN 'false' ELSE 'true' END AS exception FROM ${table}`)
            const result = await sqlConnection.connect().then(
                pool => { return pool.request().query(`SELECT *, CASE WHEN ${column} LIKE '${regexalt}' THEN 'false' ELSE 'true' END AS exception FROM ${table}`) }
            )
            rows = await result.recordset.map(
                row => ({
                    ...row,
                    exception: Boolean(row.exception)
            }))
            await sqlConnection.close()
        }

        return res.json(rows)
    } catch (error) {
        return res.status(500).json({ error: 'Error al buscar en la base de datos' })
    }
})

app.get('/anotherException', async (req: Request, res: Response) => {
    const { dbType, user, password, host, port, name, table, column } = req.query as {
        dbType: string
        user: string
        password: string
        host: string
        port: string
        name: string
        table: string
        column: string
    }

    if (!dbType || !user || !password || !host || !port ||!name || !table || !column ) {
        return res.status(400).json({ error: 'Información incompleta' })
    }

    mysqlConfig = {
        host,
        user,
        password,
        database: name,
        port: parseInt(port, 10)
    }

    sqlConfig = {
        server: host,
        authentication: {
            type: 'default',
            options: {
                userName: user,
                password: password
            }
        },
        database: name,
        options: {
            encrypt: true,
            trustServerCertificate: true
        }
    }

    async function getRowsFromQueryAlt(query: any): Promise<any[]> {
        const result: sql.IResult<any> = await query;
        return result.recordset;
    }

    try {
        let rows: any[] = []
        if (dbType === 'MySQL') {
            const mysqlConnection: Connection = await mysql.createConnection(mysqlConfig)
            await mysqlConnection.connect()
            const result = await new Promise<any[]>((resolve, reject) => {
                mysqlConnection.query(`SELECT *, CASE WHEN ${column} IN (SELECT ${column} FROM ${table} GROUP BY ${column} HAVING COUNT(*) > 1) THEN true ELSE false END AS exception FROM ${table}`, (err, results) => {
                    if (err) {
                        reject(err)
                        return
                    }
                    resolve(results)
                })
            })
            rows = result.map(row => ({
                ...row,
                exception: Boolean(row.exception)
            }))
            await mysqlConnection.end()
        } else {
            const sqlConnection: ConnectionPool = new sql.ConnectionPool(sqlConfig)
            // await sqlConnection.connect()
            // const result = await sqlConnection.request().query(`SELECT *, CASE WHEN ${column} IN (SELECT ${column} FROM ${table} GROUP BY ${column} HAVING COUNT(*) > 1) THEN true ELSE false END AS exception FROM ${table}`)
            const result = await sqlConnection.connect().then(
                pool => { return pool.request().query(`SELECT *, CASE WHEN ${column} IN (SELECT ${column} FROM ${table} GROUP BY ${column} HAVING COUNT(*) > 1) THEN true ELSE false END AS exception FROM ${table}`) }
            )
            rows = await result.recordset.map(
                row => ({
                    ...row,
                    exception: Boolean(row.exception)
            }))
            await sqlConnection.close()
        }

        return res.json(rows)
    } catch (error) {
        return res.status(500).json({ error: 'Error al buscar en la base de datos' })
    }
})

app.get('/SQLStatements', async (req: Request, res: Response) => {
    const { dbType, user, password, host, port, name, statement } = req.query as {
        dbType: string
        user: string
        password: string
        host: string
        port: string
        name: string
        statement: string
    }

    if (!dbType || !user || !password || !host || !port ||!name || !statement ) {
        return res.status(400).json({ error: 'Información incompleta' })
    }

    mysqlConfig = {
        host,
        user,
        password,
        database: name,
        port: parseInt(port, 10)
    }

    sqlConfig = {
        server: host,
        authentication: {
            type: 'default',
            options: {
                userName: user,
                password: password
            }
        },
        database: name,
        options: {
            encrypt: true,
            trustServerCertificate: true
        }
    }

    if (!/^SELECT\b/i.test(statement)) {
        console.log('Consulta invalida:', statement)
        return res.status(400).json({ message: 'La consulta debe ser de tipo SELECT' })
    }

    try {
        let rows: any[] = []
        if (dbType === 'MySQL') {
            const mysqlConnection: Connection = await mysql.createConnection(mysqlConfig)
            await mysqlConnection.connect()
            const result = await new Promise<any[]>((resolve, reject) => {
                mysqlConnection.query(statement, (err, results) => {
                    if (err) {
                        reject(err)
                        return
                    }
                    resolve(results)
                })
            })
            rows = result.map(row => ({
                ...row,
                exception: Boolean(row.exception)
            }))
            await mysqlConnection.end()
        } else {
            const sqlConnection: ConnectionPool = new sql.ConnectionPool(sqlConfig)
            // await sqlConnection.connect()
            // const result = await sqlConnection.request().query(query)
            const result = await sqlConnection.connect().then(
                pool => { return pool.request().query(statement) }
            )
            rows = await result.recordset.map(
                row => ({
                    ...row,
                    exception: Boolean(row.exception)
            }))
            await sqlConnection.close()
        }

        return res.json(rows)
    } catch (error) {
        return res.status(500).json({ error: 'Error al consultar' })
    }
})

const PORT: number = 8082
app.listen(PORT, () => {
    console.log(`🚀 Loto S en el puerto ${PORT}`)
})