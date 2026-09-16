window.addEventListener("load", e => {
    let $deleteButtons = document.querySelectorAll('.delete-transaction');

    $deleteButtons.forEach(element => {
        element.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('deleteID').value = element.dataset.value
            document.getElementById('deleteForm').submit();
        })
    })

    app.messages.init()
})

let app = {
    'messages': {
        init() {
            let $messages = document.getElementById('messagesContainer')
            if($messages) {
                let $alerts = $messages.querySelectorAll('.alert')
                $alerts.forEach(element => {
                    element.addEventListener('click', () => {
                        element.classList.add('clear')
                    })
                })
            }
        }
    }
}