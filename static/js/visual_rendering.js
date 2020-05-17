
// Include Plotly CDN
var plotlyjscdn = document.createElement('script')
plotlyjscdn.setAttribute('src', "https://cdn.plot.ly/plotly-latest.min.js")
document.body.appendChild(plotlyjscdn)


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Generate dashboard chart
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var mydashboard = document.getElementById('mydashboard');
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
var xbounds = [-Infinity, Infinity]
var ybounds = [-Infinity, Infinity]

// Plotly interaction functions
function selectPoints(eventData) {
    selectedPoints = eventData.points.map(a => a.data.ids[a.pointNumber]);
    recalculateRenderedData(selectedPoints)
};

function zoomToPoints(xMin, xMax, yMin, yMax) {
    xbounds = [xMin, xMax];
    ybounds = [yMin, yMax];
    recalculateRenderedData(selectedPoints, xbounds, ybounds);
};

function clickPoints() {
    recalculateRenderedData(selectedPoints, xbounds, ybounds);
}

function generatePlotInteractivity(element) {
     //Setting plotly interaction function
    element.on('plotly_selected', function (eventData) {
        selectPoints(eventData);
    });
    element.on('plotly_click', function () {
        clickPoints();
    });

    element.on('plotly_doubleclick', function () {
        clickPoints();
    });
    element.on('plotly_legendclick', function (curveData) {
        // selectedPoints = curveData.data[curveData.curveNumber].ids;
        console.log(curveData);
    });

    element.on('plotly_relayout', function (eventData) {
        zoomToPoints(
            eventData["xaxis.range[0]"],
            eventData["xaxis.range[1]"],
            eventData["yaxis.range[0]"],
            eventData["yaxis.range[1]"],
        );
    })

    
}

// Feed Vue the required final lists
function recalculateRenderedData(selectedPoints = [], xbounds = [-Infinity, Infinity], ybounds = [-Infinity, Infinity]) {
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
    let listingBadge =document.getElementById('listing-badge');
    listingBadge.classList.remove("deactivated")


};

