// Include Plotly CDN
var plotlyjscdn = document.createElement('script')
plotlyjscdn.setAttribute('src', "https://cdn.plot.ly/plotly-latest.min.js")
document.body.appendChild(plotlyjscdn)




//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Create ajax call to get the dashboard data.
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//Get all Rest framework URLs from the page

var urlHtmlId = {
    latesthomeid: 'drf_latesthome',
    dashboard_data:'drf_dashboard_data',
    homelisting: 'drf_homelisting',
};

var urlObject={};
var dataDict = {};
var dashboardFetchStatus;

async function ApiCall(urlDict, key){
    let apiUrl = urlDict[key]
    let response = await fetch(apiUrl)
    let data =  await response.json()
    return data
}






//Check if data is still up-to-date and whether we even need to make an API call 

async function compareLatestHomeId(){
        let remoteLatestHomeId = await ApiCall(urlObject,'latesthomeid');
        let localLatestHomeId = JSON.parse(localStorage.getItem('latesthomeid'));
        let localDashboardData = JSON.parse(localStorage.getItem('dashboard_data'));
        if (remoteLatestHomeId['id'] == localLatestHomeId['id'] && localDashboardData != null ) {
            console.log('Current data is up to date!')

            dataDict['dashboard_data'] = localDashboardData
            dataDict['latesthomeid'] = localLatestHomeId
                        
        } else{
            console.log('Data needs to be refreshed')

            let remoteDashboardData = await ApiCall(urlObject,'dashboard_data');

            
            dataDict['dashboard_data'] = remoteDashboardData
            dataDict['latesthomeid'] = localLatestHomeId

            remoteDashboardData = JSON.stringify(remoteDashboardData)  
            remoteLatestHomeId = JSON.stringify(remoteLatestHomeId)  
            localStorage.setItem('latesthomeid',remoteLatestHomeId)
            localStorage.setItem('dashboard_data',remoteDashboardData)


        };
        return true;

};




//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Generate dashboard chart
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var myPlot = document.getElementById('mydashboard');
var plotConfig = {
    responsive: true
};

var plotlayout = {
    autosize: true,
    dragmode: 'select',
    margin: {
        l: 50,
        r: 50,
        b: 100,
        t: 100,
        pad: 4
    }
};

var rendered_data = dataDict['dashboard_data']
var xVar = 'area';
var yVar = 'price';

function generateTraces(input_data, hue_column) {

    // Based on the hue_column, the function will generate individual traces per hue value to feed into Plotly
    var nonUniqueHueValues = input_data.map(a => a[hue_column]);
    var uniqueHueValues = [...new Set(nonUniqueHueValues)];
    var traceArray = [];

    uniqueHueValues.forEach(
        function (item) {
            var targetTrace = input_data.filter(a => a[hue_column] == item)
            var final_trace = {
                x: targetTrace.map(a => a[xVar]),
                y: targetTrace.map(a => a[yVar]),
                ids: targetTrace.map(a => a.id),
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


function generatePlotlyChart(input_data, layout, config) {
    var data = generateTraces(input_data, 'city');
    Plotly.newPlot('mydashboard', data, layout, config)


};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Plotly interactivity
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var selectedPoints = [];
var defaultSelectedPoints;
var xbounds = [-Infinity, Infinity];
var ybounds = [-Infinity, Infinity];

function recalculateRenderedData(selectedPoints, xbounds, ybounds) {
    
    var casecount = 0;
    if (xbounds.indexOf(undefined) >= 0 | ybounds.indexOf(undefined) >= 0) {
        xbounds = [-Infinity, Infinity];
        ybounds = [-Infinity, Infinity];
        casecount+=1;
    };

    if (selectedPoints.length == 0) {
        selectedPoints = defaultSelectedPoints
        casecount+=1;

    };

    if (casecount==2) {
        rendered_data = dataDict['dashboard_data'];
        
    } else {

        rendered_data = dataDict['dashboard_data'].filter(
            item => selectedPoints.includes(item.id) &&
            item[xVar] >= xbounds[0] && item[xVar] <= xbounds[1] &&
            item[yVar] >= ybounds[0] && item[yVar] <= ybounds[1]
    
        );
    };

    vueApp.homelist = rendered_data;
    
    vueApp.forceRerender();

};


function selectPoints(eventData) {
    selectedPoints = eventData.points.map(a => a.data.ids[a.pointNumber]);
    recalculateRenderedData(selectedPoints, xbounds, ybounds)
};

function zoomToPoints(xMin, xMax, yMin, yMax) {
    xbounds = [xMin, xMax];
    ybounds = [yMin, yMax];
    recalculateRenderedData(selectedPoints, xbounds, ybounds);
};

function clickPoints(){
    recalculateRenderedData(selectedPoints, xbounds, ybounds);
}



//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Vue App Instance
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var vueApp;

function initializeVueApp() {
    var app = new Vue({
        delimiters: ['[[', ']]'],
        el: '#homelisting',
        data: {
            componentKey: 0,
            homelist: rendered_data
        },
        methods: {
            forceRerender() {
                this.componentKey += 1;
            }
        }
    });
    return app

}

//Initialize whole page
async function InitializeWholePage(dashboardFetchStatus) {
    if (dashboardFetchStatus) {
        let dashboard_data = dataDict['dashboard_data']
        generatePlotlyChart(dashboard_data, plotlayout, plotConfig);
        vueApp = initializeVueApp();
        defaultSelectedPoints= dashboard_data.map(a => a.id)
        myPlot.on('plotly_selected', function (eventData) {
            selectPoints(eventData);
        });
        myPlot.on('plotly_click', function(){
            clickPoints();
        });        
        
        myPlot.on('plotly_doubleclick', function(){
            clickPoints();
        });
        myPlot.on('plotly_legendclick', function (curveData) {
            // selectedPoints = curveData.data[curveData.curveNumber].ids;
            console.log(curveData);
        });

        myPlot.on('plotly_relayout', function (eventData) {
            zoomToPoints(
                eventData["xaxis.range[0]"],
                eventData["xaxis.range[1]"],
                eventData["yaxis.range[0]"],
                eventData["yaxis.range[1]"],
            );
        });

    } else {
        console.log('Initialization failed!')
    }
};


// Render the whole page
window.onload = async function(){
    for (const key in urlHtmlId) {
            const element = urlHtmlId[key];
            urlObject[key] = document.getElementById(element).getAttribute('data-url');
            console.log(urlObject[key]);
    };
    this.dashboardFetchStatus = await this.compareLatestHomeId();
    this.InitializeWholePage(this.dashboardFetchStatus);
    
};
