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
        await fs.writeFileSync("src/web/store/" + qrContent.id +'.json', JSON.stringify(json), 'utf8');
        var info = await fs.readFileSync('src/web/info/info.json')
        info = JSON.parse(info);
         info.push({
            id : qrContent.id, 
            name : qrContent.name 
         }) 
        await fs.writeFileSync('src/web/info/info.json', JSON.stringify(info), 'utf8')
    }else{
        var data = await fs.readFileSync("src/web/store/" + qrContent.id +'.json', 'utf8');
        var obj = JSON.parse(data); 
        console.log(obj)
        obj.number = obj.number + 1;
        json = obj; 
        await fs.writeFileSync("src/web/store/" + qrContent.id +'.json', JSON.stringify(obj), 'utf8'); 
        
    }

    await fs.writeFileSync("src/web/photos/" + qrContent.id + "/" + json.number +".png", base64Data, 'base64');
    
});

app.get('/getImage', function (req, res) {
    var userArray = require('./src/web/info/info.json');
    
    var randomNumber = Math.floor(Math.random() * userArray.length)
    
    console.log("-----------------")
    
    console.log("random number of user: " + randomNumber)
    
    var userJson = require('./src/web/store/'+ userArray[randomNumber].id +'.json');
    
    console.log("number of images: " + userJson.number)
    
    var gen = userJson.number + 1;
    
    var randomNumberImg = Math.floor(Math.random() * gen | 0) 
    
    console.log("random number of image: " + randomNumberImg)
    
    console.log(userArray[randomNumber].id + "/" + randomNumberImg + ".png")
    
    res.send("photos/" + userArray[randomNumber].id + "/" + randomNumberImg + ".png");
    
});



app.listen(configuration.port,function () {
    console.log('Node base project listening at port ' + configuration.port);
});
