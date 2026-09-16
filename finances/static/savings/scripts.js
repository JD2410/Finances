window.addEventListener("load", e => {
    savingScript.editRecord.init()
    savingScript.editAccount.init()
})

let savingScript = {
    'editAccount': {
        accountDetails: "",
        init() {
            this.accountDetails = JSON.parse(document.getElementById('accounts').textContent)
            $editButtons = document.querySelectorAll('.account-edit')
            $editButtons.forEach(button => {
                button.addEventListener('click', ele => {
                    ele.preventDefault()
                    this.updateForm(button.dataset.id)
                })
            })
            console.log("hi")
            document.getElementById("updateAccountButton").addEventListener('click', ele => {
                ele.preventDefault()
                this.swapDetailEditView()
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
        swapDetailEditView() {
            let $modal = document.getElementById('updateAccount')
            $modal.classList.add('show-form')
        },
        updateForm(accId) {
            let info = this.getElements(accId)
            let $form = document.getElementById('updateAccount')

            $form.querySelector('input[name=accountId]').value = info.id
            $form.querySelector('input[name=name]').value = info.name
            $form.querySelector('select[name=accountType]').value = info.accountType.id

            $form.querySelector("#accountId").innerHTML = info.id
            $form.querySelector("#accountName").innerHTML = info.name

            $form.querySelector("#accountTypeId").innerHTML = info.accountType.id
            $form.querySelector("#accountTypeName").innerHTML = info.accountType.type_name
            $form.querySelector("#accountAccumulate").innerHTML = info.accountType.type_accumulate

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