const order = (order_id) => {
  var order_status = document.getElementById(`t_order_status_${order_id}`).value.trim();

  if (order_status === "poslano" || order_status === "na čekanju") {
    return;
  }

  $.ajax({
    url: "/kupac/narudzbe",
    data: {
      t_order_id: Number(order_id),
      t_order_status: order_status,
    },
    type: "PATCH",
    success: function (result) {
      alert(result.message);

      switch (result.updated_status) {
        case "poslano":
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
