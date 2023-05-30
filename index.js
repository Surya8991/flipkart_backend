const connectToMongo = require('./db');
const express = require('express')

connectToMongo();
const app = express()
const port = 5000
var cors = require('cors')
 
app.use(cors())
app.use(express.json())

// Available Routes
app.use('/api/auth', require('./Routes/auth'))


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})