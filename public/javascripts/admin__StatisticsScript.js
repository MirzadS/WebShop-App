let myChart1 = document.getElementById("myChart1").getContext("2d");
let myChart2 = document.getElementById("myChart2").getContext("2d");
let myChart3 = document.getElementById("myChart3").getContext("2d");
let myChart4 = document.getElementById("myChart4").getContext("2d");

const userStatistics = (users) => {
  //   var user_list = JSON.parse(users).map((user) => user.user_count);

  let massPopChart = new Chart(myChart1, {
    type: "pie", // pie, bar
    data: {
      labels: ["Admin", "Trgovac", "Kupac"],
      datasets: [
        {
          label: "Korisnici",
          data: JSON.parse(users).map((user) => user.user_count),
          backgroundColor: poolColors(JSON.parse(users).length),
          borderWidth: 1,
          borderColor: "#777",
          hoverBorderWidth: 3,
          hoverBorderColor: "#000",
        },
      ],
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: "Korisnici sistema",
          padding: {
            top: 20,
            bottom: 15,
          },
          font: {
            size: 25,
          },
        },
      },
    },
  });
};

const storeStatistics = (stores) => {
  let massPopChart = new Chart(myChart2, {
    type: "pie", // pie, bar
    data: {
      labels: JSON.parse(stores).map((store) => store.store_name),
      datasets: [
        {
          label: "Korisnici",
          data: JSON.parse(stores).map((store) => store.article_count),
          backgroundColor: poolColors(JSON.parse(stores).length),
          borderWidth: 1,
          borderColor: "#777",
          hoverBorderWidth: 3,
          hoverBorderColor: "#000",
        },
      ],
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: "Broj artikala po trgovini",
          padding: {
            top: 20,
            bottom: 15,
          },
          font: {
            size: 25,
          },
        },
      },
    },
  });
};

const earningsStatistics = (stores) => {
  let massPopChart = new Chart(myChart3, {
    type: "bar", // pie, bar
    data: {
      labels: JSON.parse(stores).map((store) => store.store_name),
      datasets: [
        {
          label: "Zarada",
          data: JSON.parse(stores).map((store) => store.earnings),
          backgroundColor: poolColors(JSON.parse(stores).length),
          borderWidth: 1,
          borderColor: "#777",
          hoverBorderWidth: 3,
          hoverBorderColor: "#000",
        },
      ],
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: "Zarada trgovaca",
          padding: {
            top: 20,
            bottom: 15,
          },
          font: {
            size: 25,
          },
        },
      },
    },
  });
};

const orderStatistics = (stores) => {
  let massPopChart = new Chart(myChart4, {
    type: "doughnut", // pie, bar
    data: {
      labels: JSON.parse(stores).map((store) => store.store_name),
      datasets: [
        {
          label: "Broj narudžbi",
          data: JSON.parse(stores).map((store) => store.order_count),
          backgroundColor: poolColors(JSON.parse(stores).length),
          borderWidth: 1,
          borderColor: "#777",
          hoverBorderWidth: 3,
          hoverBorderColor: "#000",
        },
      ],
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: "Broj naručenih artikala za svakog trgovca",
          padding: {
            top: 20,
            bottom: 15,
          },
          font: {
            size: 25,
          },
        },
      },
    },
  });
};

Chart.defaults.font.size = 18;

function dynamicColors() {
  var r = Math.floor(Math.random() * 255);
  var g = Math.floor(Math.random() * 255);
  var b = Math.floor(Math.random() * 255);
  return "rgba(" + r + "," + g + "," + b + ", 0.9)";
}

function poolColors(a) {
  var pool = [];
  for (i = 0; i < a; i++) {
    pool.push(dynamicColors());
  }
  return pool;
}
