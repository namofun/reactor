import * as React from "react";
import { RouteComponentProps } from "react-router";
import { FilterBar } from "azure-devops-ui/FilterBar";
import { Filter } from "azure-devops-ui/Utilities/Filter";
import { Header, TitleSize } from "azure-devops-ui/Header";
import { DatePickerFilterBarItem } from "azure-devops-ui-datepicker";
import { PageContent } from "@namofun/vssui-platform/PageContent";

export default class DatePickerTest extends PageContent<RouteComponentProps> {

  private filter = new Filter();

  public render() {
    return (
      <>
        <Header
            title="Data Picker Test"
            titleSize={TitleSize.Large}
            backButtonProps={{
              onClick: () => {
                this.props.history.goBack();
              }
            }}
        />
        <div className="page-content page-content-top">
          <FilterBar filter={this.filter}>
            <DatePickerFilterBarItem
                filterItemKey="date"
                filter={this.filter}
                placeholder="Enter a Date"
            />
            <DatePickerFilterBarItem
                filterItemKey="date2"
                filter={this.filter}
                placeholder="Enter a Date"
                hasClearButton={true}
            />
          </FilterBar>
        </div>
      </>
    );
  }
}
