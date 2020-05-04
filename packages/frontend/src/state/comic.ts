import React, { Dispatch } from 'react';
import { Comic } from './../../../shared/lib/comic';

export type ComicState = {
    selectComic?: Comic;
}
export const initialState: ComicState = {};
export type ComicAction = 'reset' | 'store';
type Action = {
    type: ComicAction;
    payload: any;
};
export function reducer(state: ComicState, action: Action): ComicState {
    switch (action.type) {
        case 'reset': {
            return initialState;
        }
        case 'store': {
            return { ...state, selectComic: action.payload }
        }
        default: {
            return state;
        }
    }
}
export const ComicStateContext = React.createContext<ComicState>(null as any);
export const DispatchContext = React.createContext<Dispatch<any>>(null as any);