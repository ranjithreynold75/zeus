var  m=require('mongodb');

var url="mongodb://zeus:alwaysforward1.@ds012058.mlab.com:12058/zeus"; //keep it safe
//mongodb://<dbuser>:<dbpassword>@ds012058.mlab.com:12058/zeus
var mc=m.MongoClient;


var _db;


mc.connect(url,function(err,db){
        if(err)
        {
            console.log(err);
        }
        else
        {
            _db=db;
            console.log("DB connected");

        }
    }
);

module.exports=function(app,io){

    io.on("connection",function(socket)
    {
        console.log("A user connected:" + socket.id);

        socket.join("zues_room");

        socket.emit("notify",{'message':"Welcome to Golite"});

    });

    app.get("/",function(req,res){
        res.send("Welcome to zeus!!");
    });

    app.post("/signup",function(req,res){

var data={
    _id:req.body.id,
    name:req.body.name,
    password:req.body.password,
    cars:[{}]
     };
        var h = _db.collection('zeus_users');

        var cursor = h.find({_id: req.body.no});

        cursor.count(function (err, c) {
            if (err)
                console.log(err);

            else {
                if (c == 1) {
                    res.send("user already exist");
                }
                else {

                    var h = _db.collection('zeus_users');
                    h.insertOne(data, function (err) {
                        if (err) {
                            console.log(err);
                            res.send("unsuccess");
                        }
                        else {
                            console.log("Zeus user registered succesfully");


                            res.send("success");
                        }
                    });

                }
            }
        })
    });


    app.post("/login",function(req,res){
        var phone=req.body.phone;
        var password=req.body.password;
        if(phone!==''&&password!=='') {
            var h = _db.collection("smart_users");
            var cursor = h.find({_id: phone, password: password});
            cursor.count(function (err, c) {
                if (err)
                    console.log(err);
                else {
                    if (c == 1) {
                        console.log("login success "+phone);
                        res.send("success");
                    }
                    else if(c==0)
                    {
                        res.send("unsuccess");
                    }
                }
            })

        }
        else
        {
            res.send("Invalid data");
        }


    })

}