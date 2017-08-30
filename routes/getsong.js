var express = require('express');
var router = express.Router();
var request = require('request');
var gapis = require('googleapis');
var channels = require('../helpers/channels');
var database = require('../helpers/mongo');

const SIRIUS_PREFIX = "http://www.siriusxm.com/metadata/pdt/en-us/json/channels/";
const SIRUS_SUFFIX = "/timestamp/";


router.get('/', function(req, res) {

  const coeff = 60000;
  var date = new Date();  //or use any other date
  var nearestMinute = new Date(Math.floor(date.getTime() / coeff) * coeff);

  if( req.query.c == undefined ) throw "No channel specified.";

  var channelExists = false;
  channelExists = channels.find((elem) => {
    return elem.value == req.query.c;
  });

  if (!channelExists) {
    respondError(res, 'Channel not allowed');
    return;
  }

  const songData = {
    source_channel: req.query.c,
    time: nearestMinute
  };

  database.findTrack(req.db, songData, (document) => {
    if(document) {
      delete document._id;
      res.send(document);
      return;
    }

    getRadioData(nearestMinute, songData, req.query.c, (siriusErr, siriusData) => {

      if(siriusErr) {
        respondError(res, siriusErr);
        return;
      }

      const search_string = siriusData.artist + ' - ' + siriusData.title;
      searchYoutube(search_string, (yt_err, yt_results) => {

        if(!yt_err && yt_results.items.length > 0) {
          const responseObj = buildResponseObject(yt_results, songData);
          database.saveTrack(req.db, responseObj);
          res.send(responseObj);
          return;
        }

        console.log(yt_err);
        respondError(res, "Could not get song from YouTube.");
      });
    });
  });
});

function zeroPad(number) {
  return String('0'+number).slice(-2);
}

function generateRadioURL(channel, time) {
  const date_string =
    zeroPad(time.getUTCMonth() + 1) + "-" +
    zeroPad(time.getUTCDate()) + "-" +
    zeroPad(time.getUTCHours()) + ":" +
    zeroPad(time.getUTCMinutes()) + ":" + "00";

  return `${SIRIUS_PREFIX}${channel}${SIRUS_SUFFIX}${date_string}`;
}

function getRadioData(time, songData, channel, callback) {
  const sirius_source = generateRadioURL(channel, time);

  // console.log('Requesting data from sirius xm')
  request({uri: sirius_source}, function(err, response, body) {

    if(err || response.statusCode == undefined || response.statusCode !== 200){
      // console.log('Request error.');
      callback("Could not get song from SiriusXM.");
      return;
    }

    let data = null;
    try {
      data = JSON.parse(body);
    }
    catch(err) {
      callback("Could not get song from SiriusXM.");
      return;
    }

    if(data.channelMetadataResponse.messages.code != 100) {
      callback("Could not get song from SiriusXM.");
      return;
    }
    else {
      songData.artist = data.channelMetadataResponse.metaData.currentEvent.artists.name;
      songData.title = data.channelMetadataResponse.metaData.currentEvent.song.name;
    }

    callback(null, songData);
  });
}


function searchYoutube(query, callback) {

  gapis.discover('youtube', 'v3').execute(function(err, client) {
    if (err) {
      callback("Error discovering YouTube client.");
      return;
    }
    var params = { q: query, part: 'snippet'};

    var apiKey = process.env.YT_API_KEY || '';
    if (apiKey == '') {
      console.log("API environment variable unset, cannot contact youtube.");
      callback("Error contacting YouTube.");
    }
    else
      client.youtube.search.list(params).withApiKey(apiKey).execute(callback);
  });
}

function buildResponseObject(oldObj, songData) {

  var retObj = {};
  retObj.source_artist = songData.artist;
  retObj.source_title = songData.title;
  retObj.source_channel = songData.source_channel;
  retObj.time = songData.time;
  retObj.tracks = [];

  // Number of song matches to return
  var songMatches = 1;
  for(var i = 0; i < songMatches; i++) {
    var item = oldObj.items[i];
    if(item && item.id && item.id.kind == "youtube#video") {
      var track = {};
      track.video_id = item.id.videoId;
      track.description = item.snippet.description;
      track.thumbnail = item.snippet.thumbnails.medium.url;
      track.title = item.snippet.title;
      retObj.tracks.push(track);
    } else {
      console.log('Video not valid', item);
    }
  }

  return retObj;
}

function respondError(res, err) {
  const error = {error: err};
  res.send(error);
}

module.exports = router;
