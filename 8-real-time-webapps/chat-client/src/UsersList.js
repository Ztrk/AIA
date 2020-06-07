import React from 'react';

export default function UsersList(props) {
    return (
        <div class="active-users">
            <h4>Active users</h4>
            <ul>
                {props.users.map(user => <li>{user}</li>)}
            </ul>
        </div>
    )
}
