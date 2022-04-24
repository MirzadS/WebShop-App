const order = (order_id, article_id, quantity) => {
  // alert("Pritisnuto: " + order_id);
  // alert("dropdown: " + document.getElementById(`t_order_status_${order_id}`).value);
  // alert("order_id: " + order_id + " artcle_id: " + article_id + " i quantity: " + quantity);
  var order_status = document.getElementById(`t_order_status_${order_id}`).value.trim();

  if (order_status === "na čekanju") {
    return;
  }

  $.ajax({
    url: "/trgovac/narudzbe",
    data: {
      t_order_id: Number(order_id),
      t_order_status: order_status,
      t_article_id: Number(article_id),
      t_quantity: quantity,
    },
    type: "PATCH",
    success: function (result) {
      alert(result.message);

      switch (result.updated_status) {
        case "poslano":
          $(`#t_order_status_${order_id} option[value='na čekanju']`).remove();
          $(`#t_order_status_${order_id} option[value='odbijeno']`).remove();
          break;
        case "odbijeno":
          $(`#t_order_status_${order_id} option[value='na čekanju']`).remove();
          $(`#t_order_status_${order_id} option[value='poslano']`).remove();
          break;
        default:
          alert("Greška");
      }
    },
    error: function (result) {
      alert(result.responseText);
    },
  });
};
