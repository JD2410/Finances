window.addEventListener("load", e => {
    accountScript.editAccount.init()
})

let accountScript = {
    'editAccount': {
        init() {
            $editButtons = document.querySelectorAll('.account-edit')
            $editButtons.forEach(button => {
                button.addEventListener('click', ele => {
                    ele.preventDefault()
                    document.getElementById('updateAccount').classList.add('show')
                })
            })
        },
    },
}