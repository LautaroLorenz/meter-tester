export interface WindowItem {
    id: number;
    url: string;
    window: any;
    close: () => void;
}
