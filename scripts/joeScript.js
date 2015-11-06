$(function(){

	
$('#').on('click',function(){
	$(this).fadeOut().fadeIn(swapPic());

	
})
	
	function firstPic(){
		document.getElementById('pic1').src = "assets/runners.jpg";
		document.getElementById('pic2').src = "assets/x-ray-runner.jpg";
		document.getElementById('pic3').src = "assets/Womens-Health-Month.jpg";
	}

	function swapPic(){
		document.getElementById('pic1').src = "assets/title.png";
		document.getElementById('pic2').src = "assets/sanquentin.png";
		document.getElementById('pic3').src = "assets/handcuffs.png";
	}
	
	
});