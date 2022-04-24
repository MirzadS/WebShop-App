// $.getScript("/javascripts/sidebarScript.js", function () {});

// const socket = io.connect("ws://localhost:3000");

// const notice = document.querySelector(".icon-button__badge").textContent;
// alert(notice);

const articleList = (item) => {
  $(".article-list").append(`
        <div class="single-item article_${item.article_id}">
        <div class="image-part ">
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

const newRoute = (route) => {
  location.href = route;
  // U NOVOM TABU OTVORI
  // window.open(route);

  // window.location.href = route;
  // location.replace(ruta);
};

/* PROVJERITI OBAVEZNO URL DA LI TREBA ICI / (KOSA CRTA) PRIJE trgovac TJ. /trgovac ili trgovac */
const articleDelete = (currArticleID) => {
  $.ajax({
    url: "trgovac/artikal/brisanje",
    type: "PATCH",
    data: {
      artikal_id: currArticleID,
    },
    success: function (result) {
      $(`.article_${currArticleID}`).remove();
      alert(result);
    },
    error: function () {
      alert("Podatak nije ažuriran");
    },
  });
};

const searchInput = document.querySelector("[data-search]");

// input - keypress
searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    const value = e.target.value;

    $.ajax({
      url: "/trgovac",
      type: "POST",
      data: {
        searchString: value.toLowerCase(),
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

const filtering = document.getElementById("filtering");

filtering.addEventListener("change", function () {
  if (isNaN(filtering.value)) {
    return;
  }

  $.ajax({
    url: "trgovac/filtriranje",
    type: "POST",
    data: {
      filteringValue: filtering.value,
    },
    success: function (result) {
      $(`.single-item`).remove();

      result.articles.forEach((item) => {
        articleList(item);
      });
    },
    error: function () {
      alert("Artikli nisu filtrirani");
    },
  });
  // if (filtering.value === "1") {
  //   alert("111111");
  // } else {
  //   alert("222222");
  // }
});
