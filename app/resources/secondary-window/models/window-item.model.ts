export interface WindowItem {
    id: number;
    url: string;
    window: any;
    isReady: boolean;
    close: () => void;
}
