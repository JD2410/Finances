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
            this.inputTest.testAllInput()
            this.columnSelection.updateSelectColumnsIndicator()
            this.tools.init()
        }
    },
    'tools': {
        init() {
            $accountSelector = document.getElementById('accountIdSelection')
            $accountSelector.addEventListener('change', selector => {
                this.updateAccountId($accountSelector.value, $accountSelector.options[$accountSelector.selectedIndex].text)
            })
            document.getElementById('selectAllRows').addEventListener('click', () => {
                this.selectRows()
            })
            document.getElementById('deselectAllRows').addEventListener('click', () => {
                this.selectRows(false)
            })
            document.getElementById('fillAllDescriptions').addEventListener('click', () => {
                this.updateDescriptions()
            })
            document.getElementById('dateFormat').addEventListener('change', () => {
                this.chekAllDates()
            })
        },
        selectRows(state=true) {
            $checkboxes = document.querySelectorAll('.select-row')
            if ($checkboxes.length > 0) {
                $checkboxes.forEach(chekcbox => {
                    chekcbox.checked = state
                    let $row = chekcbox.parentNode.parentNode
                    if (state) {
                        $row.classList.remove('deselect')
                    } else {
                        $row.classList.add('deselect')
                    }
                })
                cu.inputTest.loadErrorAmount()

            }
        },
        updateAccountId(switchTo, label='unknown') {
            $overwriteAll = document.getElementById('overwriteExisting').checked
            $findAccountId = document.querySelectorAll("[data-key='accountid']")
            if (switchTo == "") {
                alert('Please select an account')
            } else {
                if($findAccountId.length > 0) {

                    $findAccountId.forEach(row => {
                        if (!$overwriteAll) {
                            if (!row.classList.contains('verified')) {
                                row.dataset.value = switchTo
                                row.classList.remove('error')
                                row.classList.add('verified')
                                row.querySelector('.display-value').innerHTML = `${switchTo} (${label})` 
                                row.querySelector('.edit').value = switchTo
                            }
                        } else {
                            row.dataset.value = switchTo
                            row.classList.remove('error')
                            row.classList.add('verified')
                            row.querySelector('.display-value').innerHTML = `${switchTo} (${label})` 
                            row.querySelector('.edit').value = switchTo
                        }
                        cu.inputTest.cellTest(row)
                    })
                } else {
                    alert('Please select a column first')
                }
            }
            
        },
        updateDescriptions() {
            $getDescriptions = document.querySelectorAll("[data-key='name']")
            $newDescription = document.getElementById('transactionDescriptionText').value
            
            if ($getDescriptions.length > 0) {
                if ($newDescription.trim() != '') {
                    $overwriteAll = document.getElementById('overwriteFilled').checked
                        $getDescriptions.forEach(cell => {
                            if($overwriteAll) {
                                cell.dataset.value = $newDescription.trim()
                                cell.classList.remove('error')
                                cell.classList.add('verified')
                                cell.querySelector('.display-value').innerHTML = $newDescription.trim()
                                cell.querySelector('.edit').value = $newDescription.trim()
                            } else {
                                if(!cell.classList.contains('verified')) {
                                    cell.dataset.value = $newDescription.trim()
                                    cell.classList.remove('error')
                                    cell.classList.add('verified')
                                    cell.querySelector('.display-value').innerHTML = $newDescription.trim()
                                    cell.querySelector('.edit').value = $newDescription.trim()
                                }
                            }
                        })
                } else {
                    alert('Please enter a description you would like it swapped too')
                }
                
            } else {
                alert('Please select a description column')
            }
            
        },
        chekAllDates() {
            $dates = document.querySelectorAll("[data-key='date']")
            if ($dates.length > 0) {
                $dates.forEach(cell => {
                    cu.inputTest.cellTest(cell)
                })
            }
        },
        changeDateFormat(dateString) {
            const $dateDropdown = document.getElementById('dateFormat');
            const $format = $dateDropdown[$dateDropdown.selectedIndex].value;
            let breakdown = {
                day: "",
                month: "",
                year: ""
            }
            
            if ($format == 'YYYY-MM-DD') {
                const setDate = new Date(dateString)
                breakdown.day = setDate.getDate()
                breakdown.month = setDate.getMonth()+1
                breakdown.year = setDate.getFullYear()
            }
            if ($format == 'DD-MM-YYYY') {
                breakdown.day = dateString.slice(0,2),
                breakdown.month = dateString.slice(3,5),
                breakdown.year = dateString.slice(6,10)
            }
            if ($format == 'MM-DD-YYYY') {
                breakdown.day = dateString.slice(3,5),
                breakdown.month = dateString.slice(0,2),
                breakdown.year = dateString.slice(6,10)
            }
            return `${breakdown.year}-${breakdown.month}-${breakdown.day}`
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
    inputTest: {
        errorsRemaining: 0,
        date_regex: {
            'DD-MM-YYYY': /^(?:(?:(?:0[1-9]|[12][0-9]|3[01])([-/\\.])(?:0[13578]|1[02])\1|(?:0[1-9]|[12][0-9]|30)([-/\\.])(?:0[469]|11)\2|(?:0[1-9]|1[0-9]|2[0-8])([-/\\.])02\3)(?:19|20)\d\d|29([-/\\.])02\4(?:19|20)(?:0[48]|[2468][048]|[13579][26]))$/,
            'MM-DD-YYYY': /^(?:(?:(?:0[13578]|1[02])([-/\\.])(?:0[1-9]|[12][0-9]|3[01])\1|(?:0[469]|11)([-/\\.])(?:0[1-9]|[12][0-9]|30)\2|02([-/\\.])(?:0[1-9]|1[0-9]|2[0-8])\3)(?:19|20)\d\d|02([-/\\.])29\4(?:19|20)(?:0[48]|[2468][048]|[13579][26]))$/,
            'YYYY-MM-DD': /^(?:(?:19|20)\d\d([-/\\.])(?:(?:0[13578]|1[02])\1(?:0[1-9]|[12][0-9]|3[01])|(?:0[469]|11)\1(?:0[1-9]|[12][0-9]|30)|02\1(?:0[1-9]|1[0-9]|2[0-8]))|(?:19|20)(?:0[48]|[2468][048]|[13579][26])([-/\\.])02\2 29)$/
        },
        cellTest(cell) {
            cell.className = 'cell'
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
            const $dateDropdown = document.getElementById('dateFormat');
            const $format = $dateDropdown[$dateDropdown.selectedIndex].value;
            const pattern = this.date_regex[$format]
            if (!pattern) {
                throw new Error(`Unsupported date format: "${$format}"`);
                return false
            }
            return pattern.test(checkDate)
        },
        testAllInput() {
            let $cells = document.querySelectorAll('.cell')
            $cells.forEach(cell => {
                this.cellTest(cell)
            })
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
            if ($select[index].checked) {
                records.push({
                    name: transaction.dataset.value,
                    amount: parseFloat(($amount[index].dataset.value).replace(/(\d+),(\d+)[\s\S]*/g, "$1$2")),
                    date: cu.tools.changeDateFormat($date[index].dataset.value),
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
        console.log(records)
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
