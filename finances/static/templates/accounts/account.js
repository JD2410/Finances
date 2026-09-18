window.addEventListener("load", e => {
    accountScript.init()
})

const accountScript = {
    init() {
        let $addTransactionButton = document.querySelectorAll('.open-modal-add-transaction')
        $addTransactionButton.forEach(button => {
            button.addEventListener('click', () => {
                const $modal = document.getElementById(button.dataset.modal)
                $modal.querySelector('select[name=accountId]').value = button.dataset.account
                $modal.classList.add('show')
            })
        })

    }
}