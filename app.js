/**
 * Here we are importing the `neo4j` object from the `neo4j-driver` dependency
 */
// tag::import[]
// Import the neo4j dependency from neo4j-driver
const neo4j = require('neo4j-driver')
// end::import[]

const express = require('express')
const app = express();
app.set('view engine', 'pug');

const path = require('path')

var plotly = require('plotly')("KGMenear", "E8pjs60UTYzCl0E4SJNG")
var cors = require('cors')

app.use(cors())

const username = 'neo4j'
const password = 'bSsQ-_vuA9R0Yc73QlVsjztvcAMHZHCLHFsCAe4YCxY'
const connectionString = 'neo4j+s://9c453c0d.databases.neo4j.io'
const driver = neo4j.driver(connectionString,
  neo4j.auth.basic(username, password))

app.use(express.static(path.join(__dirname, 'public')))

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'index.html'));
    console.log(path.join(__dirname, 'index.html'));
});
app.use('/src/:id', function (req, res) {
    res.sendFile(path.join(__dirname, '/src/' + req.params.id));
    console.log(path.join(__dirname, '/src/' + req.params.id));
});
app.use('/public/:id', function (req, res) {
    res.sendFile(path.join(__dirname, '/public/' + req.params.id));
    console.log(path.join(__dirname, '/public/' + req.params.id));
});
app.use('/read/:name/weight/:weight', function (req, res) {
    res.set('Access-Control-Allow-Origin', '*');
    var dbs = new DBService(driver);
    const input = [req.params.name,req.params.weight]
    dbs.markers_and_lines(input).then(function(result) {
      try{
        const relationships = []
        const node_vectors = {}
        var identity = result['records'][0]['_fields'][0]['identity']['low']
        var x = result['records'][0]['_fields'][0]['properties']['x']
        var y = result['records'][0]['_fields'][0]['properties']['y']
        var z = result['records'][0]['_fields'][0]['properties']['z']
        var name = result['records'][0]['_fields'][0]['properties']['name']
        node_vectors[identity] = {x:x, y:y, z:z, name:name}
        for (rec of result['records']){
          relationships.push(rec['_fields'][1])
          relationships.push(rec['_fields'][3])
          relationships.push(rec['_fields'][5])
          identity = rec['_fields'][2]['identity']['low']
          x = rec['_fields'][2]['properties']['x']
          y = rec['_fields'][2]['properties']['y']
          z = rec['_fields'][2]['properties']['z']
          name = rec['_fields'][2]['properties']['name']
          node_vectors[identity] = {x:x, y:y, z:z, name:name}
          identity = rec['_fields'][4]['identity']['low']
          x = rec['_fields'][4]['properties']['x']
          y = rec['_fields'][4]['properties']['y']
          z = rec['_fields'][4]['properties']['z']
          name = rec['_fields'][4]['properties']['name']
          node_vectors[identity] = {x:x, y:y, z:z, name:name}
        }

        start_node = []
        end_node = []
        for (rel of relationships){
          start_node.push([rel['start']['low'],rel['properties']['weight']])
          end_node.push(rel['end']['low'])
        }

        vector_traces = []
        start_node.forEach((start_elem, index) => {
          const start_vector = node_vectors[start_elem[0]]
          const end_vector = node_vectors[end_node[index]]
          const x_vec = [start_vector['x'],end_vector['x']]
          const y_vec = [start_vector['y'],end_vector['y']]
          const z_vec = [start_vector['z'],end_vector['z']]
          vector_traces.push({x:x_vec, y:y_vec, z:z_vec, weight:start_elem[1]})
        });

        data = []
        for (const trace of vector_traces){
          trace['mode'] = "lines"
          trace['type'] = "scatter3d"
          trace['line'] = {
            color: 'rgba(30, 50, 55, 0.4)',
            width: trace['weight']*1.25}
          data.push(trace)
        }

       const name_markers = []
       const x_markers = []
       const y_markers = []
       const z_markers = []
       for (const [n, vec] of Object.entries(node_vectors)) {
          name_markers.push(vec['name'])
          x_markers.push(vec['x'])
          y_markers.push(vec['y'])
          z_markers.push(vec['z'])
        }
        
        var trace_markers = {
          x:x_markers, 
          y:y_markers, 
          z:z_markers, 
          text:name_markers, 
          mode: "text+markers",
          marker: {
            color: "rgb(173, 217, 228)",
            size: 12,
            symbol: "circle",
            line: {
              color: "rgb(91, 151, 166)",
              width: 1
            },
            opacity: 0.9
          },
          type: "scatter3d"
        };
        data.push(trace_markers)

       res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate"); // HTTP 1.1.
       res.setHeader("Pragma", "no-cache"); // HTTP 1.0.
       res.setHeader("Expires", "0"); // Proxies.
       res.send(data)
      } catch(error){
        res.send(["error",req.params.name])
        console.log(error)
      }
    })
    
});
app.use('/images/:id', function (req, res) {
    res.sendFile(path.join(__dirname, '/images/' + req.params.id));
    console.log(path.join(__dirname, '/images/' + req.params.id));
});
app.listen(process.env.PORT || 4000, function () {
    console.log('Node app is working!');
});


class DBService {
  driver

  constructor(driver) {
    this.driver = driver
  }

  markers(id) {
    const session = this.driver.session()

    const res = session.readTransaction(tx => {
      console.log('Reading')
      return tx.run(
        `MATCH (n)--(k) WHERE n.name = $name
        RETURN k
        LIMIT 50`,{name: id} // <2>
      )
    })

    return res.then(function(result) {
     return result
    })
  }

  markers_and_lines(input) {
    // Open a new session
    const session = this.driver.session()
    console.log(input[0])
    console.log(input[1])

    const res = session.readTransaction(tx => {
      console.log('Reading')
      return tx.run(
        `MATCH (n)-[r]-(k)-[s]-(m)-[t]-(n) WHERE n.name = $name AND r.weight >= $weight AND s.weight >= $weight AND t.weight >= $weight
        RETURN n,r,k,s,m,t
        LIMIT 50`,{name: input[0], weight: parseInt(input[1])} // <2>
      )
    })

    return res.then(function(result) {
     //console.log(result['records']) // "Some User token"
     return result
    })
  }
  
}