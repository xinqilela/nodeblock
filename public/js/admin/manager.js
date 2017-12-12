$(document).ready(function(){
	//搜索
	var now_url=window.location.href;
	var target_url='',
		target_option={};
	$('.form-search .fingUser').click(function(){
		if(now_url.indexOf("/admin/manager/users")){
			target_url="/admin/manager/users";
			target_option.username=$('#username').val();
		}
		if(now_url.indexOf("/admin/manager/managers")){
			target_url="/admin/manager/managers";
			target_option.username=$('#username').val();
		}
		if(now_url.indexOf("/admin/manager/categories")){
			target_url="/admin/manager/categories";
			target_option.category=$('#category').val();
		}
		if(now_url.indexOf("/admin/manager/blogs")){
			target_url="/admin/manager/blogs";
			target_option.title=$('#blog').val();
		}
		$.get(target_url,target_option);
	});
	//图表
	$.get('/admin/manager/chart/data',function(datas){
		var result=[];
		for(var i=0;i<datas.length;i++){
			var cur=datas[i];
			if(cur.value>0){
				result.push(cur);
			}
		}
		var legend_data=result.map((item)=>{
			return item.name;
		});
		// debugger
		var mychart=echarts.init(document.getElementById('category-post-chart'));
		var option = {
            tooltip: {
                trigger: 'item',
                formatter: "{a} <br/>{b}: {c} ({d}%)"
            },
            legend: {
                orient: 'vertical',
                x: 'left',
                data:legend_data
            },
            series: [
                {
                    name:'文章数量',
                    type:'pie',
                    radius: ['30%', '55%'],
                    label: {
                        normal: {
                            formatter: '{a|{a}}{abg|}\n{hr|}\n  {b|{b}：}{c}  {per|{d}%}  ',
                            backgroundColor: '#eee',
                            borderColor: '#aaa',
                            borderWidth: 1,
                            borderRadius: 4,
                            rich: {
                                a: {
                                    color: '#999',
                                    lineHeight: 22,
                                    align: 'center'
                                },
                                hr: {
                                    borderColor: '#aaa',
                                    width: '100%',
                                    borderWidth: 0.5,
                                    height: 0
                                },
                                b: {
                                    fontSize: 16,
                                    lineHeight: 33
                                },
                                per: {
                                    color: '#eee',
                                    backgroundColor: '#334455',
                                    padding: [2, 4],
                                    borderRadius: 2
                                }
                            }
                        }
                    },
                    data:result
                }
            ]
        };
        mychart.setOption(option);
	});
});