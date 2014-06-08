var videoQueue = [];
var player;
var setupDone = false;

window.setInterval(queueSong, 30000);

function queueSong() {
  console.log("Searching queue");

  var channelName = $('input[name=channelRadio]:checked', '#channels').val();
  console.log(channelName);

  $.ajax('/getsong?c=' + channelName).done(function(data){
    console.log(data);

    try{

      if(data != {} && !existsInArray(videoQueue, data)) {
        videoQueue.push(data.tracks[0]);

        if(videoQueue.length > 1)
          makeQueueItem(data.tracks[0]);
      }

    }
    catch(err) {
      console.log("No song to push to queue." );
    }

    console.log(videoQueue);
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

function existsInArray(array, item) {
    for(var i=0;i<array.length;i++) {
        if ( array[i].video_id === item.tracks[0].video_id )
          return true;
    }
    return false;
}

function makeQueueItem(queueItem) {
  console.log("Making queue item.");

  var image = $("<img>").attr("src", queueItem.thumbnail);
  var title = $("<span>").text(queueItem.title);
  var desc = $("<span>>").text(queueItem.description);

  var rootTag = $("<div>", {class: "queueItem"})
                      .append(image)
                      .append(title)
                      .append(desc);


  $("#queue").append(rootTag);

}

function onYouTubeIframeAPIReady() {

  if(videoQueue.length > 0) {
    player = new YT.Player('player', {
      height: '390',
      width: '640',
      videoId: videoQueue[0].video_id,
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
    player.loadVideoById(videoQueue[0].video_id);

    var queueItems = $("#queue").children();
    if( queueItems.length > 0 ) {
      queueItems[0].remove();
    }
  }
}

function setupVideo() {
  var tag = document.createElement('script');
  tag.src = "https://www.youtube.com/iframe_api";
  var firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

function buildChannelSelector() {
  for( var i = 0; i < sxmChannels.length; i++ ) {
    var radioButton = $("<input>").attr("type", "radio")
      .attr("value", sxmChannels[i].value)
      .attr("name", "channelRadio");

    if( i == 0 )
      radioButton.attr("checked", true);

    $("#channels").append(radioButton).append(sxmChannels[i].key);
  }
}

$(document).ready(function(){
  buildChannelSelector();
  queueSong();
});
