import mongoose from "mongoose";
const Schema = mongoose.Schema;
const fileSchema = new Schema({
  _id: mongoose.Schema.Types.ObjectId,
  imagesArray: {
    type: Array
  }
}, {
  collection: 'files'
});
export default mongoose.model('File', fileSchema);
