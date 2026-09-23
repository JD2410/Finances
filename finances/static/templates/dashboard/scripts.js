let homeSc = {
    'utils': {
        totalDates(start = '2024-01-01', end = '2024-01-11') {
                const startDate = new Date(start)
                const endDate = new Date(end)
                const oneDay = 1000 * 60 * 60 * 24;
                const diffInTime = endDate.getTime() - startDate.getTime();

                return Math.round(diffInTime / oneDay)
        },
        getTwoDigitDate(value, raw = false) {
            let date = new Date(value)
            let finaDateFormat = {
                'day': date.getDate(),
                'month': date.getMonth() + 1,
                'year': date.getFullYear(),
            }

            if (finaDateFormat.day <= 9) { finaDateFormat.day = `0${finaDateFormat.day}` }
            if (finaDateFormat.month <= 9) { finaDateFormat.month = `0${finaDateFormat.month}` }

            if (raw) {
                return finaDateFormat
            } 
            return `${finaDateFormat.year}-${finaDateFormat.month}-${finaDateFormat.day}`
        },
        displayCurrency(value) {
            let amount = parseFloat(value).toFixed(2)
            if (amount >= 1000 || amount <= -1000) {
                let where = amount.indexOf('.') - 3
                amount = amount.slice(0, where) + "," + amount.slice(where)
            }
            return amount
        },
        displayDate(passedDate){
            const date = new Date(passedDate)
            const finaDateFormat = {
                'day': date.getDate(),
                'month': date.getMonth(),
                'year': date.getFullYear(),
            }
            const dayToString = finaDateFormat.day.toString()
            let daySuffix = "th"
            if (finaDateFormat.day == 1) {
                daySuffix = 'st'
            }
            if (finaDateFormat.day == 2) {
                daySuffix = 'nd'
            }
            if (finaDateFormat.day == 3){
                daySuffix = 'rd'
            }
            if (finaDateFormat.day > 10) {
                if (dayToString[1] == 1) {
                    daySuffix = 'st'
                } else if (dayToString[1] == 2) {
                    daySuffix = 'nd'
                } else if (dayToString[1] == 3) {
                    daySuffix = 'rd'
                }
            }
            return `${finaDateFormat.day}${daySuffix} ${this.months[finaDateFormat.month]} ${finaDateFormat.year}`
        },
        months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        getToken(cname) {
            let name = cname + "=";
            let decodedCookie = decodeURIComponent(document.cookie);
            let ca = decodedCookie.split(';');
            for(let i = 0; i <ca.length; i++) {
                let c = ca[i];
                while (c.charAt(0) == ' ') {
                c = c.substring(1);
                }
                if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
                }
            }
            return "";
        }
    },
    'transactions': {
        init() {
            $dateInput = document.getElementById('transactionDate')
            const $chart = document.getElementById("accountProgress")
            let chart = Highcharts.charts[Highcharts.attr($chart, 'data-highcharts-chart')]

            $dateInput.addEventListener('change', () => {
                this.getDateTransaction($dateInput.value)
                chart.getSelectedPoints().forEach(function (point) {
                    point.select(false, true);
                });
            })
            this.accountSymbols.init()
        },
        async getDateTransaction(date, accountId=false) {
            const url = document.getElementById('transactionWidget').dataset.url
            let options = {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': homeSc.utils.getToken("csrftoken")
                },
                body: JSON.stringify({
                    "date": date,
                    "accountId": accountId
                }),
            }
            await fetch(url, options)
                .then(response => response.json())
                .then(data => {
                    if(data.status == 'error') {
                        let message = document.createElement('div');
                        message.classList.add('alert')
                        message.classList.add('alert-warning')
                        message.innerHTML = `There was a problem retrieving your records. Please try again later`
                        document.getElementById('messagesContainer').appendChild(message)
                    } else if(data.status == 'success') {

                        let $tbody = document.getElementById('transactionBody')
                        $tbody.innerHTML = "";
                        $rowClone = document.getElementById('transactionTemplate').cloneNode(true)
                        $rowClone.removeAttribute('id')

                        data.transactions.forEach(transaction => {
                            let transactionRow = $rowClone.cloneNode(true)

                            let $description = transactionRow.querySelector('.description')
                            $description.href = `${$description.href}?q=${transaction.name}`
                            $description.innerHTML = transaction.name

                            let $account = transactionRow.querySelector('.account')
                            $account.href = `${$account.href}${transaction.account_details.id}`
                            $account.innerHTML = transaction.account_details.name
                            
                            transactionRow.querySelector('.date').innerHTML = homeSc.utils.displayDate(transaction.date)
                            transactionRow.querySelector('.amount').innerHTML = `£${homeSc.utils.displayCurrency(transaction.amount)}`
                            $tbody.appendChild(transactionRow)
                        })

                        const $widget = document.getElementById('transactionWidgetInsights')
                        $widget.classList.add('show')
                        const $dates = $widget.querySelectorAll('.card-date')
                        $dates.forEach(date => {
                            date.innerHTML = homeSc.utils.displayDate(data.request_date)
                        })

                        const accountWidget = $widget.querySelector('.accounts')
                        if (data.request_account) {
                            accountWidget.innerHTML = data.request_account
                        } else {
                            accountWidget.innerHTML = 'All Accounts'
                        }

                        homeSc.transactions.accountSymbols.assignTable()
                    }
                })
        },
        'accountSymbols': {
            'symbols': [],
            init() {
                this.getSymbols()
                this.assignTable()
            },
            getSymbols() {
                const $chart = document.getElementById("accountProgress")
                let chart = Highcharts.charts[Highcharts.attr($chart, 'data-highcharts-chart')]
                for (let count=0; count<chart.series.length; count++) {
                    this.symbols.push({
                        'name': chart.series[count].name,
                        'symbol': chart.series[count].symbol,
                        'color': chart.series[count].color,
                    })
                }
            },
            assignTable() {
                $tr = document.getElementById('transactionBody').querySelectorAll('tr')
                $tr.forEach(element => {
                    const $account = element.querySelector('.account')
                    const $accountText = $account.innerHTML
                    let obj = this.symbols.find(o => o.name === $accountText.trim());

                    let symbol = document.createElement('span')
                    symbol.style.backgroundColor = obj.color
                    symbol.classList.add(obj.symbol)
                    $account.parentNode.prepend(symbol)
                })
            }
        },
    },
    'accountTotals': {
        init() {
            const $accounts = JSON.parse(document.getElementById('savings').textContent)
            const $total = parseFloat(JSON.parse(document.getElementById('total').textContent))
            let piePieces = []

            $accounts.forEach(acc => {
                let construct = [
                    `${acc.name} - £${ parseFloat(acc.total).toFixed(2) }`,
                    parseFloat(((parseFloat(acc.total) / $total) * 100).toFixed(2))
                ]
                piePieces.push(construct) 
            })
            if(piePieces.length) {
                this.loadChart(piePieces)
            }
        },
        loadChart(data) {
            Highcharts.chart('piechart', {
                colors: ['#32CD32','#990099','#7C997C','#B500B5','#D100D1','#260026','#005E38','#007C00','#420042','#5E005E','#7C007C',],
                chart: {
                    type: 'pie'
                },

                title: {
                    text: ''
                },

                tooltip: {
                    valueSuffix: '%'
                },
                plotOptions: {
                    pie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        dataLabels: {
                            enabled: false
                        },
                        showInLegend: true
                    }
                },
                legend: {
                    align: 'left',
                    layout: 'vertical',
                    verticalAlign: 'middle',
                },
                series: [{
                    name: '',
                    dataLabels: [
                        {
                            format: '{point.name}',
                        },
                    ],
                    data: data
                }]
            });
        },
    },
    'accountProgress': {
        init() {
            const graphInit = this.graph.sortData(JSON.parse(document.getElementById('savings').textContent))
            this.graph.createGraph(graphInit)

            let $dateInput = document.getElementById('accountProgressDate')
            $dateInput.addEventListener('change', () => {
                this.graph.changeDate($dateInput.value)
            })
        },
        'graph': {
            async changeDate(date) {
                const url = document.getElementById('accountProgressWidgt').dataset.date
                let options = {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': homeSc.utils.getToken("csrftoken")
                    },
                    body: JSON.stringify({
                        "date": date,
                    }),
                }
                await fetch(url, options)
                    .then(response => response.json())
                    .then(data => {
                        if(data.status == 'error') {
                            let message = document.createElement('div');
                            message.classList.add('alert')
                            message.classList.add('alert-warning')
                            message.innerHTML = `There was a problem retrieving your records. Please try again later`
                            document.getElementById('messagesContainer').appendChild(message)
                        } else if(data.status == 'success') {

                            const processed = homeSc.accountProgress.graph.sortData(data.savings, date)
                            const $chart = document.getElementById("accountProgress")
                            let chart = Highcharts.charts[Highcharts.attr($chart, 'data-highcharts-chart')]
                            chart.destroy()
                            this.createGraph(processed)
                        }
                    })
            },
            createGraph(seriesData) {
                Highcharts.chart('accountProgress', {
                    tooltip: {
                        formatter: function () {
                            let amount = parseFloat(this.y).toFixed(2)
                            const date = new Date(this.x)
                            if (amount >= 1000) {
                                let where = amount.indexOf('.') - 3
                                amount = amount.slice(0, where) + "," + amount.slice(where)
                            }
                            return `${this.series.name}<br><strong>£${amount}</strong><br>${date.getDate()} ${homeSc.utils.months[date.getMonth()]} ${date.getFullYear()}`;
                        }
                    },
                    colors: ['#32CD32','#990099','#7C997C','#B500B5','#D100D1','#260026','#005E38','#007C00','#420042','#5E005E','#7C007C'],
                    plotOptions: {
                        series: {
                            cursor: 'pointer',
                            allowPointSelect: true,
                            marker: {
                                states: {
                                    select: {
                                        fillColor: 'green',
                                        lineColor: 'purple',
                                        lineWidth: 4,
                                    }
                                }
                            },
                            point: {
                                events: {
                                    click: function () {
                                        if (this.point.realDataPoint) {
                                            const date = new Date(this.x)
                                            homeSc.transactions.getDateTransaction(`${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`,seriesData[this.colorIndex].id)
                                            document.getElementById('transactionWidget').scrollIntoView({block: "end", behavior: "smooth",})
                                        }
                                    },
                                    select: function() {
                                        if (!this.point.realDataPoint) {
                                            return false
                                        }
                                    }
                                }
                            }
                        }
                    },
                    title: {
                        text: null
                    },
                    yAxis: {
                        type: 'currency',
                        title: {
                            text: null
                        },
                        labels: {
                            formatter: function() {
                                let value = parseFloat(this.value)
                                if (value < 1000) {
                                    return '£' + this.value;    
                                }
                                return '£' + (this.value / 1000) + 'k';
                            }
                        }
                    },
                    xAxis: {
                        type: 'datetime',
                    },
                    series: seriesData
                });
            },
            sortData(data, date=null) {
                const $savings = data

                let transactionDates = new Set()
                let runningTotal = []
                let series_data = []

                if ($savings.length) {
                    $savings.forEach(acc => {
                        Object.entries(acc.daily_totals).forEach(ele => transactionDates.add(ele[0]))
                        series_data.push({
                            name: acc.name,
                            id: acc.id,
                            type: "line",
                            data: [],
                            connectNulls: true,
                            pointInterval: 24 * 3600 * 1000,
                        })
                        if (acc.graph_start != null) {
                            runningTotal.push(parseFloat(acc.graph_start))
                        } else {
                            runningTotal.push(acc.graph_start)
                        }
                    })
                    transactionDates = Array.from(transactionDates).sort((d1,d2) => new Date(d1) - new Date(d2))

                    const numberOfDates = 91
                    let startDate;
                    if (date != null) {
                        startDate = new Date(date)
                    } else {
                        startDate = new Date()
                    }

                    startDate.setDate(startDate.getDate() - numberOfDates)
                    for (i=0; i <= numberOfDates; i++) {
                        let newDate = new Date(startDate)
                        newDate.setDate(newDate.getDate() + i)
                        let dateFormatted = homeSc.utils.getTwoDigitDate(newDate)

                        $savings.forEach((account, index) => {

                            let valueToAdd = null
                            if(typeof series_data[index].pointStart == 'undefined') {
                                series_data[index].pointStart = Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
                            }

                            if (account.type_details.accumulate) {
                                if (typeof account.daily_totals[dateFormatted] != 'undefined') {
                                    value = parseFloat(account.daily_totals[dateFormatted])
                                    runningTotal[index] += value
                                    valueToAdd = {
                                        y: runningTotal[index],
                                        realDataPoint: true
                                    }
                                } else {
                                    if (i == numberOfDates) {
                                        valueToAdd = {
                                            y: runningTotal[index],
                                            marker: {
                                                enabled: false
                                            }
                                        }
                                    }
                                }
                            } else {
                                if (typeof account.daily_totals[dateFormatted] != 'undefined') {
                                    value = parseFloat(account.daily_totals[dateFormatted])
                                    runningTotal[index] = value
                                    valueToAdd = {
                                        y: runningTotal[index],
                                        realDataPoint: true
                                    }
                                } else {
                                    if (i == numberOfDates) {
                                        valueToAdd = {
                                            y: runningTotal[index],
                                            marker: {
                                                enabled: false
                                            }
                                        }
                                    }
                                }
                            }       
                            if (valueToAdd == null && i == 0) {
                                valueToAdd = {
                                    y: runningTotal[index],
                                    marker: {
                                        enabled: false
                                    }
                                }
                            }
                            series_data[index].data.push(valueToAdd)
                        })
                    }
                    return series_data
                }
            }
        }
    }
}

window.addEventListener("load", e => {
    homeSc.accountProgress.init()
    homeSc.accountTotals.init()
    homeSc.transactions.init()
})