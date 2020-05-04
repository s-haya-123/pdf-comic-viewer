import React, { useState, useContext } from 'react';
import { ComicStateContext } from '../../state/comic';
import { Comic } from '../../../../shared/lib/comic';
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import './editInfo.css';
import { CloseAction } from '../pdf/RenderComic';
import { useToasts } from 'react-toast-notifications';

function EditInfo() {
    const { selectComic } = useContext(ComicStateContext);
    const [ comicInfo, setComicInfo ] = useState(selectComic);
    const { addToast } = useToasts()
    const closeAction = useContext(CloseAction);
    const save = ()=>{
        fetch('http://localhost:8000/info',
            { method: "PATCH", body: JSON.stringify(comicInfo)}
        ).then(res=>{
            addToast('Saved Successfully', { appearance: 'success' })
        })
    }
    const setInfo = (key: keyof Comic, value: string) => {
        setComicInfo({...comicInfo, [key]: value} as Comic)
    }
    return (
      <div className="info-wrapper">
        <div className="close" onClick={()=> closeAction()}><FontAwesomeIcon icon={faTimes} size="lg"/></div>
        <div>
            <input defaultValue={(selectComic?.title || '')} onChange={(event)=>setInfo('title', event.target.value)}></input>
            <input defaultValue={(selectComic?.author || '')} onChange={(event)=>setInfo('author', event.target.value)}></input>
            <button onClick={save}>決定</button>
        </div>
      </div>
    );
}
export default EditInfo;