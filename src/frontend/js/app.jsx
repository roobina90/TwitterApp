const React = require('react');
const daggy = require('daggy'); 
const Task = require("data.task");
const { getJSON } = require("jquery");
const { Just, Nothing } = require("data.maybe");
const {Some, None} = require("fantasy-options");
const {compose, prop, curry, append, map, remove} = require("ramda");
const {fold} = require("pointfree-fantasy");




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


const mayToOpt = (m) => m.cata({Just: Some, Nothing: () => None});
const baseUrl = "https://api.github.com/users/";

const toPhoto = compose(newPhoto, prop("avatar_url"));
const indexOf = curry((x,xs) => {
    const idx = xs.indexOf(x);
    return idx < 0 ? Nothing() : Just(idx);
});
const indexOfPhoto = curry((p,ps) => indexOf(p.src, ps.map(prop('src'))));

const replacePhoto = curry((p,ps) => compose(fold(append(p), () => append(p,ps)),
                                                 mayToOpt, 
                                                 map(i => remove(i, 1, ps)), 
                                                 indexOfPhoto(p))(ps));


const githubSearch = compose(map(toPhoto), Http.get, makeUrl);
const preventDefault = e => e.preventDefault();
 /* model <---- */


var DragImage = React.createClass({
    displayName: "DragImage",
    
    onDragStart({dataTransfer: dt, currentTarget: t}) {
        dt.setData('text', t.src);
    },

    render() {
        const imageSource = this.props.src,
        dragStart = this.onDragStart,
        imageStyle = this.props.style;
        return <img src={imageSource} {...this.props} width="100" draggable={true} onDragStart={dragStart}/> 

    }
});

var Collage = React.createClass({
    displayName: "Collage",
    getInitialState() { return { photos: []}},
    updatePhotos(xs) { 
        this.setState({photos: xs});
    }, 

    onDrop({dataTransfer: dt, clientX: x, clientY: y, currentTarget: t}) { 
        const offset = t.getBoundingClientRect().top;
        const src = dt.getData("text");
        const photo = Photo(src, x, y-offset);
        this.updatePhotos(replacePhoto(photo, this.state.photos));
    },
    render() {
        const images = (this.state.photos).map(function(photo) {
            return <DragImage src={photo.src}  style={{left: photo.x, top: photo.y}}/>
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

  
    render() {
        const drag = this.onDragStart;
        const profileImages = (this.state.result).map(function(photo) {
            return <DragImage src={photo.src}/>
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


// const App = React.createClass({
//     displayName: "App",
//     getInitialState() { return { error: "" }; },
//     showErrors(s) { this.setState({ error: s }); },

//     render() {
//         return (
//             <div id="app">
//                 { this.state.error ? <p> {this.state.error}</p> : null}
//                 <GitHub />
//             </div>

//         );
//     }
// });



module.exports = React.createClass({
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

