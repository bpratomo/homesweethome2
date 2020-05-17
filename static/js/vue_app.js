

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
            size: 10,
        },
        methods: {
            forceRerender() {
                this.pageNumber = 0
                this.componentKey += 1;
            },
            pageNext() {
                this.pageNumber++;
            },
            pagePrevious() {
                this.pageNumber--;
            },
            goToPage(index) {
                this.pageNumber = index;
            },
            openNav(screenshots, index) {
                console.log('opening NAV!')
                console.log(typeof screenshot)
                screenshots.forEach((screenshot, counter) => {
                    let carouselitem = document.createElement("DIV")
                    if (counter == index) {
                        carouselitem.setAttribute("class", "carousel-item active")
                    } else {
                        carouselitem.setAttribute("class", "carousel-item")
                    }

                    let imageItem = document.createElement("IMG")
                    imageItem.src = screenshot
                    carouselitem.appendChild(imageItem)
                    document.getElementById('innerCarousel').appendChild(carouselitem)
                })
                document.getElementById("overlayCarousel").style.height = "100%";


            }



        },
        computed: {
            pageCount() {
                let l = this.homelist.length;
                let s = this.size;
                return Math.ceil(l / s)
            },
            paginatedData() {
                const start = this.pageNumber * this.size,
                    end = start + this.size
                console.log([start, end])
                return this.homelist.slice(start, end)
            },
            renderedButtonIndices() {

                let startAndEndButton = [0, this.pageCount - 1]
                console.log(startAndEndButton)
                let relativePageButtons = [...Array(this.pageNumber + 4).keys()].filter(a => a > this.pageNumber - 4)
                console.log(relativePageButtons)
                console.log('testing renderedbuttonIndices')
                return startAndEndButton.concat(relativePageButtons)
            },

        }
    });
    return app

}