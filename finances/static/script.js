window.addEventListener("load", e => {
    let $deleteButtons = document.querySelectorAll('.delete-transaction');

    $deleteButtons.forEach(element => {
        element.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('deleteID').value = element.dataset.value
            document.getElementById('deleteForm').submit();
        })
    })
})