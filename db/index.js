const mysql = require('mysql')

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'yl1223',
  database: 'transaction',
})
module.exports = db

