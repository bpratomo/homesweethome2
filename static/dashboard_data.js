
// Include Plotly CDN
var plotlyjscdn = document.createElement('script')
plotlyjscdn.setAttribute('src',"https://cdn.plot.ly/plotly-latest.min.js")
document.body.appendChild(plotlyjscdn)

var rest_framework_url = document.getElementById('rest_framework_url').getAttribute('data-url')


// Create ajax call to get the dashboard data.
function getDashboardData(dashboardurl){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState==4 && this.status==200) {
            console.log(this.responseText)
        }
        
    }
    xhttp.open("GET",dashboardurl,true);
    xhttp.send()
};

if (document.readyState=='complete') {
    getDashboardData(rest_framework_url)
    
}


