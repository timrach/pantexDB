#PantexDB

PantexDB is file-based database system for local [node-projects](http://nodejs.org) that need to save small amounts of data but don't want to include big database systems.

##Features
PantexDB tries to give the look and feel of mongoDB, therefore data is stored as JSON-Objects
in **Documents**. Documents belong to a **Collection** and Collections belong to a **Database**.

###Database
Databases can be created by requiring the PantexDB module and creating an instance of it.  
It is recommended not to use more than one database object (because it's not tested yet).
A database is initialized with the 'open()' method and can be deleted with the method 'delete()'.
Be careful when you delete a database, EVERYTHING in the database folder will be deleted.

```javascript
    var Pandex = require('pandexdb');
    //new Pandex(db_path,db_name,[collection_names])
    var db = new Pandex('./','Animals',['turtles','penguins']).open()
```

The module will automatically create all needed folders in the given directory.
The generated structure for the example above would be:
```
.
|-- db
    |-- Animals
        |-- penguins
        |-- turtles
```

###Collections
Collections are created automatically by the database and can be accessed from the databaseobject by their name. Operations on collections are:    
`findOne(query,callback)`   
`find(query,callback)`     
`save(obj,callback)`   
`update(id,props,callback)`   
`delete(query,callback)` 


See the Operations section below for detailed descriptions.


###Documents
Documents in a collections can have arbitrary form or fields but have to be valid JSON-Objects.
Documents are stored as files in their parenting collection folder with their id as filename.
A random id is generated autmatically when a document is saved for the first time, but you can generate your own ids if you insist. If you do, be sure to generate unique ids as they act as primary key.



```javascript
var Pandex = require('pandexdb');
//new Pandex(db_path,db_name,[collection_names])
var db = new Pandex('./','Animals',['turtles','penguins']).open()

var sea_turtle = {"name" : "Fred", "family" : "Cheloniidae"};
db.turtles.save(sea_turtle,function(err,obj){
    /*    obj: {_id: 45h2345k134h12349,
          family: "Cheoloniidae",
          name: "Fred" }   */
});
```

###Operations

The examples blow assume there is an existing database with a collection 'Turtles' with following documents:

```javascript
    {_id: "45h2345k134h12349", "name":"George", "family" : "Cheloniidae", "age" : 58}
    {_id: "45h234adsf134h123", "name":"John", "family" : "Cheloniidae", "age" : 40}
    {_id: "45h2345k134h12324", "name":"Paul", "family" : "Testudinidae", "age" : 71}
    {_id: "45h2345k134h12fff", "name":"Ringo", "family" : "Testudinidae", "age" : 73}
```


####db.collection.findOne(query,callback(err,result))
Finds the first documents in the collection matching to a set of attributes defined in the query object.
The query object can have zero,one or multiple attributes. 
If zero attributes are given `query = {}`, a random document will be selected.    
If multiple attributes are given, a document must have equal values for ALL keys to match.    
Searching by id `query = {_id:"someid_2334"}` is always faster than searching by other attributes.
```javascript
db.turtles.findOne({"name":"George"},function(err,result){
    /*    result: {_id: 45h2345k134h12349,
          family: "Cheoloniidae",
          age: 58,
          name: "George" }   */
});
```

###db.collection.find(query,callback(err,result))
Finds all documents in the collections that match the attributes defined in the query object.
The query object can have zero,one or multiple attributes. 
If zero attributes are given `query = {}`, all documents of the collection will be selected.
```javascript
db.turtles.find({"family":"Cheloniidae"},function(err,results){
    /*results: [{_id: 45h2345k134h12349, family: "Cheoloniidae", age: 58, name: "George" },
                {_id: 45h234adsf134h123, "name":"John", "family" : "Cheloniidae", "age" : 40}] */
});
```

###db.collection.save(obj,callback(err,obj))
Save a object as a document. If the object is already present in the collection by id,
the old record will be overwritten. If the object has no `_id` field, a unique id will
be generated.


###db.collection.update(id,attributes,callback(err,obj))
Updates the attributes of the document with given id.   
If the attributes are not present in the object yet they will be created.
If they already exist, the values to the keys will be updated.

```
db.turtles.update("45h2345k134h12349",{age: 59, beatle: true} function(err,obj){
    /*    obj: {_id: 45h2345k134h12349,
          age: 59,
          beatle: "true",
          family: "Cheoloniidae",
          name: "George" }   */
});
```

###db.collection.delete(query,callback(err,num))
Deletes all documents matching the attributes specified in the query object.
Returns the number of deleted documents

```
db.turtles.delete({family: "Testudinidae"},function(err,num){
    /* 2 Documents deleted (num = 2)  */
})
```


## License

(The MIT License)

Copyright (c) 2011-2014 Tim Rach <tim.rach91@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
