import * as React from "react";
import * as H from "history";
import { Link } from "azure-devops-ui/Link";
import { Icon } from "azure-devops-ui/Icon";
import { css } from "azure-devops-ui/Util";

export interface ISuiteLogoProps {
    history?: H.History<H.LocationState>;
    iconName: string;
    title: string;
    href: string;
    linkClassName?: string;
    iconClassName?: string;
}

export function SuiteLogo(props: ISuiteLogoProps): JSX.Element {
    return (
        <Link
            title={props.title}
            className={css("commandbar-item suite-logo flex-row flex-noshrink flex-center", props.linkClassName)}
            href={props.href}
            role="menuitem"
            tabIndex={0}
            onClick={props.history === undefined ? undefined : event => {
                event.preventDefault();
                props.history.push(props.href);
            }}
        >
            <Icon
                iconName={props.iconName}
                className={css("suite-image commandbar-icon justify-center flex-noshrink compact-fabric-icon", props.iconClassName)}
            />
        </Link>
    );
}
