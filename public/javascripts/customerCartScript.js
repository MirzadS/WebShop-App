const deleteArticleFromCart = (cart_item_id) => {
  $.ajax({
    url: "/kupac/korpa/" + cart_item_id,
    type: "DELETE",
    success: function (result) {
      $(`.article-No-${cart_item_id}`).remove();

      document.getElementById("totalSum").textContent = result.info.sum + " KM";
      document.getElementById("articleCount").textContent = result.info.count;
    },
    error: function () {
      alert("Artikal iz korpe nije izbrisan.");
    },
  });
};

function quantityInput(cart_item_id) {
  /* Moze se i na drugi nacin uraditi (Bolji od ovog) */
  /* U customerCart.ejs za input stavimo klasu ili id <%=item.cart_item_id %> bez direktnog pozivanja funkcije
  i zatim ovdje ----.addEvenetListener(keyup, function(event){
    console.log(event);
    ......
  }) */
  if (
    (event.keyCode >= 48 && event.keyCode <= 57) ||
    (event.keyCode >= 96 && event.keyCode <= 105) ||
    event.keyCode === 8
  ) {
    var valueAfterChange = parseInt(document.getElementById(`quantitativeValue${cart_item_id}`).value);

    if (!isNaN(valueAfterChange)) {
      valueAfterChange = Math.abs(valueAfterChange);

      $.ajax({
        url: "/kupac/korpa",
        data: {
          cart_article_id: cart_item_id,
          cart_quantity: valueAfterChange,
        },
        type: "PATCH",
        success: function (result) {
          document.getElementById("totalSum").textContent = result.info.sum + " KM";
          document.getElementById("articleCount").textContent = result.info.count;
        },
        error: function () {
          alert("Količina nije promijenjena.");
        },
      });
    }
  }
}

const quantityIncrement = (sign, cart_item_id) => {
  previousValue = parseInt(document.getElementById(`quantitativeValue${cart_item_id}`).value);

  var valueAfterChange;
  if (sign === "+") {
    valueAfterChange = parseInt(document.getElementById(`quantitativeValue${cart_item_id}`).value) + 1;
  } else if (sign === "-") {
    if (previousValue > 1) {
      valueAfterChange = parseInt(document.getElementById(`quantitativeValue${cart_item_id}`).value) - 1;
    }
  }

  if (valueAfterChange !== undefined && valueAfterChange !== null) {
    $.ajax({
      url: "/kupac/korpa",
      data: {
        cart_article_id: cart_item_id,
        cart_quantity: valueAfterChange,
      },
      type: "PATCH",
      success: function (result) {
        document.getElementById("totalSum").textContent = result.info.sum + " KM";
        document.getElementById("articleCount").textContent = result.info.count;
      },
      error: function () {
        alert("Količina nije promijenjena.");
      },
    });

    document.getElementById(`quantitativeValue${cart_item_id}`).value = valueAfterChange;
  }

  // if (valueAfterChange > 1) {
  //     document.querySelector(".minus-btn").removeAttribute("disabled");
  //     document.querySelector(".minus-btn").classList.remove("disabled");
  // }
};

const articleNo = document.getElementById("articleCount");

articleNo.addEventListener("click", () => {
  if (articleNo.value === 0) {
    alert("Ne moze");
  } else {
    alert("Moze");
  }
});

const orderMultipleItems = () => {
  if (articleNo.textContent.trim() == 0) {
    alert("Korpa je prazna.");
    return;
  }

  $.ajax({
    url: "/kupac/korpa/narudzba",
    type: "POST",
    success: function (result) {
      $(".article").remove();

      document.getElementById("totalSum").textContent = 0 + " KM";
      document.getElementById("articleCount").textContent = 0;
      console.log(result + "ispisss");
      alert(result);
    },
    error: function () {
      alert("Narudžba nije izvršena.");
    },
  });
};
