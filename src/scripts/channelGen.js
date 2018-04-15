const rawChannels = require("./rawChannels");

// {
//   "id": 2740,
//   "title": "MLB Play-by-Play Sports 178",
//   "classes": " sports siriusxm-all-access siriusxm-select xm-all-access xm-select",
//   "genre_sort": "baseball",
//   "permalink": "http:\/\/www.siriusxm.ca\/channels\/mlb-play-by-play-sports-178\/",
//   "logo": "http:\/\/www.siriusxm.ca\/wp-content\/uploads\/2014\/05\/MLB-Play-by-Play-Sports.png",
//   "category": "Sports",
//   "genre": "Baseball",
//   "sub_genre": "MLB",
//   "description": "Live MLB Play-by-Play",
//   "what_youll_hear": "Live MLB Play-by-Play.",
//   "sirius_channel_number": "",
//   "xm_channel_number": "178",
//   "channel_key": "8269",
//   "sirius_availability": "",
//   "xm_availability": "XM Satellite Only",
//   "sirius_plans": [],
//   "xm_plans": ["XM All Access", "XM Select"],
//   "siriusxm_plans": ["SiriusXM All Access", "SiriusXM Select"],
//   "listen_live": "MLBPlaybyPlay178"
// },

module.exports = rawChannels.filter((channel) => {
  return channel.category === "Music";
}).map((channel) => {
  return {
    key: channel.title,
    value: channel.channel_key,
    genre: channel.genre,
    number: channel.xm_channel_number
  };
});
