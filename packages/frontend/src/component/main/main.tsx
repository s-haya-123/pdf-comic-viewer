import React, { useEffect, useState, useContext, createContext, useRef } from 'react';
import { Comic } from '../../models/comic';
import './main.css';
import { useHistory } from 'react-router-dom';
import { DispatchContext } from '../../state/comic'

export const ComicList = createContext<Comic[] | undefined>(null as any);
function Main() {
  const inputEl = useRef<HTMLInputElement>(null);
  const [list, setList] = useState<Comic[]>([]);
  const [originList, setOriginList] = useState<Comic[]>([]);
  const dispatch = useContext(DispatchContext);
  const history = useHistory();
  const limit = 5;
  const [page, setPage] = useState(1);
  useEffect(()=>{
    fetchPage(page, list, originList);
  }, []);

  const fetchPage = (nextPage: number, oldList: Comic[], oldOriginList: Comic[]) => {
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
      setOriginList([...oldOriginList,...json]);
    });
  }
  const searchComic = ( value: string, targetList: Comic[]) => {
    const messages = value.trimEnd().replace('　',' ').split(/ +/);
    return targetList?.filter(comic=>messages.filter(message=>JSON.stringify(comic).indexOf(message) >= 0).length === messages.length);
  };
  const fetchNextPage = (oldPage: number, list: Comic[], oldOriginList: Comic[]) => {
    const nextPage = oldPage +1;
    fetchPage(nextPage, list, oldOriginList);
    setPage(nextPage);
  };
  const openPDFPage = (selectComic: Comic)=>{
    dispatch({type: 'store', payload: selectComic});
    history.push(`/page/${selectComic.id}`);
  }
  return (
    <div>
      <div className="search">
        <input className="search-input" onChange={({ target : { value }})=>setList(searchComic(value, originList))} ref={inputEl}></input>
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
          <button className="nextPage" onClick={()=>fetchNextPage(page, list, originList)}>もっと見る</button>
        </div>
      </div>
    </div>
  );
}
export default Main;
