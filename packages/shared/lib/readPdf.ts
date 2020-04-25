import {getDocument, PDFDocumentProxy, PDFPageProxy} from 'pdfjs-dist';

export interface PDFFactory {
    getPDFSize: () => Promise<{width: number, height: number, pageNumber: number}>;
    getPage: (page: number) => Promise<PDFPageProxy>;
}
export async function getPDFFactory(docPromise: Promise<PDFDocumentProxy>): Promise<PDFFactory> {
    return {
        getPDFSize: () =>
            docPromise.then(
                async doc => {
                    const page = await ((doc.getPage(1) as unknown) as Promise<PDFPageProxy>);
                    const { width, height } = page.getViewport({scale: 1});
                    const pageNumber = doc.numPages;
                    return { width, height, pageNumber }
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