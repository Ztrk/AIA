import React from 'react';

export default class Input extends React.Component {
    constructor(props) {
        super(props);
        this.state = {value: ''};
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {
        this.setState({value: event.target.value});
    }

    handleSubmit(event, collection) {
        this.props.onSubmit(this.state.value);
        this.setState({value: ''});
        event.preventDefault();
    }

    render() {
        return (
            <form onSubmit={this.handleSubmit}>
                <input value={this.state.value} onChange={this.handleChange} />
                <input type='submit' value={this.props.buttonText} />
            </form>
        )
    }
}
