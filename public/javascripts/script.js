

function addToCart(proId) {
  $.ajax({
    url: '/add-to-cart/' + proId,
    success: (response) => {
      if (response) {
        let count = $('#cart-count').html()
        count = parseInt(count) + 1
        $('#cart-count').html(count)
      }
    } 
  })
}
