import { getPDFFactory, getPDFViewport } from './readPdfNode';
import { createCanvas } from 'canvas';
import { writeFile, readdir, rename } from 'fs';
import { PDFRenderParams } from 'pdfjs-dist';
import { Client,Pool } from 'pg';
const pool = new Pool({
    user: 'pdf',
    host: 'localhost',
    database: 'pdf',
    password: 'pdf',
    port: 15432,
});
interface InsertResult {
    id: string;
}
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
export async function backTasks(pdfPath: string, file: string, savePath: string) {
    const fileInPath = `${pdfPath}/${file}`;
    const factory = await getPDFFactory(fileInPath);
    const {width, height} = await factory.getPDFSize();
    const canvas = createCanvas(width, height);
    const page = await factory.getPage(1);
    const ctx = canvas.getContext('2d')!;
    const config = getPDFViewport(page, ctx);
    const canvasFactory = new CanvasFactory();
    await ((page.render({...config, canvasFactory} as PDFRenderParams).promise as unknown) as Promise<void>);
    const title = file.match(/(.*)\.pdf/);
    const query = {
        text: 'insert into comic (title) values ($1) RETURNING id;',
        values: [(title && title[1] || file)],
      };
    const res = await pool.query(query);
    const insertResult = res.rows[0] as InsertResult;
    writeFile(`${savePath}/${insertResult.id}.jpg`, canvas.toBuffer(), ()=>{});
    rename(fileInPath, `${pdfPath}/${insertResult.id}.pdf`, ()=>{});
}

if (process.argv.length >= 2) {
    const path = process.argv[2];
    const savePath = process.argv[3];
    readdir(process.argv[2], (err, files)=>{
        if(err) {
            console.log(err);
            process.exit(-1);
        }
        files.forEach(file=>{
            backTasks(path, file, savePath);
        });
        console.log(files);
    });
} else {
    console.log('required pdf files path');
}