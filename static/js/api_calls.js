
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

async function fetchDashboardData(referenceId, targetDataKey) {
    console.log('fetching data for ' + targetDataKey)
    let remoteReferenceId = await ApiCall(urlObject, referenceId);

    //Get local information
    let localTargetData = JSON.parse(localStorage.getItem(targetDataKey));
    let latestlocalReferenceId = localTargetData ? Math.max(...localTargetData.map(a => a.id)) : 0

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


