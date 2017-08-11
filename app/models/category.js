// Example model

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var CategorySchema = new Schema({
	title: {
		type: String,
		required: true
	},
	slug: {
		type: String,
		required: true
	},
	created: {
		type: Date
	},
	author: {
		type: Schema.Types.ObjectId,
		ref: 'User'
	}
});

mongoose.model('Category', CategorySchema);
