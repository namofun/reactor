import * as React from "react";
import { RouteComponentProps } from "react-router";

export abstract class PageContent<TProps extends RouteComponentProps> extends React.Component<TProps> {

    public componentDidMount() {
        this.loadData();
    }

    public componentWillUnmount() {
        document.body.dispatchEvent(new CustomEvent("fpsLoading", { cancelable: false }));
    }

    public loadData(): Promise<void> {
        return new Promise(resolve => {
            setTimeout(() => {
                document.body.dispatchEvent(new CustomEvent("fpsLoaded", { cancelable: false }));
                resolve();
            }, 1);
        });
    }
}
