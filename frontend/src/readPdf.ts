import {getDocument, PDFDocumentProxy} from 'pdfjs-dist/webpack';

export async function getPDF(src: string) {
    console.time('load');
    const docPromise = (getDocument(src).promise as unknown) as Promise<
    PDFDocumentProxy
    >;
    console.log(await docPromise.then(doc=>{
        console.timeEnd('load')
        return doc.numPages;
    }));
}