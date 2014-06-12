var config = require('../config');
var database = require('../mongo');
var express = require('express');
var router = express.Router();
var request = require('request');
var gapis = require('googleapis');

var data_url = "http://www.siriusxm.com/metadata/pdt/en-us/json/channels/$$$$$/timestamp/";

router.get('/', function(req, res) {

  console.log("Getting song.");
  this.res = res;

  var coeff = 1000 * 60;
  var date = new Date();  //or use any other date
  var nearestMinute = new Date(Math.floor(date.getTime() / coeff) * coeff)

  getRadioData(req, res, nearestMinute);
});

function generateRadioURL(req, time) {
  date_string =
    zeroPad(time.getUTCMonth() + 1) + "-" +
    zeroPad(time.getUTCDate()) + "-" +
    zeroPad(time.getUTCHours()) + ":" +
    zeroPad(time.getUTCMinutes()) + ":" + "00";

  if( req.query.c == undefined ) throw "No channel specified.";

  return data_url.replace("$$$$$", req.query.c) + date_string
}

function getRadioData(req, res, time) {

  try {
    sirius_source = generateRadioURL(req, time);
  }
  catch(err) {
    respondError(res, err);
    return;
  }

  var songData = {};
  songData.source_channel = req.query.c;


  console.log("Retrieving songs for " + date_string + " ");

  console.log("From the url " + sirius_source);

  request({uri: sirius_source}, function(err, response, body) {
    if(err && response.statusCode !== 200){
      console.log('Request error.');
      respondError(res, "Could not reach SeriusXM website.");
      return;
    }

    try {
      data = JSON.parse(body);
    }
    catch(err) {
      respondError(res, "Could not parse SeriusXM page.");
      return;
    }

    if(data.channelMetadataResponse.messages.code != 100) {
      respondError(res, "No song data returned.");
      return;
    }
    else {
      songData.artist = data.channelMetadataResponse.metaData.currentEvent.artists.name;
      songData.title = data.channelMetadataResponse.metaData.currentEvent.song.name;

      songData.time = time;
      search_string = songData.artist + ' - ' + songData.title;
    }

    if( req.query.c == 'debug' )
      searchYoutube(res, "like it? - #BPMBREAKER", songData);
    else
      searchYoutube(res, search_string, songData);
  });
}

function zeroPad(number) {
  return String('0'+number).slice(-2);
}


function searchYoutube(res, query, songData) {
  console.log("Searching for song: " + query);

  gapis.discover('youtube', 'v3').execute(function(err, client) {
    if (err) {
      console.log("Error during client discovery: " + err);
      respondError("Error discovering YouTube client.");
      return;
    }
    var params = { q: query, part: 'snippet'};
    client.youtube.search.list(params).withApiKey(config.APIKEY).execute(printResult(res, songData));
  });
}

function printResult(res, songData) {
  return function(err, response) {
    if(err) {
      console.log("Error retreiving YouTube video.");
      respondError("Internal error, could not contact YouTube.");
      return;
    }
    var responseObj = buildResponseObejct(response, songData);
    database.connect(database.findOrSaveTrack(songData));
    res.send(responseObj);
  }
};

function buildResponseObejct(oldObj, songData) {
  var retObj = {};
  retObj.source_artist = songData.artist;
  retObj.source_title = songData.title;
  retObj.source_channel = songData.channel;
  retObj.time = songData.time;
  retObj.tracks = [];

  for(var i = 0; i < oldObj.items.length; i++) {
    var item = oldObj.items[i];
    if(item.id.kind == "youtube#video") {
      var track = {};
      track.video_id = item.id.videoId;
      track.description = item.snippet.description;0
      track.thumbnail = item.snippet.thumbnails.medium.url;
      track.title = item.snippet.title;
      retObj.tracks.push(track);
    }
  }

  return retObj;
}

function respondError(res, err) {
  error = {'error': err};
  res.send(error);
}

module.exports = router;
