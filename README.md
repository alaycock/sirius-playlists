serious-playlists
=================

SiriusXM scraper + playlist generator which powers [Serious Playlists](http://music.adamlaycock.ca/)

It's a web service that scrapes the Sirius XM 'now playing' data, finds it on youtube, and plays as it is scraped. It's a makeshift free internet satellite radio service, with just the music.

Usage
-----

Hopefully it should be pretty self-explanitory, load the page, select a station, and every 30 seconds it will search for a new track. If there is one, it will add it to the song queue. Songs are search for, and played through, YouTube. When a song ends, the next one will come on.

Installation
------------

1.  Clone this repo
2.  Install Node.js, NPM, & Foreman (`gem install foreman`)
3.  Install MongoDB and ensure you can connect to it. I use docker, so I would use this command: `docker run -p 27017:27017 --name sirius_mongo -d mongo`
4.  Setup your environment file in `.env`. See below for the environment variables you should include.
5.  `foreman start` to start the web server on `localhost:3000`

Environment Variables
------

```
MONGO_DB=mongodb://0.0.0.0:27017
YT_API_KEY=XXXXXXXXXXXXXXXXXXXX
```

Additionally, I deploy to Openshift, so in my prod environment I could ensure I have the variables `OPENSHIFT_NODEJS_PORT` and `OPENSHIFT_NODEJS_IP`.

To Do
-----

*  Make it pretty
*  Improve the song queue, make it one big long queue, instead of a upcoming and completed one.
*  Make priority list for stations (using a sortable list)
*  Improve the logic for selecting tracks, eg, grab 5 at startup to build the queue, select random previous song from that day if queue is empty, etc.
