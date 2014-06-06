var config = require('../config');
var express = require('express');
var router = express.Router();
var request = require('request');
var gapis = require('googleapis');
var apiKey = process.argv[2];
var data_url = "http://www.siriusxm.com/metadata/pdt/en-us/json/channels/$$$$$/timestamp/";
var page_res;

router.get('/', function(req, res) {

  console.log("Getting song.");
  page_res = res;

  getRadioData(req, new Date());
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

function getRadioData(req, time) {

  console.log(time);
  try {
    sirius_source = generateRadioURL(req, time);
  }
  catch(err) {
    respond_error(err);
    return;
  }

  console.log("Retrieving songs for " + date_string + " ");

  console.log("From the url " + sirius_source);

  request({uri: sirius_source}, function(err, response, body) {
    if(err && response.statusCode !== 200){
      console.log('Request error.');
      respond_error("Could not reach SeriusXM website.");
      return;
    }

    try {
      data = JSON.parse(body);
    }
    catch(err) {
      respond_error("Could not parse SeriusXM page.");
      return;
    }

    if(data.channelMetadataResponse.messages.code != 100)
      console.log("No data returned");
    else {
      artist = data.channelMetadataResponse.metaData.currentEvent.artists.name;
      song = data.channelMetadataResponse.metaData.currentEvent.song.name;
      search_string = artist + ' - ' + song;
    }

    searchYoutube(search_string);
  });
}

function zeroPad(number) {
  return String('0'+number).slice(-2);
}


function searchYoutube(query) {
  console.log("Searching for song: " + query);

  gapis.discover('youtube', 'v3').execute(function(err, client) {
    if (err) {
      console.log("Error during client discovery: " + err);
      respond_error("Error discovering YouTube client.");
      return;
    }
    var params = { q: query, part: 'snippet'};
    client.youtube.search.list(params).withApiKey(config.APIKEY).execute(print_result);
  });
}

function print_result(err, response) {
  if(err) {
    console.log("Error retreiving YouTube video.");
    respond_error("Internal error, could not contact YouTube.");
    return;
  }
  page_res.send({items: response.items});
}

function respond_error(err) {
  error = {'error': err};
  page_res.send(error);
}

module.exports = router;
