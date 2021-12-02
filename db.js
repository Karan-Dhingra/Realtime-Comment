// DB Connection
const dbConnection = () => {
    const mongoose = require('mongoose')
    const url = 'mongodb://localhost/comments'

    mongoose.connect(url);

    const connection = mongoose.connection.asPromise();
    if (connection) {
        console.log("Database connected");
    } else {
        console.log("Database not connected");
    }
}

module.exports = dbConnection;