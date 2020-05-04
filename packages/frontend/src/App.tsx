import React, { useReducer } from 'react';
import './App.css';
import { BrowserRouter, Route } from "react-router-dom";
import RenderComic from './component/pdf/RenderComic';
import Main from './component/main/main';
import { reducer, DispatchContext, ComicStateContext } from './state/comic';
import { ToastProvider } from 'react-toast-notifications';

function App() {
  const [state, dispatch] = useReducer(reducer, {});
  return (
    <BrowserRouter>
      <ToastProvider>
        <ComicStateContext.Provider value={state}>
          <DispatchContext.Provider value={dispatch}>
            <div className="App">
              <Route exact path="/" component={Main}/>
              <Route path="/page/:id" component={RenderComic}/>
            </div>
          </DispatchContext.Provider>
        </ComicStateContext.Provider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
