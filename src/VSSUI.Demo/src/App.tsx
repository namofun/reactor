import * as React from 'react';
import { withRouter } from 'react-router';
import { RouteComponentProps, NavLink, Route } from 'react-router-dom';
import { Action, Location } from 'history';

import { Page } from "azure-devops-ui/Page";
import { Surface, SurfaceBackground } from "azure-devops-ui/Surface";
import { NavBar } from "@namofun/vssui-platform/NavBar";

interface IAppState {
  input: string;
}

class App extends React.Component<RouteComponentProps, IAppState> {

  private scrollRef = React.createRef<HTMLDivElement>();

  constructor(props: RouteComponentProps) {
    super(props);
    this.state = { input: '' };
    this.props.history.listen(this.onRouteChange);
  }

  public render() {
    return (
      <div className="full-size flex-column">
        <div className="flex-column">
          <NavBar {...this.props} />
        </div>
        <div className="flex-row flex-grow v-scroll-auto">
          <Surface background={SurfaceBackground.neutral}>
            <Page className="flex-grow custom-scrollbar scroll-auto-hide" scrollableContainerRef={this.scrollRef}>
              {this.props.children}
            </Page>
          </Surface>
        </div>
      </div>
    );
  }

  private onRouteChange = (location: Location, action: Action) => {
    this.setState({ input: "" });
  }
}

export default withRouter(App);
