const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const routerAuth = require('./routes/auth')
const routerUser = require('./routes/user')

const app = express()
const port =8080

const db = require("./config/db");
db.connect();

app.use(
    express.urlencoded({
      extended: true,
    })
);
app.use(express.json())
app.use(cors())
app.use(morgan('combined'))

app.use('/v1/auth' , routerAuth)
app.use('/v1/user' , routerUser)


app.listen(port, () => console.log('============= port',port))

// Authentication => xác thực so sánh dữ liệu mình nhập với database đang có 
// Authorization => phân quyền 

// JWT : như là 1 cccd để nhận diện user 