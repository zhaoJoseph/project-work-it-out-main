const { Schema, model, default: mongoose } = require("mongoose");

const SetSchema = new Schema({
  session : {
    type : mongoose.Schema.Types.ObjectId,
    ref : 'Session',
    required : 'Session required'
  },
  // type of workout
  workout : {
    type : String,
    required : true
  },
  bodyPart : {
    type : String,
    required : true,
    enum: ['waist', 'upper legs', 'back', 'cardio', 'chest', 'lower arms', 'lower legs', 'neck', 'shoulders', 'upper arms', 'full body'],
    default : 'full body'
  },
  setNumber : {
    type: Number,
    required : true
  },
  duration : {
    type : String,
    required : true
  },
  reps: Number,
  // resistance during workout
  weight : Number,
  // heart rate
  hr : Number,
  // calories burned
  calories : Number,
  // rest time in seconds
  rest: Number,
  // distance
  distance : String,
  // elevation
  elevation : String

});


const Set = model("Set", SetSchema);

module.exports = Set;