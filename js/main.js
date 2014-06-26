var chart = new Highcharts.Chart({
  chart: {
    renderTo: 'container',
    type: 'column'
  },
  credits: {enabled: false},
  title: null,
  xAxis: {categories: ['Before', 'After']},
  yAxis: {
    min: 0,
    title: {text: 'Total cost of education $'},
  },
  legend: {
    align: 'right',
    x: -70,
    verticalAlign: 'top',
    y: -10,
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
    name: 'Unpaid debt',
    data: [0, 0]
  }, {
    name: 'Interest',
    data: [0, 0]
  }, {
    name: 'Fees',
    data: [0, 0]
  }],
  colors: ['#f15c80', '#7cb5ec', '#434348'],
});

function updateChart(interest, fees, remaining) {
  // update chart data but don't redraw
  chart.series[0].setData(remaining, false);
  chart.series[1].setData(interest, false);
  chart.series[2].setData(fees, false);
}

function updateTable(paid, interest, years, debt) {
  $('#OldPaidBox')[0].innerHTML = "$ " + paid[0].toFixed(0);
  $('#NewPaidBox')[0].innerHTML = "$ " + paid[1].toFixed(0);
  $('#OldInterestBox')[0].innerHTML = "$ " + interest[0].toFixed(0);
  $('#NewInterestBox')[0].innerHTML = "$ " + interest[1].toFixed(0);
  $('#NewYearsBox')[0].innerHTML = years[0];
  $('#OldYearsBox')[0].innerHTML = years[1];
  $('#OldUnpaidBox')[0].innerHTML = "$ " + debt[0].toFixed(0);
  $('#NewUnpaidBox')[0].innerHTML = "$ " + debt[1].toFixed(0);
}

/* Setup Selector */
var DegreeBandSelector = $('#DegreeBandSelector');
DegreeBandSelector.change(function () {
    updateFeesSlider();
    updateAll();
    chart.redraw();
});

/*    Setup Sliders    */
var sliderOptions = {
  tooltip: "hide",
  orientation: "horizontal",
  handle: "round",
  selection: "none"
};

function updateUnchanged(elementID) {
    // calls updateAll() then redraw chart if HTML is unchanged after timeout
    updateAll();
    var curHTML = $(elementID)[0].innerHTML;
    setTimeout(function () {
      var newHTML = $(elementID)[0].innerHTML;
      if (newHTML == curHTML) {
        chart.redraw();
      }
    }, 100);
}

// InflationRate
function updateInflationRate (ev) {
  $('#InflationRateBox')[0].innerHTML = ev.value.toFixed(1) + " %";
  if (ev.value > BondRateSlider.data('slider').getValue()) {
    // inflation rate can't rise above bond rate
    BondRateSlider.data('slider').setValue(ev.value);
    $('#BondRateBox')[0].innerHTML = ev.value.toFixed(1) + " %";
  }
  updateUnchanged('#InflationRateBox');
}
var InflationRateSlider = $('#InflationRateSlider').slider(sliderOptions);
InflationRateSlider.on('slide', updateInflationRate);
InflationRateSlider.on('slideStop', updateInflationRate);

// BondRate
function updateBondRate (ev) {
  $('#BondRateBox')[0].innerHTML = ev.value.toFixed(1) + " %";
  if (ev.value < InflationRateSlider.data('slider').getValue()) {
    // bond rate can't drop below inflation rate
    InflationRateSlider.data('slider').setValue(ev.value);
    $('#InflationRateBox')[0].innerHTML = ev.value.toFixed(1) + " %";
  }
  updateUnchanged('#BondRateBox');
}
var BondRateSlider = $('#BondRateSlider').slider(sliderOptions);
BondRateSlider.on('slide', updateBondRate);
BondRateSlider.on('slideStop', updateBondRate);

// DegreeLength
function updateDegreeLength (ev) {
  $('#DegreeLengthBox')[0].innerHTML = ev.value;
  updateUnchanged('#DegreeLengthBox');
}
var DegreeLengthSlider = $('#DegreeLengthSlider').slider(sliderOptions);
DegreeLengthSlider.on('slide', updateDegreeLength);
DegreeLengthSlider.on('slideStop', updateDegreeLength);

// TuitionFees
function updateTuitionFees (ev) {
  $('#TuitionFeesBox')[0].innerHTML = "$ " + ev.value.toFixed(0) + " K";
  updateUnchanged('#TuitionFeesBox');
}
var TuitionFeesSlider = $('#TuitionFeesSlider').slider(sliderOptions);
TuitionFeesSlider.on('slide', updateTuitionFees);
TuitionFeesSlider.on('slideStop', updateTuitionFees);

