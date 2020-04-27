import { getPDFFactory, getPDFViewport } from './readPdfNode';
import { createCanvas } from 'canvas';
import { writeFile, readdir, rename } from 'fs';
import { PDFRenderParams } from 'pdfjs-dist';
import { Pool } from 'pg';
const pool = new Pool({
    user: 'pdf',
    host: 'localhost',
    database: 'pdf',
    password: 'pdf',
    port: 15432,
});
interface IdResult {
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
    const insertPromise = insertTitle(file);
    const createCanvasPromise = createPDFCanvas(fileInPath);
    const [insertResult, canvas] = await Promise.all([insertPromise, createCanvasPromise]);
    writeFile(`${savePath}/${insertResult.id}.jpg`, canvas.toBuffer(), ()=>{});
    rename(fileInPath, `${pdfPath}/${insertResult.id}.pdf`, ()=>{});
}
async function createPDFCanvas(fileInPath: string) {
    const factory = await getPDFFactory(fileInPath);
    const {width, height} = await factory.getPDFSize();
    const canvas = createCanvas(width, height);
    const page = await factory.getPage(1);
    const ctx = canvas.getContext('2d')!;
    const config = getPDFViewport(page, ctx);
    const canvasFactory = new CanvasFactory();
    await ((page.render({...config, canvasFactory} as PDFRenderParams).promise as unknown) as Promise<void>);    
    return canvas
}
async function insertTitle(fileName: string) {
    const title = fileName.match(/(.*)\.pdf/);
     const query = {
        text: 'insert into comic (title) values ($1) RETURNING id;',
        values: [(title && title[1] || fileName)],
      };
    return (await pool.query(query)).rows[0] as IdResult;
}
async function selectFiles() {
    const query = 'select id from comic;';
    return (await pool.query(query)).rows as IdResult[];
}
if (process.argv.length >= 2) {
    const path = process.argv[2];
    const savePath = process.argv[3];
    selectFiles().then(selectFiles=>{
        readdir(process.argv[2], (err, files)=>{
            if(err) {
                console.log(err);
                process.exit(-1);
            }
            files.forEach(file=>{
                if( !file.match(/pdf/g) || selectFiles.find(({id})=>`${id}.pdf` === file)) {
                    return;
                }
                backTasks(path, file, savePath);
            });
        });
    });
} else {
    console.log('required pdf files path');
}