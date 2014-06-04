serious-playlists
=================

SeriusXM scraper + playlist generator

It's a web service that scrapes the Sirius XM 'now playing' data, finds it on youtube, and plays as it is scraped. It's a makeshift free internet satellite radio service, with just the music.

Installation
------------

1.  Clone this repo
2.  Install npm
3.  `npm install` to install dependencies
4.  `npm start` to start the web server on localhost:3000

Current Issues
--------------

*  Web service doesn't work behind a proxy
*  No visible playlist
*  Only includes one Sirius XM channel (BPM), but can be easily modified in getsong.js
*  No caching/database, a fresh scrape is done every time /getsong is requested
*  Empty website
*  No 'next' or 'prev' buttons
*  /getsong returns too much irrelevant metadata
