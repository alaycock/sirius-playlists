serious-playlists
=================

SiriusXM scraper + playlist generator which powers [Serious Playlists](http://music.adamlaycock.ca/)

It's a web service that scrapes the Sirius XM 'now playing' data, finds it on youtube, and plays as it is scraped. It's a makeshift free internet satellite radio service, with just the music.

Installation
------------

1.  Clone this repo
2.  Install npm
3.  Get a Youtube API key and set it to the environment variable YT_API_KEY
4.  Install MongoDB and ensure you can connect to it
5.  `npm install` to install dependencies
6.  `npm start` to start the web server on localhost:3000

To Do
-----

*  Make it pretty
*  Improve the song queue, when the application loads, build a queue of old songs.
*  Make priority list for stations (using a sortable list)
*  Get a complete list of stations.
*  If there isn't anything in the DB for a specific channel and time, grab the most recent track
