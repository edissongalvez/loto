import express, { Request, Response } from 'express'
import mysql, { Connection } from 'mysql'
import sql, { ConnectionPool, Request as SqlRequest } from 'mssql'

const app = express()

const mysqlConfig = {
    host: 'localhost',
    user: '', // Agregar usuario (MySQL)
    password: '', // Agregar contraseña (MySQL)
}

const sqlConfig = {
    server: '', // Agregar servidor (SQL Server)
    authentication: {
        type: 'default',
        options: {
            userName: '', // Agregar usuario (SQL Server)
            password: '' // Agregar contraseña (SQL Server)
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
    try {
        const mysqlConnection: Connection = mysql.createConnection(mysqlConfig)
        mysqlConnection.connect()

        mysqlConnection.query('SHOW DATABASES', (error, results) => {
            if (error) {
                res.status(500).json({ error: error.message })
                return
            }
            const mysqlDatabases: string[] = results.map((result: any) => result.Database)

            const sqlPool = new sql.ConnectionPool(sqlConfig)
            sqlPool.connect().then(() => {
                const request: SqlRequest = new sql.Request(sqlPool)

                request.query('SELECT name FROM sys.databases').then((result) => {
                    const sqlServerDatabases: string[] = result?.recordset.map((db: any) => db.name) || []

                    sqlPool.close()
                    mysqlConnection.end()

                    res.json({
                        mysql: mysqlDatabases,
                        sqlServer: sqlServerDatabases,
                    })
                }).catch((err) => {
                    res.status(500).json({ error: err.message })
                })
            }).catch((err) => {
                res.status(500).json({ error: err.message })
            })
        })
    } catch (error: any) {
        res.status(500).json({ error: error.message })
    }
})

const PORT: number = 8082
app.listen(PORT, () => {
    console.log(`🚀 Loto S en el puerto ${PORT}`)
})