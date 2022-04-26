var neo4j = require('neo4j-driver');

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
const username = 'neo4j'
const password = 'bSsQ-_vuA9R0Yc73QlVsjztvcAMHZHCLHFsCAe4YCxY'
const connectionString = 'neo4j+s://9c453c0d.databases.neo4j.io'

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
const driver = neo4j.driver(connectionString,
  neo4j.auth.basic(username, password))
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

  method() {
    // tag::session[]
    // Open a new session
    const session = this.driver.session()
    // end::session[]

    // Do something with the session...

    // Close the session
    session.close()
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

  document.getElementById("query").innerHTML = "change it";

  //const query = 'MATCH (n) RETURN n.name LIMIT 10'
  //const params = {}

  // tag::session.run[]
  // Run a query in an auto-commit transaction
  //const res = await session.run(query, params)
  // end::session.run[]

  // tag::session.close[]
  // Close the session
  await session.close()
  // end::session.close[]

}

main()