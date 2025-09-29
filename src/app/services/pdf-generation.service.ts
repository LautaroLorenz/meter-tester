import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { BlockUIService } from './block-ui.service';
import { MessagesService } from './messages.service';

export interface PdfGenerationOptions {
    scale?: number;
    useCORS?: boolean;
    format?: 'a4' | 'letter';
    orientation?: 'portrait' | 'landscape';
}

export interface PdfPage {
    html: HTMLElement;
}

@Injectable({
    providedIn: 'root'
})
export class PdfGenerationService {
    constructor(
        private readonly blockUIService: BlockUIService,
        private readonly messagesService: MessagesService
    ) {}

    /**
     * Genera y descarga un PDF a partir de un elemento HTML
     * @param element Elemento HTML a convertir a PDF
     * @param fileName Nombre del archivo PDF
     * @param options Opciones de configuración para la generación
     */
    async generatePDFFromElement(
        element: HTMLElement,
        fileName: string,
        options: PdfGenerationOptions = {}
    ): Promise<void> {
        const { scale = 1.5, useCORS = false, format = 'a4', orientation = 'portrait' } = options;

        const PDF = new jsPDF(orientation, 'mm', format, true);
        const canvas = await html2canvas(element, {
            scale,
            useCORS
        });
        const imageGeneratedFromTemplate = canvas.toDataURL('image/jpeg');
        const width = PDF.internal.pageSize.getWidth();
        const height = PDF.internal.pageSize.getHeight();
        PDF.addImage(imageGeneratedFromTemplate, 'JPEG', 0, 0, width, height, undefined, 'FAST');

        return PDF.save(fileName, { returnPromise: true });
    }

    /**
     * Genera y descarga un PDF a partir de múltiples páginas
     * @param pages Array de páginas PDF
     * @param fileName Nombre del archivo PDF
     * @param options Opciones de configuración para la generación
     */
    async generatePDFFromPages(pages: PdfPage[], fileName: string, options: PdfGenerationOptions = {}): Promise<void> {
        const { scale = 1.5, useCORS = false, format = 'a4', orientation = 'portrait' } = options;

        const PDF = new jsPDF(orientation, 'mm', format, true);

        for (let index = 0; index < pages.length; index++) {
            const page = pages[index];
            if (index > 0) {
                PDF.addPage();
            }
            const canvas = await html2canvas(page.html, {
                scale,
                useCORS
            });
            const imageGeneratedFromTemplate = canvas.toDataURL('image/jpeg');
            const width = PDF.internal.pageSize.getWidth();
            const height = PDF.internal.pageSize.getHeight();
            PDF.addImage(imageGeneratedFromTemplate, 'JPEG', 0, 0, width, height, undefined, 'FAST');
        }

        return PDF.save(fileName, { returnPromise: true });
    }

    /**
     * Genera un nombre de archivo con timestamp
     * @param prefix Prefijo del archivo (ej: 'reporte', 'historial')
     * @param essayName Nombre del ensayo
     * @param extension Extensión del archivo (por defecto 'pdf')
     */
    generateFileName(prefix: string, essayName: string, extension = 'pdf'): string {
        const date = new Date();
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear().toString().padStart(4, '0');
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');
        const formatedDate = `${day}-${month}-${year}-${hours}-${minutes}-${seconds}`;
        return `${prefix}_${essayName}_${formatedDate}.${extension}`;
    }

    /**
     * Método de conveniencia para generar PDF con bloqueo de UI y manejo de errores
     * @param element Elemento HTML a convertir
     * @param fileName Nombre del archivo
     * @param options Opciones de configuración
     * @param successMessage Mensaje de éxito (opcional)
     * @param errorMessage Mensaje de error (opcional)
     */
    async generatePDFWithUI(
        element: HTMLElement,
        fileName: string,
        options: PdfGenerationOptions = {},
        successMessage?: string,
        errorMessage?: string
    ): Promise<void> {
        this.blockUIService.setBlocked(true);

        try {
            await this.generatePDFFromElement(element, fileName, options);
            if (successMessage) {
                this.messagesService.success(successMessage);
            }
        } catch (error) {
            const message = errorMessage || 'No se pudo generar el PDF';
            this.messagesService.error(message);
            throw error;
        } finally {
            this.blockUIService.setBlocked(false);
        }
    }
}
