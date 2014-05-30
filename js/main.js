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

/* Setup Selector */
$('#DegreeBandSelector').click(function() {
    updateAll();
})

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
    'DegreeBand': parseInt($('#DegreeBandSelector').val()),
    'DegreeLength': DegreeLengthSlider.data('slider').getValue(),
    'GapYear': GapYearSlider.data('slider').getValue(),
    'StartingSalary': StartingSalarySlider.data('slider').getValue() * 1000,
    'SalaryIncrease': SalaryIncreaseSlider.data('slider').getValue() / 1000,
    'PercentageOfInternational': 0.75,   // XXX Make this a slider?
  };
}

function updateAll() {
  /* Compute costs and update chart */
  var data = getData();
  var oldDebt = 0.0;
  var newDebt = 0.0;

  if (data['DegreeBand'] == 1) {
    var oldSemesterFees = 3020.0;
  } else if (data['DegreeBand'] == 2) {
    var oldSemesterFees = 4304.0;
  } else {
    var oldSemesterFees = 5050.0;
  }

  var newSemesterFees = data['PercentageOfInternational'] * 15055.5;

  var normalisedFees = newSemesterFees * (1. + Math.exp(-0.5 * data['BondRate']));
  var ratio = (1 + data['InflationRate']) * Math.exp(-data['BondRate']);
  var normalisedDegreeCost = normalisedFees * (Math.pow(ratio, data['DegreeLength']) - 1) / (ratio - 1);

  // debts when you start work
  var newDebt = normalisedDegreeCost * Math.exp(data['BondRate'] * (data['DegreeLength'] + data['GapYear'] - 11/12.));
  var oldDebt = (oldSemesterFees * 2 * data['DegreeLength']) * Math.pow(1 + data['InflationRate'], data['DegreeLength'] + data['GapYear']);

  var yearsTaken = data['DegreeLength'] + data['GapYear'];
  var income = data['StartingSalary'] * Math.pow(1 + data['InflationRate'], yearsTaken); // inflation adjusted income

  var repaymentRate;
  var inflationFactor;
  var newPaid = 0.0;    // how much is paid under new system (today's dollars)
  var oldPaid = 0.0;    // how much is paid under old system (today's dollars)
  var newYears = yearsTaken; // years taken to repay load under new system
  var oldYears = yearsTaken; // years taken to repay load under old system

  /* old system */
  while (true) {
    inflationFactor = Math.pow(1 + data['InflationRate'], oldYears);
    // calculate repayment
    if (income < 51309 * inflationFactor) {
        repaymentRate = 0.000;
    } else if (income < 57153 * inflationFactor) {
        repaymentRate = 0.040;
    } else if (income < 62997 * inflationFactor) {
        repaymentRate = 0.045;
    } else if (income < 66308 * inflationFactor) {
        repaymentRate = 0.050;
    } else if (income < 71277 * inflationFactor) {
        repaymentRate = 0.055;
    } else if (income < 77194 * inflationFactor) {
        repaymentRate = 0.060;
    } else if (income < 81256 * inflationFactor) {
        repaymentRate = 0.065;
    } else if (income < 89421 * inflationFactor) {
        repaymentRate = 0.070;
    } else if (income < 95287 * inflationFactor) {
        repaymentRate = 0.075;
    } else {
        repaymentRate = 0.080;
    }

    if (oldYears > 60) {  // debt for life
        break;
    }

    // debt repayments
    if (income*repaymentRate > oldDebt) {   // finish paying off loan
        oldPaid += oldDebt*Math.pow(1 + data['InflationRate'], -oldYears);
        break;
    } else {
        oldDebt -= income*repaymentRate;
        oldPaid += income*repaymentRate*Math.pow(1 + data['InflationRate'], -oldYears);
    }

    oldDebt *= Math.exp(data['BondRate']);  // interest on remaining loan
    income *= (1.0 + data['SalaryIncrease']);
    oldYears ++;
  }

  /* new system */
  while (true) {
    // calculate repayment
    inflationFactor = Math.pow(1 + data['InflationRate'], newYears);
    if (income < 46206 * inflationFactor) {
        repaymentRate = 0.000;
    } else if (income < 51309 * inflationFactor) {
        repaymentRate = 0.020;
    } else if (income < 57153 * inflationFactor) {
        repaymentRate = 0.040;
    } else if (income < 62997 * inflationFactor) {
        repaymentRate = 0.045;
    } else if (income < 66308 * inflationFactor) {
        repaymentRate = 0.050;
    } else if (income < 71277 * inflationFactor) {
        repaymentRate = 0.055;
    } else if (income < 77194 * inflationFactor) {
        repaymentRate = 0.060;
    } else if (income < 81256 * inflationFactor) {
        repaymentRate = 0.065;
    } else if (income < 89421 * inflationFactor) {
        repaymentRate = 0.070;
    } else if (income < 95287 * inflationFactor) {
        repaymentRate = 0.075;
    } else {
        repaymentRate = 0.080;
    }
    if (newYears > 60) {  // debt for life
        break;
    }

    // debt repayments
    if (income*repaymentRate > newDebt) {   // finish paying off loan
        newPaid += newDebt*Math.pow(1 + data['InflationRate'], -newYears);
        break;
    } else {
        newDebt -= income*repaymentRate;
        newPaid += income*repaymentRate*Math.pow(1 + data['InflationRate'], -newYears);
    }

    newDebt *= Math.exp(data['InflationRate']);  // interest on remaining loan
    income *= (1.0 + data['SalaryIncrease']);
    newYears ++;
  }

  // Update Table
  $('#OldPaidBox').val("$ " + oldPaid.toFixed(0));
  $('#NewPaidBox').val("$ " + newPaid.toFixed(0));
  $('#NewYearsBox').val(newYears);
  $('#OldYearsBox').val(oldYears);

  updateChart([0, 0], [oldPaid, newPaid]);
}

updateAll();
