import React, { useEffect, useState, useContext, createContext, useRef, useReducer } from 'react';
import { Comic } from '../../models/comic';
import './main.css';
import { useHistory } from 'react-router-dom';
import { DispatchContext, ComicStateContext } from '../../state/comic'

export const ComicList = createContext<Comic[] | undefined>(null as any);
function Main() {
  const inputEl = useRef<HTMLInputElement>(null);
  const [list, setList] = useState<Comic[]>([]);
  const dispatch = useContext(DispatchContext);
  const history = useHistory();
  const limit = Number(process.env.REACT_APP_PAGE_LIMIT);
  const [page, setPage] = useState(1);
  const { comics } = useContext(ComicStateContext);
  useEffect(()=>{
    if(comics) {
      setList(comics);
      setPage(Math.floor(comics.length / limit));
      return;
    }
    fetchPage(page, []);
  }, []);

  const fetchPage = (nextPage: number, oldList: Comic[]) => {
    fetch(`${process.env.REACT_APP_SERVER}/pdf/list?limit=${limit}&page=${nextPage}`)
    .then(res=>res.json())
    .then((json)=>{
      const value = inputEl.current?.value;
      if(value) {
        const target = searchComic(value, json);
        setList([...oldList, ...target]);
      } else {
        setList([...oldList, ...json])
      }
      dispatch({type: 'storeComics', payload: json})
    });
  }
  const searchComic = ( value: string, targetList: Comic[]) => {
    const messages = value.trimEnd().replace('　',' ').split(/ +/);
    return targetList?.filter(comic=>messages.filter(message=>JSON.stringify(comic).indexOf(message) >= 0).length === messages.length);
  };
  const fetchNextPage = (oldPage: number, list: Comic[]) => {
    const nextPage = oldPage +1;
    fetchPage(nextPage, list);
    setPage(nextPage);
  };
  const openPDFPage = (selectComic: Comic)=>{
    dispatch({type: 'storeComic', payload: selectComic});
    history.push(`/page/${selectComic.id}`);
  }
  return (
    <div>
      <div className="search">
        <input className="search-input" onChange={({ target : { value }})=>setList(searchComic(value, list))} ref={inputEl}></input>
      </div>
      <div className="list">
        {list?.map(
          comic=>
            <div className="comic" key={comic.id} onClick={()=>{openPDFPage(comic)}}>
              {comic.title}
              <img src={`${process.env.REACT_APP_SERVER}/thumbnail/${comic.id}`} alt="サムネイル" loading="lazy"></img>
            </div>
        )}
        <div className="nextPageWrapper">
          <button className="nextPage" onClick={()=>fetchNextPage(page, list)}>もっと見る</button>
        </div>
      </div>
    </div>
  );
}
export default Main;
