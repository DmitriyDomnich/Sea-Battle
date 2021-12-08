export interface Ship {
    id: number;
    width: number;
    height: number;
    src: string;
    barsCount: number;
    orientation?: 'horizontal' | 'vertical';
}