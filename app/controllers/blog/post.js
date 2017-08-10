var express = require('express'),
	router = express.Router(),
	mongoose = require('mongoose'),
	Post = mongoose.model('Post'),
	Category = mongoose.model('Category');

module.exports = function (app) {
	app.use('/posts', router);
};

router.get('/', function (req, res, next) {
	var conditions = {
		published: true
	};
	if (req.query.keyword) {
		conditions.title = new RegExp(req.query.keyword.trim(), 'i');
		conditions.content = new RegExp(req.query.keyword.trim(), 'i');
	}
	Post.find(conditions).sort({
		created: -1
	}).populate('author').populate('category').exec(function (err, posts) {
		if (err) {
			return next(err);
		}
		var pageNum = Math.abs(parseInt(req.query.page || 1, 10));
		var pageSize = 10;
		var totalCount = posts.length;
		var pageCount = Math.ceil(totalCount / pageSize);
		if (pageNum > pageCount) {
			pageNum = pageCount;
		}
		res.render('block/index', {
			posts: posts.slice((pageNum - 1) * pageSize, pageNum * pageSize),
			pageNum: pageNum,
			pageCount: pageCount,
			pretty: true,
			keyword: req.query.keyword
		});
	});
});
router.get('/category/:title', function (req, res, next) {
	Category.findOne({
		title: req.params.title
	}).exec(function (err, category) {
		if (err) {
			return next(err);
		}
		Post.find({
			category: category,
			published: true
		}).sort({
			'created': -1
		}).exec(function (err, posts) {
			if (err) {
				return next(err);
			}
			res.render('block/category', {
				posts: posts,
				pretty: true,
				category: category
			});
		});
	});
});
router.get('/view/:id', function (req, res, next) {

	if (!req.params.id) {
		return next(new Error('no post id in provided!'));
	}

	var conditions = {};
	try {
		conditions._id = mongoose.Types.ObjectId(req.params.id);
	} catch (err) {
		conditions.slug = req.params.id;
	}

	Post.findOne(
		conditions
	).populate('category').populate('author').exec(function (err, post) {
		if (err) {
			return next(err);
		}
		res.render('block/view', {
			post: post
		});
	});
});
router.get('/favorite/:id', function (req, res, next) {

	if (!req.params.id) {
		return next(new Error('no post id in provided!'));
	}

	var conditions = {};
	try {
		conditions._id = mongoose.Types.ObjectId(req.params.id);
	} catch (err) {
		conditions.slug = req.params.id;
	}

	Post.findOne(
		conditions
	).populate('category').populate('author').exec(function (err, post) {
		if (err) {
			return next(err);
		}
		post.meta.favourates = post.meta.favourates ? post.meta.favourates + 1 : 1;
		post.markModified('meta');
		post.save(function (err) {
			res.redirect('/posts/view/' + post.slug);
		});
	});
});
router.post('/comment/:id', function (req, res, next) {
	if (!req.body.email) {
		return next(new Error("no email provided for comment!"));
	}
	if (!req.body.text) {
		return next(new Error("no content provided for coment!"));
	}
	var conditions = {};
	try {
		conditions._id = mongoose.Types.ObjectId(req.params.id);
	} catch (err) {
		conditions.slug = req.params.id;
	}
	Post.findOne(
		conditions
	).exec(function (err, post) {
		if (err) {
			return next(err);
		}
		var comment = {
			email: req.body.email,
			content: req.body.text,
			created: new Date()
		};
		post.comment.unshift(comment);
		post.markModified('comment');
		post.save(function (err, post) {
			req.flash('info', '评论添加成功!');
			res.redirect('/posts/view/' + post.slug);
		});
	});
	//res.jsonp(req.body);
});
