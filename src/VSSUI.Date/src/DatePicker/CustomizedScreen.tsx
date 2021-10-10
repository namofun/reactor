import * as React from "react";
import { Observer } from "azure-devops-ui/Observer";
import { IObservableValue, ObservableValue } from "azure-devops-ui/Core/Observable";

export declare enum CustomizedScreenBreakpoints {
    xsmall = 1,
    small = 750,
}

export const enum CustomizedScreenSize {
    xsmall = 0,
    small = 1,
}

export interface ICustomizedScreenContext {
    size: IObservableValue<CustomizedScreenSize>;
}

class CustomizedScreenContextImp implements ICustomizedScreenContext {
    public size: IObservableValue<CustomizedScreenSize>;

    constructor() {
        this.size = new ObservableValue(this.getCurrentSize());
        window.addEventListener("resize", this.onResize);
    }

    public getCurrentSize() {
        return window.innerWidth >= 750 ? 1 : 0;
    }

    public onResize = (): void => {
        const size = this.getCurrentSize();
        if (this.size.value !== size) {
            this.size.value = size;
        }
    }
}

export const CustomizedScreenContext = React.createContext(new CustomizedScreenContextImp());

export interface ICustomizedScreenSizeConditionalProps {
    condition: (screenSize: CustomizedScreenSize) => boolean;
    children: React.ReactNode;
}

export function CustomizedScreenSizeObserver(props: { children: any }) {
    return React.createElement(
        CustomizedScreenContext.Consumer,
        null,
        (screen: ICustomizedScreenContext) => React.createElement(
            Observer,
            { screenSize: screen.size },
            props.children
        )
    )
}

export function ScreenSizeConditional(props: ICustomizedScreenSizeConditionalProps) {
    return React.createElement(
        CustomizedScreenSizeObserver,
        null,
        (screenSizeProps: { screenSize: CustomizedScreenSize }) => {
            if (props.condition(screenSizeProps.screenSize)) {
                return props.children;
            }
        }
    )
}
