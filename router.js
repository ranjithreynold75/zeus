var  m=require('mongodb');

var url="mongodb://zeus:alwaysforward1.@ds012058.mlab.com:12058/zeus"; //keep it safe
//mongodb://<dbuser>:<dbpassword>@ds012058.mlab.com:12058/zeus
var mc=m.MongoClient;



var users={
    user:{

    },
    status:{

    }

};



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

    /*io.on("connection",function(socket)
    {
        console.log("A user connected:" + socket.id);
        socket.emit('message', {'id': socket.id});

        socket.join("zues_room");

        //socket.emit("notify",{'message':"Welcome to Zeus"});


        socket.on('register', function (data) {
            var d = JSON.parse(data);
            console.log("registering user " + d.id);
            users.user[d.no] = d.id;
            var phoneno=d.no;



            var db=_db.collection('zeus_users');
            db.updateOne({_id:d.no},{$set:{status:"online"}});

            console.log("user status:"+users);



                // io.sockets.in("room-"+room).emit('notify',{'message':phoneno+" is online"});

           console.log(users);

        })

    });
*/

    app.get("/",function(req,res){
        res.send("Welcome to zeus!!");
    });

    app.post("/signup",function(req,res){
console.log(req.body.name);
var data={
    _id:req.body.phone,
    name:req.body.name,
    password:req.body.password,
    cars:[{}]
     };
console.log(data);
     /*   var h = _db.collection("zeus_users");

        var cursor = h.find({_id: req.body.phone});

        cursor.count(function (err, c) {
            if (err)
                console.log(err);

            else {
                if (c == 1) {
                    res.send("user already exist");
                }
                else {
*/
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

               // }
            //}
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

app.post("/add_new_car",function(req,res){

})


}