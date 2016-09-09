
// Load the Visualization API and the corechart package.
google.charts.load('current', {'packages':['corechart']});

// APP SCOPE DATA AND CONSTANTS
var databaseUrl = 'https://www.quandl.com/api/v3/datasets/GOOG/';
var jsonExt = '.json';
var urlOptions = '?api_key=BK7rxeeuPK-tz8TMEf4B&column_index=4&start_date=2010-01-01&order=asc'

var userPortfolio = new Portfolio({
  name: 'User Portfolio',
  initialCash: 1000000,
  companies: [
    'NASDAQ_GOOG',
    'NYSE_BA',
    'NYSE_F',
    'NYSE_VZ',
    'NYSE_GE'
  ]
});

var spyPortfolio = new Portfolio({
  name: 'S&P',
  initialCash: 1000000,
  companies: [
    'NYSE_SPY'
  ]
});

var sharePrices = {}; // file scoped object to hold the stockData

// EXECUTION

//BIND EXECUTION TO BUTTON
$(document).ready(function() {
  processPortfolios(userPortfolio, spyPortfolio);
  $('#run_button').click(function() {
    var userCompanies = $('#tkr_text').val().match(/([a-zA-Z_]+)/g).map((x) => x.trim().toUpperCase());
    console.log(userCompanies);
    userPortfolio.companies = userCompanies;
    processPortfolios(userPortfolio, spyPortfolio);

  });
});

function processPortfolios(...portfolios) {
  var companies = portfolios.reduce((p,x) => p.concat(x.companies), []);
  $.when( getStockData( companies ) ).then(
    function() {
      for (var p = 0, pLen = portfolios.length; p < pLen; p++) {
        var portfolio = portfolios[p];
        portfolio.buyInitialShares();
        portfolio.calculatePerformance();
      }
      google.charts.setOnLoadCallback(drawPortfolioComparisonChart.bind(null, portfolios));
    }
  );
}

// Portfolio class and methods
function Portfolio(opts) {
  this.name = '';
  this.initialCash = 0;
  this.companies = [];
  this.shares = {};
  this.performance = [];
  Object.assign(this, opts);
}

// Calculate the monetary value of the portfolio over time
Portfolio.prototype.calculatePerformance = function calculatePerformance() {
  var mergedData = mergeStockData(this.companies.map((x) => sharePrices[x].data));
  this.performance = mergedData.map((row) => [(new Date(row[0])), row.slice(1).reduce((p, x, i) => this.shares[this.companies[i]] * x + p, 0)]);
};

// Calculate how many shares of each company the portfolio initially buys
Portfolio.prototype.buyInitialShares = function buyInitialShares() {
  for (var c = 0, cLen = this.companies.length; c < cLen; c++) {
    var tkr = this.companies[c];
    var initialSharePrice = sharePrices[tkr].data[0][1];
    this.shares[tkr] = Math.floor((this.initialCash / cLen) / initialSharePrice);
  }
};

// functions to get the stock data from Quandl servers
function getStockData( companies ) {
  var dfd = $.Deferred();

  var numRequests = companies.length;
  function addData(data) {
    sharePrices[data.dataset.dataset_code] = data.dataset;
    if (--numRequests === 0) {
      dfd.resolve(sharePrices);
    }
  }
  for (var i = 0; i < companies.length; i++) {
    var tkr = companies[i];
    getQuandlDataset(tkr, addData);
  }

  return dfd.promise();
};

function getQuandlDataset(tkr, callback) {
  console.log('getQuandlDataset ' + tkr);
  $.getJSON(databaseUrl + tkr + jsonExt + urlOptions, null, callback);
}

// some stock data has different time stamps, this will sync the data to share the same time stamps
function mergeStockData(stockData) {
  if (stockData.length === 1) {
    return stockData[0];
  }
  function ltDate(a, b) {
    return (a >= b ? b : a); // >= because comparing strings with a non string is always false
  }

  //first row can have stockData from future dates
  var currDate = stockData.reduce((p,x) => ltDate(x[0][0], p));
  var stockDataM = [[currDate, ...stockData.map((x) => x[0][1])]]; //first row of merged stockData is the first element of each stockData

  var cnt = Array(stockData.length).fill(1);
  var done = false;
  var currDate = stockData.reduce((p,x) => ltDate(x[1][0], p)); //set current date to earliest of second row
  while (!done) {
    done = true;
    var nextDate = Infinity;
    var stockDataRowM = [currDate];
    for ( var i = 0, len = stockData.length; i < len; i++ ) {
      var stockDataRowI = stockData[i][cnt[i]];
      var date = stockDataRowI[0];
      if (date <= currDate) {
        stockDataRowM.push(stockDataRowI[1]);
        cnt[i]++;
        if (cnt[i] < stockData[i].length) {
          done = false;
          nextDate = ltDate(stockData[i][cnt[i]][0], nextDate);
        }
      } else {
        stockDataRowM.push(stockData[i][cnt[i] - 1][1]);
      }
    }
    stockDataM.push(stockDataRowM);
    currDate = nextDate;
  }

  return stockDataM;
}

// Set a callback to run when the Google Visualization API is loaded.
// google.charts.setOnLoadCallback(drawPortfolioComparisonChart.call(null, data.dataset));



function drawPortfolioComparisonChart(portfolios) {
  var mergedData = mergeStockData(portfolios.map((x) => x.performance));
  console.log(mergedData);
  var data = new google.visualization.DataTable();
  data.addColumn('date', 'Date');
  portfolios.map((x) => data.addColumn('number', x.name));
  data.addRows(mergedData);
  // var data = google.visualization.arrayToDataTable([
    // ['Date', ...portfolios.map((x) => x.name)],
    // ...mergedData
  // ]);

  var options = {
    title: 'Portfolio Comparison',
    legend: { position: 'bottom' },
    animation: {
      startup: true,
      duration: 1000,
      easing: 'out'
    }
  };

  var chart = new google.visualization.LineChart(document.getElementById('portfolio_comparison_chart'));

  chart.draw(data, options);
}