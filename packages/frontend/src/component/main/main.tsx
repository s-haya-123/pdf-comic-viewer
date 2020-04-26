import React, { useEffect, useState } from 'react';
import { Comic } from '../../models/comic';
import './main.css';
import { useHistory } from 'react-router-dom';

function Main() {
  const [list, setList] = useState<Comic[]>();
  const history = useHistory();
  useEffect(()=>{
    fetch('http://localhost:8000/pdf/list')
      .then(res=>res.json())
      .then((json)=>setList(json));
  }, []);
  return (
    <div className="list">
      {list?.map(
        comic=>
          <div className="comic" key={comic.id} onClick={()=>history.push(`/page/${comic.id}`)}>
            {comic.title}
            <img src={`http://localhost:8000/thumbnail/${comic.id}`} alt="サムネイル"></img>
          </div>
      )}
    </div>
  );
}
export default Main;
