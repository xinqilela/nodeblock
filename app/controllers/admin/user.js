var express = require('express'),
	router = express.Router(),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	md5 = require('md5'),
	passport = require('passport'),
	multer = require('multer'),
	config = require('../../../config/config');
var User = mongoose.model('User');
var upload = multer({
	dest: config.root + '/public/img'
});
module.exports = function (app) {
	app.use('/admin/users', router);
};
module.exports.requireLogin = function (req, res, next) {
	if (req.user) {
		next();
	} else {
		req.flash('error', '用户登陆才能访问!');
		res.redirect('/admin/users/login');
	}
};
//登录
router.get('/login', function (req, res, next) {
	res.render('admin/user/login', {
		pretty: true
	});
});
router.post('/login', passport.authenticate('local', {
	failureRedirect: '/admin/users/login',
	failureFlash: '用户名或密码错误!'
}), function (req, res, next) {
	console.log('user login success:', req.body);
	res.redirect('/admin/posts');
});
router.post('/adminLogin',passport.authenticate('local'),
	function(req,res,next){
	console.log('user login success:', req.body);
	res.redirect('/admin/manager/users');
});
//注册
router.get('/register', function (req, res, next) {
	res.render('admin/user/register', {
		pretty: true
	});
});
router.post('/register', function (req, res, next) {

	req.checkBody('email', '邮箱不能为空').notEmpty().isEmail();
	req.checkBody('password', '密码不能为空').notEmpty();
	req.checkBody('confirmPassword', '两次密码不一致').notEmpty().equals(req.body.password);

	var errors = req.validationErrors();
	if (errors) {
		console.log(errors);
		return res.render("admin/user/register", req.body);
	}

	var user = new User({
		username: req.body.email.split('@').shift(),
		email: req.body.email,
		password: md5(req.body.password),
		created: new Date(),
		identify:0
	});

	user.save(function (err, user) {
		if (err) {
			return next(err);
			req.flash('error', '用户注册失败');
			res.render('admin/user/register');
		} else {
			req.flash('info', '用户注册成功');
			res.render('admin/user/register');
		}

	});
});

//用户信息
router.get('/message/:id', function (req, res, next) {
	res.render('admin/user/userinfo', {
		pretty: true
	});
});
router.post('/message/:id', upload.single('img'), function (req, res, next) {
	
	User.findOne({
		_id: req.user._id
	}, function (err, user) {
		if (err) {
			return next(err);
		} else {
			user.img = '/img/' + req.file.filename;
			user.save(function (err, user) {
				if (err) {
					console.log('上传头像失败!');
					req.flash('error', '上传头像失败!');
				} else {
					res.render('admin/user/userinfo', {
						pretty: true,
						userimg: user.img
					});
					req.flash('info', '上传头像成功!');
				}
			});
		}
	});
});
//退出
router.get('/loginout', function (req, res, next) {
	req.logout();
	res.redirect('/');
});
