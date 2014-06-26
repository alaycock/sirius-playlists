var MongoClient = require('mongodb').MongoClient;

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

  saveTrack: function(toSave) {
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
            console.error(err, doc);
            db.close();
            return;
          }
          console.log(err, doc);
          db.close();
        });


      });

    }
  }
}

module.exports = database;
