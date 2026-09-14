window.addEventListener("load", e => {
    cu.preview.init()
})

let cu = {
    'preview': {
        init() {
            let confirmButton = document.getElementById('confirmCSV')
            if(confirmButton) {
                document.getElementById('confirmCSV').addEventListener('click', (e) => {
                    e.preventDefault();
                    alert('Sending Stopped')
                    //cu.sendTransacrions();
                })
                this.columnSelectorsListner()
            }
            this.firstPass()
        },
        firstPass() {
            let $cells = document.querySelectorAll('.cell')
            $cells.forEach(cell => {
                if (cell.dataset.value == '') {
                    cell.classList.add('error')
                } else {
                    if (cell.dataset.key == 'date') {
                        if (this.dateChecker(cell.dataset.value)) {
                            cell.classList.add('verfied')
                        } else {
                            cell.classList.add('error')
                        }
                    } else if (cell.dataset.key == 'amount') {
                        if (this.numberChecker(cell.dataset.value)) {
                            cell.classList.add('verfied')
                        } else {
                            cell.classList.add('error')
                        }
                    } else if (cell.dataset.key == 'accountid') {
                        if (this.numberChecker(cell.dataset.value)) {
                            cell.classList.add('verfied')
                        } else {
                            cell.classList.add('error')
                        }
                    }
                }
                
            })
        },
        numberChecker(value) {
            const num = parseFloat(value);
            return Number.isNaN(num) ? null : num;
        },
        dateChecker(checkDate) {
            const passedDate = Date.parse(checkDate)

            return isNaN(checkDate) && !isNaN(passedDate) ? true : false
            // if(isNaN(checkDate) && !isNaN(passedDate)) {
            //     return true
            // } else {
            //     return false
            // }
        },
        columnSelectorsListner() {
            let $dropdowns = document.querySelectorAll('.column-selection')
            $dropdowns.forEach((elem, index) => {
                elem.addEventListener('change', function() {
                    const value = this.value
                    let getColumns = document.querySelectorAll('.row')
                    getColumns.forEach((ele) => {
                        let cell = ele.querySelectorAll('.cell')
                        cell[index+1].dataset.key = value
                    })
                })
            })
        },
    },
    
    
    async sendTransacrions() {
        let records = [];

        const $select = document.querySelectorAll('.select-row')
        const $names = document.querySelectorAll("[data-key='name']");
        const $amount = document.querySelectorAll("[data-key='amount']");
        const $date = document.querySelectorAll("[data-key='date']");
        const $accountId = document.querySelectorAll("[data-key='accountid']");


        $names.forEach((transaction, index) => {
            if ($select[index].value) {
                const setDate = new Date($date[index].dataset.value)
                let dateFormatSetup = `${setDate.getFullYear()}-${setDate.getMonth()+1}-${setDate.getDate()}`

                records.push({
                    name: transaction.dataset.value,
                    amount: parseFloat(($amount[index].dataset.value).replace(/(\d+),(\d+)[\s\S]*/g, "$1$2")),
                    date: dateFormatSetup,
                    accountId: parseInt($accountId[index].dataset.value),
                })
            }
        })

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
                        message.classList.add('alert')
                        message.classList.add('alert-warning')

                        let errorConstruct = `<p>Issue on line ${parseInt(ele.row_index) + 1} :</p>`
                        for (const [key, value] of Object.entries(ele.errors)) {
                            errorConstruct += (`Field: ${key}:<ul>`);
                            value.forEach(errorEle => {
                                errorConstruct += `<li>${errorEle.message}</li>`;
                            })
                            errorConstruct += (`</ul>`);
                        }
                        message.addEventListener('click', () => {
                            message.classList.add("clear")
                        })
                        message.innerHTML = errorConstruct;
                        document.getElementById('messagesContainer').appendChild(message)
                        
                    })
                } else if(data.status == 'success') {
                    let message = document.createElement('div');
                    message.classList.add('alert')
                    message.classList.add('alert-success')
                    message.innerHTML = `Records added successfully`
                    document.getElementById('messagesContainer').appendChild(message)
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
}
