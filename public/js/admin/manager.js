$(document).ready(function(){
	//普通用户管理
	$('.form-search .fingUser').click(function(){
		// method="get",action="/admin/manager/users"
		var url="/admin/manager/users",
		    _username=$('#username').val();
		$.get(url,{
			username:_username
		});
	});
});