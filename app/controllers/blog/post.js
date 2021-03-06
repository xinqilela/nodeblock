var express = require('express'),
	router = express.Router(),
	mongoose = require('mongoose'),
	Post = mongoose.model('Post'),
	Category = mongoose.model('Category');
var auth = require('../admin/user');
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
		var pageSize = 5;
		var totalCount = posts.length;
		var pageCount = Math.ceil(totalCount / pageSize);
		if (pageNum > pageCount) {
			pageNum = pageCount;
		}
		// return res.send(posts);
		res.render('blog/index', {
			posts: posts.slice((pageNum - 1) * pageSize, pageNum * pageSize),
			pageNum: pageNum,
			pageCount: pageCount,
			pretty: true,
			keyword: req.query.keyword || ""
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
		}).populate('category').populate('author').sort({
			'created': -1
		}).exec(function (err, posts) {
			if (err) {
				return next(err);
			}
			res.render('blog/category', {
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
		res.render('blog/view', {
			post: post
		});
	});
});
router.get('/favorite/:id', auth.requireLogin, function (req, res, next) {
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
		post.meta.fabulous = post.meta.fabulous ? post.meta.fabulous + 1 : 1;
		post.markModified('meta');
		post.save(function (err) {
			res.redirect('/posts/view/' + post.slug);
		});
	});
});
router.post('/comment/:id', auth.requireLogin, function (req, res, next) {
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
			email: req.user.email,
			content: req.body.text,
			created: new Date(),
			img:req.user.img
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
