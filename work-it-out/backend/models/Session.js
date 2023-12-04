const { Schema, model, default: mongoose } = require("mongoose");

const SessionSchema = new Schema({
  date : Date,
  user : {
    type : mongoose.Schema.Types.ObjectId, 
    ref : 'User',
    required : true
  },
  Sets : [{
    type : mongoose.Schema.Types.ObjectId,
    ref : 'Set',
    required : true
  }]
});


const Session = model("Session", SessionSchema);

module.exports = Session;