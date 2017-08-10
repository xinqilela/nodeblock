$(document).ready(function () {
	//条件筛选
	var ndCategory = $("#js-category");
	var ndAuthor = $("#js-author");
	var ndKeyword = $("#js-keyword");
	$("js-filter-submit").on("click", function () {
		var query = queryString.parse(location.search);
		var category = ndCategory.val();
		var author = ndAuthor.val();
		var keyword = ndKeyword.val();
		if (category) {
			query.category = category;
		} else {
			delete query.category;
		}
		if (author) {
			query.author = author;
		} else {
			delete query.author;
		}
		if (keyword) {
			query.keyword = keyword;
		} else {
			delete query.keyword;
		}
		console.log(queryString.stringify(query));
		window.location.url = window.location.origin + window.location.pathname + queryString.stringify(query);
	});
	//富文本编辑器初始化
	CKEDITOR.replace('js-post-content');
});
