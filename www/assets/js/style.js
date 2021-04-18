

$(document).on('click', '.dropdown-menu', function (e) {
  e.stopPropagation();
});

// make it as accordion for smaller screens
if ($(window).width() < 992) {
  $('.dropdown-menu a').click(function(e){
    e.preventDefault();
      if($(this).next('.submenu').length){
        $(this).next('.submenu').toggle();
      }
      $('.dropdown').on('hide.bs.dropdown', function () {
     $(this).find('.submenu').hide();
  })
  });
}
$(function(){
    $('.dropdown').hover(function() {
        $(this).addClass('open');
    },
    function() {
        $(this).removeClass('open');
    });
});

$(document).ready(function() {

    var select = $('select[multiple]');
    var options = select.find('option');

    var div = $('<div />').addClass('selectMultiple');
    var active = $('<div />');
    var list = $('<ul />');
    var placeholder = select.data('placeholder');

    var span = $('<span />').text(placeholder).appendTo(active);

    options.each(function() {
        var text = $(this).text();
        if($(this).is(':selected')) {
            active.append($('<a />').html('<em>' + text + '</em><i></i>'));
            span.addClass('hide');
        } else {
            list.append($('<li />').html(text));
        }
    });

    active.append($('<div />').addClass('arrow'));
    div.append(active).append(list);

    select.wrap(div);

    $(document).on('click', '.selectMultiple ul li', function(e) {
        var select = $(this).parent().parent();
        var li = $(this);
        if(!select.hasClass('clicked')) {
            select.addClass('clicked');
            li.prev().addClass('beforeRemove');
            li.next().addClass('afterRemove');
            li.addClass('remove');
            var a = $('<a />').addClass('notShown').html('<em>' + li.text() + '</em><i></i>').hide().appendTo(select.children('div'));
            a.slideDown(400, function() {
                setTimeout(function() {
                    a.addClass('shown');
                    select.children('div').children('span').addClass('hide');
                    select.find('option:contains(' + li.text() + ')').prop('selected', true);
                }, 500);
            });
            setTimeout(function() {
                if(li.prev().is(':last-child')) {
                    li.prev().removeClass('beforeRemove');
                }
                if(li.next().is(':first-child')) {
                    li.next().removeClass('afterRemove');
                }
                setTimeout(function() {
                    li.prev().removeClass('beforeRemove');
                    li.next().removeClass('afterRemove');
                }, 200);

                li.slideUp(400, function() {
                    li.remove();
                    select.removeClass('clicked');
                });
            }, 600);
        }
    });

    $(document).on('click', '.selectMultiple > div a', function(e) {
        var select = $(this).parent().parent();
        var self = $(this);
        self.removeClass().addClass('remove');
        select.addClass('open');
        setTimeout(function() {
            self.addClass('disappear');
            setTimeout(function() {
                self.animate({
                    width: 0,
                    height: 0,
                    padding: 0,
                    margin: 0
                }, 300, function() {
                    var li = $('<li />').text(self.children('em').text()).addClass('notShown').appendTo(select.find('ul'));
                    li.slideDown(400, function() {
                        li.addClass('show');
                        setTimeout(function() {
                            select.find('option:contains(' + self.children('em').text() + ')').prop('selected', false);
                            if(!select.find('option:selected').length) {
                                select.children('div').children('span').removeClass('hide');
                            }
                            li.removeClass();
                        }, 400);
                    });
                    self.remove();
                })
            }, 300);
        }, 400);
    });

    $(document).on('click', '.selectMultiple > div .arrow, .selectMultiple > div span', function(e) {
        $(this).parent().parent().toggleClass('open');
    });

});


// Using JS is not necissary, it just simplifies the HTML.

// If you don't want to use JS, put a span with a class of `.inner` within the `.tooltip` element, and remove the `data-tooltip` attribute and put it's value within the span. 

var $info = $('.tooltip');
$info.each( function () {
  var dataInfo = $(this).data("tooltip");
  $( this ).append('<span class="inner" >' + dataInfo + '</span>');
});

// Search
$("#search, .searchArea").hover(function () {  
  $(".searchArea").show();
  $("#search").attr("style","width: 470px; border-radius: 4px 4px 0px 0px;");
}, function () {
  $(".searchArea").hide();
  $("#search").attr("style","width: 470px; border-radius: 4px 4px 4px 4px;");
});
$("#search").keyup(function () {
  $(".searchArea").show();
  $.ajax({
    type: "POST",
    url: "/api/search",
    data: {key: $("#search").val()},
    dataType: "json",
    success: function (response) {
      let message = "";
      let data = response.data;
      if (data.length == 0) {
        $("#searchResults").html("You haven't made any searchs. <br><br>");
        return;
      }
      for (let i = 0; i < data.length; i++) {
        if (i === 5) break; 
        let bot = data[i];
        message += `<a href="/bot/${bot.id}"><div class='mt-3 mb-4 searchResultsBot'> <img draggable="false" src='https://cdn.discordapp.com/avatars/${bot.id}/${bot.avatar}'> <p style="margin-top: 3px;" class="ml-3">${bot.username}</p></div></a>`;
      }
      if (data.length > 8) {
        $(".showMore").show();  
        setInterval(() => {
          $(".showMoreLink").attr("value", `/search?q=${$("#search").val()}&page=1`);
        }, 100);
        $(".showMore").click(function () { window.location.href = $(".showMoreLink").val(); });    
      }
      $("#searchResults").html(message);
    }
  });
});
console.log("vCodes: Online - Coded by: Claudette#0241 & Void Development")
$(document).ready(function(){
    $(".dropdown").hover(function(){
        var dropdownMenu = $(this).children(".dropdown-menu");
        if(dropdownMenu.is(":visible")){
            dropdownMenu.parent().toggleClass("open");
        }
    });
});     
$('body').toggleClass('loaded');
$(document).ready(function() {
 
    setTimeout(function(){
        $('body').addClass('loaded');
        $('h1').css('color','#222222');
    }, 250);
 
});
