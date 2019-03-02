import React, { Component } from 'react';
import './App.css';
import axios from "axios";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      start: false
    };
  }

  start() {
    return (
      <div id = "start">
        <h1>Trivia Night</h1>
        <button className = "btn btn-success btn-lg" onClick = 
          {() => this.setState({start: true})}>Start!</button>
          <img src = "https://i.pinimg.com/originals/6f/24/bd/6f24bd34e0e2eadb52891d65d730cfe0.jpg"
            alt = "trivia logo"/>
      </div>
    )
  }

  render() {
    return (
      <div className = "App">
        {this.state.start ? <Trivia/> : this.start()}
      </div>
    );
  }
}

class Trivia extends Component {
  constructor(props) {
    super(props);
    this.state = {
      trivia: [],
      index: 0,
      hint: false,
      usedhint: false,
      time: 15,
      elapsed: 0,
      score: 0,
      answered: false,
      correct: null,
      totalcorrect: 0,
      complete: false
    };

    this.clicked = this.clicked.bind(this);
    this.clickedAns = this.clickedAns.bind(this);
    this.interval = setInterval(() => {
      if (this.state.answered === false && this.state.time > 0) {
          this.setState({time: this.state.time - 1, elapsed: this.state.elapsed + 1});
      }
    }, 1000);
  }

  componentWillMount() {
    axios.get("http://34.215.246.172/api")
      .then(response => {
        this.setState({trivia: response.data});
      })
      .catch(error => {
        console.log("Bad request. Cannot retrieve data");
      })
    this.setState({answered: false});
  }

  componentWillUnmount() {
    this.setState({answered: true});
    clearInterval(this.interval);
  }

  clicked() {
    if (this.state.hint === false) {
        this.setState({hint: true, usedhint: true});
    }
    else {
        this.setState({hint: false});
    }
  }

  card() {
    var triv = this.state.trivia;
    var i = this.state.index;

    if (this.state.hint === false) {
      return (
        <div>
          <h5 className = "card-title">{triv[i].topic.title}</h5>
          <p className = "card-text">{triv[i].description}</p>
          <button className = "btn btn-primary" onClick = {() => this.clicked()}
            disabled = {this.state.answered}>Click for a hint</button>
        </div>
      )
    }
    else {
      return (
        <div>
          <h5 className = "card-title">Hint</h5>
          <p className = "card-text">{triv[i].hint}</p>
          <button className = "btn btn-primary" onClick = {() => this.clicked()}
            disabled = {this.state.answered}>Go Back</button>
        </div>
      )
    }
  }

  answers() {
    var triv = this.state.trivia;
    var j = this.state.index;

    var answers = triv[j].answers.map((a, i) => {
      return (
        <button key = {i} className = "btn btn-info btn-lg" onClick = 
          {() => this.clickedAns(a.isCorrect)}>{a.value}</button>
      )
    })

    return (
      <div id = "answers">
        {answers}
      </div>
    )
  }

  clickedAns(a) {
    var score;

    if (a === false) {
      this.setState({answered: true, correct: false});
    }
    else if (a === true && this.state.usedhint === true) {
      score = this.state.time - 3;
      if (score < 1) {
        score = 1;
      }
      this.setState({answered: true, correct: true, totalcorrect: this.state.totalcorrect + 1, 
        score: this.state.score + score});
    }
    else {
      this.setState({answered: true, correct: true, totalcorrect: this.state.totalcorrect + 1,
        score: this.state.score + this.state.time});
    }

    this.result();
  }

  result() {
    var result;
    var points;
    var score = this.state.time;

    if (this.state.usedhint === true) {
      score = score - 3;

      if (score < 1) {
        score = 0;
      }
    }
    
    if (score === 1) {
      points = "point";
    }
    else {
      points = "points";
    }

    if (this.state.time < 1) {
      result = <h4>You ran out of time!</h4>
    }
    else if (this.state.correct === false) {
      result = <h4>Sorry! Wrong answer.</h4>
    }
    else if (this.state.correct === true && this.state.usedhint === true) {
      result = <h4>Correct! You used a hint, so you get {score} {points}.</h4>
    }
    else {
      result = <h4>Correct! You get {score} {points}.</h4>
    }
    return (
      <div id = "result">
        {result}
        {this.nextbutton()}
      </div>
    )
  }

  nextbutton() {
    var triv = this.state.trivia;
    var l = this.state.index;
    var button;

    if (l === triv.length - 1) {
      button = <button className = "btn btn-secondary" onClick = 
        {() => this.setState({complete: true})}>View Results</button>;
    }
    else {
      button = <button className = "btn btn-secondary" onClick = 
        {() => this.setState({index: this.state.index + 1, time: 16, hint: false, usedhint: false,
        answered: false, correct: null})}>Next question</button>;
    }

    return button;
  }

  main() {
    var triv = this.state.trivia;
    var k = this.state.index;

    if (triv.length > 0) {
      return (
        <div>
          <div id = "top">
            <h2>Time: <span className = {(this.state.time < 6 && this.state.time > 0 ? "timelow": null)}>
              {this.state.time}</span></h2>
            <h2 id = "score">Score: {this.state.score}</h2>
          </div><br/>
  
          <div className = "card" style = {{width: "18rem"}}>
            <img className = "card-img-top" src = {triv[k].topic.imageUrl} alt = "cardimage"/>
            <div className = "card-body text-center">
              {this.card()}
            </div>
          </div>
          {this.state.answered || this.state.time === 0 ? this.result() : this.answers()}
        </div>
      )
    }
    else {
      return (
        <h1>Loading...</h1>
      )
    }
  }

  complete() {
    var correct = ((this.state.totalcorrect/this.state.trivia.length) * 100).toFixed(2);
    var avg = (this.state.elapsed/this.state.trivia.length).toFixed(2);

    return (
      <div id = "complete">
        <h1>Game Complete!</h1><br/>
        <h4>Final score: {this.state.score} points</h4>
        <h4>Total time elapsed: {this.state.elapsed} seconds</h4>
        <h4>Average time: {avg} seconds</h4>
        <h4>Correctly answered: {this.state.totalcorrect}/{this.state.trivia.length} questions
          ({correct}%)</h4>
        <button className = "btn btn-info" onClick = {() => this.setState({
          index: 0, hint: false, usedhint: false, time: 16, elapsed: 0, score: 0, answered: false,
          correct: null, totalcorrect: 0, complete: false})}>Replay</button>
      </div>
    )
  }

  render() {
    return (
      <div>
        {this.state.complete ? this.complete() : this.main()}
      </div>
    )
  }
}

export default App;
