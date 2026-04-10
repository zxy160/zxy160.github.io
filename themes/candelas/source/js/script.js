(function($){
  // Caption
  $('.article-entry').each(function(i){
    $(this).find('img').each(function(){
      if ($(this).parent().hasClass('fancybox') || $(this).parent().is('a')) return;

      let alt = this.alt;

      if (alt) $(this).after('<span class="caption">' + alt + '</span>');

      $(this).wrap(`<a href="${this.src}" data-fancybox="gallery" data-caption="${alt}"></a>`);
    });

    $(this).find('.fancybox').each(function(){
      $(this).attr('rel', 'article' + i);
    });
  });

  if ($.fancybox){
    $('.fancybox').fancybox();
  }

  // Mobile nav
  let $container = $('#container'),
    isMobileNavAnim = false,
    mobileNavAnimDuration = 200;

  let startMobileNavAnim = function(){
    isMobileNavAnim = true;
  };

  let stopMobileNavAnim = function(){
    setTimeout(function(){
      isMobileNavAnim = false;
    }, mobileNavAnimDuration);
  };

  $('#main-nav-toggle').on('click', function(){
    if (isMobileNavAnim) return;

    startMobileNavAnim();
    $container.toggleClass('mobile-nav-on');
    stopMobileNavAnim();
  });

  $('#wrap').on('click', function(){
    if (isMobileNavAnim || !$container.hasClass('mobile-nav-on')) return;

    $container.removeClass('mobile-nav-on');
  });

  // Hide the fixed header when scrolling down and reveal it again on scroll up.
  let $header = $('#header-inner');
  let $headerContainer = $('#header');
  let shouldToggleHeader = $headerContainer.is('.post-header, .home-header');
  let prevScrollY = $(window).scrollTop();
  let prevDirection;
  let curDirection = 1;  // 0 - down, 1 - up
  let headerDelta = 5;

  function toggleHeader(direction) {
    if (direction === 0) {
      $header.addClass('header-up');
    } else if (direction === 1) {
      $header.removeClass('header-up');
    }
  }

  function checkHeaderScroll(curScrollY) {
    if (Math.abs(curScrollY - prevScrollY) <= headerDelta) {
      return;
    }
    if (curScrollY > prevScrollY && curScrollY > $header.height()) {
      curDirection = 0;
    } else if (curScrollY < prevScrollY) {
      curDirection = 1;
    }
    if (curDirection !== prevDirection) {
      toggleHeader(curDirection);
      prevDirection = curDirection;
    }
    prevScrollY = curScrollY;
  }

  if (shouldToggleHeader) {
    $(window).scroll(function () {
      checkHeaderScroll($(window).scrollTop());
    });
  }
})(jQuery);
