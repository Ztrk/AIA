function createButton(name, buttonClass, onclick) {
    const button = document.createElement('button');
    button.textContent = name;
    button.classList.add(buttonClass);
    button.addEventListener('click', onclick);
    return button;
}

function onAddCollection() {
    const COLUMNS = 2;
    const tableBody = document.querySelector('tbody');
    const row = document.createElement('tr');
    for (let i = 0; i < COLUMNS; ++i) {
        const field = document.createElement('td');
        const inputField = document.createElement('input');
        field.append(inputField);
        row.append(field);
    }
    const saveButton = createButton('Save', 'save-button', () => onSave(row));
    const editButton = createButton('Edit', 'edit-button', () => onEdit(row));
    editButton.hidden = true;
    const removeButton = createButton('Remove', 'remove-button', () => onRemove(row));

    const buttonField = document.createElement('td');
    buttonField.append(saveButton);
    buttonField.append(editButton);
    buttonField.append(removeButton);
    row.append(buttonField);
    tableBody.append(row);
    row.querySelector('td:first-child input').focus();
}

function onSave(row) {
    row.querySelector('.save-button').hidden = true;
    row.querySelector('.edit-button').hidden = false;
    const fields = row.querySelectorAll('td');
    for (let i = 0; i < fields.length - 1; ++i) {
        const field = fields[i];
        const input = field.querySelector('input');
        field.textContent = input.value;
    }
}

function onEdit(row) {
    row.querySelector('.save-button').hidden = false;
    row.querySelector('.edit-button').hidden = true;
    const fields = row.querySelectorAll('td');
    for (let i = 0; i < fields.length - 1; ++i) {
        const field = fields[i];
        const input = document.createElement('input');
        input.value = field.textContent;
        field.textContent = '';
        field.append(input);
    }
    row.querySelector('td:first-child input').focus();
}

function onRemove(row) {
    row.remove();
}
