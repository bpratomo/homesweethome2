// Include Plotly CDN
var plotlyjscdn = document.createElement('script')
plotlyjscdn.setAttribute('src', "https://cdn.plot.ly/plotly-latest.min.js")
document.body.appendChild(plotlyjscdn)



// Render the whole page. Function described below
window.onload = async function () {
    this.loadUrls(urlHtmlId,urlObject);
    let dashboardFetchStatus = await this.compareLatestHomeId();
    this.InitializeDashboardAndList(dashboardFetchStatus);

};



//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Create ajax call to get the dashboard data.
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//Get all Rest framework URLs from the page

var urlObject = {}; //Store the urls fetched from index.html
var dataDict = {};  //Store the result of data fetched from Django Rest Framework

var urlHtmlId = {
    latesthomeid: 'drf_latesthome',
    dashboard_data: 'drf_dashboard_data',
    homelisting: 'drf_homelisting',
};


function loadUrls(urlHtmlId,urlObject) {
    for (const key in urlHtmlId) {
        const element = urlHtmlId[key];
        urlObject[key] = document.getElementById(element).getAttribute('data-url');
    };
}


async function ApiCall(urlDict, key) {
    let apiUrl = urlDict[key]
    let response = await fetch(apiUrl)
    let data = await response.json()
    return data
}


//Check if data is still up-to-date and whether we even need to make an API call 

async function compareLatestHomeId() {
    let remoteLatestHomeId = await ApiCall(urlObject, 'latesthomeid');

    //Get local information
    let localLatestHomeId = JSON.parse(localStorage.getItem('latesthomeid'));
    let localDashboardData = JSON.parse(localStorage.getItem('dashboard_data'));

    //Perform the comparison
    if (remoteLatestHomeId['id'] == localLatestHomeId['id'] && localDashboardData != null) {
        console.log('Current data is up to date!')

        // Store information to datadict for further use
        dataDict['dashboard_data'] = localDashboardData
        dataDict['latesthomeid'] = localLatestHomeId

    } else {
        console.log('Data needs to be refreshed')

        let remoteDashboardData = await ApiCall(urlObject, 'dashboard_data');

        // Store information to datadict for further use
        dataDict['dashboard_data'] = remoteDashboardData
        dataDict['latesthomeid'] = localLatestHomeId

        // Store information to localstorage for future use
        localStorage.setItem('latesthomeid', JSON.stringify(remoteLatestHomeId))
        localStorage.setItem('dashboard_data', JSON.stringify(remoteDashboardData))

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


var xVar = 'area';
var yVar = 'price';

function generateTraces(input_data, hue_column) {

    defaultSelectedPoints = input_data.map(a => a.id)

    // Based on the hue_column, the function will generate individual traces per hue value to feed into Plotly
    let nonUniqueHueValues = input_data.map(a => a[hue_column]);
    let uniqueHueValues = [...new Set(nonUniqueHueValues)];
    let traceArray = [];

    uniqueHueValues.forEach(
        function (item) {
            let targetTrace = input_data.filter(a => a[hue_column] == item)

            let plotly_formatted_trace = {
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
            traceArray.push(plotly_formatted_trace)
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

// Default setting
var selectedPoints = [];
var defaultSelectedPoints;
var xbounds = [-Infinity, Infinity];
var ybounds = [-Infinity, Infinity];


// Plotly interaction functions
function selectPoints(eventData) {
    selectedPoints = eventData.points.map(a => a.data.ids[a.pointNumber]);
    recalculateRenderedData(selectedPoints, xbounds, ybounds)
};

function zoomToPoints(xMin, xMax, yMin, yMax) {
    xbounds = [xMin, xMax];
    ybounds = [yMin, yMax];
    recalculateRenderedData(selectedPoints, xbounds, ybounds);
};

function clickPoints() {
    recalculateRenderedData(selectedPoints, xbounds, ybounds);
}


// Feed Vue the required final lists
function recalculateRenderedData(selectedPoints, xbounds, ybounds) {
    let dashboard_data = dataDict['dashboard_data']

    let casecount = 0;
    // Case where no relayout has been done
    if (xbounds.indexOf(undefined) >= 0 | ybounds.indexOf(undefined) >= 0) {
        xbounds = [-Infinity, Infinity];
        ybounds = [-Infinity, Infinity];
        casecount += 1;
    };

    // Case where no points are selected
    if (selectedPoints.length == 0) {
        selectedPoints = defaultSelectedPoints
        casecount += 1;

    };

    if (casecount == 2) {
        // No points are actually selected. Show everything. 
        rendered_data = dashboard_data;

    } else {

        rendered_data = dashboard_data.filter(
            item => selectedPoints.includes(item.id) &&
            item[xVar] >= xbounds[0] && item[xVar] <= xbounds[1] &&
            item[yVar] >= ybounds[0] && item[yVar] <= ybounds[1]

        );
    };

    vueApp.homelist = rendered_data;

    vueApp.forceRerender();

};


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Vue App Instance
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var vueApp;

function initializeVueApp() {
    let app = new Vue({
        delimiters: ['[[', ']]'],
        el: '#homelisting',
        data: {
            componentKey: 0,
            homelist: null,
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
async function InitializeDashboardAndList(dashboardFetchStatus) {
    if (dashboardFetchStatus) {
        let dashboard_data = dataDict['dashboard_data']
        generatePlotlyChart(dashboard_data, plotlayout, plotConfig);
        vueApp = initializeVueApp();


        //Setting plotly interaction function
        myPlot.on('plotly_selected', function (eventData) {
            selectPoints(eventData);
        });
        myPlot.on('plotly_click', function () {
            clickPoints();
        });

        myPlot.on('plotly_doubleclick', function () {
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