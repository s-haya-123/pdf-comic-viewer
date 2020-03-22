import React, { useEffect, useRef, useState } from 'react';
import { getPDFFactory, getPDFViewport, PDFFactorry } from '../../readPdf';
import './RenderComic.css';
import { PDFPageProxy } from 'pdfjs-dist';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronRight,faChevronLeft } from '@fortawesome/free-solid-svg-icons'

function RenderComic() {
  const canvasRefRight = useRef(null);
  const canvasRefLeft = useRef(null);
  const [{width, height}, setCanvasSize] = useState({width: 100, height: 100});
  const [scale, setScale] = useState(1);

  const getContext = (canvas: HTMLCanvasElement) => {
    return canvas.getContext('2d') as CanvasRenderingContext2D;
  };
  const renderPage = (pdfPage: PDFPageProxy, ctx: CanvasRenderingContext2D, scale = 1) => {
    const config = getPDFViewport(pdfPage, ctx, scale);
    pdfPage.render(config);
  }
  const initCanvasSize = async (factory: PDFFactorry) => {
    const {width, height} = await factory.getPDFSize();
    const {innerWidth} = window;
    setCanvasSize({width: innerWidth / 2 ,height});
    setScale((innerWidth / 2) / width);
  };
  useEffect(() => {
    getPDFFactory(`${process.env.PUBLIC_URL}/assets/sample.pdf`).then(
      async factory=>{
        initCanvasSize(factory);
        const page = await factory.getPage(1);
        const page2 = await factory.getPage(2);
        const ctx = getContext(canvasRefRight.current as any);
        const ctx2 = getContext(canvasRefLeft.current as any);
        renderPage(page, ctx, scale);
        renderPage(page2, ctx2, scale);
    });
  },[]);
  return (
    <div className="page-wrapper">
      <div className="page">
        <div className="canvas-wrapper">
          <div className="back send">
            <FontAwesomeIcon icon={faChevronRight}/>
          </div>
          <canvas className="canvas" ref={canvasRefRight} width={width} height={height}/>
        </div>
        <div className="canvas-wrapper">
          <div className="next send">
            <FontAwesomeIcon icon={faChevronLeft}/>
          </div>
          <canvas className="canvas" ref={canvasRefLeft} width={width} height={height}/>
        </div>
      </div>
    </div>
  );
}
export default RenderComic;
