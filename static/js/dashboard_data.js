// Include Plotly CDN
var plotlyjscdn = document.createElement('script')
plotlyjscdn.setAttribute('src', "https://cdn.plot.ly/plotly-latest.min.js")
document.body.appendChild(plotlyjscdn)

var rest_framework_url = document.getElementById('rest_framework_url').getAttribute('data-url')
console.log
var dashboard_data;
console.log('Sending request......')


// Create ajax call to get the dashboard data.
function getDashboardData(dashboardurl) {
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", dashboardurl, true);
    xhttp.send()
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            dashboard_data = JSON.parse(this.responseText);
        }

    }

};



var myPlot = document.getElementById('mydashboard');

function generateTraces(input_data, hue_column) {
    var nonUniqueHueValues = input_data.map(a => a[hue_column]);
    var uniqueHueValues = [...new Set(nonUniqueHueValues)];
    var traceArray = [];

    uniqueHueValues.forEach(
        function (item, index) {
            var targetTrace = input_data.filter(a => a[hue_column] == item)
            var final_trace = {
                x: targetTrace.map(a => a.area),
                y: targetTrace.map(a => a.price),
                mode: 'markers',
                type: 'scatter',
                marker: {
                    size: 20,
                },
                opacity: '0.5',
                name: item,
            };
            traceArray.push(final_trace)
        }

    );
    return traceArray;
}



getDashboardData(rest_framework_url);


//Generate plotly chart
function generatePlotlyChart(input_data) {
    //Generate plotly chart

    var data = generateTraces(dashboard_data, 'city');

    Plotly.newPlot('mydashboard', data)

};


function initializeVueApp() {
    var app = new Vue({
        delimiters: ['[[', ']]'],
        el: '#homelisting',
        data: {
          homelist: dashboard_data
        }
      });
    return app    
    
}

var fullDataArray = [];


function waitForElement() {
    if (typeof dashboard_data !== "undefined" && typeof Plotly !== "undefined") {
        generatePlotlyChart(dashboard_data);
        var vueApp = initializeVueApp();
        myPlot.on('plotly_selected',function(eventData){
            fullDataArray = eventData.points.map(a=>a.fullData.uid)
        });
    } else {
        setTimeout(waitForElement, 250);
    }
};

waitForElement();


// Render the home details list Vue APP