function updateFeesSlider() {
    var min, max;
    switch (parseInt(DegreeBandSelector.val())) {
        case 1:             /*Accounting*/
          min = 10.3
          max = 28.4;
          break;
         case 2:            /*Administration*/
          min = 10.3
          max = 28.4;
          break;
         case 4:            /*Behavioural Science*/
          min = 7.1
          max = 21.6;
          break;
         case 6:            /*Commerce*/
          min = 10.3
          max = 28.4;
          break;
         case 7:            /*Computing*/
          min = 9.7
          max = 21.6;
          break;
         case 9:            /*Economics*/
          min = 10.3
          max = 28.4;
          break;
         case 11:            /*Engineering*/
          min = 14.0
          max = 18.7;
          break;
         case 12:            /*Foreign Languages*/
          min = 6.4
          max = 14.6;
          break;
         case 14:            /*Humanities*/
          min = 5.8
          max = 20.3;
          break;
         case 15:            /*Law*/
          min = 10.3
          max = 28.4;
          break;
         case 16:            /*Mathematics*/
          min = 6.8
          max = 18.7;
          break;
         case 19:            /*Science*/
          min = 14.0
          max = 18.7;
          break;
         case 20:            /*Social Studies*/
          min = 9.9
          max = 24.4;
          break;
         case 21:            /*Statistics*/
          min = 6.8
          max = 18.7;
          break;
         case 24:            /*Visual and Performing Arts*/
          min = 9.3
          max = 17.4;
          break;
        default:
          min = 10
          max = 28;
    }
    TuitionFeesSlider.slider('setAttribute', 'min', min);
    TuitionFeesSlider.slider('setAttribute', 'max', max);
    var newVal = 0.5 * (min + max);
    TuitionFeesSlider.slider('setValue', newVal);
    $('#TuitionFeesBox')[0].innerHTML = "$ " +  newVal.toFixed(0) + " K";
}

// GapYear
function updateGapYear (ev) {
  $('#GapYearBox')[0].innerHTML = ev.value;
  updateUnchanged('#GapYearBox');
}
var GapYearSlider = $('#GapYearSlider').slider(sliderOptions);
GapYearSlider.on('slide', updateGapYear);
GapYearSlider.on('slideStop', updateGapYear);

// StartingSalary
function updateStartingSalary (ev) {
  $('#StartingSalaryBox')[0].innerHTML = "$ " + ev.value.toFixed(0) + " K";
  updateUnchanged('#StartingSalaryBox');
}
var StartingSalarySlider = $('#StartingSalarySlider').slider(sliderOptions);
StartingSalarySlider.on('slide', updateStartingSalary);
StartingSalarySlider.on('slideStop', updateStartingSalary);

// SalaryIncrease
function updateSalaryIncrease (ev) {
  $('#SalaryIncreaseBox')[0].innerHTML = ev.value.toFixed(1) + " %";
  updateUnchanged('#SalaryIncreaseBox');
}
var SalaryIncreaseSlider = $('#SalaryIncreaseSlider').slider(sliderOptions);
SalaryIncreaseSlider.on('slide', updateSalaryIncrease);
SalaryIncreaseSlider.on('slideStop', updateSalaryIncrease);

function getData() {
  return {
    'InflationRate': InflationRateSlider.data('slider').getValue() / 100.0,
    'BondRate': BondRateSlider.data('slider').getValue() / 100.0,
    'DegreeBand': parseInt($('#DegreeBandSelector').val()),
    'DegreeLength': DegreeLengthSlider.data('slider').getValue(),
    'TuitionFees': TuitionFeesSlider.data('slider').getValue() * 1000.0,
    'GapYear': GapYearSlider.data('slider').getValue(),
    'StartingSalary': StartingSalarySlider.data('slider').getValue() * 1000,
    'SalaryIncrease': SalaryIncreaseSlider.data('slider').getValue() / 100.0,
  };
}

