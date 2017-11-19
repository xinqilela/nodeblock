//生成随机数据
var loremIpsum = require('lorem-ipsum'),
	slug = require('slug'),
	config = require('./config/config'),
	glob = require('glob'),
	mongoose = require('mongoose');

mongoose.connect(config.db, {
	useMongoClient: true
});
var db = mongoose.connection;
db.on('error', function () {
	throw new Error('unable to connect to database at ' + config.db);
});

var models = glob.sync(config.root + '/app/models/*.js');
models.forEach(function (model) {
	require(model);
});

var Post = mongoose.model('Post'),
	User = mongoose.model('User'),
	Category = mongoose.model('Category');
User.findOne(function (err, user) {
	if (err) {
		return console.log('cant find a user');
	}
	Category.find(function (err, categories) {
		if (err) {
			return console.log('cant find categories');
		}
		categories.forEach(function (category) {
			for (var i = 0; i < 35; i++) {
				var title = loremIpsum({
					count: 1,
					units: 'sentence'
				});
				var post = new Post({
					title: title,
					slug: slug(title),
					content: loremIpsum({
						count: 30,
						units: 'sentence'
					}),
					category: category,
					author: user,
					published: true,
					meta: {
						fabulous: 0
					},
					comment: [],
					created: new Date
				});
				post.save(function (err, post) {
					console.log('save post:' + post.slug)
				});
			}
		});
	});
});
