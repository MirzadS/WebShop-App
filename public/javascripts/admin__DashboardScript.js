var datePicker = document.querySelectorAll(".datePicker");

for (let index = 0; index < datePicker.length; index++) {
  datePicker[index].min = new Date().toISOString().split("T")[0];

  // if (datePicker[index].value.trim().length === 0) {
  //   datePicker[index].value = new Date().toISOString().split("T")[0];
  // }
}

const blocking = (user_id, user_role) => {
  var blocked_until = document.querySelector(".datePicker_" + user_id).value;

  if (blocked_until.trim().length === 0) {
    alert("Morate unijeti datum.");
    return;
  }

  $.ajax({
    url: "admin/blokiranje",
    type: "PATCH",
    data: {
      user_id: parseInt(user_id),
      user_role: user_role.trim(),
      blocked_until: blocked_until.trim(),
    },
    success: function (result) {
      alert(result);
    },
    error: function () {
      alert("Korisnik nije blokiran.");
    },
  });
};

const archiving = (user_id, user_role) => {
  $.ajax({
    url: "admin/arhiviranje",
    type: "PATCH",
    data: {
      user_id: parseInt(user_id),
      user_role: user_role.trim(),
    },
    success: function (result) {
      alert(result);
    },
    error: function () {
      alert("Korisnik nije arhiviran.");
    },
  });
};

const removeRestrictions = (user_id, user_role) => {
  $.ajax({
    url: "admin/ukloni-ogranicenja",
    type: "PATCH",
    data: {
      user_id: parseInt(user_id),
      user_role: user_role.trim(),
    },
    success: function (result) {
      document.querySelector(".datePicker_" + user_id).value = "";
      alert(result);
    },
    error: function () {
      alert("Nisu uklonjena ograničenja.");
    },
  });
};

const updateCategory = (category_id) => {
  const new_category = document.querySelector(`.category_name_${category_id}`).value;

  if (new_category.trim().length === 0) {
    alert("Polje ne može biti prazno");
    return;
  }

  $.ajax({
    url: "admin/kategorije",
    type: "PATCH",
    data: {
      category_id: parseInt(category_id),
      new_category_name: new_category.trim(),
    },
    success: function (result) {
      alert(result);
    },
    error: function () {
      alert("Kategorija nije ažurirana.");
    },
  });
};

const deleteCategory = (category_id) => {
  $.ajax({
    url: "admin/kategorije",
    type: "DELETE",
    data: {
      category_id: parseInt(category_id),
    },
    success: function (result) {
      alert(result);

      $(`.category_row_${category_id}`).remove();
    },
    error: function () {
      alert("Kategorija nije izbrisana.");
    },
  });
};

const addCategory = () => {
  const new_category = document.querySelector(`.add_new_category`).value;

  if (new_category.trim().length === 0) {
    alert("Polje ne može biti prazno");
    return;
  }

  $.ajax({
    url: "admin/kategorije",
    type: "POST",
    data: {
      new_category: new_category.trim(),
    },
    success: function (result) {
      $(".newCategory > tbody").append(`
        <tr class=category_row_${result.new_category_row[0].category_id}>
              <td>
                  <input type="text" value="${result.new_category_row[0].category_name}" class="category_name category_name_${result.new_category_row[0].category_id}" />
              </td>
              <td>
                  <button type="button" onclick="updateCategory('${result.new_category_row[0].category_id}')" class="btn btn-success">Ažuriraj</button>
              </td>
              <td>
                  <button type="button" onclick="deleteCategory('${result.new_category_row[0].category_id}')" class="btn btn-danger">Izbrisi</button>
              </td>
        </tr>`);

      document.querySelector(`.add_new_category`).value = "";
    },
    error: function () {
      alert("Nova kategorija nije dodana.");
    },
  });
};
