import React from 'react';
import io from "socket.io-client"
import Input from './Input.js';
import './App.css';
import UsersList from './UsersList.js';

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            messages: [],
            users: [],
            isLoggedIn: false
        }
        this.send = this.send.bind(this);
        this.login = this.login.bind(this);
    }

    componentDidMount() {
        this.socket = io("http://localhost:8888");
        this.socket.on('message', data => {
            this.setState(state => {
                return {messages: [...state.messages, data]};
            })
        });

        this.socket.on('loggedIn', users => {
            this.setState({users, isLoggedIn: true})
        });

        this.socket.on('userConnected', nickname => {
            this.setState(state => {
                return {
                    messages: [...state.messages, `${nickname} has connected`],
                    users: [...state.users, nickname]
                };
            })
        });

        this.socket.on('userDisconnected', nickname => {
            this.setState(state => {
                const newUsers = state.users.filter(user => user !== nickname);
                return {
                    messages: [...state.messages, `${nickname} has disconnected`],
                    users: newUsers
                };
            })
        });
    }

    send(message) {
        this.socket.emit('message', message);
    }

    login(nickname) {
        this.socket.emit('login', nickname);
    }

    render() {
        if (!this.state.isLoggedIn) {
            return (
                <div class="login-form">
                    <p>Enter your nickname</p>
                    <Input onSubmit={this.login} buttonText='Enter chat'/>
                </div>
            );
        }

        return (
            <div class="chat-container">
                <div class="chat-window">
                    <ul>
                        {this.state.messages.map(m => <li>{m}</li>)}
                    </ul>
                    <Input onSubmit={this.send} buttonText='Send' />
                </div>
                <UsersList users={this.state.users}/>
            </div>
        );
    }
}
