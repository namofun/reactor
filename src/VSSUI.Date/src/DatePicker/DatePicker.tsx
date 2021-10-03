import * as React from "react";
import { IReadonlyObservableValue } from "azure-devops-ui/Core/Observable";
import { IFocusZoneProps } from "azure-devops-ui/FocusZone";
import { Spinner, SpinnerSize } from "azure-devops-ui/Spinner";
import { css, KeyCode } from "azure-devops-ui/Util";
import { Location } from "azure-devops-ui/Utilities/Position";
import { Observer } from "azure-devops-ui/Observer";
import { FormItem } from "azure-devops-ui/FormItem";
import { TextField } from "azure-devops-ui/TextField";
import { Callout, ContentLocation } from "azure-devops-ui/Callout";
import { Calendar } from "../Calendar";

import "./DatePicker.css";
import { datePickerStrings, Resources } from "./DataStringHelpers";
import { CustomizedScreenSize, CustomizedScreenSizeObserver } from "./CustomizedScreen";

export interface IDatePickerProps {
    ariaLabel?: string;
    calendarId?: string;
    calloutAriaLabel?: string;
    containerClassName?: string;
    className?: string;
    disabled?: boolean;
    errorMessage?: IReadonlyObservableValue<string> | string;
    hasError?: IReadonlyObservableValue<boolean> | boolean;
    onChange?: (date: Date) => void;
    placeholder?: string;
    value: IReadonlyObservableValue<Date | undefined> | Date | undefined;
    minDate?: Date;
    maxDate?: Date;
    focusZoneProps?: IFocusZoneProps;
}

export interface IDateTimePickerState {
    pickerShown: boolean;
}

export class DatePicker extends React.Component<IDatePickerProps, IDateTimePickerState> {
    private containerDiv : React.RefObject<HTMLDivElement>;

    constructor(props: IDatePickerProps) {
        super(props);
        this.containerDiv = React.createRef<HTMLDivElement>();

        if (props) {
            this.state = { pickerShown: false };
        }
    }

    public calendarDismissed = () => {
        this.setState({ pickerShown: false });
    }

    public onClick = (event: React.MouseEvent<HTMLElement | HTMLTextAreaElement>) => {
        if (!(event.defaultPrevented || this.props.disabled)) {
            this.setState({ pickerShown: true });
            event.preventDefault();
        }
    }

    public onKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
        if (!(event.defaultPrevented || this.props.disabled)) {
            if (KeyCode.downArrow === event.which || KeyCode.enter === event.which) {
                this.setState({ pickerShown: true });
                event.preventDefault();
            } else if (KeyCode.escape === event.which) {
                this.setState({ pickerShown: false });
                event.preventDefault();
            }
        }
    }

    public onSelectDate = (date: Date) => {
        this.setState({ pickerShown: false });
        if (this.props.onChange) {
            this.props.onChange(date);
        }
    }

    public renderSpinner = () => {
        return (
            <div className="bolt-date-picker-spinner flex-row flex-center justify-center">
                <Spinner label={Resources.Loading} size={SpinnerSize.large} />
            </div>
        )
    }

    public render() {
        return (
            <Observer date={this.props.value}>
                {(dateProps: { date: Date }) => (
                    <div
                        aria-expanded={this.state.pickerShown}
                        role="combobox"
                        className={this.props.containerClassName}
                        ref={this.containerDiv}
                    >
                        <FormItem
                            error={this.props.hasError}
                            message={this.props.errorMessage}
                        >
                            <TextField
                                ariaControls={this.state.pickerShown ? this.props.calendarId : undefined}
                                ariaLabel={this.props.ariaLabel}
                                ariaHasPopup={true}
                                className={css("flex-row flex-grow", this.props.className)}
                                disabled={this.props.disabled}
                                inputClassName="bolt-date-picker-input"
                                onClick={this.onClick}
                                onKeyDown={this.onKeyDown}
                                role="textbox"
                                readOnly={true}
                                prefixIconProps={{ iconName: "Calendar", onClick: this.onClick }}
                                placeholder={this.props.placeholder}
                                value={dateProps.date ? dateProps.date.toLocaleString(undefined, { year: "numeric", month: "numeric", day: "numeric" }) : undefined}
                            />
                        </FormItem>
                        {this.state.pickerShown && (
                            <CustomizedScreenSizeObserver>
                                {(screenSizeProps: { screenSize: CustomizedScreenSize }) => {
                                    const isSmall = CustomizedScreenSize.xsmall === screenSizeProps.screenSize;
                                    return (
                                        <Callout
                                            anchorElement={isSmall ? undefined : this.containerDiv.current!}
                                            anchorOrigin={isSmall ? undefined : { horizontal: Location.start, vertical: Location.end }}
                                            ariaLabel={this.props.calloutAriaLabel || Resources.DatePickerCalloutLabel}
                                            contentClassName="depth-8 bolt-date-picker"
                                            contentLocation={isSmall ? ContentLocation.Start : undefined}
                                            contentShadow={true}
                                            id={this.props.calendarId}
                                            onDismiss={this.calendarDismissed}
                                            escDismiss={true}
                                            lightDismiss={true}
                                            focuszoneProps={this.props.focusZoneProps}
                                        >
                                            <Calendar
                                                onSelectDate={this.onSelectDate}
                                                onDismiss={this.calendarDismissed}
                                                shouldFocusOnMount={true}
                                                minDate={this.props.minDate}
                                                maxDate={this.props.maxDate}
                                                value={dateProps.date}
                                                strings={datePickerStrings()}
                                                className="bolt-date-picker"
                                            />
                                        </Callout>
                                    );
                                }}
                            </CustomizedScreenSizeObserver>
                        )}
                    </div>
                )}
            </Observer>
        );
    }
}
