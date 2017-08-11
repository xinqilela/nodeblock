var express = require('express'),
	router = express.Router(),
	mongoose = require('mongoose'),
	Post = mongoose.model('Post'),
	pinyin = require("pinyin"),
	slug = require("slug"),
	Category = mongoose.model('Category');
var auth = require('./user');
module.exports = function (app) {
	app.use('/admin/categories', router);
};
router.get('/', auth.requireLogin, function (req, res, next) {
	res.render('admin/category/index', {
		pretty: true
	});
});
router.get('/add', auth.requireLogin, function (req, res, next) {
	res.render('admin/category/add', {
		action: "/admin/categories/add",
		pretty: true,
		category: {
			_id: ""
		}
	});
});
router.post('/add', auth.requireLogin, function (req, res, next) {

	req.checkBody('title', '分类名称不能为空').notEmpty();
	var errors = req.validationErrors();
	if (errors) {
		console.log(errors);
		return res.render('admin/category/add', {
			errors: errors,
			title: req.body.title
		});
	}

	var title = req.body.title.trim();
	var py = pinyin(title, {
		style: pinyin.STYLE_NORMAL,
		heteronym: false
	}).map(function (item) {
		return item[0];
	}).join(' ');
	var category = new Category({
		title: title,
		slug: slug(py),
		created: new Date(),
		author: req.user
	});
	category.save(function (err, category) {
		if (err) {
			console.log('category/add error:', err);
			req.flash('error', '分类保存失败');
			res.redirect('/admin/categories/add');
		} else {
			req.flash('info', '分类保存成功');
			res.redirect('/admin/categories');
		}
	});
});
router.get('/edit/:id', auth.requireLogin, getCategoryById, function (req, res, next) {
	res.render('admin/category/add', {
		action: "/admin/categories/edit/" + req.category._id,
		category: req.category
	});
});
router.post('/edit/:id', auth.requireLogin, getCategoryById, function (req, res, next) {
	var category = req.category;
	var title = req.body.title.trim();
	var py = pinyin(title, {
		style: pinyin.STYLE_NORMAL,
		heteronym: false
	}).map(function (item) {
		return item[0];
	}).join(' ');
	category.title = title;
	category.slug = slug(py);
	category.save(function (err, category) {
		if (err) {
			console.log('category/edit error:', err);
			req.flash('error', '分类编辑失败');
			req.redirect('/admin/categories/edit/' + post._id);
		} else {
			req.flash('info', '分类编辑成功');
			res.redirect('/admin/categories');
		}
	});
});
router.get('/delete/:id', auth.requireLogin, getCategoryById, function (req, res, next) {
	req.category.remove(function (err, rowsRemoved) {
		if (err) {
			return next(err);
		}
		if (rowsRemoved) {
			req.flash('success', '分类删除成功');
		} else {
			req.flash('success', '分类删除失败');
		}
		res.redirect('/admin/categories');
	});
});

function getCategoryById(req, res, next) {
	if (!req.params.id) {
		return next(new Error('no category id provided!'));
	}
	Category.findOne({
		_id: req.params.id
	}).exec(function (err, category) {
		if (err) {
			return next(err);
		}
		if (!category) {
			return next(new Error('category not found:', req.params.id));
		}
		req.category = category;
		next();
	});
}
