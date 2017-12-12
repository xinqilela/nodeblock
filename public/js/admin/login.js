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
		var url=window.location.href;
		var id=url.substring(url.lastIndexOf('/')+1);
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
});