var videoQueue = [];
var player;
var setupDone = false;

window.setInterval(queueSong, 30000);

function queueSong() {
  console.log("Searching queue");
  $.ajax('/getsong').done(function(data){

    try{
      var songId = data.items[0].id.videoId;
      if(videoQueue.indexOf(songId) == -1)
        videoQueue.push(songId);
      console.log(videoQueue);
    }
    catch(err) {
      console.log(data);
      console.log("No song to push to queue.");
    }

    if(!setupDone) {
      setupVideo();
    }

    if(player != undefined) {
      var state = player.getPlayerState();
      if(state == 0)
        loadNextSong();
    }
  });
}

function onYouTubeIframeAPIReady() {

  if(videoQueue.length > 0) {
    player = new YT.Player('player', {
      height: '390',
      width: '640',
      videoId: videoQueue[0],
      events: {
        'onReady': onPlayerReady,
        'onStateChange': onPlayerStateChange
      }
    });
    setupDone = true;
  }
}

function onPlayerReady(event) {
  event.target.playVideo();
}

function onPlayerStateChange(event) {
  if (event.data === 0) {
    loadNextSong();
  }
}
function stopVideo() {
  player.stopVideo();
}

function loadNextSong() {
  if(videoQueue.length > 1) {
    console.log("Loading next song");
    videoQueue.shift()
    player.loadVideoById(videoQueue[0]);
  }
}


function setupVideo() {
  var tag = document.createElement('script');
  tag.src = "https://www.youtube.com/iframe_api";
  var firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

$(document).ready(function(){
  queueSong();
});
