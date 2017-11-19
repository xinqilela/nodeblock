var express = require('express'),
	router = express.Router(),
	mongoose = require('mongoose'),
	slug = require('slug'),
	Post = mongoose.model('Post'),
	Category = mongoose.model('Category'),
	User = mongoose.model('User'),
	pinyin = require('pinyin');
var auth = require('./user'),
	category = require('./category');
module.exports = function (app) {
	app.use('/admin/posts', router);
};
router.get('/', auth.requireLogin, category.getMyCategories, function (req, res, next) {

	//排序功能
	var sortby = req.query.sortby ? req.query.sortby : 'created';
	var sortdir = req.query.sortdir ? req.query.sortdir : 'desc';
	if (['title', 'category', 'author', 'created', 'published'].indexOf(sortby) === -1) {
		sortby = 'created';
	}
	if (['desc', 'asc'].indexOf(sortdir) === -1) {
		sortdir = 'desc';
	}
	var sortObj = {};
	sortObj[sortby] = sortdir;

	//条件筛选功能
	var conditions = {};
	if (req.query.category) {
		conditions.category = req.query.category.trim();
	}
	if (req.query.keyword) {
		conditions.title = new RegExp(req.query.keyword.trim(), 'mig');
		conditions.content = new RegExp(req.query.keyword.trim(), 'mig');
	}
	User.findOne({
		_id: req.user._id
	}, function (err, author) {
		if (err) {
			return next(err);
		}
		conditions.author = author;
		Post.find(conditions).sort(sortObj).populate('author').populate('category').exec(function (err, posts) {

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
			res.render('admin/post/index', {
				posts: posts.slice((pageNum - 1) * pageSize, pageNum * pageSize),
				pageNum: pageNum,
				pageCount: pageCount,
				sortdir: sortdir,
				sortby: sortby,
				pretty: true,
				author: author,
				mycategories: req.mycategories,
				filter: {
					category: req.query.category || "",
					author: req.query.author || "",
					keyword: req.query.keyword || ""
				}
			});
		});
	});
});
router.get('/add', auth.requireLogin, category.getMyCategories, function (req, res, next) {
	res.render('admin/post/add', {
		pretty: true,
		action: "/admin/posts/add",
		mycategories: req.mycategories,
		post: {
			category: {
				_id: ""
			}
		}
	});
});
router.post('/add', auth.requireLogin, function (req, res, next) {
	//return res.send(req.user);
	//服务端校验
	req.checkBody('title', '文章标题不能为空').notEmpty();
	req.checkBody('category', '必须指定文章分类').notEmpty();
	req.checkBody('content', '文章内容至少写几句').notEmpty();

	var errors = req.validationErrors();
	if (errors) {
		return res.render('admin/post/add', {
			errors: errors,
			title: req.body.title,
			content: req.body.content
		});
	}

	var title = req.body.title.trim();
	var category = req.body.category.trim();
	var content = req.body.content;
	User.findOne({
		_id: req.user._id
	}, function (err, author) {
		if (err) {
			return next(err);
		}
		var py = pinyin(title, {
			style: pinyin.STYLE_NORMAL,
			heteronym: false
		}).map(function (item) {
			return item[0];
		}).join(' ');

		var post = new Post({
			title: title,
			slug: slug(py),
			category: category,
			content: content,
			author: author,
			published: true,
			meta: {
        fabulous: 0
			},
			comment: [],
			created: new Date()
		});
		post.save(function (err, post) {
			if (err) {
				req.flash('error', '文章保存失败');
				res.redirect('/admin/posts/add');
			} else {
				req.flash('info', '文章保存成功');
				res.redirect('/admin/posts');
			}
		});
	});
});
router.get('/edit/:id', auth.requireLogin, getPostById, category.getMyCategories, function (req, res, next) {
	res.render('admin/post/add', {
		post: req.post,
		action: "/admin/posts/edit/" + req.post._id,
		mycategories: req.mycategories
	});
});
router.post('/edit/:id', auth.requireLogin, getPostById, function (req, res, next) {
	var post = req.post;
	var title = req.body.title.trim();
	var category = req.body.category.trim();
	var content = req.body.content;

	var py = pinyin(title, {
		style: pinyin.STYLE_NORMAL,
		heteronym: false
	}).map(function (item) {
		return item[0];
	}).join(" ");

	post.title = title;
	post.category = category;
	post.content = content;
	post.slug = slug(py);
	post.author = req.user;

	post.save(function (err, post) {
		if (err) {
			console.log('post/edit error:', err);
			req.flash('error', '文章编辑失败');
			res.redirect('/admin/posts/edit/' + post._id);
		} else {
			req.flash('info', '文章编辑成功');
			res.redirect('/admin/posts');
		}
	});
});
router.get('/delete/:id', auth.requireLogin, function (req, res, next) {
	if (!req.params.id) {
		return next(new Error('no post id provided!'));
	}
	Post.remove({
		_id: req.params.id
	}).exec(function (err, rowsRemoved) {
		if (err) {
			return next(err);
		}
		if (rowsRemoved) {
			req.flash('success', '文章删除成功!');
		} else {
			req.flash('success', '文章删除失败!');
		}
		res.redirect('/admin/posts');
	});
});

function getPostById(req, res, next) {
	if (!req.params.id) {
		return next(new Error('no post id provided!'));
	}
	Post.findOne({
			_id: req.params.id
		})
		.populate('category')
		.populate('author')
		.exec(function (err, post) {
			if (err) {
				return next(err);
			}
			if (!post) {
				return next(new Error('post not found:', req.params.id));
			}
			req.post = post;
			next();
		});
}
