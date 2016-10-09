var Twitter = React.createClass( {
    displayName: "Twitter",
    getInitialState() {return null},

    render() {
        return (
            <div id="twitter">
           <input />
           <button>Search</button>
           <div id="results">...</div>
            </div>
        );
    }
});


const App = React.createClass( {
    displayName: "App",
    getInitialState() { return {error: ""};},
    showErrors(s) { this.setState({error: s});},

    render() {
        return (
            <div id="app">
            { this.state.error ? <p> {this.state.error}</p> : null}
            <Twitter />
            </div>
            
        );
    }
});


ReactDOM.render(<App />, document.getElementById("main"));