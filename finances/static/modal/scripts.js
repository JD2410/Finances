window.addEventListener("load", e => {
    $openModals = document.querySelectorAll('.open-modal')
    $openModals.forEach(event => {
        event.addEventListener('click', function() {
            let container = this.dataset.modal
            document.getElementById(container).classList.toggle('show')
        })
    })

    let $modals = document.querySelectorAll('.modal')

    $modals.forEach(modal => {
        modal.addEventListener('click', function() {
            this.classList.remove('show')
            modal.getElementsByTagName('form')[0].reset()
        })
        modal.getElementsByTagName('form')[0].addEventListener('click', function(event) {
            event.stopPropagation()
        })
    })
})