function updateAll() {
  // Compute costs and update tables and chart data
  // Note: you will need to call chart.redraw() afterwards
  var data = getData();
  var inflation = data.InflationRate;
  var bondRate = data.BondRate;
  var years = data.DegreeLength;
  var gap = data.GapYear;
  var startingSalary = data.StartingSalary;
  var salaryIncrease = data.SalaryIncrease;
  var degree = data.DegreeBand;
  var tuitionFees = data.TuitionFees;
  var oldDebt = 0.0;    // running debt under old system
  var newDebt = 0.0;    // running debt under new system

  var oldAnnualFees;
  var newContribution;
  var internationalFees;

  // Calculate fees per semester (today's dollars)
  switch (degree) {
  case 1:
    oldAnnualFees = 10085;
    break;
  case 2:
    oldAnnualFees = 10085;
    break;
  // case 3:
  //   oldAnnualFees = 8613;
  //   break;
  case 4:
    oldAnnualFees = 6044;
    break;
  // case 5:
  //   oldAnnualFees = 8613;
  //   break;
  case 6:
    oldAnnualFees = 10085;
    break;
  case 7:
    oldAnnualFees = 8613;
    break;
  // case 8:
  //   oldAnnualFees = 10085;
  //   break;
  case 9:
    oldAnnualFees = 10085;
    break;
  // case 10:
  //   oldAnnualFees = 6044;
  //   break;
  case 11:
    oldAnnualFees = 8613;
    break;
  case 12:
    oldAnnualFees = 6044;
    break;
  case 13:
  //   oldAnnualFees = 8613;
  //   break;
  case 14:
    oldAnnualFees = 6044;
    break;
  case 15:
    oldAnnualFees = 10085;
    break;
  case 16:
    oldAnnualFees = 8613;
    break;
  case 17:
    oldAnnualFees = 10085;
    break;
  case 18:
  //   oldAnnualFees = 6044;
  //   break;
  case 19:
    oldAnnualFees = 8613;
    break;
  case 20:
    oldAnnualFees = 6044;
    break;
  case 21:
    oldAnnualFees = 8613;
    break;
  // case 22:
  //   oldAnnualFees = 8613;
  //   break;
  // case 23:
  //   oldAnnualFees = 10085;
  //   break;
  case 24:
    oldAnnualFees = 6044;
    break;
  }

  newAnnualFees = tuitionFees;

  var oldFees = years * oldAnnualFees;    // total fees paid under old system (today's dollars)
  var newFees = years * newAnnualFees;    // total fees paid under new system (today's dollars)

  /* Stage 1 - Studying */
  for (var i = 1; i <= data.DegreeLength; i++) {
    // old system
    oldDebt = oldDebt*(1 + inflation) + oldAnnualFees * Math.pow(1 + inflation, i - 1);

    // new system
    newDebt = newDebt*(1 + bondRate) + newAnnualFees * Math.pow(1 + inflation, i - 1);
  }


  /* Stage 2 - Gap Years */
  oldDebt *= Math.pow(1 + inflation, gap);
  newDebt *= Math.pow(1 + bondRate, gap);


  /* Stage 3 - Working */
  var repaymentRate;
  var inflationFactor;

  var oldPaid = 0.0;    // how much is paid under old system (today's dollars)
  var oldYears = years + gap;
  var income = startingSalary*Math.pow(1 + inflation, oldYears);  // Income adjusted for inflation
  /* old system */
  while (true) {
    inflationFactor = Math.pow(1 + inflation, oldYears);
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

    if (oldYears >= 50+years) {  // debt for life
      break;
    }

    oldDebt *= (1.0 + inflation);   // debt indexed by inflation

    // debt repayments
    if (income*repaymentRate >= oldDebt) {   // finish paying off loan
      oldPaid += oldDebt/inflationFactor;
      oldDebt = 0.0;
      break;
    } else {
      oldDebt -= income * repaymentRate;
      oldPaid += income * repaymentRate / inflationFactor;
    }

    income *= (1.0 + salaryIncrease);
    oldYears ++;
  }
  oldDebt /= Math.pow(1+inflation,oldYears-1);       // remaining debt in today's dollars

  var newPaid = 0.0;    // how much is paid under new system (today's dollars)
  var newYears = years+gap;
  var income = startingSalary * Math.pow(1 + inflation, newYears);  // Income adjusted for inflation
  var new_bracket = 50638 * Math.pow(1 + inflation, -2);

  /* new system */
  while (true) {
    // calculate repayment
    inflationFactor = Math.pow(1 + inflation, newYears);
    if (income < new_bracket * inflationFactor) {
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

    if (newYears >= 50+years) {  // debt for life
      break;
    }

    newDebt *= (1.0 + bondRate);    // debt indexed by the bond rate

    // debt repayments
    if (income*repaymentRate > newDebt) {   // finish paying off loan
      newPaid += newDebt/inflationFactor;
      newDebt = 0.0;
      break;
    } else {
      newDebt -= income*repaymentRate;
      newPaid += income*repaymentRate/inflationFactor;
    }
    income *= (1.0 + salaryIncrease);
    newYears ++;
  }
  newDebt /= Math.pow(1+inflation,newYears-1);       // remaining debt in today's dollars

  var oldInterest=0;
  var newInterest = newPaid-newFees;
  if (newInterest < 0) {
    newInterest = 0;
  }

  var oldPaidFees = oldFees;
  if (oldPaid < oldFees) {
    oldPaidFees = oldPaid;
  }

  var newPaidFees = newFees;
  if (newPaid < newFees) {
    newPaidFees = newPaid;
  }

  updateTable([oldPaid, newPaid], [oldInterest, newInterest], [newYears - years, oldYears - years], [oldDebt, newDebt]);
  updateChart([oldInterest, newInterest], [oldPaidFees, newPaidFees], [oldDebt, newDebt]);
}

updateFeesSlider();
updateAll();
chart.redraw();
