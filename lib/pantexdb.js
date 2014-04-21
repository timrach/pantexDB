var Collection = require('./collection.js')
,   fs = require('fs.extra');


/**
 * Creates and initializes a Database object
 *
 * @constructor
 * @param {String} path The path to the databasefolder
 * @param {String} name The databases's name
 * @param {String} name The databases's name
 * @param {Bool} debug Controls if debuggin consolelog is enabled
 */
var Database = function(path,name,collections,debug){
    this._name = name;
    this._path = path + '/db/' + name;
    this._collections = collections;
    this._debug = debug || true;
    this.init();
}


/**
 * Initialize the Database
 * 
 */
Database.prototype.init = function() {
    var self = this;
    self.log("Initializing Database...");
    /* Check if the folderstructure for the database already exists.
        If not, create the folder tree:*/
    var dbexists = fs.existsSync(self._path);
    if(!dbexists){
        self.log("Database directory doesn't exist yet. It will be created...");
        fs.mkdirRecursiveSync(self._path);
    }

    self.createCollections();
};


/**
 * Create all collection objects
 * 
 */
Database.prototype.createCollections = function() {
    var self = this;
    self.log("Collections are added...");

    self._collections.forEach(function(col){
        self[col] = new Collection(self._path,col,self._debug);

    });
};


/**
 * Print console log if debug mode is enabled
 * 
 * @param  {String} text The text to print
 */
Database.prototype.log = function(text) {
    if(this._debug) console.log(text);
};


/**
 * Deletes the complete database structure.
 * It deletes EVERYTHING in the database directory...be careful.
 * Init() has to be called again if the database is still used after its death :(
 * @param  {Function} callback The final callback
 */
Database.prototype.delete = function(callback) { 
    var self = this;
    self.log("Delete Database...");

    fs.rmrf(self._path,function(err){
        if(err) self.log(err);
        callback(err);
    });
};


module.exports = Database;