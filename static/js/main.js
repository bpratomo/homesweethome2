

// Render the whole page. Function described in each respective JS files
window.onload = async function () {
    this.loadUrls(urlHtmlId, urlObject);
    let dashboardFetchStatus = await this.fetchDashboardData('latesthomeid', 'dashboard_data');
    this.InitializeDashboardAndList(dashboardFetchStatus);
    let homelistFetchStatus = await this.fetchDashboardData('latesthomeid', 'homelist')
    console.trace(homelistFetchStatus)
    if (homelistFetchStatus) {
        this.recalculateRenderedData()

    }



};


//Initialize whole page
async function InitializeDashboardAndList(dashboardFetchStatus) {
    if (dashboardFetchStatus) {
        let dashboard_data = dataDict['dashboard_data']
        generatePlotlyChart(dashboard_data, plotlayout, plotConfig);
        vueApp = initializeVueApp();
        generatePlotInteractivity(mydashboard)
       ;

    } else {
        console.log('Initialization failed!')
    }
};