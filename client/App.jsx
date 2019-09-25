/**
 * ************************************
 *
 * @module  App.jsx
 * @author
 * @date
 * @description
 *
 * ************************************
 */
import React, { Component } from 'react';
import MainContainer from "./containers/MainContainer.jsx";
import TrailContainer from './containers/TrailContainer.jsx';
import key from "./../config/keys.js"; // ADDED BY DREW; REMEMBER TO GITIGNORE FILE

const googleMapsUrl = 'https://maps.googleapis.com/maps/api/geocode/json?address=';
const googleMaps_API_KEY = 'AIzaSyAgJUQeWjM55IdJbPXVRa3i-5N6uLvptI8';

const hikingProject_API_KEY = '200601261-d71b1d3a8f073c58c93d34bf907171f1'

//state includes data retrieved from REI API, selects selected trail
// holds trail specific comments pulled from database
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
    trailData: [], // most important // ARRAY OF OBJECTS 
    selectedTrail: null, // second most important; also
    isLoggedIn: true,
    comments: [], 
    currentLocation: '',
    lat: 34.383966, // 34.383966 @ Los Angeles / 34.0489
    long: -118.537239, // - 118.537239 @ Los Angeles // 111.0937
    searchLocation: '',
    searchInput: '',
  }
  // this.getTrail = this.getTrail.bind(this);
  // this.noTrail = this.noTrail.bind(this);
  // this.postComment = this.postComment.bind(this);
  // this.displayTrail = this.displayTrail.bind(this);
  // this.updateLat = this.updateLat.bind(this);
  // this.updateLong = this.updateLong.bind(this);
  };

  handleSearchInput(e) {
    let input = e.target.value;
    // console.log(input)
    input = input.replace(' ', '+')
    this.setState({ searchInput: input })
}

handleSearchSubmit(e) {
    e.preventDefault()
    console.log('this.state.searchInput is: ', this.state.searchInput)
    const gUrl = googleMapsUrl + this.state.searchInput + '&key=' + googleMaps_API_KEY; // NEED TO UPDATE API KEY TO CONFIG.KEY FILE
    console.log(gUrl);
    fetch(gUrl)
    .then((res) => res.json())
    .then((res) => {
        const lat = res.results[0].geometry.location.lat;
        const lng = res.results[0].geometry.location.lng;
        this.setState({ lat: lat, long: lng })
        console.log('latitude is: ', lat)
        console.log('longitude is: ', lng)
    }) 
    .then((res) => {    
        const hUrl = `https://www.hikingproject.com/data/get-trails?lat=${this.state.latitude}&lon=${this.state.longitude}&maxDistance=20&maxResults=100$minStars=3&key=${hikingProject_API_KEY}` // NEED TO UPDATE API KEY TO CONFIG.KEY FILE
        console.log('hUrl is: ', hUrl);
        fetch(hUrl)
        .then((res) => res.json())
        .then((res) => {
            console.log(res);
            // this.setState({ trailData: res.trails })
            this.setState(state => {
                return {
                    ...state,
                    trailData: res.trails
                }
            })
            console.log('this.state.trailData is: ', this.state.trailData)
            })
    })
}

  // componentWillMount() {
  //   navigator.geolocation.getCurrentPosition(position => {
  //     this.setState({ lat: position.coords.latitude, long: position.coords.longitude });
  //   }, err => console.log(`Error at componentWillMount: ${err}`)
  //   );
    // console.log(`333${this.state.lat}`)
    // console.log(`333${this.state.long}`)
  // } 
  // getMyLocation() {
  //   const location = window.navigator && window.navigator.geolocation;
  //   if (location) {
  //     location.getCurrentPosition((position) => {
  //       const lat = (position.coords.latitude).toFixed(6);
  //       const long = (position.coords.longitude).toFixed(6);
  //       this.setState({
  //         // lat: position.coords.latitude,
  //         // long: position.coords.longitude,
  //         lat,
  //         long
  //       });
  //       console.log('#######')
  //       console.log(this.state.lat);
  //       console.log(this.state.long)
  //     }, (error) => {
  //       this.setState({ lat: 'err-latitude', long: 'err-longitude' })
  //     })
  //   }
  // };

    //fetches data from REI API and sets to state when the page loads
  
  
  
  componentDidMount() {

    console.log('Fetch started')
    const fetchUrl = `/data/?lat=${this.state.lat}&lon=${this.state.long}&maxDistance=20&maxResults=100&minStars=3.5&key=200597455-cfbe6650f3776f2f486ae788a2ecf16b`;

    fetch(fetchUrl, {
      method: 'GET',
    })
      .then(res => res.json())
      .then(data => {
        this.setState({ trailData: data.trails })
      })
      .catch(err => console.log(`***App.jsx => componentDidMount fetch request failed: ${err}`))
    console.log('Fetch ended')
  
    // this.getMyLocation();

    // fetch('/data')
    // .then((res) => {
    //     return res.json();
    // })
    // .then((res) => {
    //     this.setState(state => {
    //         return {
    //             ...state,
    //             trailData: res.trails
    //         };
    //     });
  };

