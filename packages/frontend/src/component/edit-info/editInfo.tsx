import React, { useState, useContext } from 'react';
import { ComicStateContext } from '../../state/comic';
import { Comic } from '../../../../shared/lib/comic';

function EditInfo() {
    const { selectComic } = useContext(ComicStateContext);
    const [ comicInfo, setComicInfo ] = useState(selectComic);
    const save = ()=>{
        fetch('http://localhost:8000/pdf/info',
            { method: "PATCH", body: JSON.stringify(comicInfo)}
        ).then(res=>{
            console.log(res)
        })
    }
    const setInfo = (key: keyof Comic, value: string) => {
        setComicInfo({...comicInfo, [key]: value} as Comic)
    }
    return (
      <div>
            <input defaultValue={(selectComic?.title || '')} onChange={(event)=>setInfo('title', event.target.value)}></input>
            <input defaultValue={(selectComic?.author || '')} onChange={(event)=>setInfo('author', event.target.value)}></input>
            <button onClick={save}>決定</button>
      </div>
    );
}
export default EditInfo;
