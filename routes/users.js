var express = require('express');
const pool = require('./mysqlconnection');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  pool.query("CREATE SCHEMA `assignmentsubmmision`",function(error,result){
    if(error){
      console.log(error)
      
    }
    else{
      console.log(result)
    }
  })
  pool.query("CREATE  table assignmentsubmmision.user('id')",function(error,result){
    if(error){
      console.log(error)
      res.render("error")
    }
    else{
      console.log(result)
      res.render('index')
    }
  })
});

module.exports = router;
