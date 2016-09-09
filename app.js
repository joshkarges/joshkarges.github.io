
// Load the Visualization API and the corechart package.
google.charts.load('current', {'packages':['corechart']});

var databaseUrl = 'https://www.quandl.com/api/v3/datasets/GOOG/';
var jsonExt = '.json';
var urlOptions = '?api_key=BK7rxeeuPK-tz8TMEf4B&column_index=4&start_date=2010-01-01&order=asc'
var spyTkr = 'NYSE_SPY';
var googTkr = 'NASDAQ_GOOG';
var baTkr = 'NYSE_BA';
var fTkr = 'NYSE_F';
var vzTkr = 'NYSE_VZ';
var geTkr = 'NYSE_GE';


var portfolio = {
  initialCash: 1000000,
  companies: [
    'NASDAQ_GOOG',
    'NYSE_BA',
    'NYSE_F',
    'NYSE_VZ',
    'NYSE_GE'
  ],
  shares: {},
  spyShares: 0,
  performance: []
}

var sharePrices = {};

processPortfolio();

function processPortfolio() {
  $.when( getPortfolioData( portfolio ) ).then(
    function() {
      buyInitialShares( portfolio );
      calculatePerformance( portfolio );
      drawChart( portfolio );
    }
  );
}

function calculatePerformance(p) {
  var tkrCnt = {};
  p.companies.map(function(cmp) {tkrCnt[cmp] = 0;});
  tkrCnt[spyTkr] = 0;

  var currDate = "2010-01-01";
  var done = false;
  while (!done) {
    var moneyAtDate = 0;
    var nextDate = Infinity;
    done = true;
    for (var c = 0, cLen = p.companies.length; c < cLen; c++) {
      var tkr = p.companies[c];
      var i = tkrCnt[tkr];
      var shareDate = sharePrices[tkr].data[i][0]
      if (shareDate <= currDate) {
        moneyAtDate += (p.shares[tkr] * sharePrices[tkr].data[i][1]);
        tkrCnt[tkr]++;
        if (tkrCnt[tkr] < sharePrices[tkr].data.length) {
          done = false;
          nextDate = (sharePrices[tkr].data[tkrCnt[tkr]][0] > nextDate ? nextDate : sharePrices[tkr].data[tkrCnt[tkr]][0]); // next date is the earliest of the companies next share dates
        }
      }
    }

    while (sharePrices[spyTkr].data[tkrCnt[spyTkr]][0] < currDate) tkrCnt[spyTkr]++;

    if (tkrCnt[spyTkr] >= sharePrices[spyTkr].data.length) break;

    p.performance.push([currDate, moneyAtDate, p.spyShares * sharePrices[spyTkr].data[tkrCnt[spyTkr]][1]]);
    currDate = nextDate;
  }
}

function buyInitialShares(p) {
  for (var c = 0, cLen = p.companies.length; c < cLen; c++) {
    var tkr = p.companies[c];
    var initialSharePrice = sharePrices[tkr].data[0][1];
    p.shares[tkr] = Math.floor((p.initialCash / cLen) / initialSharePrice);
  }
  p.spyShares = Math.floor(p.initialCash / sharePrices[spyTkr].data[0][1]);
}

function getPortfolioData(p) {
  var dfd = $.Deferred();

  var numUrls = p.companies.length + 1; //plus 1 for the spy request
  function addData(data) {
    sharePrices[data.dataset.dataset_code] = data.dataset;
    if (--numUrls === 0) {
      dfd.resolve(sharePrices);
    }
  }
  getQuandlDataset(spyTkr, addData);
  for (var i = 0; i < p.companies.length; i++) {
    var tkr = p.companies[i];
    getQuandlDataset(tkr, addData);
  }

  return dfd.promise();
}

function getQuandlDataset(tkr, callback) {
  console.log('getQuandlDataset ' + tkr);
  $.getJSON(databaseUrl + tkr + jsonExt + urlOptions, null, callback);
}

// Set a callback to run when the Google Visualization API is loaded.
// google.charts.setOnLoadCallback(drawChart.call(null, data.dataset));

function drawChart(p) {
  console.log(p);
  var data = google.visualization.arrayToDataTable([
    ['Date', 'Money', 'S&P'],
    ...p.performance
  ]);

  var options = {
    title: 'NYSE SPY',
    legend: { position: 'bottom' },
    animation: {
      startup: true,
      duration: 1000
    }
  };

  var chart = new google.visualization.LineChart(document.getElementById('spy_chart'));

  chart.draw(data, options);
}