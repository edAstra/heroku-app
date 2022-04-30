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
app.use('/read/:id', function (req, res) {
    res.set('Access-Control-Allow-Origin', '*');
    var ms = new MyService(driver);
    console.log(path.join(__dirname, req.params.id));
    /*ms.method(req.params.id).then(function(result) {
     const name = []
     const x = []
     const y = []
     const z = []
     for (rec of result['records']){
        record = rec['_fields'][0]['properties']
        name.push(record['name'])
        x.push(record['x'])
        y.push(record['y'])
        z.push(record['z'])
      }
      var trace = {x:x, y:y, z:z, text:name, 
        mode: "text+lines+markers",
        marker: {
          color: "rgb(127, 127, 127)",
          size: 12,
          symbol: "circle",
          line: {
            color: "rgb(204, 204, 204)",
            width: 1
          },
          opacity: 0.9
        },
        type: "scatter3d"
      };
      var data = [trace];
      var layout = {margin: {
        l: 0,
        r: 0,
        b: 0,
        t: 0
      }};
      var graphOptions = {layout: layout, filename: "simple-3d-scatter", fileopt: "overwrite"};
      
      //plotly.plot(data, graphOptions, function (err, msg) {
      //  if (err) return console.log(err);
      //  console.log(msg);
      //});
     //console.log(name,x,y,z)
     res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate"); // HTTP 1.1.
     res.setHeader("Pragma", "no-cache"); // HTTP 1.0.
     res.setHeader("Expires", "0"); // Proxies.
     //res.render('index');
     res.send(trace)
    }*/

    ms.markers_and_lines(req.params.id).then(function(result) {
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

        
        //plotly.plot(data, graphOptions, function (err, msg) {
        //  if (err) return console.log(err);
        //  console.log(msg);
        //});
       //console.log(name,x,y,z)
       res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate"); // HTTP 1.1.
       res.setHeader("Pragma", "no-cache"); // HTTP 1.0.
       res.setHeader("Expires", "0"); // Proxies.
       //res.render('index');*/
       res.send(data)
      } catch(error){
        res.send(["error",req.params.id])
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


//How to make get request??
//Route request to read
//Return the results of the database query

/**
 * We may also need access to the session variable to set the default session mode
 * on the session object (session.READ or session.WRITE).
 * See #sessionWithArgs

// tag::importWithSession[]
import neo4j, { session } from 'neo4j-driver'
// end::importWithSession[]
*/

/**
 * Example Authentication token.
 *
 * You can use `neo4j.auth` to create a token.  A basic token accepts a
 * Username and Password
 */
//const username = 'neo4j'
//const password = 'bSsQ-_vuA9R0Yc73QlVsjztvcAMHZHCLHFsCAe4YCxY'
//const connectionString = 'neo4j+s://9c453c0d.databases.neo4j.io'

// tag::auth[]
neo4j.auth.basic(username, password)
// end::auth[]

/*
 * Here is the pseudocode for creating the Driver:

// tag::pseudo[]
const driver = neo4j.driver(
  connectionString, // <1>
  authenticationToken, // <2>
  configuration // <3>
)
// end::pseudo[]

The first argument is the connection string, it is constructed like so:

// tag::connection[]
  address of server
          ↓
neo4j://localhost:7687
  ↑                ↑
scheme        port number
// end::connection[]
*/

/**
 * The following code creates an instance of the Neo4j Driver
 */
// tag::driver[]
// Create a new Driver instance
//const driver = neo4j.driver(connectionString,
//  neo4j.auth.basic(username, password))
// end::driver[]


/**
 * It is considered best practise to inject an instance of the driver.
 * This way the object can be mocked within unit tests
 */
class MyService {
  driver

  constructor(driver) {
    this.driver = driver
  }

  method(id) {
    // tag::session[]
    // Open a new session
    const session = this.driver.session()
    // end::session[]

    const res = session.readTransaction(tx => {
      console.log('Reading')
      return tx.run(
        `MATCH (n)--(k) WHERE n.name = $name
        RETURN k
        LIMIT 50`,{name: id} // <2>
      )
    })

    return res.then(function(result) {
     //console.log(result['records']) // "Some User token"
     return result
    })
    //console.log(res)

    //return res.records
    // Do something with the session...

    // Close the session
    //session.close()
  }

  markers_and_lines(id) {
    // tag::session[]
    // Open a new session
    const session = this.driver.session()
    // end::session[]

    const res = session.readTransaction(tx => {
      console.log('Reading')
      return tx.run(
        `MATCH (n)-[r]-(k)-[s]-(m)-[t]-(n) WHERE n.name = $name AND r.weight > 3 AND s.weight > 3 AND t.weight > 3
        RETURN n,r,k,s,m,t
        LIMIT 50`,{name: id} // <2>
      )
    })

    return res.then(function(result) {
     //console.log(result['records']) // "Some User token"
     return result
    })
    //console.log(res)

    //return res.records
    // Do something with the session...

    // Close the session
    //session.close()
  }
  
}

/**
 * These functions are wrapped in an `async` function so that we can use the await
 * keyword rather than the Promise API.
 */
const main = async () => {
  // tag::verifyConnectivity[]
  // Verify the connection details
  await driver.verifyConnectivity()
  // end::verifyConnectivity[]

  console.log('Connection verified!')

  // tag::driver.session[]
  // Open a new session
  const session = driver.session()
  // end::driver.session[]

  // Run a query

  const res = await session.readTransaction(tx => {
    return tx.run(
      `MATCH (n)
      RETURN n.name AS name
      LIMIT 10` // <2>
    )
  })

  

  console.log(res['records'])

  for (const Record of res['records']){
    console.log(Record['_fields'][0])
  }

  //const query = 'MATCH (n) RETURN n.name LIMIT 10'
  //const params = {}

  // tag::session.run[]
  // Run a query in an auto-commit transaction
  //const res = await session.run(query, params)
  // end::session.run[]

  // tag::session.close[]
  // Close the session
  //await session.close()
  // end::session.close[]

}



const readTransaction = async () => {
  const session = this.driver.session()

  // tag::session.readTransaction[]
  // Run a query within a Read Transaction
  const res = await session.readTransaction(tx => {
    return tx.run(
      `MATCH (p:Person)-[:ACTED_IN]->(m:Movie)
      WHERE m.title = $title // <1>
      RETURN p.name AS name
      LIMIT 10`,
      { title: 'Arthur' } // <2>
    )
  })
  // end::session.readTransaction[]

  await session.close()
}



const writeTransaction = async () => {
  const session = this.driver.session()

  // tag::session.writeTransaction[]
  const res = await session.writeTransaction(tx => {
    return tx.run(
      'CREATE (p:Person {name: $name})',
      { name: 'Michael' }
    )
  })
  // end::session.writeTransaction[]

  await session.close()
}


/**
 * This is an example function that will create a new Person node within
 * a read transaction and return the properties for the node.
 *
 * @param {string} name
 * @return {Record<string, any>}  The properties for the node
 */
// tag::createPerson[]
async function createPerson(name) {
  // tag::sessionWithArgs[]
  // Create a Session for the `people` database
  const session = driver.session({
    // Run sessions in WRITE mode by default
    defaultAccessMode: session.WRITE,
    // Run all queries against the `people` database
    database: 'people',
  })
  // end::sessionWithArgs[]

  // Create a node within a write transaction
  const res = await session.writeTransaction(tx => {
    return tx.run('CREATE (p:Person {name: $name}) RETURN p', { name })
  })

  // Get the `p` value from the first record
  const p = res.records[0].get('p')

  // Close the sesssion
  await session.close()

  // Return the properties of the node
  return p.properties
}
// end::createPerson[]

// Run the main method above
main()