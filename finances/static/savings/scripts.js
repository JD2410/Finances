window.addEventListener("load", e => {
    savingScript.editRecord.init()
    savingScript.editAccount.init()
})

let savingScript = {
    'editAccount': {
        init() {
            $editButtons = document.querySelectorAll('.account-edit')
            $editButtons.forEach(button => {
                button.addEventListener('click', ele => {
                    ele.preventDefault()
                    let id = button.dataset.value
                    let value = this.getElements(id)
                    this.updateForm(value)
                })
            })
        },
        getElements(accountId) {
            const $form = document.getElementById('account_' + accountId);
            const obj = {
                'id': accountId,
                'name': $form.querySelector('.name').dataset.value,
                'accountType': $form.querySelector('input[name=accountType]').value
            }
            console.log(obj)
            return obj
        },
        updateForm(value) {
            let $form = document.getElementById('updateAccount')
            $form.querySelector('input[name=accountId]').value = value.id
            $form.querySelector('input[name=name]').value = value.name
            $form.querySelector('select[name=accountType]').value = value.accountType
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