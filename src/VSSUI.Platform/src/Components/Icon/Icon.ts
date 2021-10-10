import { IIconProps } from "azure-devops-ui/Components/Icon/Icon.Props";
import { Icon as IconV1 } from "azure-devops-ui/Components/Icon/Icon";
import { css } from "azure-devops-ui/Util";

import { getIconNameMap } from "./IconNames";
import "./ExtendedIcon.css";

export type { IIconProps };

export function Icon(props: Readonly<IIconProps>): JSX.Element {
    return IconV1({
        className: css(props.className, 'ms-IconSet--' + getIconNameMap(props.iconName)),
        ...props
    });
}
