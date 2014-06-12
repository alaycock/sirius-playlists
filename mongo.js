var MongoClient = require('mongodb').MongoClient;

/*
var songSchema = mongoose.Schema({
  source_artist: String,
  source_title: String,
  source_channel: String,
  time: Date,
  tracks: [{
    video_id: String,
    description: String,
    thumbnail: String,
    title: String
  }]
});*/

var database = {
  connect: function(onConnect) {
    MongoClient.connect('mongodb://localhost/test', function(err, db) {
      if (err) {
        console.log("Failed to connect to DB.");
        return;
      }

      var collection = db.collection('songQueue');

      onConnect(db, collection);

    });
  },

  findOrSaveTrack: function(toSave) {
    return function(db, collection) {



      var conditions = {
        source_channel: toSave.source_channel,
        time: toSave.time
      };

      console.log(conditions);

      var cursor = collection.findOne(conditions, function(err, doc) {
        if (err) {
          console.error(err);
          return;
        }

        if (doc)
          return doc;

        var options = {
          upsert: true
        };

        collection.update(conditions, toSave, options, function(err, doc) {
          if (err) {
            console.error(err);
            db.close();
            return;
          }
          console.log(doc);
          db.close();
        });


      });


//      collection.update();

    }
  }
}

module.exports = database;
