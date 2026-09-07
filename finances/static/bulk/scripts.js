window.addEventListener("load", e => {
    cu.init()
})

let cu = {
    init() {
        let confirmButton = document.getElementById('confirmCSV')
        if(confirmButton) {
            document.getElementById('confirmCSV').addEventListener('click', (e) => {
                e.preventDefault();
                cu.sendConfirmedRecords();
            })
            this.validator();
            this.columnSelectorsListner()
            this.previewFirstCheck()
        }
    },
    columnSelectorsListner() {
        let $dropdowns = document.querySelectorAll('.column-selection')
        $dropdowns.forEach((elem, index) => {
            elem.addEventListener('change', function() {
                const value = this.value
                let getColumns = document.querySelectorAll('.row')
                getColumns.forEach((ele) => {
                    let cell = ele.querySelectorAll('.cell')
                    cell[index].dataset.key = value
                })
            })
        })
    },
    validator() {
        let records = document.querySelectorAll('.values');

        records.forEach(elem => {
            if (elem.dataset.key == 'amount') {
                console.log(elem.dataset.value)
            }
        })
    },
    async sendConfirmedRecords() {
        let records = [];

        const $names = document.querySelectorAll("[data-key='name']");
        const $amount = document.querySelectorAll("[data-key='amount']");
        const $date = document.querySelectorAll("[data-key='date']");
        const $accountId = document.querySelectorAll("[data-key='accountid']");

        $names.forEach((transaction, index) => {
            const setDate = new Date($date[index].dataset.value)
            let dateFormatSetup = `${setDate.getFullYear()}-${setDate.getMonth()+1}-${setDate.getDate()}`

            records.push({
                    name: transaction.dataset.value,
                    amount: parseFloat(($amount[index].dataset.value).replace(/(\d+),(\d+)[\s\S]*/g, "$1$2")),
                    date: dateFormatSetup,
                    accountId: parseInt($accountId[index].dataset.value),
                }
            )
        })

        console.log(records)

        let options = {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': this.getToken("csrftoken")
            },
            body: JSON.stringify({ "records": records }),
        }

        await fetch("/savings/import/", options)
            .then(response => response.json())
            .then(data => {
                if(data.status == 'error') {
                    data.row_errors.forEach(ele => {
                        let message = document.createElement('div');
                        message.classList.add('error-entry')
                        let errorConstruct = `<p>Issue on line ${parseInt(ele.row_index) + 1}:</p>`
                        for (const [key, value] of Object.entries(ele.errors)) {
                            errorConstruct += (`Field: ${key}:<ul>`);
                            value.forEach(errorEle => {
                                errorConstruct += `<li>${errorEle.message}</li>`;
                            })
                            errorConstruct += (`</ul>`);
                        }
                        message.innerHTML = errorConstruct;
                        document.getElementById('errorInfo').appendChild(message)
                        
                    })
                } else if(data.status == 'success') {
                    let message = document.createElement('div');
                    message.classList.add('error-entry')
                    message.innerHTML = `<p>Records added successfully</p>`
                    document.getElementById('errorInfo').appendChild(message)
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
    previewFirstCheck() {
        let countHeader = document.querySelectorAll('.header-label').length

        if (countHeader < 3) {
            document.getElementById('confirmCSV').setAttribute('disabled', true)
            let message = document.createElement('div');
            message.innerHTML = `Submitted CSV file doesn't have enough fields to be submitted`
            document.getElementById('errorInfo').appendChild(message)
        }
    }
}
