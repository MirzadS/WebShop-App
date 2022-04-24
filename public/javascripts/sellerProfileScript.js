"use strict";

const fieldName = [
  "first_name",
  "last_name",
  "store_name",
  "email",
  "phone_number",
  "password",
  "city",
  "address",
  "zip_code",
  "region_canton",
  "birth",
];

const inputField = document.querySelectorAll(".form-control");
const btn = document.querySelectorAll(".btn");

//keydown promijeniti poslije
for (let i = 0; i < inputField.length; i++) {
  inputField[i].addEventListener("click", () => {
    btn[i].classList.remove("hidden");
  });
}

for (let i = 0; i < btn.length; i++) {
  btn[i].addEventListener("click", () => {
    $.ajax({
      url: "/trgovac/profil",
      data: {
        fieldName: fieldName[i],
        fieldValue: document.querySelector(`#${fieldName[i]}`).value,
      },
      type: "POST",
      success: function (result) {
        alert(result.msg);
        if (result.fieldName === "first_name") {
          var full_name = document.querySelector(".seller-name").textContent.replace(/\s+/g, " ").trim().split(" ");
          var after_update = `${result.fieldValue} ${full_name[1]}`;
          document.querySelector(".seller-name").textContent = after_update;
        } else if (result.fieldName === "last_name") {
          var full_name = document.querySelector(".seller-name").textContent.replace(/\s+/g, " ").trim().split(" ");
          var after_update = `${full_name[0]} ${result.fieldValue}`;
          document.querySelector(".seller-name").textContent = after_update;
        } else if (result.fieldName === "store_name") {
          document.querySelector(".seller-store-name").textContent = result.fieldValue;
        }
        btn[i].classList.add("hidden");
      },
      error: function () {
        alert("Podatak nije ažuriran");
      },
    });
  });
}
