import React, { useEffect, useRef, useState } from 'react';
import { getPDFFactory, getPDFViewport, PDFFactory } from '../../readPdf';
import './RenderComic.css';
import { PDFPageProxy } from 'pdfjs-dist';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronRight,faChevronLeft, faArrowLeft } from '@fortawesome/free-solid-svg-icons'

// TODO: perfomance tuning
function RenderComic() {
  const canvasRefRight = useRef(null);
  const canvasRefLeft = useRef(null);
  const [{width: canvasWidth, height: canvasHeight}, setCanvasSize] = useState({width: 100, height: 100});
  const [scale, setScale] = useState<number>();
  const [page, setPage] = useState(1);
  const [maxPage, setMaxPage] = useState<number>();
  const [factory, setFactory] = useState<PDFFactory>();
  const [showPageOperator, setShowPageOperator] = useState(false);

  const getContext = (canvas: HTMLCanvasElement | OffscreenCanvas) => {
    return canvas.getContext('2d') as CanvasRenderingContext2D;
  };
  const renderPage = (pdfPage: PDFPageProxy, ctx: CanvasRenderingContext2D, scale = 1) => {
    const config = getPDFViewport(pdfPage, ctx, scale);
    pdfPage.render(config);
  }
  const initCanvasSize = async (factory: PDFFactory) => {
    const {width: originWidth, height: originHeight, pageNumber} = await factory.getPDFSize();
    const {innerWidth, innerHeight} = window;
    const originScale = (innerWidth / 2) / originWidth;
    const scaledHeight = originHeight * originScale;
    const width = innerWidth / 2;
    const height = scaledHeight < innerHeight ? scaledHeight : innerHeight -5;
    const scale = scaledHeight < innerHeight ? originScale : (innerHeight / originHeight);
    setMaxPage(pageNumber);
    setScale(scale);
    setCanvasSize({ width, height });
    const pages = await Promise.all([
      factory.getPage(1),
      factory.getPage(2)
    ]);
    renderPDF(pages, scale);
    console.log(pageNumber)
  };
  useEffect(() => {
    getPDFFactory(`${process.env.PUBLIC_URL}/assets/sample.pdf`).then(
      async factory=>{
        await initCanvasSize(factory);
        setFactory(factory);
    });
  },[]);
  const onClick = async (page: number) => {
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
  const onkeypress = (e: React.KeyboardEvent) => {
    if(e.key === 'ArrowLeft') {
      onClick(page + 2);
    }
    if(e.key === 'ArrowRight') {
      onClick(page - 2);
    }
  };
  const sliderPointUp = (e:React.PointerEvent<HTMLInputElement>) => {
    e.stopPropagation();
    onClick(Number(e.currentTarget.value));
  }
  const arrowPointUp = (e: React.MouseEvent, page: number ) => {
    e.stopPropagation();
    onClick(page);
  }
  const stop = (e: React.MouseEvent) => {
    e.stopPropagation();
  }
  return (
    <div className="page-wrapper" onKeyDown={e => onkeypress(e)} tabIndex={-1} onPointerUp={()=>setShowPageOperator(!showPageOperator)}>
      {
        showPageOperator &&
          [
            <div className="slider" key='0'>
              <input
                type="range"
                name="speed"
                min="1"
                max={(maxPage||1)-1}
                step="2"
                value={page}
                onPointerUp={(e)=>sliderPointUp(e)}
                onChange={({target:{value}})=>setPage(Number(value))}
              />
            </div>,
            <div className="info" key='1' onPointerUp={e => e.stopPropagation()}>
              <a href="/"><FontAwesomeIcon icon={faArrowLeft}/></a>
              <div className="info-content"> title</div>
              <div className="info-content">{page} / {maxPage}</div>
            </div>
          ]
      }
      <div className="page">
        <div className="canvas-wrapper">
          <div className="back send" onPointerUp={e=> arrowPointUp(e, page - 2)}>
            <FontAwesomeIcon icon={faChevronRight}/>
          </div>
          <canvas className="canvas" ref={canvasRefRight} width={canvasWidth} height={canvasHeight}/>
        </div>
        <div className="canvas-wrapper">
          <div className="next send"  onPointerUp={e=> arrowPointUp(e, page + 2)}>
            <FontAwesomeIcon icon={faChevronLeft}/>
          </div>
          <canvas className="canvas" ref={canvasRefLeft} width={canvasWidth} height={canvasHeight}/>
        </div>
      </div>
    </div>
  );
}
export default RenderComic;
