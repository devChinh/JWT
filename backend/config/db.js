const mongoose = require('mongoose')
const dotenv = require('dotenv')

dotenv.config()

async function connect() {
    try {
        await mongoose.connect( process.env.MONGO_URL ,{
            useNewUrlParser : true,
            useUnifiedTopology : true
        })
        console.log('============= success')
        
    } catch (error) {
        console.log('============= error',error)
    }
}

module.exports = {connect}