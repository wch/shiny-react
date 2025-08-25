export type ImageData = {
    src: string;
    width: number;
    height: number;
    coordmap: {
        panels: {
            panel: number;
            row: number;
            col: number;
            domain: {
                left: number;
                right: number;
                bottom: number;
                top: number;
            };
            range: {
                left: number;
                right: number;
                bottom: number;
                top: number;
            };
            log: {
                x: string | null;
                y: string | null;
            };
            mapping: {
                x: string | null;
                y: string | null;
            };
        }[];
        dims: {
            width: number;
            height: number;
        };
    };
};
export declare function ImageOutput({ id, className, }: {
    id: string;
    className?: string;
}): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=ImageOutput.d.ts.map