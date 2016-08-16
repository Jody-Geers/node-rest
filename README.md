# node-rest

  RESTful web service, talks to mysql, returns JSON.

  An example written in Node.js; because Javascript rocks!

  Extendable to suite your needs. Index.js acts as the router / server. From then on out, data hits controller, based off incoming specifications controller asks service for data interaction and the model representation is used and or returned to client.
  
  Note: I did not use HTTP delete - I update data and flag it as inactive as opposed to deleting it - Preference.<br/>
  Note: I did not use HTTP put - I update data using post - I read on a stackoverflow put can be cross browser naughty.
  
## Installation

  For now, 'git clone' this repo; npm install node-rest is coming.
  
  Install node_modules missing from repo with, 'npm install'.
  
  Make sure you have the test mysql db up and running, '.sql' found in ./test/
  
  Make sure you have set the config as per your environment, 'config.js' found in ./config/
  
  At root dir of cloned repo 'node index.js', to get it started.

## API

  http://localhost:8080/test.html - Will test if everything up and running your side. Will also remind you of the API.
  
  GET - all<br/>
  Should return array of items or empty array.<br/>
  http://localhost:8080/api/Car
  
  GET - by id<br/>
  Should return the object or empty object.<br/>
  http://localhost:8080/api/Car/1
  
  GET - by params<br/>
  Should return array of items or empty array.<br/>
  http://localhost:8080/api/Car?car_model=m3
  
  POST - update<br/>
  Should update item based off primary key - return update meta.<br/>
  http://localhost:8080/api/Car
  
  POST - insert<br/>
  Should insert item - return item as obj with its primary key.<br/>
  http://localhost:8080/api/Car

  
## License

  MIT

