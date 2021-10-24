import * as React from "react";
import { FilterBar } from "azure-devops-ui/FilterBar";
import { Filter } from "azure-devops-ui/Utilities/Filter";
import { Header, TitleSize } from "azure-devops-ui/Header";
import { DatePickerFilterBarItem } from "azure-devops-ui-datepicker";
import { PageContent } from "@namofun/vssui-platform/PageContent";
import { IBreadcrumbItem } from "azure-devops-ui/Breadcrumb.Types";

export default class DatePickerTest extends PageContent {

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

  public getBreadcrumb() {
    return Promise.resolve<IBreadcrumbItem[]>([
      {
        key: 'index',
        text: 'Demo Gallery',
        href: '/',
        onClick: (event, item) => {
          event?.preventDefault();
          this.props.history.push('/');
        }
      },
      {
        key: 'date-picker',
        text: 'Date Picker Test',
        href: '/date-picker',
        onClick: (event, item) => {
          event?.preventDefault();
          this.props.history.push('/date-picker');
        }
      }
    ]);
  }
}