getCurrentLocaiton() {
  const googleMapsUrl = 'https://maps.googleapis.com/maps/api/geocode/json?address='
  const API_KEY = 'AIzaSyAgJUQeWjM55IdJbPXVRa3i-5N6uLvptI8';

  }
  

  //invoked by on-click function in TrailDisplay, sets selected trail in state
  getTrail(id) {
    let trailsArr = this.state.trailData.slice();
    let chosenTrail;
    for (let i = 0; i < trailsArr.length; i++) {
      if (trailsArr[i].id === +id) {
        chosenTrail = trailsArr[i];
        this.setState({ selectedTrail: chosenTrail })
      };
    };

    fetch('/comments', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        id: id
      }
    })
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        this.setState(state => {
          return {
            ...state,
            comments: res
          };
        }); // 
      });
  };
  //closes TrailDisplay overlay
  noTrail() {
    this.setState({ selectedTrail: null })
  }
  //adds comment and author to database and pulls back all comments for specified trail and sets to state
  postComment(id, comment, author) {
    fetch('/comments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: id,
        comment: comment,
        author: author
      })
    })
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        this.setState(state => {
          return {
            ...state,
            comments: res
          };
        });
      });
  };
  //invoked when clicking on the map popups
  displayTrail(selectedHike) {
    this.setState({ selectedTrail: selectedHike });
  }

  updateLat(e) {
    this.setState({lat: e.target.value})
    console.log(this.state.lat)
  }
  updateLong(e) {
    this.setState({long: e.target.value})
    console.log(this.state.long)
  }

  updateLocationUserInput() {
    console.log('Fetch started')
    const fetchUrl = `/data/?lat=${this.state.lat}&lon=${this.state.long}&maxDistance=20&maxResults=100&minStars=3.5&key=200597455-cfbe6650f3776f2f486ae788a2ecf16b`;

    fetch(fetchUrl, {
      method: 'GET',
    })
      .then(res => res.json())
      .then(data => {
        this.setState({ trailData: data.trails })
      })
      .catch(err => console.log(`***App.jsx => componentDidMount fetch request failed: ${err}`))
    console.log('Fetch ended')
  }

  //renders MainContainer and conditionally renders TrailContainer
  render() {
    if (!this.state.isLoggedIn) return <Redirect to="/login" />
    console.log(this.state.trailData)
  
    return (
      <div className='appContainer'>
        
        <p>{this.state.lat}</p>
        <p>{this.state.long}</p>
        <span>Lat: </span>
        <input type='number' value={34.0489} onChange={e => {this.updateLat(e)}}></input>
        <span>Long: </span>
        <input type='number' value={-111.0937} onChange={e => { this.updateLong(e) }}></input>
        <button onClick={() => { this.updateLocationUserInput() }}>Enter</button>
        <p>Search address</p>
        <input name="Address" placeholder="Address" /><br></br>
        <p>Current Location</p>
        <input placeholder="currLocation"></input>
        <MainContainer
          className='mainContainer'
          trailData={this.state.trailData}
          getTrail={this.getTrail}
          selectedTrail={this.state.selectedTrail}
          displayTrail={this.displayTrail}
          lat={this.state.lat}
          long={this.state.long}
        />
        {
          this.state.selectedTrail &&
          <TrailContainer
            className="modal"
            trailData={this.state.trailData}
            selectedTrail={this.state.selectedTrail}
            noTrail={this.noTrail}
            postComment={this.postComment}
            comments={this.state.comments}
            getTrail={this.getTrail} />
        }
      </div>
    );
  };
};

export default App;

{/* <div className='appContainer'>
<form onSubmit={this.handleSearchSubmit}>
<label>
Search Address:
<input type="text" value={this.state.searchLocation} onChange={this.handleSearchInput} />
</label>
<input type="submit" value="Submit" />
</form>
    <MainContainer 
    className='mainContainer' 
    latitude={this.state.latitude}
    longitude={this.state.longitude}
    trailData={this.state.trailData}
    getTrail={this.getTrail}
    selectedTrail={this.state.selectedTrail}
    displayTrail={this.displayTrail}
    // showKey={this.showKey}
    // diffKey={this.state.diffKey}
    />
    {this.state.selectedTrail &&
    <TrailContainer 
    className="modal" 
    trailData={this.state.trailData} 
    selectedTrail={this.state.selectedTrail} 
    noTrail={this.noTrail}
    postComment={this.postComment}
    comments={this.state.comments}
    getTrail={this.getTrail} />
    }
</div> */}