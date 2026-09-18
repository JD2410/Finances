window.addEventListener("load", e => {
    cu.init()
})

let cu = {
    init() {
        let confirmButton = document.getElementById('confirmCSV')
        if(confirmButton) {
            document.getElementById('confirmCSV').addEventListener('click', (e) => {
                e.preventDefault();
                cu.checkUserInput()
            })

            this.columnSelection.columnSelectorsListener()
            this.inputEditingListener()
            this.showInputEditorListener()
            this.resetShowEditorListener()
            this.rowSelection()
            this.testAllInput()
            this.columnSelection.updateSelectColumnsIndicator()
        }
    },
    inputEditingListener() {
        let $inputs = document.querySelectorAll('.edit')
        $inputs.forEach(input => {
            input.addEventListener('blur', () => {
                let $cell = input.parentNode
                this.updateDataAttrWithInput($cell)
            })
        })
    },
    updateDataAttrWithInput(cell) {
        const $input = cell.querySelector('.edit')
        cell.dataset.value = $input.value
        cell.querySelector('.display-value').innerHTML = $input.value
        this.inputTest.cellTest(cell)
        cell.classList.remove('show-editor')
    },
    resetShowEditorListener() {
        document.querySelector('.full-page').addEventListener('click', () => {
            this.resetShowEditor()
        })
    },
    resetShowEditor() {
        $shownCells = document.querySelectorAll('.show-editor')
        $shownCells.forEach(cell => {
            cell.classList.remove('show-editor')
        })
    },
    showInputEditorListener() {
        let $cell = document.querySelectorAll('.cell')
        $cell.forEach(element => {
            const $inputIgnore = element.querySelector('.select-row')
            if ($inputIgnore == null) {
                element.addEventListener('click', ele => {
                    
                    if (!element.parentNode.classList.contains('deselect')) {
                        ele.stopPropagation()
                        this.resetShowEditor()
                        element.classList.add('show-editor')
                        $input = element.querySelector('.edit')
                        $input.focus();
                        $input.select();
                    }
                })
            }
        })
    },
    rowSelection() {
        let $rowSelection = document.querySelectorAll('.select-row')
        $rowSelection.forEach(chekcbox => {
            chekcbox.addEventListener('click', () => {
                let $row = chekcbox.parentNode.parentNode
                $row.classList.toggle('deselect')
                this.inputTest.loadErrorAmount()
            })
        })
    },
    'columnSelection': {
        columnsSelected: 0,
        columnSelectorsListener() {
            let $dropdowns = document.querySelectorAll('.column-selection')
            $dropdowns.forEach((elem, index) => {
                elem.addEventListener('change', function() {
                    const value = this.value
                    cu.columnSelection.resetDuplicateColumnSelection(value, index)
                    cu.columnSelection.updateRow(value.toLowerCase(), index)
                    cu.columnSelection.updateSelectColumnsIndicator()
                })
            })
        },
        resetDuplicateColumnSelection(which, notIndex) {
            let $columnSelectors = document.querySelectorAll('.column-selection');
            let whichIndex = null;

            $columnSelectors.forEach((element, index) => {
                if(element.value == which && index != notIndex) {
                    element.value = ''
                    whichIndex = index
                }
            })
            if (whichIndex != null) {
                this.updateRow("", whichIndex)
            }
        },
        updateRow(what, which) {
            let $getColumns = document.querySelectorAll('.row')
            $getColumns.forEach((ele) => {
                let cell = ele.querySelectorAll('.cell')
                cell[which+1].dataset.key = what
                cu.inputTest.cellTest(cell[which+1])
            })
        },
        updateSelectColumnsIndicator() {
            let $columnSelectors = document.querySelectorAll('.column-selection');
            let count = 0
            $columnSelectors.forEach(dropdown => {
                if (dropdown.value != 0) {
                    count++
                }
            })
            $indicator = document.getElementById('selectionIndicator')
            $indicator.innerHTML = count
            if (count < 4) {
                $indicator.classList.add('problem')
            } else {
                $indicator.classList.remove('problem')
            }
            this.columnsSelected = count
        }
    },
    testAllInput() {
        let $cells = document.querySelectorAll('.cell')
        $cells.forEach(cell => {
            this.inputTest.cellTest(cell)
        })
    },
    inputTest: {
        errorsRemaining: 0,
        cellTest(cell) {
            cell.className = 'cell'
            // if (cell.dataset.value == '') {
            //     cell.classList.add('error')
            // } else {
            //     // if (cell.dataset.key == 'date') {
            //     //     if (this.dateChecker(cell.dataset.value)) {
            //     //         cell.classList.add('verified')
            //     //     } else {
            //     //         cell.classList.add('error')
            //     //     }
            //     // } else if (cell.dataset.key == 'amount') {
            //     //     if (this.numberChecker(cell.dataset.value)) {
            //     //         cell.classList.add('verified')
            //     //     } else {
            //     //         cell.classList.add('error')
            //     //     }
            //     // } else if (cell.dataset.key == 'accountid') {                    
            //     //     if (this.numberChecker(cell.dataset.value)) {
            //     //         let check = this.checkAccountIds(cell.dataset.value)
            //     //         if (check != null) {
            //     //             cell.classList.add('verified')
            //     //             cell.querySelector('.display-value').innerHTML = `${cell.dataset.value} (${check})`
            //     //         } else {
            //     //             cell.classList.add('error')
            //     //             cell.querySelector('.display-value').innerHTML = `${cell.dataset.value} (?)`
            //     //         }
            //     //     } else {
            //     //         cell.classList.add('error')
            //     //     }
            //     // } else if (cell.dataset.key == 'name') {
            //     //     cell.classList.add('verified')
            //     // }
            // }
            if (cell.dataset.key == 'date') {
                if(cell.dataset.value != '') {   
                    if (this.dateChecker(cell.dataset.value) && cell.dataset.value != '') {
                        cell.classList.add('verified')
                    } else {
                        cell.classList.add('error')
                    }
                } else {
                    cell.classList.add('error')
                }
            } 
            if (cell.dataset.key == 'amount' && cell.dataset.value != '') {
                if(cell.dataset.value != '') {   
                    if (this.numberChecker(cell.dataset.value)) {
                        cell.classList.add('verified')
                    } else {
                        cell.classList.add('error')
                    }
                } else {
                    cell.classList.add('error')
                }
            } 
            if (cell.dataset.key == 'accountid') {         
                if(cell.dataset.value != '') {          
                    if (this.numberChecker(cell.dataset.value)) {
                        let check = this.checkAccountIds(cell.dataset.value)
                        if (check != null) {
                            cell.classList.add('verified')
                            cell.querySelector('.display-value').innerHTML = `${cell.dataset.value} (${check})`
                        } else {
                            cell.classList.add('error')
                            cell.querySelector('.display-value').innerHTML = `${cell.dataset.value} (?)`
                        }
                    } else {
                        cell.classList.add('error')
                    }
                } else {
                    cell.classList.add('error')
                }
            }
            if (cell.dataset.key == 'name') {
                if (cell.dataset.value != '') {
                    cell.classList.add('verified')
                } else {
                    cell.classList.add('error')
                }
            }
            this.loadErrorAmount()
        },
        checkAccountIds(passedNumber) {
            const $accounts = JSON.parse(document.getElementById('accounts').textContent)
            let accountId = null
            for (let i = 0; i < $accounts.length; i++) {
                if(passedNumber == $accounts[i].id) {
                    accountId = $accounts[i].name;
                    break
                }
            }
            return accountId
        },
        loadErrorAmount() {
            const $display = document.getElementById('errorsIndicator')
            const $errors = document.querySelectorAll('.error')
            let count = 0;
            $errors.forEach(err => {
                const $parent = err.parentNode.classList.contains('deselect')
                if (!$parent) {
                    count++
                }
            })
            if (count > 0) {
                $display.classList.add('problem')
            } else {
                $display.classList.remove('problem')
            }
            this.errorsRemaining = count;
            $display.innerHTML = count
        },
        numberChecker(value) {
            const num = parseFloat(value);
            return Number.isNaN(num) ? null : num;
        },
        dateChecker(checkDate) {
            const passedDate = Date.parse(checkDate)
            return isNaN(checkDate) && !isNaN(passedDate) ? true : false
        },
    },
    createMessage(details, type='warning') {
        let message = document.createElement('div');
        message.classList.add('alert')
        message.classList.add(`alert-${type}`);
        message.innerHTML = details
        message.addEventListener('click', () => {
            message.classList.add("clear")
        })
        document.getElementById('messagesContainer').appendChild(message)
    },
    checkUserInput() {
        if(this.columnSelection.columnsSelected == 4) {
            if (this.inputTest.errorsRemaining > 0) {
                this.createMessage("There are still errors remaining.")
            } else {
                this.sendTransacrions()
            }
        } else {
            this.createMessage("You need to select 4 columns: <ul><li>Amount</li><li>Description</li><li>AccountId</li><li>Date</li></ul>")
        }
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

        await fetch("/accounts/import/", options)
            .then(response => response.json())
            .then(data => {
                if(data.status == 'error') {
                    data.row_errors.forEach(ele => {
                        let errorConstruct = `<p>Issue on line ${parseInt(ele.row_index) + 1} :</p>`
                        for (const [key, value] of Object.entries(ele.errors)) {
                            errorConstruct += (`Field: ${key}:<ul>`);
                            value.forEach(errorEle => {
                                errorConstruct += `<li>${errorEle.message}</li>`;
                            })
                            errorConstruct += (`</ul>`);
                        }
                        cu.createMessage(errorConstruct)
                        
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
