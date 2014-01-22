/*globals asyncTest:true, ok:true, start:true, playerjs:true*/
var FRAMES = [
  'http://localhost.com:8003/test/iframe.html'
];

//playerjs.DEBUG = true;

var isNumber= function(obj){
  return Object.prototype.toString.call(obj) === "[object Number]";
};

function testCases(){
  var player = this;
  asyncTest("Play", 3, function() {
    var count = 0;
    var done = function(){
      count ++;
      if (count === 2){
        // Revert us back to the opening bell.
        player.setCurrentTime(0);
        player.pause();
        start();
      }
    };

    player.on('play', function(){
      ok(true, "video has played");
      this.off('play');
      done();
    });

    player.on('timeupdate', function(data){
      ok(isNumber(data.seconds));
      ok(isNumber(data.duration));

      this.off('timeupdate');
      done();
    });

    player.play();
  });

  asyncTest("Pause", 2, function() {
    player.on('pause', function(){
      ok(true, "video has paused");
      this.off('pause');
      // Test if paused works.
      this.getPaused(function(value){
        ok( true === value, "video is paused" );
        start();
      });
    });

    // We won't fire pause unless we are actually playing first.
    player.on('play', function(){
      player.off('play');
      player.pause();
    });

    player.play();
  });

  asyncTest("Duration", 1, function() {
    player.getDuration(function(value){
      ok(isNumber(value), "video has duration" );
      start();
    });
  });

  asyncTest("getVolume", 1, function() {
    player.getVolume(function(value){
      ok(isNumber(value), "video has Volume" );
      start();
    });
  });

  asyncTest("getCurrentTime", 1, function() {
    player.getCurrentTime(function(value){
      ok(isNumber(value), "video has time:" + value );
      start();
    });
  });

  //Test Seek.
  asyncTest("setCurrentTime", 1, function() {
    player.on('timeupdate', function(v){
      if (v.seconds >= 5){
        player.off('timeupdate');
        player.getCurrentTime(function(value){
          ok(Math.floor(value) === 5, "video has time:" + value );
          player.pause();
          start();
        });
      }
    });

    player.play();
    player.setCurrentTime(5);
  });

  //Test Loop
  asyncTest("setLoop", 1, function() {
    player.setLoop(true);
    setTimeout(function(){
      player.getLoop(function(v){
        ok(v === true, 'Set Loop was not set');
        start();
      });
    }, 100);
  });

  // Volumne tests
  asyncTest("volume", 3, function() {

    player.setVolume(87);
    player.getVolume(function(value){
      ok(value === 87, "video volume:" + value );

      //Mute
      player.mute();

      setTimeout(function(){
        player.getMuted(function(value){
          ok(value, "video muted:" + value );

          //Unmute
          player.unmute();
          setTimeout(function(){
            player.getMuted(function(value){
              ok(!value, "video unmuted:" + value );
              start();

              // Not all providers have mute, so we are going to need to fix this.
              //player.getVolume(function(value){
              //  ok(value === 87, "video volume:" + value );
              //  start();
              //});
            });
          }, 500);
        });
      }, 500);
    });
  });
}

var count = 0,
  players = [];

var loadPlayers = function() {
  count++;
  if (count === FRAMES.length){
    var iframes = document.getElementsByTagName('iframe');

    for (var d=0; d<iframes.length; d++){
      var player = new playerjs.Player(iframes[d]);

      player.on('ready', testCases, player);

      players.push(player);
    }
  }
};

for (var f in FRAMES){
  var iframe = document.createElement('iframe');

  iframe.src = FRAMES[f];
  iframe.id = 'iframe_'+f;
  iframe.width = 200;
  iframe.height = 200;

  document.body.appendChild(iframe);

  // we want to load the players a couple of different ways.
  if ( f % 2 === 1){
    loadPlayers();
  } else {
    iframe.onload = loadPlayers;
  }
}