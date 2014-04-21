var fs = require('fs.extra')
,   crypto = require('crypto');


/**
 * Creates and initializes a Collection object
 *
 * @constructor
 * @param {String} path The path of the parenting databasefolder
 * @param {String} name The collection's name
 * @param {Bool} debug Controls if debuggin consolelog is enabled
 */
var Collection = function(path, name, debug){
    this._name = name;
    this._path = path + '/' + name + '/';
    this._debug = debug;
    this.init();
}

/**
 * Initialize the collection - basically this means a folder with the 
 * collectionname will be created in the database directory.
 *
 */
Collection.prototype.init = function() {
    var self = this;
    self.log("Initializing Collection " + self._name + "...");

    //Check if folder for collection exists...if not create it
    var dbexists = fs.existsSync(self._path);
    if(!dbexists){
        self.log("Parenting collection directory doesn't exist yet. It will be created...");
        fs.mkdirSync(self._path);
    }
};


/**
 * Saves an object to the json file matching its id. If the object has no id yet,
 * an id will be generated first.
 * @param  {JSON-Object}  obj The Object to write. Has to be correct JSON!
 * @param  {Function} callback The function that is called when the object is written
 */
Collection.prototype.save = function(obj, callback) {
    var self = this;
    self.log("Collection.save(" + self._name + ")");

    //The object doesn't have an id yet, create one before saving
    if(!obj._id){
        var current_date = (new Date()).valueOf().toString();
        var random = Math.random().toString();
        obj._id = crypto.createHash('sha1').update(current_date + random).digest('hex');
    }
    fs.writeFile(self._path + '/' + obj._id + '.json', JSON.stringify(obj, null, 4), function(err){
        callback(err,obj);
    });
};


/**
 * Finds the first entry matching the query properties. If no entries match, returns null.
 * Because records are processed synchronous, searching by other than _id can be slow.
 * @param  {Object}   query The query object containing the matching conditions
 * @param  {Function} callback The function to call when finished searching 
 */
Collection.prototype.findOne = function(query,callback) {
    var self = this;
    self.log("Collection.findOne(" + self._name + ")");
    //Search by id - phew, no real searching
    if(query._id){
        fs.readFile(self._path + '/' + query._id + '.json',function(err,data){
            if(err || !data){
                callback(err,null);
            }else{
                var result = JSON.parse(data);
                callback(null,result);
            }
        });
    }else{
        //Search by property: Traverse all entries and return the first found entry matching all conditions
        fs.readdir(self._path,function(err,files){
            if(err || !files){
                callback(err,null);
            }else{
                for (var i = files.length - 1; i >= 0; i--) {
                    var item = files[i];
                    //Only process .json files - stupid dotfiles...
                    if(item.split('.').pop() === 'json'){
                        var data = fs.readFileSync(self._path + '/' + item);
                        var obj = JSON.parse(data);
                        var matching = true;
                        /*Check for property matching: 
                          Test every key in the query for existance and equality in the object.
                          Return the first object matching.
                        */
                        for (var key in query) {
                            if(obj[key]){
                                if(query[key] != obj[key]){
                                    matching = false;
                                    break;
                                }    
                            }else{
                                matching = false;
                            }
                        }
                        if(matching) {
                            return callback(null, obj);
                        }
                    }
                };
                callback("No Object found",null);
            }
        });
    }
};

/**
 * Finds all Entries matching the query properties. If no entries match, returns an empty array.
 * Because records are processed synchronous, this method can be very(!) slow
 * @param  {Object}   query The query object containing all matching conditions
 * @param  {Function} callback The function that gets called when all matching entries are found
 * @return {[Object]}
 */
Collection.prototype.find = function(query, callback) {
    var self = this;
    self.log("Collection.find(" + self._name + ")");
    
    //ID is index, no multiple documents possible
    if(query._id){
        return self.findOne(query,function(err,result){
            if(err || !result){
                return callback(err,[]);    
            }else{
                return callback(null,[result]);
            }
        });
    }

    var result = [];
    fs.readdir(self._path, function(err, files){
        if(err || !files){
            callback(err, []);
        }else{
            for (var i = files.length - 1; i >= 0; i--) {
                var item = files[i];
                //Only process .json files - stupid dotfiles...
                if(item.split('.').pop() === 'json'){
                    var data = fs.readFileSync(self._path + '/' + item);
                    var obj = JSON.parse(data);
                    var matching = true;
                    /*Check for property matching: 
                      Test every key in the query for existance and equality in the object.
                      Return the first object matching.
                    */
                    for (var key in query) {
                        if(obj[key]){
                            if(query[key] != obj[key]){
                                matching = false;
                                break;
                            }    
                        }else{
                            matching = false;
                        }
                    }
                    if(matching) {
                        result.push(obj);
                    }
                }
            }
            return callback(null,result);
        }
    });
};

/**
 * Updates the record with the given id. If the records doesn't have the property yet
 * it will be created
 * @param  {ObjectID}  id The entries id
 * @param  {Object}   prop Object containing all new or to update properties and values
 * @param  {Function} callback Function that is called when the record was updated
 */
Collection.prototype.update = function(id,prop,callback) {
    var self = this;
    self.log("Collection.update(" + self._name + "): " + id);

    self.findOne({"_id":id},function(err,rec){
        if(err || !rec){
            callback(err, null);
        }else{
            for (key in prop){
                rec[key] = prop[key];
            }
            self.save(rec, callback)
        }
    });
};


/**
 * Deletes all documents matching the query conditionals.
 * @param  {[type]}   query Contains all conditions that have to be fulfilled
 * @param  {Function} callback The function that is called after all records are deleted
 * @return {Integer} the number of deleted objects
 */
Collection.prototype.delete = function(query,callback) {
    var self = this;
    //Easy - only delete a specific record
    if(query._id){
        deleteRecord(query._id,callback);
    }else{
        var deletedElements = 0;
        self.find(query,function(err,results){
            for (var i = results.length - 1; i >= 0; i--) {
                deleteRecord(results[i]._id,function(err, num){
                    if(err) self.log(err);
                    deletedElements += num;
                });
            };
            callback(err,results.length);
        });
    }

    function deleteRecord(id,callback){
        var err = fs.unlinkSync(self._path + '/' + id + '.json');
        if(err) callback(err,0)
        else callback(null,1);
    }
};


/**
 * Print console log if debug mode is enabled
 *
 * @param {String} text The output text
 */
Collection.prototype.log = function(text) {
    var self = this;
    if(self._debug) console.log(text);
};

module.exports = Collection;