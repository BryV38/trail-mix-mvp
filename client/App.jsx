import React, { Component } from 'react';
import MainContainer from "./containers/MainContainer.jsx";

const googleMapsUrl = 'https://maps.googleapis.com/maps/api/geocode/json?address=';
const googleMaps_API_KEY = 'AIzaSyAgJUQeWjM55IdJbPXVRa3i-5N6uLvptI8';

const hikingProject_API_KEY = '200601261-d71b1d3a8f073c58c93d34bf907171f1'
const weather_API = '5a7844ec3fff2f570b9449fb1c26d66a';
const darkSky_API_KEY = '0b5c5fab0ec2f6d0ad4dd955eea69e1c';
// import Skycons from 'react-skycons'
const Skycons = require("skycons")(window);


//state includes data retrieved from REI API, selects selected trail
// holds trail specific comments pulled from database
class App extends Component {
  // user ID
    constructor(props) {
        super(props);

        this.state = {
            userId: null,
            username: null,
            trailData: [],
            selectedTrail: null,
            isLoggedIn: true,
            comments: [], 
            searchInput: '',
            latitude: 39.0119,
            longitude: -98.4842,
            zoom: 3,
            weatherData: [],
        }

    
    this.getTrail = this.getTrail.bind(this);
    this.saveTrail = this.saveTrail.bind(this);
    this.removeTrail = this.removeTrail.bind(this);
    this.displayTrail = this.displayTrail.bind(this);
    this.handleSearchInput = this.handleSearchInput.bind(this);
    this.handleSearchSubmit = this.handleSearchSubmit.bind(this);
    this.ref = React.createRef();

    };
    //fetches data from REI API and sets to state when the page loads

    handleSearchInput(e) {
        let input = e.target.value;
        // console.log(input)
        input = input.replace(' ', '+')
        this.setState({ searchInput: input })
    }

    handleSearchSubmit(e) {
        e.preventDefault()
        console.log('this.state.searchInput is: ', this.state.searchInput)
        const gUrl = googleMapsUrl + this.state.searchInput + '&key=' + googleMaps_API_KEY;
        console.log(gUrl);
        fetch(gUrl)
        .then((res) => res.json())
        .then((res) => {
            const lat = res.results[0].geometry.location.lat;
            const lng = res.results[0].geometry.location.lng;
            this.setState({ latitude: lat, longitude: lng })
            console.log('latitude is: ', lat)
            console.log('longitude is: ', lng)
        }) 
        .then((res) => {    
            const hUrl = `https://www.hikingproject.com/data/get-trails?lat=${this.state.latitude}&lon=${this.state.longitude}&maxDistance=20&maxResults=20$minStars=2&key=${hikingProject_API_KEY}`
            console.log('hUrl is: ', hUrl);
            fetch(hUrl)
            .then((res) => res.json())
            .then((res) => {
                console.log(`array of trails: `+ res);
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
        .then((res) => {
            const wUrl = `https://cors-anywhere.herokuapp.com/https://api.darksky.net/forecast/${darkSky_API_KEY}/${this.state.latitude},${this.state.longitude}`;
            console.log(`wUrl: ${wUrl}`)
            fetch(wUrl)
                .then((res) => res.json())
                .then((res) => {
                    this.setState({ weatherData: res.daily });
                    console.log(`Weather array info: ${this.state.weatherData.data[0].temperatureMin}`)
                })
        })

  

        this.setState({zoom: 10})
    }

       

    // fetches data from REI API and sets to state when the page loads
    componentDidMount() {

            this.setState({
              userId: this.props.location.state.id,
              username: this.props.location.state.username
            });

            fetch('/data')
            .then((res) => {
                return res.json();
            })
            .then((res) => {
              this.setState(state => {
                  return {
                      ...state,
                      trailData: res.trails
                  };
              });
        });

        // const skycons = new Skycons({ color: "gray" });
        // console.log(this.state.weatherData.data[0].icon)
        // let a = this.state.weatherData.data[0].icon;
        // console.log(`state: ${a}`)
        // skycons.add(this.ref.current, Skycons.a);
        // skycons.play();
        const skycons = new Skycons({ color: "pink" });
        skycons.add(this.ref.current, Skycons.PARTLY_CLOUDY_DAY);
        skycons.play();
    };

    //invoked by on-click function in TrailDisplay, sets selected trail in state
    getTrail(id) {
        let trailsArr = this.state.trailData.slice();
        let chosenTrail;
        for (let i = 0; i < trailsArr.length; i++) {
            if (trailsArr[i].id === +id) {
                chosenTrail = trailsArr[i];
                this.setState({selectedTrail: chosenTrail})
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
            });
        });
    };

    saveTrail(event, props) {
      event.preventDefault();

      fetch('/trail/add', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({
              userId: props.userId,
              reiId: props.id,
              length: props.length,
              difficulty: props.difficulty,
              location: props.location,
              name: props.name,
          })
      })
      .then((res) => {
          return res.json();
      })
    }

    removeTrail(event, props) {
      event.preventDefault();

      fetch('/trail/remove', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({
              userId: props.userId,
              reiId: props.id,
          })
      })
      .then((res) => {
          return res.json();
      })
    }

    //invoked when clicking on the map popups
    displayTrail(selectedHike) {
        this.setState({selectedTrail: selectedHike});
    }

    //renders MainContainer and conditionally renders TrailContainer
    render() {
        if (!this.state.isLoggedIn) return <Redirect to="/login" />
        console.log(`Weather Data Array: ${this.state.weatherData}`)

        let weather = 70;
        if (this.state.weatherData.length !== 0) {
            weather = <canvas ref={this.ref} width="128" height="128" />
        }
        return (
            <div className='appContainer'>
                {/* <p>Weather info: {this.state.weatherData.hourly.summary}</p> */}
            <form onSubmit={this.handleSearchSubmit}>
            <label>
            Search Address:
            <input type="text" value={this.state.searchLocation} onChange={this.handleSearchInput} />
            </label>
            <input type="submit" value="Submit" />
            </form>
                {weather}
                <MainContainer 
                className='mainContainer' 
                latitude={this.state.latitude}
                longitude={this.state.longitude}
                trailData={this.state.trailData}
                getTrail={this.getTrail}
                selectedTrail={this.state.selectedTrail}
                displayTrail={this.displayTrail}
                zoom={this.state.zoom}
                saveTrail={this.saveTrail}
                userId={this.state.userId}
                username={this.state.username} />
            </div>
        );
    };
};


export default App;
