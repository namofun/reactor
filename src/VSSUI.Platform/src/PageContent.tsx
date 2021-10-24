import * as React from "react";
import { RouteComponentProps } from "react-router";
import { NavigationContext } from "./NavBar";
import { IBreadcrumbItem } from "azure-devops-ui/Breadcrumb.Types";

export abstract class PageContent<TProps = {}> extends React.Component<TProps & RouteComponentProps> {

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

    public getBreadcrumb(): Promise<IBreadcrumbItem[] | undefined> | undefined {
        return undefined;
    }

    public abstract renderChildren(): JSX.Element;

    public render() {
        return <>
            <NavigationContext.Consumer>
                {context => {
                    this.getBreadcrumb()?.then(value => value && (context.breadcrumb.value = value));
                    return <></>;
                }}
            </NavigationContext.Consumer>
            {this.renderChildren()}
        </>;
    }
}
