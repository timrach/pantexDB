var Filedb = require('./filedb/filedb.js'),
    path = "./",
    name = "test",
    collections = ["users","scores"];

var db = new Filedb(path,name,collections);

var fabbi = {'name' : "fabbi", "age" : 24};
db.users.save(fabbi,function(err,rec){
    console.log("saved fabbi as " + rec._id);
    fabbi = rec;
})

var fabbisScore = {"points" : 100, "user":fabbi._id};

db.scores.save(fabbisScore,function(err,score){});  
db.users.delete({"age":24},function(err,num) {
    console.log(num + " deleted");
})