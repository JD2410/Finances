window.addEventListener("load", e => {
    savingScript.editRecord.init()
})

let savingScript = {
    'editRecord': {
        init() {
            $updateButtons = document.querySelectorAll('.update-transaction')
            $updateButtons.forEach(element => {
                element.addEventListener('click', () => {
                    let values = this.getElements(element.dataset.value, element.dataset.id)
                    this.updateForm(values)
                })
            })
        },
        getElements(rowId, accId) {
            let $row = document.getElementById('record_' + rowId)
            const $cell = {
                'name': $row.querySelector('.name').dataset.value,
                'accountId': accId,
                'date': $row.querySelector('.date').dataset.value,
                'amount': $row.querySelector('.amount').dataset.value,
                'id': $row.querySelector('.update-transaction').dataset.value,
            }

            return $cell
        },
        updateForm(values) {
            const $form = document.getElementById('updateTransaction')
            $form.classList.add('show')
            $form.querySelector('input[name=name]').value = values.name
            $form.querySelector('input[name=amount]').value = values.amount
            $form.querySelector('input[name=date]').value = values.date
            $form.querySelector('select[name=accountId]').value = values.accountId
            $form.querySelector('input[name=id]').value = values.id
        }
    }
}