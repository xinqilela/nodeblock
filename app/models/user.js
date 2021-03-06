// Example model

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;
var md5 = require('md5');
var UserSchema = new Schema({
	username: {
		type: String,
		required: true
	},
	email: {
		type: String,
		required: true
	},
	password: {
		type: String,
		required: true
	},
	created: {
		type: Date
	},
	img: {
		type: String
	},
	identify:{
		type:Number
	}
});
UserSchema.methods.verifyPassword = function (password) {
	var isMatch = (md5(password) === this.password);
	console.log('UserSchema.methods.verifyPassword:', password, this.password, isMatch);
	return isMatch;
};
mongoose.model('User', UserSchema);
