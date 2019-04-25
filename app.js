const express = require('express'),
      app = express(),
      configuration = require('./config/config.js'),
      bodyParser = require('body-parser');
var fs = require('fs');

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

// CORS header
app.use(function(req, res, next) {
   res.header('Access-Control-Allow-Origin', '*');
   res.header('Access-Control-Allow-Methods', 'GET, POST');
   res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
   next();
});


// Expose webpage
app.use('/', express.static(__dirname + '/src/web'));



app.get('/get', function (req, res) {
    
    res.send("get");
    
});

app.post('/upload',async function (req, res, next) {

    var base64Data = req.body.imgBase64.replace(/^data:image\/png;base64,/, "");
    
    var qrContent = JSON.parse(req.body.qrcontent);
    
    var json;
    
    if (!fs.existsSync("src/web/photos/" + qrContent.id)){
        await fs.mkdirSync("src/web/photos/" + qrContent.id);
        json = {
            name : qrContent.name,
            number: 0
        }
        await fs.writeFile("src/web/store/" + qrContent.id +'.json', JSON.stringify(json), 'utf8', function(err) {
          console.log(err);
        });
    }else{
        fs.readFile("src/web/store/" + qrContent.id +'.json', 'utf8', function readFileCallback(err, data){
        if (err){
            console.log(err);
        } else {
        obj = JSON.parse(data); 
            console.log(obj)
        obj.number = obj.number + 1;
        json = obj; 
        fs.writeFile("src/web/store/" + qrContent.id +'.json', JSON.stringify(obj), 'utf8', function(err) {
          console.log(err);
        }); 
    }});
        
    }

    require("fs").writeFile("src/web/photos/" + qrContent.id + "/" + json.number +".png", base64Data, 'base64', function(err) {
      console.log(err);
    });
    
});



app.listen(configuration.port,function () {
    console.log('Node base project listening at port ' + configuration.port);
});
