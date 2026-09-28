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
    app.resetSearchForm.init()
    app.sidebar.init()
})

let app = {
    'sidebar': {
        init() {
            this.screenToggleSidebar()
            this.mobileToggleMenu()
        },
        screenToggleSidebar() {
            $closeSidebarButtons = document.querySelectorAll('.close-sidebar')
            $pageContainer = document.getElementById('page')
            $closeSidebarButtons.forEach(button => {
                button.addEventListener('click', element => {
                    element.preventDefault()
                    $pageContainer.classList.toggle('sidebar--closed')
                })
            })
            $pageContainer.classList.add('animation-on')
        },
        mobileToggleMenu() {
            $toggleButton = document.getElementById('sidebarMenu')
            $toggleButton.addEventListener('click', () => {
                document.getElementById('sidebarSections').classList.toggle('show')
            })
        }
    },
    'resetSearchForm': {
        init() {
            const $getReset = document.getElementById('resetSearchForm')
            if ($getReset) {
                $getReset.addEventListener('click', ele => {
                    ele.preventDefault()
                    document.querySelector('input[name=q]').value = ""
                    document.querySelector('.search-form').submit()
                })
            }
        }
    },
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