import { getPDFFactory, getPDFViewport } from './readPdfNode';
import { createCanvas } from 'canvas';
import { writeFile } from 'fs';
import { PDFRenderParams, PDFDocumentProxy } from 'pdfjs-dist';
const getDocument = require('pdfjs-dist/es5/build/pdf').getDocument;

class CanvasFactory {
    create(width: number, height: number) {
        var canvas = createCanvas(width, height);
        var context = canvas.getContext("2d");
        return {
            canvas: canvas,
            context: context,
        };
    }
    reset(ctx: CanvasRenderingContext2D, width: number, height: number) {
        ctx.canvas.width = width;
        ctx.canvas.height = height;
    }
    destroy(ctx: CanvasRenderingContext2D) {
        ctx.canvas.width = 0;
        ctx.canvas.height = 0;
    }
}
export async function backTasks(pdfPath: string) {
    const factory = await getPDFFactory(pdfPath);
    const {width, height} = await factory.getPDFSize();
    const canvas = createCanvas(width, height);
    const page = await factory.getPage(1);
    const ctx = canvas.getContext('2d')!;
    const config = getPDFViewport(page, ctx);
    const canvasFactory = new CanvasFactory();
    await ((page.render({...config, canvasFactory} as PDFRenderParams).promise as unknown) as Promise<void>);
    writeFile('./data.jpg', canvas.toBuffer(), ()=>{});
}

if (process.argv.length >= 2) {
    backTasks(process.argv[2]);
} else {
    console.log('required pdf files path');
}