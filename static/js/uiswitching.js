/* Close */
function closeNav() {
    console.log('closing NAV!')
    document.getElementById("overlayCarousel").style.height = "0%";
    document.getElementById("innerCarousel").innerHTML = ''
}; // Overlay functions



function activateListing() {

    let listing = document.getElementById('listingcolumn');
    let listingNav = document.getElementById('listing-nav');
    let listingBadge = document.getElementById('listing-badge');

    let scatterplot = document.getElementById('scatterplot-column');
    let scatterNav = document.getElementById('scatter-nav');

    // Deactivate scatterplot
    scatterplot.classList.add("deactivated")
    scatterplot.classList.remove("activated")
    scatterNav.classList.remove("active")


    // Activate Listing
    listing.classList.add("activated")
    listing.classList.remove("deactivated")
    listingNav.classList.add("active")
    listingBadge.classList.add("deactivated")
    
}

function activateScatter() {

    let listing = document.getElementById('listingcolumn');
    let listingNav = document.getElementById('listing-nav');

    let scatterplot = document.getElementById('scatterplot-column');
    let scatterNav = document.getElementById('scatter-nav');

    // Activate scatterplot
    scatterplot.classList.add("activated")
    scatterplot.classList.remove("deactivated")
    scatterNav.classList.add("active")


    // Deactivate Listing
    listing.classList.add("deactivated")
    listing.classList.remove("activated")
    listingNav.classList.remove("active")
    

    
}