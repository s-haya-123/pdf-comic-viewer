import React, { useEffect, useState, useContext } from 'react';
import { Comic } from '../../models/comic';
import './main.css';
import { useHistory } from 'react-router-dom';
import { DispatchContext } from '../../state/comic'

function Main() {
  const [list, setList] = useState<Comic[]>();
  const dispatch = useContext(DispatchContext);
  const history = useHistory();
  useEffect(()=>{
    dispatch({type: 'store'});
    fetch('http://localhost:8000/pdf/list')
      .then(res=>res.json())
      .then((json)=>setList(json));
  }, []);
  return (
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
  );
}
export default Main;
