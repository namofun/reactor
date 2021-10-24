import * as React from "react";
import { RouteComponentProps } from "react-router";
import { Icon } from "azure-devops-ui/Icon";
import { Breadcrumb, IBreadcrumbItem } from "azure-devops-ui/Breadcrumb";
import { IndeterminateProgressBar } from "azure-devops-ui/ProgressBar";
import { ObservableValue } from "azure-devops-ui/Core/Observable";
import { Observer } from "azure-devops-ui/Observer";
import { FocusZone, FocusZoneDirection } from "azure-devops-ui/FocusZone";

import './NavBar.css';
import { SuiteLogo } from "./SuiteLogo";

export interface INavigationContext {
    breadcrumb: ObservableValue<IBreadcrumbItem[]>;
}

class NavigationContextImp implements INavigationContext {
    breadcrumb = new ObservableValue<IBreadcrumbItem[]>([]);
}

export const NavigationContext = React.createContext<INavigationContext>(new NavigationContextImp());


interface IWithHeaderProgressBarState {
  loading?: ObservableValue<boolean>;
}

class WithHeaderProgressBar extends React.Component<{}, IWithHeaderProgressBarState> {

  constructor() {
    super({});
    this.state = {
      loading: new ObservableValue<boolean>(true)
    };
  }

  private clearLoading = (() => {
    this.setState({
      loading: undefined
    });
  });

  private startLoading = (() => {
    this.setState({
      loading: new ObservableValue<boolean>(true)
    });
  })

  private setLoadingComplete = (() => {
    if (this.state.loading !== undefined) {
      this.state.loading.value = false;
    }
  });

  public render() {
    return (
      <>
        {this.props.children}
        {this.state.loading !== undefined && (
          <IndeterminateProgressBar
              className="project-header-progress"
              loading={this.state.loading}
              loadingAnimationComplete={this.clearLoading}
          />
        )}
      </>
    );
  }

  public componentDidMount() {
    document.body.addEventListener("fpsLoading", this.startLoading);
    document.body.addEventListener("fpsLoaded", this.setLoadingComplete);
  }

  public componentWillUnmount() {
    document.body.removeEventListener("fpsLoaded", this.setLoadingComplete);
    document.body.removeEventListener("fpsLoading", this.startLoading);
  }
}


export interface INavBarProps extends RouteComponentProps {
}


function NavBarImp(props: INavBarProps): JSX.Element {

  const breadcrumbControl = (
    <div className="flex-row flex-grow scroll-hidden bolt-breadcrumb-with-items">
      <NavigationContext.Consumer>
        {context => (
          <Observer breadcrumb={context.breadcrumb}>
            {(observedProps: { breadcrumb: IBreadcrumbItem[] }) => (
              <Breadcrumb
                  className="header-breadcrumb flex-grow"
                  items={observedProps.breadcrumb}
              />
            )}
          </Observer>
        )}
      </NavigationContext.Consumer>
    </div>
  );

  const commandBarItems = (
    <>
      <div aria-expanded="false" aria-haspopup="true" aria-label="My Work" className="commandbar-item commandbar-icon cursor-pointer flex-row flex-noshrink justify-center bolt-expandable-container flex-row flex-center" data-focuszone="focuszone-1" role="menuitem" tabIndex={-1}>
        <Icon iconName="CheckList" className="compact-fabric-icon medium" />
      </div>
      <div aria-expanded="false" aria-haspopup="true" aria-label="Marketplace" className="commandbar-item commandbar-icon cursor-pointer flex-row flex-noshrink justify-center bolt-expandable-container flex-row flex-center" data-focuszone="focuszone-1" role="menuitem" tabIndex={-1}>
        <Icon iconName="Shop" className="compact-fabric-icon medium" />
      </div>
      <div aria-expanded="false" aria-haspopup="true" aria-label="Help" className="commandbar-item commandbar-icon cursor-pointer flex-row flex-noshrink justify-center bolt-expandable-container flex-row flex-center" data-focuszone="focuszone-1" role="menuitem" tabIndex={-1}>
        <Icon iconName="Unknown" className="compact-fabric-icon medium" />
      </div>
      <div aria-expanded="false" aria-haspopup="true" aria-label="User settings" className="commandbar-item commandbar-icon cursor-pointer flex-row flex-noshrink justify-center bolt-expandable-container flex-row flex-center" data-focuszone="focuszone-1" role="menuitem" tabIndex={-1}>
        <Icon iconName="PlayerSettings" className="compact-fabric-icon medium" />
      </div>
    </>
  );

  const logo = (
    <SuiteLogo
        history={props.history}
        href="/"
        iconName="VSTSLogo"
        title="VSSUI.Demo"
    />
  );

  return (
    <div className="flex-row flex-grow region-header" data-renderedregion="header" role="menubar">
      {logo}
      {breadcrumbControl}
      {commandBarItems}
    </div>
  );
}


export function NavBar(props: INavBarProps): JSX.Element {
  return (
    <>
      <FocusZone circularNavigation={true} direction={FocusZoneDirection.Horizontal} focusGroupProps={{ defaultElementId: 'suite-logo' }}>
        <div className="project-header flex-row flex-noshrink" role="navigation">
          <WithHeaderProgressBar>
            <NavBarImp {...props} />
          </WithHeaderProgressBar>
        </div>
      </FocusZone>
    </>
  );
}
