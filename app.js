const express = require('express'),
      app = express(),
      configuration = require('./config/config.js');



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

app.post('/upload',function (req, res, next) {

        var fstream;
        req.pipe(req.busboy);
        req.busboy.on('file', function (fieldname, file, filename) {
            console.log("Uploading: " + filename);

            //Path where image will be uploaded
            fstream = fs.createWriteStream(__dirname + '/originalVideos/' + filename);
            file.pipe(fstream);
            fstream.on('close', function () {    
                console.log("Upload Finished of " + filename);              
                res.send(filename); //where to go next
            });
        });
});



app.listen(configuration.port,function () {
    console.log('Node base project listening at port ' + configuration.port);
});
