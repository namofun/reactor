import * as React from "react";
import { ArrayItemProvider } from "azure-devops-ui/Utilities/Provider";
import { Header, TitleSize } from "azure-devops-ui/Header";
import { IListItemDetails, ListItem, List } from "azure-devops-ui/List";
import { Card } from "azure-devops-ui/Card";
import { Icon } from "@namofun/vssui-platform/Components/Icon/Icon";
import { IconSize } from "azure-devops-ui/Components/Icon/Icon.Props";
import { ILinkProps } from "azure-devops-ui/Link";
import { PageContent } from "@namofun/vssui-platform/PageContent";
import { IBreadcrumbItem } from "azure-devops-ui/Breadcrumb.Types";

interface ITaskItem {
  description: string;
  iconName: string;
  name: string;
  href?: string;
}

const tasks: ITaskItem[] = [
  {
    description: "All demos index in one gallery",
    iconName: "Home",
    name: "Demo Gallery",
    href: "/"
  },
  {
    description: "Calendar, DatePicker, DatePickerFilterBarItem tests",
    iconName: "Calendar",
    name: "Date Picker Test",
    href: "/date-picker"
  }
];

export default class DemoIndex extends PageContent {

  public tasks = new ArrayItemProvider(tasks);

  public renderChildren() {
    return (
      <>
        <Header
            title="Demo Gallery"
            titleSize={TitleSize.Large}
        />
        <div className="page-content page-content-top">
          <Card>
            <List
                itemProvider={this.tasks}
                renderRow={this.renderRow}
                width="100%"
            />
          </Card>
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
      }
    ]);
  }

  public async loadData() {
    await new Promise((resolve) => {
      setTimeout(resolve, 1000);
    });
    await super.loadData();
  }

  private renderRow = (
    index: number,
    item: ITaskItem,
    details: IListItemDetails<ITaskItem>,
    key?: string
  ): JSX.Element => {

    const linkProps: ILinkProps = {};
    if (item.href !== undefined) {
      linkProps.href = item.href;
      linkProps.onClick = event => {
        event.preventDefault();
        this.props.history.push(item.href!);
      }
    }

    return (
      <ListItem
          key={key || "list-item" + index}
          index={index}
          details={details}
          linkProps={linkProps}
      >
        <div className="list-example-row flex-row h-scroll-hidden">
          <Icon iconName={item.iconName} size={IconSize.medium} />
          <div style={{ marginLeft: "10px", padding: "10px 0px" }} className="flex-column h-scroll-hidden">
            <span className="text-ellipsis">{item.name}</span>
            <span className="fontSizeMS font-size-ms text-ellipsis secondary-text">
              {item.description}
            </span>
          </div>
        </div>
      </ListItem>
    );
  };
}
