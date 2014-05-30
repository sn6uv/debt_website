var chart = new Highcharts.Chart({
  chart: {
      renderTo: 'container',
      type: 'column'
  },
  credits: {enabled: false},
  title: {text: 'Effect of deregulation'},
  xAxis: {categories: ['Before', 'After']},
  yAxis: {
      min: 0,
      title: {text: 'Money $'},
  },
  legend: {
      align: 'right',
      x: -70,
      verticalAlign: 'top',
      y: 20,
      floating: true,
      backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || 'white',
      borderColor: '#CCC',
      borderWidth: 1,
      shadow: false
  },
  tooltip: {enabled: false},
  plotOptions: {
      column: {
          stacking: 'normal',
      }
  },
  series: [{
      name: 'Interest',
      data: [0, 40000]
  }, {
      name: 'Fees',
      data: [30000, 100000]
  }]
});

function updateChart(interest, fees) {
  chart.series[0].setData(interest)
  chart.series[1].setData(fees)
}

/*    Setup Sliders    */
var sliderOptions = {
  tooltip: "hide",
  orientation: "horizontal",
  handle: "round",
  selection: "none",
}

var InflationRateSlider = $('#InflationRateSlider').slider(sliderOptions)
InflationRateSlider.on('slide', function(ev){
    $('#InflationRateBox').val((ev.value/10.).toFixed(1) + " %");
    updateAll();
});

var BondRateSlider = $('#BondRateSlider').slider(sliderOptions)
BondRateSlider.on('slide', function(ev){
    $('#BondRateBox').val((ev.value/10.).toFixed(1) + " %");
    updateAll();
  });

var DegreeLengthSlider = $('#DegreeLengthSlider').slider(sliderOptions)
DegreeLengthSlider.on('slide', function(ev){
    $('#DegreeLengthBox').val(ev.value);
    updateAll();
  });

var GapYearSlider = $('#GapYearSlider').slider(sliderOptions)
GapYearSlider.on('slide', function(ev){
    $('#GapYearBox').val(ev.value);
    updateAll();
  });

var StartingSalarySlider = $('#StartingSalarySlider').slider(sliderOptions)
StartingSalarySlider.on('slide', function(ev){
    $('#StartingSalaryBox').val("$" + ((ev.value >= 100) ? "" : " ") + ev.value.toString() + " K");
    updateAll();
  });

var SalaryIncreaseSlider = $('#SalaryIncreaseSlider').slider(sliderOptions)
SalaryIncreaseSlider.on('slide', function(ev){
    $('#SalaryIncreaseBox').val((ev.value/10.).toFixed(1) + " %");
    updateAll();
  });

function getData() {
  return {
    'InflationRate': InflationRateSlider.data('slider').getValue() / 1000.,
    'BondRate': BondRateSlider.data('slider').getValue() / 1000.,
    'DegreeBand': 3, // TODO
    'DegreeLength': DegreeLengthSlider.data('slider').getValue(),
    'GapYear': GapYearSlider.data('slider').getValue(),
    'StartingSalary': StartingSalarySlider.data('slider').getValue() * 1000,
    'SalaryIncrease': SalaryIncreaseSlider.data('slider').getValue() / 1000,
  };
}

function updateAll() {
  /* Compute costs and update chart */
  var data = getData();
  var fees = 0.0;
  var interest = 0.0;
  var thisSemesterFees;

  // While Studying
  for (var i = 0; i < 2*data['DegreeLength']; i++) {
    thisSemesterFees = 1.;  // TODO
    fees = (fees + thisSemesterFees)*Math.E ^ (0.5 * data['BondRate']);
  }

  // GapYear
  fees = fees * Math.E ^ (data['GapYear'] * data['BondRate']);

  // Repayments

  updateChart([interest, interest], [fees, fees]);
}

updateAll();