window.addEventListener("load", e => {
    savingScript.editRecord.init()
    savingScript.editAccount.init()
})

let savingScript = {
    'editAccount': {
        accountDetails: "",
        displayMoney(value) {
            let amount = parseFloat(value).toFixed(2)
            if (amount >= 1000) {
                let where = amount.indexOf('.') - 3
                amount = amount.slice(0, where) + "," + amount.slice(where)
            }
            return amount
        },
        init() {
            this.accountDetails = JSON.parse(document.getElementById('accounts').textContent)
            $editButtons = document.querySelectorAll('.account-edit')
            $editButtons.forEach(button => {
                button.addEventListener('click', ele => {
                    ele.preventDefault()
                    this.updateForm(button.dataset.id, button.dataset.amount)
                })
            })
            const $swtichButtons = document.querySelectorAll('.openUpdateView')
            if($swtichButtons) {
                $swtichButtons.forEach(ele => {
                    ele.addEventListener('click', ele => {
                        ele.preventDefault()
                        ele.stopPropagation()
                        this.switchView.openUpdateForm()
                    })
                })
            }
            const $resetView = document.querySelectorAll('.resetView')
            if($resetView) {
                $resetView.forEach(ele => {
                    ele.addEventListener('click', ele => {
                        ele.preventDefault()
                        ele.stopPropagation()
                        this.switchView.resetView()
                    })
                })
            }
            document.getElementById("deleteAccount").addEventListener('click', ele => {
                ele.preventDefault()
                ele.stopPropagation()
                this.switchView.swapDeleteForm()
            })
            document.getElementById("confirmUpdate").addEventListener('click', ele => {
                ele.preventDefault()
                ele.stopPropagation()
                document.getElementById('updateForm').submit()
            })

        },
        getElements(accountId) {
            for (let i = 0; i<=this.accountDetails.length; i++) {
                if (this.accountDetails[i].id == accountId) {
                    return this.accountDetails[i]
                }
            }
            return null
        },
        'switchView': {
            resetView() {
                let $modal = document.getElementById('updateAccount')
                $modal.classList.remove('show-update-form')
                $modal.classList.remove('show-delete-form')
            },
            openUpdateForm() {
                this.resetView()
                let $modal = document.getElementById('updateAccount')
                $modal.classList.add('show-update-form')
            },
            swapDeleteForm() {
                this.resetView()
                let $modal = document.getElementById('updateAccount')
                $modal.classList.toggle('show-delete-form')
            },
        },
        updateForm(accId, amount) {
            let info = this.getElements(accId)
            let $form = document.getElementById('updateAccount')
            this.switchView.resetView()

            $form.querySelector('input[name=deleteAccount]').value = info.id

            $form.querySelector('input[name=accountId]').value = info.id
            $form.querySelector('input[name=name]').value = info.name
            $form.querySelector('select[name=accountType]').value = info.accountType.id

            $form.querySelector("#accountIdLabel").innerHTML = info.id
            $form.querySelector("#accountNameLabel").innerHTML = info.name
            $form.querySelector("#accountValueLabel").innerHTML = `£${amount}`
            $form.querySelector("#accountTypeNameLabel").innerHTML = info.accountType.type_name
            $form.querySelector("#accountAccumulateLabel").innerHTML = info.accountType.type_accumulate ? "Yes" : "No"
            $form.querySelector("#accountCreatedLabel").innerHTML = info.created;
            if (info.firstDate != null) {
                $form.querySelector("#accountStartLabel").innerHTML = `£${this.displayMoney(info.first)}`
                $form.querySelector("#accountStartDateLabel").innerHTML = info.firstDate
            } else {
                $form.querySelector("#accountStartLabel").innerHTML = `Not Set`
                $form.querySelector("#accountStartDateLabel").innerHTML = `Not Set`
            }
            

            $form.classList.add('show')
        }
    },
    'editRecord': {
        init() {
            $updateButtons = document.querySelectorAll('.update-transaction')
            $updateButtons.forEach(element => {
                element.addEventListener('click', () => {
                    let values = this.getElements(element.dataset.value)
                    this.updateForm(values)
                })
            })
        },
        getElements(rowId) {
            let $row = document.getElementById('record_' + rowId)
            const $cell = {
                'name': $row.querySelector('.name').dataset.value,
                'accountId': $row.querySelector('.accountId').dataset.value,
                'date': $row.querySelector('.date').dataset.value,
                'amount': $row.querySelector('.amount').dataset.value,
                'id': $row.querySelector('.update-transaction').dataset.value,
            }

            return $cell
        },
        updateForm(values) {
            const $form = document.getElementById('recordUpdate')
            $form.classList.add('show')
            $form.querySelector('input[name=name]').value = values.name
            $form.querySelector('input[name=amount]').value = values.amount
            $form.querySelector('input[name=date]').value = values.date
            $form.querySelector('select[name=accountId]').value = values.accountId
            $form.querySelector('input[name=id]').value = values.id
        }
    }
}