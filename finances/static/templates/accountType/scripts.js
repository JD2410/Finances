window.addEventListener("load", e => {
    type.update.init();
    type.delete.init()
})

type = {
    'update': {
        init() {
            const $updateButton = document.querySelectorAll('.update-type')
            $updateButton.forEach(button => {
                button.addEventListener('click', () => {
                    const value = this.getValues(button.dataset.value)
                    this.udpateForm(value)
                })
            })
        },
        getValues(which) {
            const $values = document.getElementById('record_' + which)
            let obj = {
                'id': which,
                'name': $values.querySelector('.name').dataset.value,
                'accumulate': $values.querySelector('.accumulate').dataset.value.toLowerCase(),
            }
            return obj
        },
        udpateForm(what) {
            $form = document.getElementById('updateType')
            $form.querySelector('input[name=typeId]').value = what.id
            $form.querySelector('input[name=name]').value = what.name
            $accumulatedCheckbox = $form.querySelector('input[name=accumulate]')
            $accumulatedCheckbox.removeAttribute('checked')
            if (what.accumulate == 'true') {
                $accumulatedCheckbox.checked = true
            } else {
                $accumulatedCheckbox.checked = false
            }
            $form.classList.add('show')
        }
    }, 
    'delete': {
        init() {
            const $updateButton = document.querySelectorAll('.delete-type')
            $updateButton.forEach(button => {
                button.addEventListener('click', e => {
                    e.preventDefault();
                    $form = document.getElementById('deleteType')
                    $form.querySelector('input[name=deleteId]').value = button.dataset.value
                    $form.submit();
                })
            })
        }
    }
}