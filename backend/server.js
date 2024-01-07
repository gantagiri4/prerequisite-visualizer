const cors = require('cors');
const express = require('express');
const app = express();

const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: "req-visualizer-database",
  user: "GG",
  password: "prereqvisualizer123",
  database: "prerequisites"
});

connection.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

app.use(cors());

app.get('/', (req, res) => {
  res.send('Server is running. Use /courses to fetch data.');
});

app.get('/courses', (req, res) => {
  connection.query("SELECT * FROM `courses`;", (err, results, fields) => {
    if(err) console.log(err);
    res.send(results);
    console.log(results);
    connection.release();
  });
});

//app.get('/prereqs') <--- add this for the prereq table for the tree maybe??

let server = app.listen(5000, (err) => {
  if (err) throw err;
  console.log(`App listening on port 5000!`)
});