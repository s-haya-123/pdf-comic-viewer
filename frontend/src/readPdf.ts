import {getDocument, PDFDocumentProxy, PDFPageProxy} from 'pdfjs-dist/webpack';

export async function getPDFFactory(src: string) {
    const docPromise = (getDocument(src).promise as unknown) as Promise<
    PDFDocumentProxy
    >;
    return {
        getPDFSize: () =>
            docPromise.then(
                async doc => {
                    const page = await ((doc.getPage(1) as unknown) as Promise<PDFPageProxy>);
                    const { width, height } = page.getViewport({scale: 1});
                    return { width, height }
                }
            ),
        getPage: (page: number) => docPromise.then(
            doc => (doc.getPage(page) as unknown) as Promise<PDFPageProxy>
        )
    }
}
export function getPDFViewport(pdfPage: PDFPageProxy, ctx: CanvasRenderingContext2D, scale = 1) {
    const viewport = pdfPage.getViewport({ scale });
    return {
        canvasContext: ctx,
        viewport
    };
}