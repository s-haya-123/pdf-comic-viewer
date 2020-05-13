import React, { useEffect, useRef, useState, useContext, createContext } from 'react';
import { getPDFFactory, getPDFViewport, PDFFactory } from '../../readPdf';
import './RenderComic.css';
import { PDFPageProxy } from 'pdfjs-dist';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronRight,faChevronLeft, faArrowLeft, faBars } from '@fortawesome/free-solid-svg-icons'
import { useParams } from 'react-router-dom';
import { ComicStateContext, DispatchContext } from '../../state/comic';
import EditInfo from '../edit-info/editInfo';
import { Comic } from '../../models/comic';

export const CloseAction = createContext<()=>void>(null as any);

function RenderComic() {
  const canvasRefRight = useRef(null);
  const canvasRefLeft = useRef(null);
  const [{width: canvasWidth, height: canvasHeight}, setCanvasSize] = useState({width: 100, height: 100});
  const [scale, setScale] = useState<number>();
  const [page, setPage] = useState(1);
  const [maxPage, setMaxPage] = useState<number>();
  const [factory, setFactory] = useState<PDFFactory>();
  const [showPageOperator, setShowPageOperator] = useState(false);
  const [isShowMenu, setIsShowMenu] = useState(false);
  const { id } = useParams();
  const { selectComic } = useContext(ComicStateContext);
  const dispatch = useContext(DispatchContext);
  const divRef = useRef(null);

  useEffect(()=>{
    window.addEventListener('resize', resizeFunc);
    return () => window.removeEventListener('resize', resizeFunc);
  });
  useEffect(() => {
    const startPage = (selectComic?.current_page || 1);

    !selectComic && fetch(`${process.env.REACT_APP_SERVER}/info/${id}`)
      .then(res=>res.json())
      .then((json: Comic)=>dispatch({type: 'storeComic', payload: json}));
    setPage( Number(startPage));
    getPDFFactory(`${process.env.REACT_APP_SERVER}/pdf/${id}`).then(
      async factory=>{
        await initCanvasSize(factory, Number(startPage));
        setFactory(factory);
        prefetchPDF(factory);
    });
    (divRef?.current as any ).focus();
  },[]);
  const getContext = (canvas: HTMLCanvasElement | OffscreenCanvas) => {
    return canvas.getContext('2d') as CanvasRenderingContext2D;
  };
  const renderPage = (pdfPage: PDFPageProxy, ctx: CanvasRenderingContext2D, scale = 1): Promise<void> => {
    const config = getPDFViewport(pdfPage, ctx, scale);
    return (pdfPage.render(config).promise as unknown) as Promise<void>;
  }
  const initCanvasSize = async (factory: PDFFactory, initPage = 1) => {
    const {width: originWidth, height: originHeight, pageNumber} = await factory.getPDFSize();
    const {innerWidth, innerHeight} = window;
    const originScale = (innerWidth / 2) / originWidth;
    const scaledHeight = originHeight * originScale;
    const scale = scaledHeight < innerHeight ? originScale : (innerHeight / originHeight);
    setMaxPage(pageNumber);
    setScale(scale);
    setCanvasSize({ width: originWidth, height: originHeight });
    const pages = await Promise.all([
      factory.getPage(initPage),
      factory.getPage(initPage+1)
    ]);
    renderPDF(pages, 1);
  };
  const prefetchPDF = async (factory: PDFFactory) => {
    const { pageNumber } = await factory.getPDFSize();
    let pagesPromis = [];
    for(let i =1; i<= pageNumber; i++) {
      pagesPromis.push(factory.getPage(i))
    }
    const pages = await Promise.all(pagesPromis);
    const canvas = document.createElement('canvas');
    const ctx = getContext(canvas as any);
    for(let page of pages) {
      await renderPage(page, ctx, scale);
    }
  };
  const resizeFunc = () =>{
    factory && initCanvasSize(factory, page);
  }
  const onClick = async (page: number, comic: Comic) => {
    if (!factory || !scale || !maxPage || page < 0 || page > maxPage ) {
      return ;
    }
    const nextPromiseAll: Promise<PDFPageProxy>[] = [];
    if(page <= maxPage) {
      nextPromiseAll.push(factory.getPage(page));
    }
    if(page + 1 <= maxPage) {
      nextPromiseAll.push(factory.getPage(page + 1));
    }
    const pages = await Promise.all(nextPromiseAll);
    renderPDF(pages, scale);
    setPage(page);
    fetch(`${process.env.REACT_APP_SERVER}/info`,
      { method: "PATCH", body: JSON.stringify({...comic, current_page: page})}
    );
  };
  const renderPDF =
  (
    pdfPages: PDFPageProxy[],
    scale: number,
  ) => {
      if (pdfPages.length < 1 || pdfPages.length > 3) {
        return;
      }
      const ctx = getContext(canvasRefRight.current as any);
      renderPage(pdfPages[0], ctx, scale);
      if(pdfPages.length === 2) {
        const ctx2 = getContext(canvasRefLeft.current as any);
        renderPage(pdfPages[1], ctx2, scale);
      }
  }
  const onkeypress = (e: React.KeyboardEvent, comic: Comic) => {
    if(e.key === 'ArrowLeft') {
      onClick(page + 2, comic);
    }
    if(e.key === 'ArrowRight') {
      onClick(page - 2, comic);
    }
  };
  const sliderPointUp = (e:React.PointerEvent<HTMLInputElement>, comic: Comic) => {
    e.stopPropagation();
    onClick(Number(e.currentTarget.value),comic);
  }
  const arrowPointUp = (e: React.MouseEvent, page: number, comic: Comic) => {
    e.stopPropagation();
    onClick(page, comic);
  }
  return (
    <div
      className="render-wrapper"
      onKeyDown={e => onkeypress(e, selectComic!)} tabIndex={-1}
      onPointerUp={()=>setShowPageOperator(!showPageOperator)}
      ref={divRef}
    >
      <div className="page-wrapper">
        <div className="info-wrapper">
          {
            showPageOperator &&
              [
                <div className="slider" key='0'>
                  <input
                    className="input-bar"
                    type="range"
                    name="speed"
                    min="1"
                    max={(maxPage||1)-1}
                    step="2"
                    value={page}
                    onPointerUp={(e)=>sliderPointUp(e, selectComic!)}
                    onChange={({target:{value}})=>setPage(Number(value))}
                  />
                </div>,
                <div className="info" key='1' onPointerUp={e => e.stopPropagation()}>
                  <a href="/"><FontAwesomeIcon icon={faArrowLeft}/></a>
                  <div className="info-content"> {(selectComic?.title || 'タイトル未設定')}</div>
                  <div className="info-content">{page} / {maxPage}</div>
                  {
                    !isShowMenu &&<div className="menu" onClick={()=>setIsShowMenu(!isShowMenu)}><FontAwesomeIcon icon={faBars}/></div>
                  }
                </div>
              ]
          }
        </div>
        <div className="page">
          <div className="canvas-wrapper">
            <div className="back send" onPointerUp={e=> arrowPointUp(e, page - 2, selectComic!)}>
              <FontAwesomeIcon icon={faChevronRight}/>
            </div>
            <canvas className="canvas" ref={canvasRefRight} width={canvasWidth} height={canvasHeight}/>
          </div>
          <div className="canvas-wrapper">
            <div className="next send"  onPointerUp={e=> arrowPointUp(e, page + 2, selectComic!)}>
              <FontAwesomeIcon icon={faChevronLeft}/>
            </div>
            <canvas className="canvas" ref={canvasRefLeft} width={canvasWidth} height={canvasHeight}/>
          </div>
        </div>
      </div>
        { 
          isShowMenu &&
            <div className="info-menu" onPointerUp={(e)=>e.stopPropagation()}>
              <CloseAction.Provider value={()=>setIsShowMenu(false)}>
                <EditInfo></EditInfo>
              </CloseAction.Provider>
            </div>
        }
    </div>
  );
}
export default RenderComic;
