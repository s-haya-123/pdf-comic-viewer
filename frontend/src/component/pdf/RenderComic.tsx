import React, { useEffect, useRef, useState } from 'react';
import { getPDFFactory, getPDFViewport } from '../../readPdf';
import './RenderComic.css';
import { PDFPageProxy } from 'pdfjs-dist';

function RenderComic() {
  const canvasRefRight = useRef(null);
  const canvasRefLeft = useRef(null);
  const [{width, height}, setCanvasSize] = useState({width: 100, height: 100});

  const getContext = (canvas: HTMLCanvasElement) => {
    return canvas.getContext('2d') as CanvasRenderingContext2D;
  };
  const renderPage = (pdfPage: PDFPageProxy, ctx: CanvasRenderingContext2D, scale = 1) => {
    const config = getPDFViewport(pdfPage, ctx, scale);
    pdfPage.render(config);
  }
  useEffect(() => {
    getPDFFactory(`${process.env.PUBLIC_URL}/assets/sample.pdf`).then(
      async factory=>{
        const {width, height} = await factory.getPDFSize();
        const {innerWidth, innerHeight} = window;
        setCanvasSize({width: innerWidth / 2 ,height: innerHeight});
        const scale = (innerWidth / 2) / width;
        const page = await factory.getPage(1);
        const page2 = await factory.getPage(2);
        const ctx = getContext(canvasRefRight.current as any);
        const ctx2 = getContext(canvasRefLeft.current as any);
        renderPage(page, ctx, scale);
        renderPage(page2, ctx2, scale);
    });
  },[]);
  return (
    <div className="page">
      <canvas className="canvas" ref={canvasRefRight} width={width} height={height}/>
      <canvas className="canvas" ref={canvasRefLeft} width={width} height={height}/>
    </div>
  );
}
export default RenderComic;
