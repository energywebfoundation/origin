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
      label: (tooltipItem: any, data: any) => {
        const tooltipValue =
          data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];

        return parseInt(tooltipValue, 10).toLocaleString();
      },
    },
  },
};
