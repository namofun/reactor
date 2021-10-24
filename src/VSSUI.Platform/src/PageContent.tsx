import * as React from "react";
import { RouteComponentProps } from "react-router";
import { NavigationContext } from "./NavBar";
import { IBreadcrumbItem } from "azure-devops-ui/Breadcrumb.Types";

export abstract class PageContent<TProps = {}> extends React.Component<TProps & RouteComponentProps> {

    public componentDidMount() {
        this.updateBreadcrumb();
        this.loadData();
    }

    public componentWillUnmount() {
        document.body.dispatchEvent(new CustomEvent("fpsLoading", { cancelable: false }));
    }

    public componentDidUpdate() {
        this.updateBreadcrumb();
    }

    public loadData(): Promise<void> {
        return new Promise(resolve => {
            setTimeout(() => {
                document.body.dispatchEvent(new CustomEvent("fpsLoaded", { cancelable: false }));
                resolve();
            }, 1);
        });
    }

    public getBreadcrumb(): Promise<IBreadcrumbItem[] | undefined> | undefined {
        return undefined;
    }

    public updateBreadcrumb(): void {
        this.getBreadcrumb()?.then(value => value && (
            NavigationContext.breadcrumb.value = value
        ));
    }
}
