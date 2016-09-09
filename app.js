
// Load the Visualization API and the corechart package.
google.charts.load('current', {'packages':['corechart']});

// Set a callback to run when the Google Visualization API is loaded.
// google.charts.setOnLoadCallback(null);

var spyUrl = 'https://www.quandl.com/api/v3/datasets/GOOG/NYSE_SPY.json';

$.ajax({
  url:spyUrl,
  dataType: 'json',
  type: 'GET',
  success: function(data){
    console.log(data);
    alert('success!');
  }});