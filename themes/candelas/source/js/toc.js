(function ($) {
  function getHeadlineInterval() {
    let offsets = $('.article-inner h3, .article-inner h4').map(function () {
      return $(this).offset().top;
    });
    let interval = Array.prototype.slice.call(offsets);

    interval.push(Math.max($(document).height(), $(window).height()));
    interval = interval.map(function (i) { return Math.floor(i); });

    return interval;
  }

  function getTocLink() {
    return $('.toc-wrap .toc-link');
  }

  let $tocLinks = getTocLink();
  let curScrollY;
  let clickedByToc = false;

  function activeTocLink(curScrollY) {
    let headlineInterval = getHeadlineInterval();

    for (let i = 0; i < headlineInterval.length - 1; i++) {
      let offsetA = headlineInterval[i];
      let offsetB = headlineInterval[i + 1];

      if (curScrollY >= offsetA && curScrollY < offsetB) {
        $tocLinks.each(function (index) {
          if (index === i) {
            $(this).addClass('toc-link-active');
          }
          else {
            $(this).removeClass('toc-link-active');
          }
        });
      }
    }
  }

  $tocLinks.click(function (event) {
    let $clickedTocLink = $(event.target).hasClass('toc-link')
      ? $(event.target)
      : $(event.target).parents('.toc-link');

    clickedByToc = true;
    $tocLinks.each(function () {
      if ($(this).is($clickedTocLink)) {
        $(this).addClass('toc-link-active');
      }
      else {
        $(this).removeClass('toc-link-active');
      }
    });
  });

  $(window).scroll(function () {
    curScrollY = $(window).scrollTop();

    if (clickedByToc) {
      clickedByToc = false;
      return;
    }
    activeTocLink(curScrollY);
  });
})(jQuery);
