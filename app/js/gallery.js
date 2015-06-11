/*http://masonry.desandro.com/*/
$(function(){
    $('.responsive').picture();
});
	/*Masonry*/
$(document).ready(function($) {
  var $masonryContainer = $('.photos');
$masonryContainer.imagesLoaded(function() {
	    var columns    = 3,
	        setColumns = function() { columns = $( window ).width() > 1500 ? 4 : $( window ).width() > 640 ? 3 : $( window ).width() > 320 ? 2 : 1; };

	    setColumns();
	    $( window ).resize( setColumns );

	    $( '#column' ).masonry(
	    {
	        itemSelector: '.responsive',
	        columnWidth:  function( containerWidth ) { return containerWidth / columns; }
	    });
	});
});