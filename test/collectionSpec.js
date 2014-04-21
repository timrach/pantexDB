var expect = require('chai').expect;
var should = require('chai').should();
var fs = require('fs.extra');
var Collection = require('../lib/collection.js');
var Pantex = require('../lib/pantexDB.js');


describe("dataBase", function(){
    var d = new Pantex('./testDB', 'testDB', ["testCollection", "test2"], false);

    after(function(done){
        d.delete(function(err){
            if(err) console.log(err);
            done();
        })
    });
    
    describe("#create()", function(){
       it("should Create the folder structure for the database", function(){
        
          var result1 = fs.existsSync('./testDB');
          var result2 = fs.existsSync('./testDB/db/testDB');
          var result3 = fs.existsSync('./testDB/db/testDB/testCollection');
          var result4 = fs.existsSync('./testDB/db/testDB/test2');
          
          expect(result1).to.equal(true);
          expect(result2).to.equal(true);
          expect(result3).to.equal(true);
          expect(result4).to.equal(true); 
       });
    });

    var c = new Collection('./testDB/db/testDB/', 'testCollection', false);
    describe("#save()", function(){
       it("should save an json object. which has the same properties + _id when read again", function(done){
            var obj = {"name" : "Tim", "age" : 22};
            c.save(obj,function(err,obj){
                fs.readFile((c._path + '/' + obj._id + '.json'),function (err, data){
                    should.not.exist(err);
                    var result = JSON.parse(data);
                    expect(result).to.have.a.property("name", "Tim");
                    expect(result).to.have.a.property("age", 22);
                    expect(result).to.have.a.property("_id");
                    done();
                });
            });           
       });
    });

    describe("#findOne",function(){
        describe("#Find Existing Entry By Id", function(){
            var obj = {"name" : "Elmar", "age" : 57}; 
            it("should find an json for an existing record by id", function(done){
                c.save(obj,function(err,obj){
                    c.findOne({"_id" : obj._id},function(err,results){
                        should.not.exist(err);
                        results.should.be.an('object');
                        done();
                    });
                });           
           });
        });

        describe("#Find Existing Entry Matching one Property", function(){
            var obj = {"name" : "Elmar", "age" : 58}; 
            it("should find an json for an existing record by property", function(done){
                c.save(obj,function(err,obj){
                    c.findOne({"name" : "Elmar"},function(err,result){
                        should.not.exist(err);
                        result.should.be.an('object');
                    });
                    done();
                });           
           });
        });

        describe("#Find Existing Entry mathing multiple Properties", function(){
            var obj = {"name" : "Elmar", "age" : 55}; 
            it("should find an json for an existing record by property", function(done){
                c.save(obj,function(err,obj){
                    c.findOne({"name" : "Elmar", "age":55},function(err,result){
                        should.not.exist(err);
                        result.should.be.an('object');
                    });
                    done();
                });           
           });
        });

        describe("Find non-existing entry by id", function(){
            it("should not find an json for a non-existing record", function(){
                c.findOne({"_id" : 1324},function(err,result){
                    should.exist(err);
                    should.not.exist(result);
                });           
           });
        });

        describe("Find non-existing entry by property", function(){
            it("should not find an json for a non-existing record", function(){
                c.findOne({"_baba" : 1324},function(err,result){
                    should.exist(err);
                    should.not.exist(result);
                });           
           });
        });
    });
    
    describe("#find",function(){
        describe("Find existing entry by id", function(){
            var obj = {"name" : "Rudi", "age" : 72}; 
            it("should find an json for an existing record by property", function(done){
                c.save(obj,function(err,obj){
                    c.find({"name" : "Rudi", "age":72},function(err,result){
                        should.not.exist(err);
                        result.should.be.an('array');
                        (result.length > 0).should.equal(true)
                    });
                    done();
                });           
           });
        });

        describe("Find existing entries by property", function(){
            it("should find entries for existing records by property", function(){
                c.find({"name" : "Elmar"},function(err,result){
                        should.not.exist(err);
                        result.should.be.an('array');
                        (result.length > 0).should.equal(true)
                });
           });
        });

        describe("Find non-existing entries by property", function(){
            it("should find entries for existing records by property", function(){
                c.find({"name" : "Hans"},function(err,result){
                        should.not.exist(err);
                        result.should.be.an('array');
                        (result.length == 0).should.equal(true)
                });
           });
        });

        describe("Find existing entry by id", function(){
            var obj = {"name" : "Rudi", "age" : 72}; 
            it("should find an json for an existing record by property", function(done){
                c.save(obj,function(err,obj){
                    c.find({"_id" : obj._id},function(err,result){
                        should.not.exist(err);
                        result.should.be.an('array');
                        (result.length == 1).should.equal(true)
                    });
                    done();
                });           
           });
        });

    });

    describe("#update",function(){
        var obj = {"name" : "Anke", "age" : 23}; 
        describe("update existing record with existing property",function(){
            it("should update the existing property", function(done){
                c.save(obj,function(err,obj){
                    c.update(obj._id,{"age" : 24},function(err,result){
                        should.not.exist(err);
                        result["age"].should.equal(24);
                    });
                    done();
                });
            });
        });

        var obj = {"name" : "Fabbi", "age" : 43}; 
        describe("update existing record with non-existing property",function(){
            it("should add a field to an existing record",function(done){
                c.save(obj, function(err,obj){
                    obj.should.not.have.property("old");
                    c.update(obj._id,{"old" : true},function(err,result){
                        result.should.have.property("old");
                        result["old"].should.equal(true);
                    });
                    done();
                });
            });

        });

        describe("update non-existing record",function(){
            it("should return error",function(){
                c.update(1234,{"old" : true},function(err,result){
                    should.exist(err);
                    should.not.exist(result);
                });
            });
        });
    });

    describe("#delete",function(){
        var obj = {"name" : "Fabbi", "age" : 143}; 
        describe("Delete record by id",function(){
            it("should delete a record",function(done){
                c.save(obj, function(err,obj){
                    c.delete({"_id":obj._id},function(err,result){
                        should.not.exist(err);
                        result.should.be.equal(1);
                        c.findOne({"_id":obj._id},function(err,result) {
                            should.exist(err);
                            should.not.exist(result); 
                        });
                    });
                    done();
                });
            });

        });

        describe("Delete records by property",function(){
            it("should delete all records with name Elmar",function(done){
                c.delete({"name":"Elmar"},function(err,results){
                    should.not.exist(err);
                    results.should.be.equal(3);
                    c.find({"name":"Elmar"},function(err,results){
                        should.not.exist(err);
                        results.should.have.length(0);
                    });
                    done();
                });
            });

        });
    });
});

