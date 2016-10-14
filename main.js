
/* ---> model */
const Http = {
    get: (url) => new Task((rej, res) => $.getJSON(url).fail(rej).done(res))
};



const Photo = daggy.tagged('src', 'x', 'y');
const newPhoto = (url) => Photo(url, 0, 0);

const Url = String;

const makeUrl = function(t) {
    return baseUrl + t;
};

const baseUrl = "https://api.github.com/users/";

const extractImage = R.prop("avatar_url");
const githubSearch = R.compose(R.map(R.compose(newPhoto, extractImage)), Http.get, makeUrl);

 /* model <---- */
const preventDefault = e => e.preventDefault();

var Collage = React.createClass({
    displayName: "Collage",
    getInitialState() { return { photos: []}},
    updatePhotos(xs) { 
        this.setState({photos: xs});
    }, 

    onDrop({dataTransfer: dt}) { 
        const src = dt.getData("text");
        this.updatePhotos(R.append(src, this.state.photos));
    },
    render() {
        const images = (this.state.photos).map(function(source) {
            return <img src={source} width="100"/>
        });
        return ( 
            <div id="collage" onDrop={this.onDrop} onDragOver={preventDefault}>{images}</div>
        );
    }
});

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

    onDragStart({dataTransfer: dt, currentTarget: t}) {
        dt.setData('text', t.src);
    },

    render() {
        const drag = this.onDragStart;
        const profileImages = (this.state.result).map(function(photo) {
            return <img src={photo.src} key={photo.src} draggable={true} onDragStart={drag} width="100"/>
        });
        return (
            <div id="gitHub">
                <input onChange={this.termChanged}/>
                <button onClick={this.searchClicked}>Search</button>
                <div id="results">{profileImages}</div>
                <Collage />
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