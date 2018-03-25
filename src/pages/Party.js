import React, { Component } from 'react';
import '../css/pages/party.css';
import Spotify from 'spotify-web-api-js';
import cookie from 'react-cookies';
//import { Search } from 'react-feather';
import firebase from 'firebase';
import Result from '../components/Result.js'
import Track from '../components/Track.js'
import uuid from 'uuid/v4';

class Party extends Component {
    constructor() {
        super();
        this.spot = new Spotify();
        this.state = {
            "playlistName": "",
            "results": [],
            "uuid": "",
            "playlistId": "",
            "hostId": "",
            "tracks": []
        }

        if (window.location.toString().includes("access_token") && cookie.load("host") === 'true') {
            console.log("creating");
            let access = window.location.toString().substring(window.location.toString().indexOf("=") + 1, window.location.toString().indexOf("&"));
            console.log(access);
            let instance = this;
            this.spot.setAccessToken(access);
            this.loggedIn = true;
            this.spot.getMe()
                .then(function (data) {
                    instance.user = data.id;
                    instance.setState({"hostName": data.display_name});
                    instance.setState({"user": data.id});
                    cookie.save("user",data.id);
                    instance.spot.createPlaylist(data.id, { "name": cookie.load("playlistName"),"public": false, "collaborative": true }, function (err, data) {
                        console.log(instance.state);
                        if (err)
                            console.log(err);
                        else
                            instance.createData(data);
                    });


                }, function (err) {
                    console.log(err);
            });

            var app = firebase.initializeApp({
                apiKey: "AIzaSyCi07jN0J152HozXKjjwSbLM-ZmzijyAuE",
                authDomain: "spotify-app-a4781.firebaseapp.com",
                databaseURL: "https://spotify-app-a4781.firebaseio.com",
                projectId: "spotify-app-a4781",
                storageBucket: "",
                messagingSenderId: "896501726838"
            });

            
            
            
           
            
        }else if(window.location.toString().includes("access_token") && cookie.load("host") === 'false'){
            //joining
            console.log("joining");
            let access = window.location.toString().substring(window.location.toString().indexOf("=") + 1, window.location.toString().indexOf("&"));
            console.log(access);
            this.spot.setAccessToken(access);
            let instance = this;
            var app = firebase.initializeApp({
                apiKey: "AIzaSyCi07jN0J152HozXKjjwSbLM-ZmzijyAuE",
                authDomain: "spotify-app-a4781.firebaseapp.com",
                databaseURL: "https://spotify-app-a4781.firebaseio.com",
                projectId: "spotify-app-a4781",
                storageBucket: "",
                messagingSenderId: "896501726838"
            });

            var ref = firebase.database().ref("/" + cookie.load("uuid"));
            ref.on("value",function(snapshot){
                let data = snapshot.val();
                if(data !== null){
                    instance.setState({
                        "playlistName": data.partyName,
                        "uuid": data.uuid,
                        "hostId": data.hostId,
                        "playlistId": data.playlistId
                    });   
                    instance.getSongs();
                }else{
                    console.log("null data");
                }
            });

            

            
        }else{
            console.log("how is this possible");
        }
        /*cookies.erase("host");
        cookies.erase("uuid");
        cookies.erase("playlistName");*/
    }


    getSongs = () => {
        let instance = this;
        this.spot.getPlaylistTracks(this.state.hostId, this.state.playlistId, {}, function (err, data) {
            if (err){
                console.log(err);
            }else{
                for(let i = 0; i < data.items.length; i++){
                    instance.setState({
                        tracks: instance.state.tracks.concat(data.items[i].track),
                    });
                }
                console.log(instance.state);
            }
        });
    }

    createData = (data) =>{
        var database = firebase.database();
        this.setState({
            "uuid": uuid().toString().substring(0,5),
            "playlistName": cookie.load("playlistName"),
            "hostId": cookie.load("user"),
            "playlistId": data.id,
            "partyName": data.name
        });

        firebase.database().ref(this.state.uuid).set({
            "partyName": data.name,
            "playlistId": data.id,
            "partyLink": data.href ,
            "uuid": this.state.uuid,
            "hostId": cookie.load("user")
        });
    }

    componentWillMount = () => {
        this.setState({ "playlistName": cookie.load("playlistName")});
    }

    keyPress = (e) => {
        if(e.keyCode === 13 ){
            let instance = this;
            this.spot.searchTracks(e.target.value)
                .then(function(data){
                    var tracks = data.tracks.items;
                    for(var i = 0; i < tracks.length; i++){
                        instance.setState({ results: instance.state.results.concat([tracks[i]])});
                    }
                }, function(err){
                    console.log(err);
                });
        }
    }

    render() {
        return (
            <div className="party-wrapper">
                <div className="info-wrapper">
                    <span className="playlist-name">{this.state.playlistName}</span>
                    <span className="uuid">Share This Code: {this.state.uuid}</span>
                </div>
                <div className="search-wrapper">        
                    <input className="searchInput" placeholder="Search For A Song" onKeyDown={this.keyPress}></input>
                    <div className="results-wrapper">
                        {this.state.results.length !== 0 ? this.state.results.map((item,i)=>
                        <Result key={i} track={this.state.results[i]} playlistId={this.state.playlistId} hostId={this.state.hostId} spot={this.spot}/>
                        ): <span>nothing</span>}
                    </div>
                </div>
                <div className="songs-wrapper">
                    {this.state.tracks.length !== 0 ? this.state.tracks.map((item, i) =>
                        <Track key={i} track={this.state.tracks[i]} />
                    ) : <span>nothing</span>}
                </div>
            </div>
        );
    }
}

export default Party;
