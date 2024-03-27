const express = require('express');
const app = express();

const mysql = require('mysql');
let connection = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:null,
    database:'bakalauras',
});

connection.connect(function(err) {
    if(err){
        console.log(err.code);
        console.log(err.fatal);
    }
});

$query = "Select * FROM test";


// connection.end(function(){
//     console.log("Connection ended");
// })


app.get("/api", (req, res) => {
    connection.query($query, function(err, rows) {
        if(err){
            console.log("An error occured with the query");
            return;
        }
        res.json({"data" : rows});
    });
})

app.listen(5000,() => {console.log("Server started on port 5000")});