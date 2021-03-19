(function () {
    // these options donT change
    var chartOptions = {
        width: 300,
        height: 200,
        animation: { duration: 333, startup: true, easing: 'inAndOut' },
        backgroundColor: 'transparent',
        vAxis: {
            title: 'Units',
            gridlines: { color: 'transparent' },
            titleTextStyle: { color: '#d56128', italic: false },
            textStyle: { color: '#ffffff' },
            baselineColor: 'white',
            format: 'decimal'
        },
        hAxis: {
            title: '',
            textStyle: { color: '#ffffff' },
            //gridlines: { color: 'transparent' },
            baselineColor: 'white',
            format: '',
            slantedText: true,
						slantedTextAngle: 55
        },
        tooltip: {
        },
        legend: { position: 'none' },
        series: {
            0: { type: 'bars', targetAxisIndex: 1, color: '#d56128' }
        },
        interpolateNulls: false
    }

    var regions = ['MidAtlantic', 'MidWest', 'Mountain', 'NewEngland', 'Pacific', 'SouthAtlantic', 'SouthCentral']

    var geoChartOptions = {
        width: 240,
        height: 200,
        backgroundColor: 'transparent',
        region: 'US',
        displayMode: 'regions',
        resolution: 'provinces',
        colorAxis: { colors: ['#f3d1c1', '#d56128'] },
        datalessRegionColor: '#f3d1c1',
        legend: 'none',
        tooltip: false
    }

    function initTop50Table() {
        
        google.charts.load('current', { 'packages': ['bar', 'geochart'] });

        const top50tableElem = document.getElementById('top50tableID');
        const tBodyElem = document.getElementById('top50tbody');

        // instantiate tablesort
        new Tablesort(top50tableElem);

        // anticipatory. test to see if too aggressive. may need to throttle or debounce
        tBodyElem.addEventListener('mouseover', loadPanel);
        tBodyElem.addEventListener('touchstart', loadPanel);
    }
    
    function loadPanel(event) {
        // wanted just to make details the thing but wouldNt work that way
        if (event.target.tagName === 'SUMMARY' && event.target.parentNode.dataset.hasBeenFetched === "false") {
            goFetch(event)
        }
        // rather than adding 25-50 listeners, cleaner to add one listener
        // on click, populate google chart IDs
    }

    function goFetch(event) {
        let parentDetailNode = event.target.parentNode;
        let idOfDetalisParentOfTargetSummary = parentDetailNode.id;
        event.target.parentNode.dataset.hasBeenFetched = true;

        // getHistorical data isan async function which should keep UI thread relatively free
        getHistoricalData(idOfDetalisParentOfTargetSummary).then(data => {
            console.log(data);

            let dataString = JSON.stringify(data[0].HistoricalData[0]);

            parentDetailNode.dataset.historical = 'hasHistorical';
            parentDetailNode.dataset.breakdown = 'none';

            // data-has-historical="" data-has-breakdown=""
            //let chartElemToPopulate = parentDetailNode.querySelector('.top50__chart');
            //chartElemToPopulate.innerHTML = dataString


            google.charts.setOnLoadCallback(drawChartAndGeoChart);

            var yearAndUnit = ['Year', 'Units'];
            var dataArray = [yearAndUnit]
            
            dataArray.push(
                ["2016", 44],
                ["2017", 31],
                ["2018", 12],
                ["2019", 10]
            );

            function drawChartAndGeoChart() {
                let chartData = new google.visualization.arrayToDataTable([

                    // goal here is to push data into a single DYNAMIC array
                    // this is static example
                    ['Year', 'Units'],
                    ["2016", 44],
                    ["2017", 31],
                    ["2018", 12],
                    ["2019", 10]


                ]);
                let theChart = new google.charts.Bar(parentDetailNode.querySelector('.googChart'));
                theChart.draw(chartData, google.charts.Bar.convertOptions(chartOptions));
                let geoChartData = new google.visualization.arrayToDataTable([
                    ['Region', 'Service'],
                    ['MidAtlantic', "Yes"]
                ]);
                let theGeoChart = new google.visualization.GeoChart(parentDetailNode.querySelector('.googMap'));
                theGeoChart.draw(geoChartData, geoChartOptions)
            };
            }).catch(err => console.log('Doh', err.message)
        );
        
    }

    async function getHistoricalData(compID) {
        // temporarily hard coded url
        let response = await fetch(`http://localhost:3000/histData/${compID}`);
        let data = await response.json();
        return data;
    }

		document.addEventListener('DOMContentLoaded', initTop50Table);
})();