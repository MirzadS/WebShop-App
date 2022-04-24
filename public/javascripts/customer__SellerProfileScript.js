// $.getScript("/javascripts/sidebarScript.js", function () {});

const newRoute = (route) => {
  location.href = route;
};

const purchase = (product_id) => {
  document.getElementById(`modalQuantitativeValue`).value = 1;
  modalBg.classList.add("bg-active");
  document.getElementById(`product_id`).value = product_id;
};

const articleCart = (currArticleID) => {
  $.ajax({
    url: "/kupac/korpa/" + currArticleID,
    type: "POST",
    success: function (result) {
      alert(result);
    },
    error: function () {
      alert("Artikal nije spremljen u korpu.");
    },
  });
};

const likeBtn = (ID) => {
  // alert("klikkk " + ID);
  var like_btn = document.querySelector(".likeBtn_" + ID);

  const contains = like_btn.classList.contains("dislike");
  contains ? (like_btn.src = "/images/like.svg") : (like_btn.src = "/images/dislike.svg");

  like_btn.classList.toggle("dislike");

  $.ajax({
    url: "/kupac/spaseni-artikli",
    type: "POST",
    data: {
      article_id: ID,
      contains: contains,
    },
    success: function (result) {
      alert(result);
    },
    error: function () {
      alert("Artikal nije spremljen.");
    },
  });
};
// like.addEventListener("click", () => {
//   // like.classList.add("hidden");
//   alert("Kliknuto");
// });

// *************** MODAL ****************

const modalBg = document.querySelector(".modal-bg");
const modalClose = document.querySelector(".modal-close");

modalClose.addEventListener("click", function () {
  modalBg.classList.remove("bg-active");
});

const orderOneItem = () => {
  var quantityVal = parseInt(document.getElementById(`modalQuantitativeValue`).value);

  if (!isNaN(quantityVal)) {
    if (quantityVal <= 0) {
      alert("Unesena količina mora biti pozitivna.");
    } else {
      quantityVal = Math.abs(quantityVal);

      $.ajax({
        url: "/kupac/lista/narudzba",
        type: "POST",
        data: {
          product_id: document.getElementById(`product_id`).value,
          quantity: quantityVal,
        },
        success: function (result) {
          alert(result);
        },
        error: function (result) {
          alert(JSON.stringify(result.responseText));
        },
      });
    }
  } else {
    alert("Podatak za količinu nije ispravan.");
  }
};

const quantityIncrement = (sign) => {
  previousValue = parseInt(document.getElementById(`modalQuantitativeValue`).value);

  var valueAfterChange;
  if (sign === "+") {
    valueAfterChange = parseInt(document.getElementById(`modalQuantitativeValue`).value) + 1;
  } else if (sign === "-") {
    if (previousValue > 1) {
      valueAfterChange = parseInt(document.getElementById(`modalQuantitativeValue`).value) - 1;
    }
  }

  if (valueAfterChange !== undefined && valueAfterChange !== null) {
    document.getElementById(`modalQuantitativeValue`).value = valueAfterChange;
  }
};

const searchInput = document.querySelector("[data-search]");

const articleList = (item) => {
  $(".article-list").append(`
          <div class="single-item article_${item.article_id}">
          <div class="image-part ">
              <div class="heart-icon">
                  <img onclick="likeBtn('${item.article_id}')" class="likeBtn_${item.article_id} ${
    item.saved != null ? "like" : "dislike"
  }" src="${item.saved != null ? "/images/like.svg" : "/images/dislike.svg"}" alt="like_btn">
              </div>
              <img src="/images/${item.image_path}" alt="article image">
          </div>
  
          <div class="text-part ">
              <div class="subname">
              ${item.article_name}
              </div>
              <div class="price ">
              ${item.price} KM
              </div>
              <div class="description ">
                  <p>
                  ${item.s_description.substring(0, 130)}...
                  </p>
              </div>
  
              <div class="article-btn">
              
                  <button onclick="newRoute('trgovac/azuriranje-artikla/${item.article_id}')">Update
                  artikla</button>
                  <button onclick="newRoute('trgovac/artikal/${item.article_id}')">Pregled artikla</button>
                  <button onclick="articleDelete('${item.article_id}')"> <i class='bx bx-trash'></i></button>
                  
              </div>
          </div>
      </div>`);
};

var pathArray = window.location.pathname.split("/");

// input - keypress
searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    const value = e.target.value;

    $.ajax({
      url: "/kupac/trgovac/profil",
      type: "POST",
      data: {
        searchString: value.toLowerCase(),
        trgovac_id: pathArray[pathArray.length - 1].trim(),
      },
      success: function (result) {
        $(`.single-item`).remove();

        result.articles.forEach((item) => {
          articleList(item);
        });
      },
      error: function () {
        alert("Nema traženih podataka.");
      },
    });
  }
});
