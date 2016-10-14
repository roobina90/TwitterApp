

const Http = {
    get: (url) => new Task((rej, res) => $.getJSON(url).fail(rej).done(res))
};


const Url = String;

const makeUrl = function(t) {
    return baseUrl + t;
};

const baseUrl = "https://api.github.com/users/";

const extractImage = R.prop("avatar_url");
const githubSearch = R.compose(R.map(extractImage), Http.get, makeUrl);

var GitHub = React.createClass({
    displayName: "GitHub",
    getInitialState() { return { term: "", result: [] } },

    termChanged({currentTarget: t}) {
        this.setState({ term: t.value });
    },
    updateResult(x) {
        var newResult = this.state.result.concat([x]);
        this.setState({ result: newResult });
    },

    searchClicked(_) {
        githubSearch(this.state.term).fork(this.props.showError, this.updateResult);
    },


    render() {
        const profileImages = (this.state.result).map(function(source) {
            return <img src={source}/>
        });
        return (
            <div id="gitHub">
                <input onChange={this.termChanged}/>
                <button onClick={this.searchClicked}>Search</button>
                <div id="results">{profileImages}</div>
            </div>
        );
    }
});


const App = React.createClass({
    displayName: "App",
    getInitialState() { return { error: "" }; },
    showErrors(s) { this.setState({ error: s }); },

    render() {
        return (
            <div id="app">
                { this.state.error ? <p> {this.state.error}</p> : null}
                <GitHub />
            </div>

        );
    }
});


ReactDOM.render(<App />, document.getElementById("main"));