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

        }
    },
    'transactions': {
        init() {
            document.getElementById('transactionState').addEventListener('click', function() {

                document.getElementById('recentTransactions').classList.toggle('show')
                document.getElementById('recentInvestments').classList.toggle('show')

                if (this.innerText == 'Investment') {
                    this.innerText = 'Savings'
                } else {
                    this.innerText = 'Investment'
                }
            })
        },
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
        },
        async getDateTransaction(date) {
            let options = {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.getToken("csrftoken")
                },
                body: JSON.stringify({ "date": date }),
            }
            let sendValue = await fetch("/getDate/", options)
                .then(response => response.json())
                .then(data => {
                    $table = document.getElementById('transactionTable')
                    $message = document.getElementById('noTransaction')

                    if (data.records.length != 0) {
                        $tbody = $table.tBodies[0]
                        $tbody.textContent = ''

                        data.records.forEach(element => {

                            let tableRow = document.createElement('tr')

                            let tableColumnName = document.createElement('td')
                            tableColumnName.innerText = element.name
                            tableRow.append(tableColumnName)

                            let tableColumnAmount = document.createElement('td')
                            tableColumnAmount.innerText = element.amount
                            tableRow.append(tableColumnAmount)

                            let tableColumnAccount = document.createElement('td')
                            tableColumnAccount.innerText = element.account_name
                            tableRow.append(tableColumnAccount)

                            $tbody.append(tableRow)
                        })
                        $table.classList.remove('hideTable')
                        $message.classList.remove('showMessage')
                        
                    } else {
                        $table.classList.add('hideTable')
                        $message.classList.add('showMessage')
                    }
                })
        }
    },
    'accountTotals': {
        init() {
            const $accounts = JSON.parse(document.getElementById('accounts').textContent)
            const $total = parseFloat(JSON.parse(document.getElementById('total').textContent))
            let piePieces = []

            $accounts.forEach(acc => {
                let construct = [
                    `${acc.name} - £${ parseFloat(acc.total).toFixed(2) }`,
                    parseFloat(((parseFloat(acc.total) / $total) * 100).toFixed(2))
                ]
                piePieces.push(construct) 
            })
            this.loadChart(piePieces)
        },
        loadChart(data) {
            Highcharts.chart('piechart', {
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
            const $savings = JSON.parse(document.getElementById('savings').textContent)

            let transactionDates = new Set()
            let runningTotal = []
            let series_data = []

            $savings.forEach(acc => {
                Object.entries(acc.daily_totals).forEach(ele => transactionDates.add(ele[0]))
                series_data.push({
                    name: acc.name,
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

            // This got the date spac on the transactions
            //const numberOfDates = homeSc.utils.totalDates(transactionDates[0], transactionDates[transactionDates.length - 1])
            //startDate = new Date(transactionDates[0])

            const numberOfDates = 80
            let startDate = new Date()
            startDate.setDate(startDate.getDate() - numberOfDates)

            for (i=0; i <= numberOfDates; i++) {
                //let newDate = new Date(transactionDates[0])
                let newDate = new Date(startDate)
                newDate.setDate(newDate.getDate() + i)
                let dateFormatted = homeSc.utils.getTwoDigitDate(newDate)

                $savings.forEach((account, index) => {

                    let valueToAdd = null
                    if(typeof series_data[index].pointStart == 'undefined') {
                        series_data[index].pointStart = Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
                    }

                    if (account.type == 'saving') {

                        if (typeof account.daily_totals[dateFormatted] != 'undefined') {
                            value = parseFloat(account.daily_totals[dateFormatted])
                            runningTotal[index] += value
                            valueToAdd = runningTotal[index]
                        } else {
                            if (i == numberOfDates) {
                                valueToAdd = runningTotal[index]
                            }
                        }
                    } else {
                        if (typeof account.daily_totals[dateFormatted] != 'undefined') {
                            value = parseFloat(account.daily_totals[dateFormatted])
                            runningTotal[index] = value
                            valueToAdd = runningTotal[index]
                        } else {
                            if (i == numberOfDates) {
                                valueToAdd = runningTotal[index]
                            }
                        }
                    }
                    if (valueToAdd == null && i == 0) {
                        valueToAdd = runningTotal[index]
                    }

                    series_data[index].data.push(valueToAdd)

                })
            }

            Highcharts.chart('accountProgress', {
                tooltip: {
                    formatter: function () {
                        let amount = parseFloat(this.y).toFixed(2)
                        if (amount >= 1000) {
                            let where = amount.indexOf('.') - 3
                            amount = amount.slice(0, where) + "," + amount.slice(where)
                        }
                        return `${this.series.name}<br><strong>£${amount}</strong>`;
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
                    ordinal: false,
                    minPadding: 0.05,
                    maxPadding: 0.05
                },
                series: series_data
            });
        }
    }
}

window.addEventListener("load", e => {
    homeSc.accountProgress.init()
    homeSc.transactions.init()
    homeSc.accountTotals.init()
})