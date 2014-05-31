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

  var oldDebt = 0.0;    // running debt under old system
  var newDebt = 0.0;    // running debt under new system

  var oldFees = 0.0;    // total fees paid under old system (today's dollars)
  var newFees = 0.0;    // total fees paid under new system (today's dollars)

  var inflationFactor;

  // Calculate fees per semester (today's dollars)
  if (data['DegreeBand'] == 1) {
    var oldSemesterFees = 3020.0;
  } else if (data['DegreeBand'] == 2) {
    var oldSemesterFees = 4304.0;
  } else {
    var oldSemesterFees = 5050.0;
  }

  var newSemesterFees = data['PercentageOfInternational'] * 15055.5;

  /* Stage 1 - Studying */
  for (var i = 1; i <= 2 * data['DegreeLength']; i++) {
    inflationFactor = Math.pow(1 + data['InflationRate'], Math.floor(i / 2));    // Assume fees rise with inflation

    // old system
    oldFees += oldSemesterFees;
    oldDebt += oldSemesterFees * inflationFactor;

    // new system
    newFees += newSemesterFees;

    if (i % 2) {    // interest compunded anually (every second semester)
      newDebt *= (1.0 + data['BondRate']);
    }

    newDebt += newSemesterFees * inflationFactor;
  }

  /* Stage 2 - Gap Years */
  oldDebt *= Math.pow(1 + data['InflationRate'], data['GapYear']);
  for (var i = 1; i < data['GapYear']; i++) {   // Interest compunded anually
    newDebt *= (1.0 + data['BondRate']);
  }

  /* Stage 3 - Working */
  var repaymentRate;

  var oldPaid = 0.0;    // how much is paid under old system (today's dollars)
  var income = data['StartingSalary'];      // current income
  var oldYears = data['DegreeLength'] + data['GapYear'];
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

    oldDebt *= (1.0 + data['InflationRate']);  // interest on remaining loan
    income *= (1.0 + data['SalaryIncrease']);
    oldYears ++;
  }

  var newPaid = 0.0;    // how much is paid under new system (today's dollars)
  var income = data['StartingSalary'];      // current income
  var newYears = data['DegreeLength'] + data['GapYear'];
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

    newDebt *= (1.0 + data['BondRate']);  // interest on remaining loan

    // debt repayments
    if (income*repaymentRate > newDebt) {   // finish paying off loan
        newPaid += newDebt*Math.pow(1 + data['InflationRate'], -newYears);
        break;
    } else {
        newDebt -= income*repaymentRate;
        newPaid += income*repaymentRate*Math.pow(1 + data['InflationRate'], -newYears);
    }

    income *= (1.0 + data['SalaryIncrease']);
    newYears ++;
  }

  // Update Table
  $('#OldPaidBox').val("$ " + oldPaid.toFixed(0));
  $('#NewPaidBox').val("$ " + newPaid.toFixed(0));
  $('#NewYearsBox').val(newYears);
  $('#OldYearsBox').val(oldYears);

  updateChart([oldPaid-oldFees, newPaid-newFees], [oldFees, newFees]);
}

updateAll();
