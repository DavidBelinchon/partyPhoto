angular.module('InformationApp', ['ngRoute', 'ja.qr', 'webcam'])
.controller('informationCtrl', function($scope,$http) {
	
    $scope.title = "tst";
    
    
})
.controller('PhotoController', function($scope,$timeout) {
     $scope.name = 'PhotoController';
     $scope.startPhoto = false;
     $scope.qrcontent;
     var _video;
    
      $scope.myChannel = {
        // the fields below are all optional
        videoHeight: 800,
        videoWidth: 600,
        video: null // Will reference the video element on success
      };
    $scope.patOpts = {x: 0, y: 0, w: 25, h: 25};
    
      let scanner = new Instascan.Scanner({ video: document.getElementById('preview') });
    
      scanner.addListener('scan', function (content) {
          console.log(content);
          $scope.$apply(function () {
            $scope.qrcontent = content;
            $scope.startPhoto = true;
              $timeout(function() {
                $scope.makeSnapshot();
              }, 5000);
          })
          scanner.stop()
          
      });
      
    $scope.start = function(){
      Instascan.Camera.getCameras().then(function (cameras) {
        if (cameras.length > 0) {
          scanner.start(cameras[0]);
        } else {
          console.error('No cameras found.');
        }
      }).catch(function (e) {
        console.error(e);
      });
    }
    
    $scope.onSuccess = function () {
        // The video element contains the captured camera data
        _video = $scope.myChannel.video;
        $scope.$apply(function() {
            $scope.patOpts.w = _video.width;
            $scope.patOpts.h = _video.height;
            $scope.showDemos = true;
        });
    };
    
    $scope.makeSnapshot = function makeSnapshot() {
        if (_video) {
            var patCanvas = document.querySelector('#snapshot');
            if (!patCanvas) return;

            patCanvas.width = _video.width;
            patCanvas.height = _video.height;
            var ctxPat = patCanvas.getContext('2d');

            var idata = getVideoData($scope.patOpts.x, $scope.patOpts.y, $scope.patOpts.w, $scope.patOpts.h);
            ctxPat.putImageData(idata, 0, 0);

            patData = idata;
            $scope.startPhoto = false;
            
            var canvas = document.getElementById('snapshot');
            var dataURL = canvas.toDataURL();
            $.ajax({
              type: "POST",
              url: "/upload",
              data: { 
                 qrcontent : $scope.qrcontent,
                 imgBase64: dataURL
              }
            }).done(function(o) {
              console.log('saved'); 

            });
        }
    };
    
    var getVideoData = function getVideoData(x, y, w, h) {
        var hiddenCanvas = document.createElement('canvas');
        hiddenCanvas.width = _video.width;
        hiddenCanvas.height = _video.height;
        var ctx = hiddenCanvas.getContext('2d');
        ctx.drawImage(_video, 0, 0, _video.width, _video.height);
        return ctx.getImageData(x, y, w, h);
    };
      
    
    
 })

.controller('ShowController', function($scope,$interval) {
     $scope.name = 'ShowController';
    $scope.image;

    $interval(function(){
        $.ajax({
            type: "GET",
            url: "/getImage"
        }).done(function(o) {
            console.log(o); 
            $scope.$apply(function() {
                $scope.image = o;
            })
        });
    },5000)
    
 })
    
.controller('CreateController', function($scope) {

    $scope.name = '';
    $scope.qrText = '';
    $scope.uniqueId = '';
    $scope.image = 'img/IMG_20190418_230838.jpg';

    
    $scope.createTarget = function(){
      $scope.uniqueId = Date.now();  
      $scope.qrText = JSON.stringify({
        name: $scope.name,
        id: $scope.uniqueId
      }); 
    }
    
    $scope.printTarget = function(el){
        html2canvas(document.querySelector("#qrCard")).then(canvas => {
            var image = canvas.toDataURL("image/png", 1.0).replace("image/png", "image/octet-stream");
              var link = document.createElement('a');
              link.download = $scope.name + ".png";
              link.href = image;
              link.click();
        });
    }
 })

.config(function($routeProvider, $locationProvider) {
  $routeProvider
   .when('/create', {
    templateUrl: 'create.html',
    controller: 'CreateController'
  })   
  .when('/photo', {
    templateUrl: 'photo.html',
    controller: 'PhotoController'
  })
  .when('/show', {
    templateUrl: 'show.html',
    controller: 'ShowController'
  });

});