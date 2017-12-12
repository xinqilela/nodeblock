var express = require('express'),
	router = express.Router(),
	mongoose = require('mongoose'),
	slug = require('slug'),
	Post = mongoose.model('Post'),
	Category = mongoose.model('Category'),
	User = mongoose.model('User'),
	pinyin = require('pinyin'),
	deasync=require('deasync');
var auth = require('./user'),
	category = require('./category');
var pageSize=5;
module.exports = function (app) {
	app.use('/admin/manager', router);
};
router.get('/users',function(req,res,next){
	var condition={};
	condition.identify=0;
	if(req.query.username){
		condition.username=req.query.username;
	}
	User.find(condition).exec(function(err,users){
		if(err){
			return next(err);
		}
		var totalUsers=users.length,
			totalPage=Math.ceil(totalUsers/pageSize);
		var curPage=Math.abs(parseInt(req.query.page||1));
		if(curPage>totalPage){
			curPage=totalPage;
		}
		res.render('admin/manager/user',{
			users:users.slice((curPage-1)*pageSize,curPage*pageSize),
			totalPage:totalPage,
			curPage:curPage
		});
	});
});
router.get('/users/delete/:id',function(req,res,next){
	if(!req.params.id){
		return next(new Error('删除用户失败！'));
	}
	Post.remove({author:req.params.id}).exec(function(err,rowsRemoved){
		if (err) {
			return next(err);
		}
		if(rowsRemoved){
            User.remove({
		            _id: req.params.id
	            }).exec(function (err, rowsRemoved) {
		            if (err) {
			            return next(err);
		            }
		            if (rowsRemoved) {
			            req.flash('success', '用户删除成功!');
		            } else {
			            req.flash('success', '用户删除失败!');
		            }
		            res.redirect('/admin/manager/users');
	            });
		}
	});
});
router.get('/users/userinfo/:id',function(req,res,next){
	if(!req.params.id){
		return next(new Error('查询用户信息失败!'));
	}
	User.findOne({
		_id:req.params.id
	}).exec(function(err,user){
		if(err){
			return next(new Error('用户查找失败!'));
		}
	    Post.find({author:req.params.id}).populate('author').populate('category').exec(function(err,posts){
                  res.render('admin/manager/userinfo',{
				                  username:user.username,
				                  email:user.email,
				                  created:user.created,
				                  identify:user.identify,
				                  userimg:user.img,
				                  posts:posts
			                  });
	    });
			
	});
});
router.get('/managers',auth.requireLogin,function(req,res,next){
	var condition={};
	condition.identify=1;
	if(req.query.username){
		condition.username=req.query.username;
	}
	User.find(condition).exec(function(err,users){
		if(err){
			return next(err);
		}
		var totalUsers=users.length,
			totalPage=Math.ceil(totalUsers/pageSize);
		var curPage=Math.abs(parseInt(req.query.page||1));
		if(curPage>totalPage){
			curPage=totalPage;
		}
		res.render('admin/manager/manager',{
			users:users.slice((curPage-1)*pageSize,curPage*pageSize),
			totalPage:totalPage,
			curPage:curPage
		});
	});
});
router.get('/managers/delete/:id',function(req,res,next){
	if(!req.params.id){
		return next(new Error('删除管理员失败！'));
	}
	User.remove({
		            _id: req.params.id
	            }).exec(function (err, rowsRemoved) {
		            if (err) {
			            return next(err);
		            }
		            if (rowsRemoved) {
			            req.flash('success', '用户删除成功!');
		            } else {
			            req.flash('success', '用户删除失败!');
		            }
		            res.redirect('/admin/manager/managers');
	            });
});
router.get('/categories',auth.requireLogin,function(req,res,next){
	var condition={};
	if(req.query.title){
		condition.title=req.query.title;
	}
	Category.find(condition).populate('author').exec(function(err,categories){
		var totalCategories=categories.length,
			totalPage=Math.ceil(totalCategories/pageSize);
		var curPage=Math.abs(parseInt(req.query.page||1));
		if(curPage>totalPage){
			curPage=totalPage;
		}
		if(err){
			return next;
		}
		res.render('admin/manager/category',{
			categories:categories.slice((curPage-1)*pageSize,curPage*pageSize),
			totalPage:totalPage,
			curPage:curPage
		});
	});
});
router.get('/categories/delete/:id',function(req,res,next){
	if(!req.params.id){
		return next(new Error('删除分类失败！'));
	}
	Post.remove({category:req.params.id}).exec(function(err,rowsRemoved){
		if (err) {
			return next(err);
		}
		if(rowsRemoved){
            Category.remove({
		            _id: req.params.id
	            }).exec(function (err, rowsRemoved) {
		            if (err) {
			            return next(err);
		            }
		            if (rowsRemoved) {
			            req.flash('success', '分类删除成功!');
		            } else {
			            req.flash('success', '分类删除失败!');
		            }
		            res.redirect('/admin/manager/categories');
	            });
		}
	});
});
router.get('/comments',auth.requireLogin,function(req,res,next){
	res.render('admin/manager/comment')
});
router.get('/blogs',auth.requireLogin,function(req,res,next){
	var condition={};
	if(req.query.title){
		condition.title=req.query.title;
	}
	Post.find(condition).populate('author').populate('category').exec(function(err,posts){
		var totalPosts=posts.length,
			totalPage=Math.ceil(totalPosts/pageSize);
		var curPage=Math.abs(parseInt(req.query.page||1));
		if(curPage>totalPage){
			curPage=totalPage;
		}
		if(err){
			return next;
		}
		res.render('admin/manager/blog',{
			posts:posts.slice((curPage-1)*pageSize,curPage*pageSize),
			totalPage:totalPage,
			curPage:curPage
		});
	});
});
router.get('/chart',auth.requireLogin,function(req,res,next){
	res.render('admin/manager/chart');
});
router.get('/chart/data',auth.requireLogin,function(req,res,next){
	let result=[];
	Category.find().then((categories)=>{
		categories.forEach((item)=>{
			var opt={};
			var cur_category_title=item.title,
			cur_category_id=item.id;
			opt.name=cur_category_title;
			Post.find({category:cur_category_id}).exec(function(err,posts){
				opt.value=posts.length;
			});
			deasync.loopWhile(function(){return opt.value==undefined});
			result.push(opt);
		});
		return res.json(result);
	});
});
router.get('/logout',auth.requireLogin,function(req,res,next){
	req.logout();
	res.redirect('/');
});