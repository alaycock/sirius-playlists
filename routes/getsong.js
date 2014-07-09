var database = require('../mongo');
var express = require('express');
var router = express.Router();
var request = require('request');
var gapis = require('googleapis');
var sys = require('../app');
var channels = require('../channels')

var data_url = "http://www.siriusxm.com/metadata/pdt/en-us/json/channels/$$$$$/timestamp/";

router.get('/', function(req, res) {

  console.log("Request started.");
  this.res = res;

  var coeff = 1000 * 60;
  var date = new Date();  //or use any other date
  var nearestMinute = new Date(Math.floor(date.getTime() / coeff) * coeff)

  if( req.query.c == undefined ) throw "No channel specified.";
  var channelExists = false;
  for (var key in channels) {
    if (channels[key].value == req.query.c) {
      channelExists = true;
      break;
    }
  }

  if (!channelExists) {
    respondError(res, 'Channel not allowed');
    return;
  }

  searchForSong(req, res, nearestMinute);
});

function generateRadioURL(req, time) {
  date_string =
    zeroPad(time.getUTCMonth() + 1) + "-" +
    zeroPad(time.getUTCDate()) + "-" +
    zeroPad(time.getUTCHours()) + ":" +
    zeroPad(time.getUTCMinutes()) + ":" + "00";



  return data_url.replace("$$$$$", req.query.c) + date_string
}

function searchForSong(req, res, time) {
  var songData = {};
  songData.source_channel = req.query.c;
  songData.time = time;

  database.findTrack(req.db, songData, dbResult(req, res, time, songData));
}

function dbResult(req, res, time, songData) {
  return function(doc) {
    console.log('DB returned')
    if(doc) {
      console.log("Song found in db")
      res.send(doc);
    }
    else {
      console.log("Song not found in db")
      getRadioData(req, res, time, songData)
    }
  }
}

function getRadioData(req, res, time, songData) {
  try {
    sirius_source = generateRadioURL(req, time);
  }
  catch(err) {
    respondError(res, err);
    return;
  }

  console.log('Requesting data from sirius xm')
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
      search_string = songData.artist + ' - ' + songData.title;
    }
    console.log('Searching youtube for song')
    searchYoutube(req, res, search_string, songData);
  });
}

function zeroPad(number) {
  return String('0'+number).slice(-2);
}


function searchYoutube(req, res, query, songData) {

  gapis.discover('youtube', 'v3').execute(function(err, client) {
    if (err) {
      console.log("Error during client discovery: " + err);
      respondError("Error discovering YouTube client.");
      return;
    }
    var params = { q: query, part: 'snippet'};

    var apiKey = process.env.YT_API_KEY || '';

    client.youtube.search.list(params).withApiKey(apiKey).execute(printResult(req, res, songData));
  });
}

function printResult(req, res, songData) {
  return function(err, response) {
    console.log('Song found on youtube')
    if(err) {
      console.log("Error retreiving YouTube video. ", err);
      respondError(res, "Internal error, could not contact YouTube.");
      return;
    }
    var responseObj = buildResponseObejct(response, songData);
    database.saveTrack(req.db, responseObj);
    res.send(responseObj);
  }
};

function buildResponseObejct(oldObj, songData) {
  var retObj = {};
  retObj.source_artist = songData.artist;
  retObj.source_title = songData.title;
  retObj.source_channel = songData.source_channel;
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
