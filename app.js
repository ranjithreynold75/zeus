var express=require("express");
var app=express();
var bodyparser=require("body-parser");

var http=require('http').Server(app);
var io=require('socket.io')(http);
function notify(req,res,next)
{
    console.log("request been made"+req.url);
    next();
}



app.use(notify);
app.use(bodyparser.json());
//app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.urlencoded({limit: '50mb', extended: true}));
require('./route')(app,io);

var server=http.listen(process.env.PORT || 5000,function(){
    console.log("server running in port "+(process.env.PORT || 5000));
});
