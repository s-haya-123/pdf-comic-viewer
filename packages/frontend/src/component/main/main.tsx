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
    dispatch({type: 'store'});
    fetch('http://localhost:8000/pdf/list')
      .then(res=>res.json())
      .then((json)=>{
        setList(json);
        setOriginList(json)
      });
  }, []);
  const searchComic = ({ target : { value }}: React.ChangeEvent<HTMLInputElement>, targetList?: Comic[]) => {
    const messages = value.replace('　',' ').split(/ +/);
    console.log(originList && JSON.stringify(originList[0]));
    const filteredList = targetList?.filter(comic=>JSON.stringify(comic).indexOf(messages[0]) >= 0);
    console.log(filteredList);
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
              <img src={`http://localhost:8000/thumbnail/${comic.id}`} alt="サムネイル"></img>
            </div>
        )}
      </div>
    </div>
  );
}
export default Main;
