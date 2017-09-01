(function(){
	var baseUrl = 'http://yanzhiwu.yepside.com/';
	function  loading() {
		var IMGURL = '';
		var loadData=[];
        var loadImgNum=0;
        $('.load-img').each(function(index,item){
            var src = $(item).attr('n-src');
            
            if (typeof src !== 'undefined') {
                $(item).attr('n-src', IMGURL+src);
                loadData.push($(item).attr('n-src'))
            }else{
                var bg_url = $(item).css('background-image');
                bg_url = bg_url.replace(/ /g, '', bg_url);
                bg_url = bg_url.replace(/url\(["']?/g, '', bg_url);
                bg_url = bg_url.replace(/["']?\)/g, '', bg_url);
                loadData.push(bg_url)
            }
            $(item).removeClass('load-img');
        })

        // console.log(loadData)
        jQuery.imgpreload(loadData,{
        	each:function(){
        		loadImgNum++;
                pre=Math.floor((loadImgNum/loadData.length)*100)+'%'
                // $('#loadProgress p').html(pre)
        	},
        	all:function(){
        		$('img').each(function(index,item){
                    $(item).attr('src',$(item).attr('n-src')).attr('n-src','')
                })
                $('#loading').hide();
                $('#wrapper').fadeIn();
                setTimeout(function(){
                	$('.logo').fadeIn();
                	$('.home-ani').fadeOut();
                	$('#homeWrapper').fadeIn();
                	drawPrize();
                },5000)
        	}
        })
	}


	function drawPrize(){
		var isClick = false
		$('.click_btn').bind('click',function(){
			if(!isClick){
				isClick = true;
				$.ajax({
			        type:'POST',
			        url:baseUrl+'flashRequest.php',
			        data:{'model':'Opt_price '},
			        dataType:'JSON',
			        success:function(data){
			        	isClick = false;
			            if(data.code==1){
			            	if(data.price==1){
			            		// 1 => 'LED表白',
			            		$('#prize_4').fadeIn();
			            		$('.submitBtn').click(function(){
			            			sendMsg(4)
			            		})
			            	}else if(data.price==2){
			            		// 2 => '燕窝表白',
			            		$('#prize_1').fadeIn();
			            		$('.submitBtn').click(function(){
			            			sendMsg(1)
			            		})
			            	}else if(data.price==3){
			            		// 3 => '面膜表白',
			            		$('#prize_2').fadeIn();
			            		$('.submitBtn').click(function(){
			            			sendMsg(2)
			            		})
			            	}else if(data.price==4){
			            		// 4 => '优步打车券',
			            		$('#prize_3').fadeIn();
			            		$('.getBtn').click(function(){
			            			window.location.href = 'https://gsactivity.diditaxi.com.cn/gulfstream/activity/v2/giftpackage/index?g_channel=9bb4e39a1de191062062f49f46a1037e';
			            		})
			            		
			            	}else if(data.price==5){
			            		// 5 => '优步定向弹屏',
			            		$('#prize_5').fadeIn();
			            		$('.submitBtn').click(function(){
			            			sendMsg(5)
			            		})
			            	}
			            }else if(data.code==2){
			            	uploadImage();
			            }
			        }
			    })
			}
			
		})
	}

	function sendMsg(id){
		var idnum = '#prize_'+id;
		var u_name = $(idnum).find('.username').val();
		var u_mobile = $(idnum).find('.usermobile').val();

		var reg = /^1[3|4|5|7|8][0-9]{9}$/; //验证规则

		if(!u_name){
			alert('请填写姓名')
			return;
		}
		if(!(/^1[34578]\d{9}$/.test(u_mobile))){
			alert('请填写正确的手机号码')
			return;
		}

		$.ajax({
			type:'POST',
			url:baseUrl+'flashRequest.php',
			data:{'model':'Opt_leavemsg','name':u_name,'mobile':u_mobile},
			dataType:'JSON',
			success:function(data){
				if(data.code==1){
					$('#successDiv').fadeIn();
					$('.againBtn').click(function(){
						window.location.reload();
					})
				}else{
					alert(data.msg);
				}
			}
		})
	}


	function uploadImage(){
        $('#upload_cont').fadeIn();

		var canvas = document.getElementById('myCanvas');
		canvas.width = 570;
    	canvas.height = 733;
		if (canvas.getContext) {
		  var ctx = canvas.getContext('2d');
		  ctx.clearRect(0,0,570,733);
		}
		var canvasBg =  new Image();
			canvasBg.src = 'images/upload_bg.png';
		canvasBg.onload=function(){
			ctx.drawImage(canvasBg,0,0,570,733);
		}

		var canvasimg = new Image();
		canvasimg.src = 'images/upload_mask_'+parseInt(Math.random()*3+1)+'.png';
		canvasimg.onload=function(){
			ctx.drawImage(canvasimg,0,492,522,240);
		}		


		$('#uploadInput,#reuploadInput').change(function(){
		    var file=this.files[0];
		    
		    var reader=new FileReader();
		    reader.onload=function(){
		        var url=reader.result;
		        setImageURL(url);
		    };
		    reader.readAsDataURL(file);
		});

		var image;
		function setImageURL(url){
			image=new Image();
		    image.src=url;
		    image.onload=function(){
		    	drawCanvas();
		    }
		}

		function drawCanvas(){
			var cw = 540,ch=700;
			var w = image.width;
			var h = image.height;
			console.log(w ,h);
			
			if(w/h<cw/ch){
				image.width = 540;
				image.height = 540*h/w
			}else{
				image.height = 700;
				image.width = 700*w/h
			}
			console.log(image.width,image.height);

			var sl = (540-image.width)/2;
			var st = (700-image.height)/2;


			$('.uploadIcon').hide();
			
			ctx.drawImage(image,sl+6,st+28,image.width,image.height);
			ctx.drawImage(canvasBg,0,0,570,733);

			ctx.drawImage(canvasimg,0,492,522,240);
			$('.reUpload,.submitImg').show();
			var isUpload = false;
			$('.submitImg').click(function(){
				var upmsg = canvas.toDataURL('image/png');
				if(!isUpload){
					isUpload = true;
					$.ajax({
						type:'POST',
						url:baseUrl+'flashRequest.php',
						data:{'model':'Opt_upload','pic':upmsg},
						dataType:'JSON',
						success:function(data){
							isUpload = false;
							if(data.code==1){
								$('#uploaded_pic').attr('src',data.msg);
								$('#upload_cont').hide();
								$('#upload_suc').show();
								$('.again_btn').click(function(){
									window.location.reload();
								})
							}else{
								alert(data.msg);
							}
						}
					})
				}
				
			})
		}
	}

	$(function(){
		loading();
	})

	

})();	