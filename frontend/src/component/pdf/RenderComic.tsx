import React, { useEffect, useRef, useState } from 'react';
import { getPDFFactory, getPDFViewport, PDFFactory } from '../../readPdf';
import './RenderComic.css';
import { PDFPageProxy } from 'pdfjs-dist';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronRight,faChevronLeft } from '@fortawesome/free-solid-svg-icons'

function RenderComic() {
  const canvasRefRight = useRef(null);
  const canvasRefLeft = useRef(null);
  const [{width: canvasWidth, height: canvasHeight}, setCanvasSize] = useState({width: 100, height: 100});
  const [scale, setScale] = useState<number>();
  const [page, setPage] = useState(1);
  const [maxPage, setMaxPage] = useState<number>();
  const [factory, setFactory] = useState<PDFFactory>();

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
  };
  useEffect(() => {
    getPDFFactory(`${process.env.PUBLIC_URL}/assets/sample.pdf`).then(
      async factory=>{
        await initCanvasSize(factory);
        setFactory(factory);
    });
  },[]);
  const onClick = async (page: number) => {
    if (!factory || !scale || !maxPage) {
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
  return (
    <div className="page-wrapper">
      <div className="page">
        <div className="canvas-wrapper">
          <div className="back send" onClick={()=> page -2 > 0 && onClick(page - 2)}>
            <FontAwesomeIcon icon={faChevronRight}/>
          </div>
          <canvas className="canvas" ref={canvasRefRight} width={canvasWidth} height={canvasHeight}/>
        </div>
        <div className="canvas-wrapper">
          <div className="next send"  onClick={()=>page + 1 < maxPage! && onClick(page + 2)}>
            <FontAwesomeIcon icon={faChevronLeft}/>
          </div>
          <canvas className="canvas" ref={canvasRefLeft} width={canvasWidth} height={canvasHeight}/>
        </div>
      </div>
    </div>
  );
}
export default RenderComic;
