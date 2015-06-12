/*Masonry*/
$(document).ready(function($) {
  var $masonryContainer = $('.photos');

  var columns;
  var windowWidth = $(window).width();

  $masonryContainer.imagesLoaded(function() {
    $masonryContainer.masonry({
      itemSelector: '.responsive',
      columnWidth: '.column',
      gutter: '.gutter'
    });

    console.log($masonryContainer);
  });
});
