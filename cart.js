$(function(){
$.ajax({
  type:"get",
  url:"data/cart/shoppingcart.php",
  dataType:"json"
}).then(function(data){
  if(data.ok==-1){
    alert("请登录");
    location.href = "login.html?back=shoppingcart.html"
  }else{
  var html = `<div class="nothing hide"></div>`;
  if(data.ok==1){
    console.log(data);
    data = data.data;
    for(var i=0;i<data.length;i++){
      html += `     
      <ul class="pro">
        <li class="chk">
          <input type="checkbox" class="chk-one">
          </li>
          <li class="image">
          <img src="${data[i].pic}" alt="" data-srid=${data[i].srid}>
        </li>
        <li class="title">
          ${data[i].title}
        </li>
        <li class="price">
          <span>${data[i].price}</span>
        </li>
        <li class="count">
          <span class="minus">-</span><input type="text" value="${data[i].count}">
          <span class="add">+</span>
        </li>
        <li class="totalprice">
          <span>${data[i].totalprice}</span>
        </li>
        <li>
          <span class="del" data-sid=${data[i].sid}>删除</span>
        </li>
      </ul>`
    }
    $(".pro-list").html(html)
  }else{
    $(".nothing").removeClass("hide")
  }
  //动态加载数据完成

  //点击图片跳转商品
  $(".pro-list .image").click(e=>{
    var $e = $(e.target);
    var srid = $e.data("srid");
    console.log(srid);
    location = "productdetails.html?rid="+srid+"&fid="+1;
  })
  //完成
  //减少商品
  $("span.minus").click(function(){
    var count = Number($(this).next().val());
    var price = $(this).parent().siblings(".price").children("span").html();//获得单价
    var srid = $(this).parent().siblings(".image").children().data("srid");
    var title = $(this).parent().siblings(".title").html();
    var pic = $(this).parent().siblings(".image").children().attr("src");
    if(count>1){
      count--;
      $(this).next().val(count);
      var totalprice = price*count;
      $(this).parent().next().children("span").html(totalprice.toFixed(2));
      $.ajax({
        type:"post",
        url:"data/cart/addcart.php",
        data:{count:-1,rid:srid,price:price,title:title,img:pic},
        dataType:"json"
      })
    }
    getTotal()
  })
  //增加商品
  $("span.add").click(function(){
    var count = Number($(this).prev().val());
    var price = $(this).parent().siblings(".price").children("span").html();//获得单价
    var srid = $(this).parent().siblings(".image").children().data("srid");
    var title = $(this).parent().siblings(".title").html();
    var pic = $(this).parent().siblings(".image").children().attr("src");
    count++;
    $(this).prev().val(count);
    var totalprice = price*count;
    $(this).parent().next().children("span").html(totalprice.toFixed(2));
    $.ajax({
      type:"post",
      url:"data/cart/addcart.php",
      data:{count:1,rid:srid,price:price,title:title,img:pic},
      dataType:"json"
    })
    getTotal()
  })
  //完毕

  //输入框输入商品
  $(".count>input").blur(function(){
      var val = $(this).val();
      if(val<=0){
        alert("数量必须大于0")
        return;
      }
      var price = $(this).parent().siblings(".price").children("span").html();
      var srid = $(this).parent().siblings(".image").children().data("srid");
      var title = $(this).parent().siblings(".title").html();
      var pic = $(this).parent().siblings(".image").children().attr("src");
      //console.log(val)
      $(this).parent().next().children("span").html((price*val).toFixed(2));
      $.ajax({
        type:"post",
        url:"data/cart/blur_addcart.php",
        data:{count:val,rid:srid,price:price,title:title,img:pic},
        dataType:"json"
      })
      getTotal()
    })

  //计算总价，总价=所有checked为true的价格总和
  var price = document.querySelectorAll(".totalprice>span");
  var tatalprice = document.querySelector(".total>span");
  var totalCount = document.querySelector(".totalcount>span");
  var total = 0;
  //计算
  function getTotal(){
    var total = 0;
    var totalC = 0; 
    var ul = document.querySelectorAll(".pro");
    for(var i= 0,len=ul.length;i<len;i++){
      if(ul[i].firstElementChild.firstElementChild.checked){
        //console.log(ul[i])
        total +=
          parseFloat(ul[i].children[5].firstElementChild.innerHTML);
        totalC += parseFloat(ul[i].children[4].children[1].value)
      }
      //商品总件数
      totalCount.innerHTML = totalC;
      tatalprice.innerHTML = total.toFixed(2)
    }
  }
  $(".chk-one").click(function(){
    if($(".pro").find(".chk>input:not(:checked)").length==0){
      $("#ckbAll").prop("checked",true);
    }else{
      $("#ckbAll").prop("checked",false);
    }
    if($(this).prop("checked")){
      $("[data-pay=pay]").addClass("active");
    }else if($(".pro").find(".chk>input:checked").length==0){
      $("[data-pay=pay]").removeClass("active");
    }
    getTotal()
  })
  $("#ckbAll").click(function(){
    if($(this).prop("checked")){
      $(".chk-one").prop("checked",true);
      if($("ul.pro").find("input:checked").length!=0)
        $("[data-pay=pay]").addClass("active");
    }else{
      $(".chk-one").prop("checked",false)
      $("[data-pay=pay]").removeClass("active");
    }
    getTotal()
  })
  //删除
  $(".del").click(function(){     
    var sid = $(this).data("sid");
    $(this).parent().parent().remove(); 
    $.ajax({
      type:"post",
      url:"data/cart/del_cart.php",
      data:{sid:sid}
    }).then(function(){getTotal();checkUl()})
  })
  //完毕
  if($(".pro-list").find("ul.pro").length!=0){
    $(".clear-all").show();
  }
  //清空购物车
  $(".clear-all").click(function(){
      var msg = "确定清空购物车吗？";
      if(confirm(msg)==true){
        $("ul.pro").each(function(){
          $(this).remove();
          var sid = $(this).children().last().children().data("sid");       
          $.ajax({
            type:"get",
            url:"data/cart/del_cart.php",
            data:{sid:sid}
          }).then(function(){
            checkUl();
          })
        })
      }
    })
  //完毕
  //检查pro-list下是否包含有ul.pro的元素,如果没有，那就是空啦
  function checkUl(){
    if($(".pro-list").find("ul.pro").length==0){
      $(".nothing").removeClass("hide");
      $(".clear-all").hide();
      $("#ckbAll").prop("checked",false);
      $(".totalcount>span").html(0.00);
      $(".total>span").html(0);
      $("[data-pay=pay]").removeClass("active")
    }
  }
}
})


})