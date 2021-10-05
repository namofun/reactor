import * as React from "react";
import { Icon, IIconProps } from "azure-devops-ui/Icon";
import { Tooltip, ITooltipProps } from "azure-devops-ui/TooltipEx";
import { css } from "azure-devops-ui/Util";

export interface IIconBadgeProps {
  className?: string;
  iconProps: IIconProps;
  children?: React.ReactNode;
  tooltipProps? : ITooltipProps;
}

export class IconBadge extends React.Component<IIconBadgeProps> {

  public render() {
    let content = (
      <div className={css(this.props.className, "flex-row", "flex-center")}>
        <Icon {...this.props.iconProps} className="icon-margin" />
        {this.props.children}
      </div>
    );

    if (this.props.tooltipProps) {
      content = (
        <Tooltip {...this.props.tooltipProps}>
          {content}
        </Tooltip>
      )
    }

    return content;
  }
}
