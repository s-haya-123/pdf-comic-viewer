import React, { useEffect, useState, useContext, createContext } from 'react';
import { Comic } from '../../models/comic';
import './main.css';
import { useHistory } from 'react-router-dom';
import { DispatchContext } from '../../state/comic'

export const ComicList = createContext<Comic[] | undefined>(null as any);
function Main() {
  const [list, setList] = useState<Comic[]>();
  const [originList, setOriginList] = useState<Comic[]>();
  const dispatch = useContext(DispatchContext);
  const history = useHistory();
  useEffect(()=>{
    console.log(process.env)
    dispatch({type: 'store'});
    fetch(`${process.env.REACT_APP_SERVER}/pdf/list`)
      .then(res=>res.json())
      .then((json)=>{
        setList(json);
        setOriginList(json)
      });
  }, []);
  const searchComic = ({ target : { value }}: React.ChangeEvent<HTMLInputElement>, targetList?: Comic[]) => {
    const messages = value.trimEnd().replace('　',' ').split(/ +/);
    const filteredList = targetList?.filter(comic=>messages.filter(message=>JSON.stringify(comic).indexOf(message) >= 0).length === messages.length);
    filteredList && setList(filteredList);
  };
  return (
    <div>
      <div className="search">
        <input className="search-input" onChange={(e)=>searchComic(e, originList)}></input>
      </div>
      <div className="list">
        {list?.map(
          comic=>
            <div className="comic" key={comic.id} onClick={()=>{
                dispatch({type: 'store', payload: comic});
                history.push(`/page/${comic.id}`);
            }}>
              {comic.title}
              <img src={`${process.env.REACT_APP_SERVER}/thumbnail/${comic.id}`} alt="サムネイル"></img>
            </div>
        )}
      </div>
    </div>
  );
}
export default Main;
