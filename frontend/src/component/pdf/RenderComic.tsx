import React, { useEffect, useRef, useState } from 'react';
import { getPDFFactory, getPDFViewport, PDFFactory } from '../../readPdf';
import './RenderComic.css';
import { PDFPageProxy } from 'pdfjs-dist';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronRight,faChevronLeft } from '@fortawesome/free-solid-svg-icons'

function RenderComic() {
  const canvasRefRight = useRef(null);
  const canvasRefLeft = useRef(null);
  const [{width, height}, setCanvasSize] = useState({width: 100, height: 100});
  const [scale, setScale] = useState<number>();
  const [page, setPage] = useState(1);
  const [maxPage, setMaxPage] = useState<number>();
  const [factory, setFactory] = useState<PDFFactory>();

  const getContext = (canvas: HTMLCanvasElement) => {
    return canvas.getContext('2d') as CanvasRenderingContext2D;
  };
  const renderPage = (pdfPage: PDFPageProxy, ctx: CanvasRenderingContext2D, scale = 1) => {
    const config = getPDFViewport(pdfPage, ctx, scale);
    pdfPage.render(config);
  }
  const initCanvasSize = async (factory: PDFFactory) => {
    const {width, height, pageNumber} = await factory.getPDFSize();
    const {innerWidth, innerHeight} = window;
    const scale = (innerWidth / 2) / width;
    const scaledHeight = height * scale;
    setMaxPage(pageNumber);
    if (scaledHeight < innerHeight) {
      setCanvasSize({
        width: innerWidth / 2,
        height: scaledHeight
      });
      setScale(scale);
    } else {
      setCanvasSize({
        width: innerWidth / 2,
        height: innerHeight -5
      });
      setScale(innerHeight / height);
    }
  };
  useEffect(() => {
    getPDFFactory(`${process.env.PUBLIC_URL}/assets/sample.pdf`).then(
      async factory=>{
        initCanvasSize(factory);
        setFactory(factory);
    });
  },[]);
  useEffect(()=>{
    if (!factory || !scale || !maxPage) {
      return ;
    }
    const promiseAll = [];
    promiseAll.push(factory.getPage(page));
    if(page + 1 <= maxPage) {
      promiseAll.push(factory.getPage(page + 1));
    }

    Promise.all(promiseAll).then( ([pdfPage, pdfPage2])=>{
      const ctx = getContext(canvasRefRight.current as any);
      const ctx2 = getContext(canvasRefLeft.current as any);
      renderPage(pdfPage, ctx, scale);
      renderPage(pdfPage2, ctx2, scale);
    });
  })
  return (
    <div className="page-wrapper">
      <div className="page">
        <div className="canvas-wrapper">
          <div className="back send" onClick={()=> page -2 > 0 && setPage(page - 2)}>
            <FontAwesomeIcon icon={faChevronRight}/>
          </div>
          <canvas className="canvas" ref={canvasRefRight} width={width} height={height}/>
        </div>
        <div className="canvas-wrapper">
          <div className="next send"  onClick={()=>page + 1 < maxPage! && setPage(page + 2)}>
            <FontAwesomeIcon icon={faChevronLeft}/>
          </div>
          <canvas className="canvas" ref={canvasRefLeft} width={width} height={height}/>
        </div>
      </div>
    </div>
  );
}
export default RenderComic;
