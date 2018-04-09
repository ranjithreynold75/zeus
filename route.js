var  m=require('mongodb');

var url="mongodb://zeus:alwaysforward1.@ds012058.mlab.com:12058/zeus"; //keep it safe

//var url="mongodb://jatters:alwaysforward1.@ds058579.mlab.com:58579/jatapp";
//mongodb://<dbuser>:<dbpassword>@ds012058.mlab.com:12058/zeus
var mc=m.MongoClient;



var users={
    user:{

    }

};

var otps={
  otp:{

  }

};

var cars={
    car:{

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
            _db=db.db("zeus");
            console.log("DB connected");

        }
    }
);

module.exports=function(app,io){

    io.on("connection",function(socket)
    {
        console.log("A user connected:" + socket.id);
        socket.emit('message', {'id': socket.id});

        socket.join("zues_room");

        //socket.emit("notify",{'message':"Welcome to Zeus"});


        socket.on('register', function (data) {
            var d = data;
            console.log("registering user " + d.id);
            var phoneno=d.no;
            var cat=d.category;
               if(cat==="phone") {

                   var db = _db.collection('zeus_users');
                   db.updateOne({_id: d.no}, {$set: {status: "online"}});

                   console.log("user status:" + users);
                   users.user[d.no] = d.id;
                   // io.sockets.in("room-"+room).emit('notify',{'message':phoneno+" is online"});
                   console.log(users);
               }
               else
               {
                   var db = _db.collection('cars');
                   db.updateOne({_id: d.no}, {$set: {status: "online"}});
                    cars.car[d.no]=d.id;
                   console.log("user status:" + cars);
                   // io.sockets.in("room-"+room).emit('notify',{'message':phoneno+" is online"});
                   console.log(cars);
               }

        });

        socket.on("add_car",function(data){                     //from phone
            var d=JSON.parse(data);
            var c_no=d.c_no;
           var p_no=d.p_no;
            var x=Math.floor((Math.random()*999999)+100000);
            otps.otp[p_no]=x;
            console.log(otps);
            io.to(cars.car[c_no]).emit("otp",{pin:x});         //to iot device
        });

        socket.on("car_register",function(data){      //from phone
            var d=JSON.parse(data);
            var pin=d.pin;
            var no=d.no;             //phone no
            var car_no=d.car_no;
            console.log(d);
            if(otps.otp[no]==pin)
            {
                console.log("otp success");
            var h=_db.collection("zeus_users");
            h.updateOne({_id:no},{$push:{cars:car_no}});
                io.to(users.user[no]).emit("otp_status",{message:"success"});

                //io.to(users.user[car_no]).emit("otp_status",{message:"success"});   //to iot device

            }
            else
            {
                io.to(users.user[no]).emit("otp_status",{message:"unsuccess"});
            }
        });

        socket.on("car_connect",function(data){               //connecting to the car i mean sync
            var d=JSON.parse(data);
            var h=_db.collection("zeus_users");
          var cursor=h.find({_id:d.phone,cars:d.car});
          cursor.count(function(err,c){
              if(c==1)
              {
                  h=_db.collection("zeus_users");
                  h.find({_id:d.phone},{name:1}).forEach(function(x){
                      var name=JSON.stringify(x);
                      io.to(cars.car[d.car]).emit("user_connect",{phone:d.phone,name:name.name});
                  });

              }
          })
        });

        socket.on("send_message",function(data){              //sending message to device
            var d=JSON.parse(data);
            var id=d.id;         //car no
            var no=d.no;        //phone no
            var message=d.message;
console.log(message);
            io.to(cars.car[id]).emit("r_message",{no:no,message:message});

        })



    });


//REST API
    app.get("/",function(req,res){
        res.send("Welcome to zeus!!");
    });

    app.post("/signup",function(req,res){
        console.log(req.body.name);
        var data={
            _id:req.body.phone,
            name:req.body.name,
            password:req.body.password,
            cars:[{}],
            status:"offline"
        };
        console.log(data);
           var h = _db.collection("zeus_users");

                var cursor = h.find({_id: req.body.phone});

                cursor.count(function (err, c) {
                    if (err)
                        console.log(err);

                    else {
                        if (c === 1) {
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
        console.log(phone);
        if(phone!==''&&password!=='') {
            var h = _db.collection("zeus_users");
            var cursor = h.find({_id: phone, password: password});
            cursor.count(function (err, c) {
                if (err)
                    console.log(err);
                else {
                    if (c ===1) {
                        console.log("login success "+phone);
                        res.send("success");
                    }
                    else if(c===0)
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



    app.post("/car_details",function(req,res){      //Start up request for car registered to user
        var user=req.body.phone;    //phone no
        var h=_db.collection("zeus_users");
        h.find({_id:user},{cars:1}).forEach(function (x) {
        console.log(JSON.stringify(x));
            res.send(JSON.stringify(x));
        });
    });


    app.post("/car_data",function(req,res){      //particular car details
        var user=req.body.car;       //car id
        var h=_db.collection("cars");
        h.find({_id:user}).forEach(function (x) {
            console.log(x);
            res.send(x);
        });
    });

app.post("/fuel_data",function(req,res){
    var user="F_"+req.body.car;
    var h=_db.collection("fuel");
    h.find({_id:user}).forEach(function(x){
        //var data=JSON.stringify(x);
        console.log(x);
        res.send(x);
    });
});


app.post("/upload_trip",function(req,res){
   var car=req.body.id;
   var user=req.body.no;
   var date=req.body.date;
   var time=req.body.tim;
   var desc=req.body.desc;
   var h=_db.collection("trip");
   var data={date:date,user:user,time:time,description:desc};
   h.updateOne({_id:car},{$push:{plan:data}});
 res.send("success");
});

    app.post("/trip_plan",function(req,res){
        var car=req.body.id;
         var h=_db.collection("trip");
        h.find({_id:car}).forEach(function(x){
            console.log(x);
            res.send(x);
        })

    });


};