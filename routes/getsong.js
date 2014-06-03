var config = require('../config');
var express = require('express');
var router = express.Router();
var request = require('request');
var gapis = require('googleapis');
var apiKey = process.argv[2];
var channel = "thebeat";
var data_url = "http://www.siriusxm.com/metadata/pdt/en-us/json/channels/" + channel + "/timestamp/";
var page_res;

router.get('/', function(req, res) {

  console.log("Getting song.");
  page_res = res;
  var time_source = "http://www.siriusxm.com/sxm_date_feed.tzi";

  getRadioData(new Date());
});

function getRadioData(time) {

  console.log(time);

  date_string =
    zeroPad(time.getUTCMonth() + 1) + "-" +
    zeroPad(time.getUTCDate()) + "-" +
    zeroPad(time.getUTCHours()) + ":" +
    zeroPad(time.getUTCMinutes()) + ":" + "00";

  data_url = data_url + date_string;

  console.log(data_url);

  request({uri: data_url}, function(err, response, body) {
    if(err && response.statusCode !== 200){console.log('Request error.'); return;}


    data = JSON.parse(body);

    //console.log(data.channelMetadataResponse.metaData.currentEvent);

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
  console.log(query);

  gapis.discover('youtube', 'v3').execute(function(err, client) {
    if (err) {
      console.log("Error during client discovery: " + err);
      return;
    }
    var params = { q: query, part: 'snippet'};
    client.youtube.search.list(params).withApiKey(config.APIKEY).execute(print_result);
  });
}

function print_result(err, response) {
  console.log(JSON.stringify(err) + response);
  if(err) {
    console.log("Error retreiving YouTube video.");
    page_res.send("{}");
    return;
  }

  page_res.send(response.items);
}

module.exports = router;