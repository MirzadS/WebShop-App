"use strict";

const fieldName = [
  "article_name",
  "price",
  "quantity",
  "s_description",
  "l_description",
  "f_category",
  "keywords",
  "article_condition",
];

const inputField = document.querySelectorAll(".form-control");
const btn = document.querySelectorAll(".btn");
const currArticleID = document.querySelector("#currArticleID").value;

//keydown promijeniti poslije
for (let i = 0; i < inputField.length; i++) {
  inputField[i].addEventListener("click", () => {
    btn[i].classList.remove("hidden");
  });
}

for (let i = 0; i < btn.length; i++) {
  btn[i].addEventListener("click", () => {
    var inputID = btn[i].previousElementSibling.id;
    var inputValue = btn[i].previousElementSibling.value;

    if (inputID == "f_category") {
      var values = $("#f_category").val();

      inputValue = JSON.stringify(values);
    }

    $.ajax({
      url: "/trgovac/azuriranje-artikla",
      data: {
        inputID: inputID,
        inputValue: inputValue,
        artikal_id: currArticleID,
      },
      type: "POST",
      success: function (result) {
        alert(result);
        btn[i].classList.add("hidden");
      },
      error: function () {
        alert("Podatak nije ažuriran");
      },
    });
  });
}

const delete_img = (image_id) => {
  $.ajax({
    url: "/trgovac/azuriranje-artikla",
    data: {
      inputID: "archived",
      inputValue: image_id,
      artikal_id: currArticleID,
    },
    type: "POST",
    success: function (result) {
      alert(result);

      $(".img_" + image_id).remove();
    },
    error: function () {
      alert("Podatak nije ažuriran");
    },
  });
};
