/**
 * Created by Administrator on 2017/11/19 0019.
 */
var mongoose=require('mongoose'),
  Schema=mongoose.Schema;
var ResponseSchema=new Schema({
  author:{
    type:Schema.Types.ObjectId,
    ref:'User',
    required:true
  },
  post:{
    type:Schema.Types.ObjectId,
    ref:'Post',
    required:true
  },
  created:{
    type:Date,
    required:true
  },
  content:{
    type:String,
    required:true
  },
  response:{
    type:Schema.Types.ObjectId,
    ref:'Response'
  }
});
mongoose.model('Response',ResponseSchema);
