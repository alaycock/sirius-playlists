serious-playlists
=================

SiriusXM scraper + playlist generator

It's a web service that scrapes the Sirius XM 'now playing' data, finds it on youtube, and plays as it is scraped. It's a makeshift free internet satellite radio service, with just the music.

Installation
------------

1.  Clone this repo
2.  Install npm
3.  `npm install` to install dependencies
4.  `npm start` to start the web server on localhost:3000

To Do
-----

*  Add caching/database, instead of a fresh scrape every time /getsong is requested
*  Make it pretty
*  Add 'next' button
*  /getsong returns too much irrelevant metadata
*  Make priority list for stations
