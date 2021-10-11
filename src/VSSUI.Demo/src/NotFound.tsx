import * as React from "react";
import { RouteComponentProps } from "react-router";
import { ZeroData, ZeroDataActionType } from "azure-devops-ui/ZeroData";
import { PageContent } from "@namofun/vssui-platform/PageContent";

export default class NotFound extends PageContent<RouteComponentProps> {

  public render() {
    return (
      <>
        <div className="flex-grow" />
        <div className="flex-grow flex-cell">
          <ZeroData
              className="flex-grow vss-ZeroData-fullsize"
              primaryText="Requested item not found"
              secondaryText={`No item exists at path '${this.props.location.pathname}'. Please check your url.`}
              imageAltText="Invalid Path"
              imagePath="https://cdn.vsassets.io/ext/ms.vss-code-web/files-hub-content-new/Content/invalid-path.ihkCdg1N1y4EB3oQ.svg"
              actionText="Go to home page"
              actionType={ZeroDataActionType.ctaButton}
              onActionClick={(event, item) => this.props.history.push('/')}
          />
        </div>
        <div className="flex-grow" style={{ flexGrow: 2 }} />
      </>
    );
  }
}
