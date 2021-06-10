export const smartMeterChartOptions = {
  maintainAspectRatio: false,
  scales: {
    yAxes: [
      {
        ticks: {
          beginAtZero: true,
        },
      },
    ],
  },
  tooltips: {
    callbacks: {
      label: (tooltipItem, data) => {
        const tooltipValue =
          data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];

        return parseInt(tooltipValue, 10).toLocaleString();
      },
    },
  },
};
