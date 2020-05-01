import React, { Dispatch, useReducer } from 'react';
import './App.css';
import { BrowserRouter, Route } from "react-router-dom";
import RenderComic from './component/pdf/RenderComic';
import Main from './component/main/main';
import { Comic } from './models/comic';

export type ComicState = {
  selectComic?: Comic;
}
export const initialState: ComicState = {};
type Action = {
  type: string;
  payload: any;
};
export function reducer(state: ComicState, action: Action): ComicState {
  switch (action.type) {
    case "reset": {
      return initialState;
    }
    case "store": {
      return { ...state, selectComic: action.payload }
    }
    default: {
      return state;
    }
  }
}
export const ComicStateContext = React.createContext<ComicState>(null as any);
export const DispatchContext = React.createContext<Dispatch<any>>(null as any);
function App() {
  const [state, dispatch] = useReducer(reducer, {});
  return (
        <BrowserRouter>
        <ComicStateContext.Provider value={state}>
          <DispatchContext.Provider value={dispatch}>
            <div className="App">
              <Route exact path="/" component={Main}/>
              <Route path="/page/:id" component={RenderComic}/>
            </div>
          </DispatchContext.Provider>
        </ComicStateContext.Provider>
        </BrowserRouter>
  );
}

export default App;
