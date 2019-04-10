var MongoClient = require("mongodb").MongoClient;

var database = {
  findTrack: function(db, toFind, cb) {
    var collection = db.get("songQueue");

    var conditions = {
      source_channel: toFind.source_channel,
      time: toFind.time
    };

    console.log("searching for:", conditions);

    var cursor = collection.findOne(conditions, function(err, doc) {
      if (err) {
        console.error("Error:", err);
        return;
      }
      cb(doc);
    });
  },

  saveTrack: function(db, toSave) {
    var collection = db.get("songQueue");
    var conditions = {
      source_channel: toSave.source_channel,
      time: toSave.time
    };

    var options = {
      upsert: true
    };

    collection.update(conditions, toSave, options, function(err, doc) {
      if (err) {
        console.log(err);
      }
    });
  }
};

module.exports = database;
