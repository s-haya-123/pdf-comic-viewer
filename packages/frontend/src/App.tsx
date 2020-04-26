import React from 'react';
import './App.css';
import { BrowserRouter, Route, Link } from "react-router-dom";
import RenderComic from './component/pdf/RenderComic';
import Main from './component/main/main';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Route exact path="/" component={Main}/>
        <Route path="/page/:id" component={RenderComic}/>
      </div>
    </BrowserRouter>
  );
}

export default App;
