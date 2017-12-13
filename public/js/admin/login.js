$(document).ready(function () {
 
	//用户权限选择ui设置
	$("#radioGroup span.left").click(function(){
		$(this).addClass('active').siblings().removeClass('active');
	});
	$("#radioGroup span.right").click(function(){
		$(this).addClass('active').siblings().removeClass('active');
	});

	//登录
	$('#userLogin button').click(function(){
		var isAdmin=$("#radioGroup span.left").hasClass('active'),
		    isUser=$("#radioGroup span.right").hasClass('active');
		if(isUser){
			$('#userLogin form').attr('action','/admin/users/login');
		}
		if(isAdmin){
			$('#userLogin form').attr('action','/admin/users/adminLogin');
		}
	});

	//用户头像上传
	$('.userInfoContainer .user-img').click(function(){
		$('.userInfoContainer #imginput').trigger('click');
	});
	$('.userInfoContainer #imginput').change(function(){
		$('.userInfoContainer button.upload_btn').trigger('click');
	});
	$('.userInfoContainer button.upload_btn').click(function(){
		var id=$('span.userId').text();
		var file=$('#imginput')[0];
		var formdata=new FormData();
		formdata.append('img',file.files[0]);
		$.ajax({
            url: '/admin/users/message/'+id,
            type: 'POST',
            data: formdata,
            processData: false,
    		contentType: false
        });
         
	});
	//用户密码修改
	$('.editPassword').click(function(){
		var id=$('span.userId').text();
		var url="/admin/users/editUser/"+id;
		var _password=$('#password').val();
		$.post(url,{password:_password},function(){
			alert('ok');
		});
	});
});