// Include Plotly CDN
var plotlyjscdn = document.createElement('script')
plotlyjscdn.setAttribute('src', "https://cdn.plot.ly/plotly-latest.min.js")
document.body.appendChild(plotlyjscdn)



// Render the whole page. Function described below
window.onload = async function () {
    this.loadUrls(urlHtmlId, urlObject);
    let dashboardFetchStatus = await this.fetchDashboardData('latesthomeid','dashboard_data');
    this.InitializeDashboardAndList(dashboardFetchStatus);
    let homelistFetchStatus = await this.fetchDashboardData('latesthomeid','homelist')
    console.trace(homelistFetchStatus)
    if (homelistFetchStatus) {
        this.recalculateRenderedData()
        
    }



};



//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Create ajax call to get the dashboard data.
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//Get all Rest framework URLs from the page

var urlObject = {}; //Store the urls fetched from index.html
var dataDict = {}; //Store the result of data fetched from Django Rest Framework

var urlHtmlId = {
    latesthomeid: 'drf_latesthome',
    dashboard_data: 'drf_dashboard_data',
    homelist: 'drf_homelisting',
};


function loadUrls(urlHtmlId, urlObject) {
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

async function fetchDashboardData(referenceId,targetDataKey) {
    console.log('fetching data for ' + targetDataKey)
    let remoteReferenceId = await ApiCall(urlObject, referenceId);

    //Get local information
    let localTargetData = JSON.parse(localStorage.getItem(targetDataKey));
    let latestlocalReferenceId = localTargetData ? Math.max(...localTargetData.map(a=>a.id)) : 0
    console.log(latestlocalReferenceId)
    console.log(remoteReferenceId['id'])

    //Perform the comparison
    if (remoteReferenceId['id'] == latestlocalReferenceId && localTargetData) {
        console.log('Current data is up to date!')

        // Store information to datadict for further use
        dataDict[targetDataKey] = localTargetData

    } else {
        console.log('Data needs to be refreshed')

        let remoteTargetData = await ApiCall(urlObject, targetDataKey);

        // Store information to datadict for further use
        dataDict[targetDataKey] = remoteTargetData

        // Store information to localstorage for future use
        localStorage.setItem(targetDataKey, JSON.stringify(remoteTargetData))

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
var defaultSelectedPoints;
var selectedPoints = [];
var xbounds = [-Infinity,Infinity]
var ybounds = [-Infinity,Infinity]

// Plotly interaction functions
function selectPoints(eventData) {
    selectedPoints = eventData.points.map(a => a.data.ids[a.pointNumber]);
    recalculateRenderedData(selectedPoints)
};

function zoomToPoints(xMin, xMax, yMin, yMax) {
    xbounds = [xMin, xMax];
    ybounds = [yMin, yMax];
    recalculateRenderedData(selectedPoints,xbounds, ybounds);
};

function clickPoints() {
    recalculateRenderedData(selectedPoints, xbounds, ybounds);
}


// Feed Vue the required final lists
function recalculateRenderedData(selectedPoints=[], xbounds= [-Infinity, Infinity], ybounds = [-Infinity, Infinity]) {
    let dashboard_data = dataDict['dashboard_data']
    let homelist = dataDict['homelist']
    let rendered_points = []
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
        rendered_points = dashboard_data.map(item => item.id);

    } else {

        rendered_points = dashboard_data.filter(
            item => selectedPoints.includes(item.id) &&
            item[xVar] >= xbounds[0] && item[xVar] <= xbounds[1] &&
            item[yVar] >= ybounds[0] && item[yVar] <= ybounds[1]

        ).map(
            item => item.id
        );
    };
    console.log(rendered_points)
    let rendered_data = homelist.filter(item =>
        rendered_points.includes(item.id))


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
            pageNumber: 0,
            size : 10,
        },
        methods: {
            forceRerender() {
                this.pageNumber = 0
                this.componentKey += 1;
            },
            pageNext(){
                this.pageNumber++;
            },
            pagePrevious(){
                this.pageNumber--;
            },
            goToPage(index){
                this.pageNumber = index;
            }

        },
        computed: {
            pageCount(){
                let l = this.homelist.length;
                let s = this.size;
                return Math.ceil(l/s)
            },
            paginatedData(){
                const start = this.pageNumber * this.size,
                      end = start + this.size
                console.log([start,end])
                return this.homelist.slice(start,end)
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