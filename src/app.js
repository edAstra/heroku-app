/**
 * Here we are importing the `neo4j` object from the `neo4j-driver` dependency
 */
// tag::import[]
// Import the neo4j dependency from neo4j-driver
import neo4j from 'neo4j-driver'
// end::import[]

import express from 'express'
import path from 'path'
import {fileURLToPath} from 'url'

const username = 'blank'
const password = 'blank'
const connectionString = 'blank'
const driver = neo4j.driver(connectionString,
  neo4j.auth.basic(username, password))

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
var app = express();
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, '../index.html'));
    console.log(path.join(__dirname, '../index.html'));
});
app.use('/src/:id', function (req, res) {
    res.sendFile(path.join(__dirname, req.params.id));
    console.log(path.join(__dirname, req.params.id));
});
app.use('/read/:id', function (req, res) {
    var ms = new MyService(driver);
    console.log(path.join(__dirname, req.params.id));
    //console.log(ms.method())
    var happy = ms.method()
    console.log(happy)
    return happy.then(function(result) {
     console.log(result['records'])
     return result['records']
    })
});
app.listen(process.env.PORT || 4000, function () {
    console.log('Node app is working!');
});
